
import { LogLevel } from '../config/config'
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

    opQueue: Op[]

    constructor(eventSource: GlobalEventHandlers, opExecutor: OpExecutor) {
        this.dragTriggerSource = TriggerSource.unknown
        this.sourceTarget = null
        this.destTarget = null
        this.dragHandler = this.dragHandler.bind(this)
        this.eventSource = eventSource
        this.c = opExecutor
        this.frameX = 0
        this.frameY = 0
    }

    start() {
        for (const n of ["dragstart", "dragover", "dragenter", 'dragleave', "drop", "dragend"]) {
            this.eventSource.addEventListener(n as any, this.dragHandler, true)
            this.eventSource.addEventListener(n as any, this.dragHandler, false)
        }
    }

    stop() {
        for (const n of ["dragstart", "dragover", "dragenter", 'dragleave', "drop", "dragend"]) {
            this.eventSource.removeEventListener(n as any, this.dragHandler, true);
            this.eventSource.removeEventListener(n as any, this.dragHandler, false);
        }
    }

    private dragHandler(e: DragEvent) {
        log.VV(e)

        switch (e.type) {
            case 'dragstart':
                this.checkDragStart(e)
                if (this.sourceTarget != null) {
                    this.initFramePosition()
                    this.c.applyOp(this.makeOp(OpType.start, this.sourceTarget, e))
                }
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

    private checkDragStart(event: DragEvent) {
        if (event.eventPhase !== EventPhase.capturing) {
            return
        }

        if (!(event.target instanceof Node)) {
            return
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
            return
        }

        if (isInstance(target, window.HTMLObjectElement)) {
            log.VV("ignore operation because target is object element")
            return;
        }

        if (isInstance(target, window.HTMLElement) && isEditableAndDraggable(target)) {
            log.VV("ignore operation because target is Editable and Draggable")
            return;
        }

        if (isInstance(target, window.HTMLAnchorElement)) {
            if (target.href.startsWith("#")) {
                log.VV("target's anchor starts with '#', ignore")
                return;
            }

            if (target.href.startsWith("javascript:")) {
                log.VV('target\'s href starts with javascript, do extra check ')
                const firstChild = target.firstElementChild
                if (isInstance(firstChild, window.HTMLImageElement)) {
                    log.VV('first child is image element')
                    this.sourceTarget = firstChild
                    return;
                }
                log.VV('not support anchor with javascript:')
                return
            }
            this.sourceTarget = target
            return
        }

        if (isInstance(target, window.HTMLImageElement)) {
            const a = target.closest("a") as HTMLAnchorElement | null
            if (a) {
                this.sourceTarget = a
            } else {
                this.sourceTarget = target
            }
            return
        }

        if (isInstance(target, window.Text)) {
            this.sourceTarget = target
            return
        }

        if (isInstance(target, window.HTMLInputElement)) {
            log.VV('target is input element, input type: ', target.type)
            if (["text", "number", "url"].includes(target.type.toLowerCase())) {
                this.sourceTarget = target
                return
            }
        }

        if (isInstance(target, window.HTMLTextAreaElement)) {
            log.VV('target is text area')
            this.sourceTarget = target
            return
        }

        // TODO: target maybe a customElement with closed mode

        log.V("unhandled target: ", target)
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

        if (event.defaultPrevented) {
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
        // this.c.applyOp(this.makeOp(OpType.end, event.target, event))
    }

    private makeOp(type: OpType, target: Node, e: DragEvent): Op {
        return Op.make({
            type: type,
            source: OpSource.fromNode(target),
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
