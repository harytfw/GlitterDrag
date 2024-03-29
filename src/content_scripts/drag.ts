
import { CompatibilityStatus, LogLevel } from '../config/config'
import { rootLog } from '../utils/log'
import { EventPhase, isEditableAndDraggable, isInstance } from './drag_utils'
import { buildOpPosition, Op, OpExecutor, OpType } from './op'
import { OpSource } from './op_source'

enum TriggerSource {
    unknown = 'unknown',
    document = 'document',
    external = 'external'
}

const log = rootLog.subLogger(LogLevel.VVV, 'drag')



export class DragController {

    dragTriggerSource: TriggerSource

    sourceTarget: Node | null
    destTarget: Node | null

    eventSource: GlobalEventHandlers
    c: OpExecutor
    frameX: number
    frameY: number
    compat: CompatibilityStatus = CompatibilityStatus.enable

    constructor(eventSource: GlobalEventHandlers, opExecutor: OpExecutor) {
        this.dragTriggerSource = TriggerSource.unknown
        this.sourceTarget = null
        this.destTarget = null
        this.handler = this.handler.bind(this)
        this.eventSource = eventSource
        this.c = opExecutor
        this.frameX = 0
        this.frameY = 0
    }

    start(compat: CompatibilityStatus) {
        this.stop()
        this.compat = compat
        if (this.compat === CompatibilityStatus.disable) {
            return
        }
        for (const n of ["dragstart", "dragover", "dragenter", 'dragleave', "drop", "dragend"]) {
            this.eventSource.addEventListener(n, this.handler, {capture: true})
            this.eventSource.addEventListener(n, this.handler, {capture: false})
        }
    }

    stop() {
        for (const n of ["dragstart", "dragover", "dragenter", 'dragleave', "drop", "dragend"]) {
            this.eventSource.removeEventListener(n, this.handler, {capture: true});
            this.eventSource.removeEventListener(n, this.handler, {capture: false});
        }
    }

    private handler(e: DragEvent) {
        log.VVV(e)

        switch (e.type) {
            case 'dragstart':
                this.checkDragStart(e)
                break
            case 'dragend':
                this.checkDragEnd(e)
                break
            case 'dragenter':
                this.initFramePosition()
                this.checkDragEnter(e)
                break
            case 'dragover':
                this.checkDragOver(e)
                break
            case 'drop':
                this.checkDrop(e)
                break
            case 'dragleave':
                this.checkDragLeave(e)
                break
            default:
                throw new Error("unhandled event type: " + e.type)
        }
        return true
    }


    private findSourceTarget(event: DragEvent): Node | null {
        if (!(event.target instanceof Node)) {
            return null
        }

        let target = event.target

        if (event.composed) {
            log.VV("composed event, check composed path")
            const paths = event.composedPath()
            if (paths.length && paths[0] instanceof Node) {
                target = paths[0]
                log.VV("use target of first composed path value:", target)
            }
        }

        if (!isInstance(target, window.Node)) {
            log.VV("target must be instance of node: ", target)
            return null
        }

        if (isInstance(target, window.HTMLObjectElement)) {
            log.VV("ignore operation because target is object element")
            return null
        }

        if (isInstance(target, window.HTMLElement) && isEditableAndDraggable(target)) {
            log.VV("ignore operation because target is Editable and Draggable")
            return null
        }

        if (isInstance(target, window.HTMLAnchorElement)) {
            if (target.href.startsWith("#")) {
                log.VV("target's anchor starts with '#', ignore")
                return null
            }

            if (target.href.startsWith("javascript:")) {
                log.VV('target\'s href starts with javascript, do extra check ')
                const firstChild = target.firstElementChild
                if (isInstance(firstChild, window.HTMLImageElement)) {
                    log.VV('first child is image element')
                    return firstChild
                }
                log.VV('not support anchor with javascript:')
                return null
            }
            return target
        }

        if (isInstance(target, window.HTMLImageElement)) {
            const a = target.closest("a") as HTMLAnchorElement | null
            if (a) {
                return a
            } else {
                return target
            }
        }

        if (isInstance(target, window.Text)) {
            return target
        }

        if (isInstance(target, window.HTMLInputElement)) {
            log.VV('target is input element, input type: ', target.type)
            if (["text", "number", "url"].includes(target.type.toLowerCase())) {
                return target
            }
        }

        if (isInstance(target, window.HTMLTextAreaElement)) {
            log.VV('target is text area')
            return target
        }

        // TODO: target maybe a customElement with closed mode
        log.V("unhandled target: ", target)
        return null
    }

    private checkDragStart(event: DragEvent) {
        if (event.eventPhase === EventPhase.bubbling) {
            if (!event.defaultPrevented) {
                this.sourceTarget = this.findSourceTarget(event)
                if (this.sourceTarget != null) {
                    this.initFramePosition()
                    const op = this.makeOp(OpType.start, this.sourceTarget, event)
                    this.c.applyOp(op)
                }
            } else {
                log.V("host page cancel dragtart event")
            }
        }
    }

    private checkDragEnter(event: DragEvent) {
        if (event.eventPhase !== EventPhase.bubbling) {
            return
        }
        if (!(event.target instanceof Node)) {
            return
        }
        this.c.applyOp(this.makeOp(OpType.running, event.target, event))
        this.destTarget = event.target
        event.preventDefault()
    }

    private checkDragOver(event: DragEvent) {
        if (event.eventPhase !== EventPhase.bubbling) {
            return
        }

        if (!(event.target instanceof Node)) {
            return
        }

        this.c.applyOp(this.makeOp(OpType.running, event.target, event))
        event.preventDefault()
    }

    private checkDrop(event: DragEvent) {
        if (event.eventPhase !== EventPhase.bubbling) {
            return
        }

        if (!(event.target instanceof Node)) {
            return
        }

        if (event.defaultPrevented && this.compat !== CompatibilityStatus.force) {
            this.c.applyOp(this.makeOp(OpType.reset, event.target, event))
            return
        }

        const r = this.c.applyOp(this.makeOp(OpType.end, event.target, event))
        if (r.cancelDrop) {
            log.VV("cancel drop event")
            event.preventDefault()
        }
    }

    private checkDragLeave(_event: DragEvent) {
        return
    }

    private checkDragEnd(event: DragEvent) {

        if (event.eventPhase !== EventPhase.bubbling) {
            return
        }

        if (!(event.target instanceof Node)) {
            return
        }
        event.preventDefault()
    }

    private makeOp(type: OpType, target: Node, e: DragEvent): Op {

        const source = OpSource.fromNode(target)

        return Op.make({
            type: type,
            source: source,
            position: buildOpPosition(e, this.frameX, this.frameY),
            dt: e.dataTransfer
        })
    }

    private initFramePosition(): boolean {
        let cur: Window = window.self
        this.frameX = this.frameY = 0
        const frame = cur.frameElement
        if (frame) {
            const rect = frame.getBoundingClientRect()
            this.frameX = rect.x
            this.frameY = rect.y
            return true
        } else {
            return false
        }
    }
}
