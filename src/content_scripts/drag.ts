
import isEqual from 'lodash-es/isEqual'
import browser from 'webextension-polyfill'
import { ActionConfig, DirectionLabel, LogLevel, MenuLayout, OperationMode, type ReadonlyConfiguration } from '../config/config'
import { buildRuntimeMessage } from '../message/message'
import { ModifierKey, type Position } from '../types'
import { rootLog } from '../utils/log'
import { updateIndicatorProxy } from '../components/indicator/indicator_proxy'
import { getMenuSelectedIdProxy, updateMenuProxy } from '../components/menu/menu_proxy'
import { updateStatusProxy } from '../components/status/status_proxy'
import { buildDataTransferStorage, canDestinationAcceptDrop, EventPhase, guessDragContent, isEditableAndDraggable, isInputArea, isInstance, modifierKey, objectifyDataTransfer, stringifyEventPhase, type Guess } from './drag_utils'
import { LabelChain } from './label_chain'
import { StateMan, States } from './state_man'
import { directionLabelMapping, getAngle, transformMenuItem, type RangeMapping } from './utils'
import { VarSubstituteTemplate } from '../utils/var_substitute'


enum TriggerSource {
    unknown = 'unknown',
    document = 'document',
    external = 'external'
}

const log = rootLog.subLogger(LogLevel.VVV, 'drag')

export class Controller {

    state: StateMan
    dragTriggerSource: TriggerSource

    sourceTarget: EventTarget | null
    destTarget: EventTarget | null

    startPos: Position = { x: 0, y: 0 }
    endPos: Position = { x: 0, y: 0 }

    eventSource: GlobalEventHandlers
    config: ReadonlyConfiguration | null = null

    tmpStorage: Map<string, string> = new Map()
    titleTemplateCache: Map<string, VarSubstituteTemplate> = new Map()

    labelChain: LabelChain = new LabelChain()

    constructor(eventSource: GlobalEventHandlers) {
        this.state = new StateMan()
        this.dragTriggerSource = TriggerSource.unknown
        this.sourceTarget = null
        this.destTarget = null
        this.dragHandler = this.dragHandler.bind(this)
        this.eventSource = eventSource
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

    async updateStorage(config: ReadonlyConfiguration) {
        this.config = config
        this.titleTemplateCache.clear()
        this.config.actions.forEach(a => {
            try {
                const t = new VarSubstituteTemplate(a.title)
                this.titleTemplateCache.set(a.title, t)
            } catch (e) {
                log.E(e)
            }
        })
        log.VVV("new config", this.config)
    }

    private dragHandler(event: DragEvent): boolean {
        this.preCheckEvent(event)
        this.checkEvent(event)
        this.postCheckEvent(event)
        return true
    }

    private get distance(): number {
        return Math.hypot(this.startPos.x - this.endPos.x, this.startPos.y - this.endPos.y);
    }

    private preCheckEvent(e: DragEvent) {

        // TODO: more readable code
        if (this.tmpStorage.size === 0 && e.dataTransfer.items.length > 0) {
            this.tmpStorage = buildDataTransferStorage(e.dataTransfer)
        }

        // TODO: no magic number
        if (this.distance > 3) {
            const label = this.angleToLabel(getAngle(this.startPos, this.endPos))
            if (label) {
                if (this.config.mode === OperationMode.chain) {
                    this.labelChain.push(label)
                } else {
                    this.labelChain.overwrite(label)
                }
            } else {
                log.V("no label available")
            }
        }

    }

    private checkEvent(e: DragEvent) {

        log.VVV(
            'check event',
            {
                'type': e.type,
                'distance': this.distance.toFixed(2),
                'source': this.dragTriggerSource,
                'phase': stringifyEventPhase(e.eventPhase),
                'labels': this.labelChain.labels,
                target: e.target,
            },
            e,
        )

        log.VVV('before state: ', this.state.toString())

        switch (e.type) {
            case 'dragstart':
                this.checkDragStart(e)
                break
            case 'dragend':
                this.checkDragEnd(e)
                break
            case 'dragenter':
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
        log.VVV('after state: ', this.state.toString())

    }

    private postCheckEvent(e: DragEvent) {
        this.updateUI(e)
    }

    private updateUI(e: DragEvent) {


        const g = guessDragContent(
            this.sourceTarget,
            this.tmpStorage
        )

        const actions = this.filterAction(g, this.labelChain.labels)

        if (e.type === 'dragstart' && this.state.test(States.running)) {
            if (this.config.extension.minDistance > 0) {
                updateIndicatorProxy({
                    type: "show",
                    radius: this.config.extension.minDistance,
                    center: {
                        x: e.pageX,
                        y: e.pageY,
                    }
                })
            }

            if (actions.length) {
                updateMenuProxy({
                    center: {
                        x: e.pageX,
                        y: e.pageY,
                    },
                    type: "show",
                    layout: MenuLayout.circle,
                    items: transformMenuItem(actions, this.config.assets),
                })
            }
        }

        if (this.state.test(States.running)) {
            if (actions.length) {
                const title = actions[0].title
                // TODO: prevent render same "title" multiple times
                const tmpl = this.titleTemplateCache.get(title)
                if (tmpl) {
                    // TODO: determine what vars should be
                    const text = tmpl.substitute(new Map())
                    updateStatusProxy({ type: 'show', text: text })
                } else {
                    log.V(`missing template instance of title: "${title}"`)
                }
            } else if (this.state.test(States.exceedDistance)) {
                updateStatusProxy({ type: 'hide' })
            }
        } else {
            updateStatusProxy({ type: 'hide' })
        }
    }


    private reset() {
        this.state.reset()
        this.labelChain.reset()
        this.tmpStorage.clear()
        this.resetUI()
    }

    private resetUI() {
        this.state.clear()
        updateIndicatorProxy({ type: 'hide' })
        updateStatusProxy({ type: 'hide' })
        updateMenuProxy({ type: 'hide' })
    }

    private checkDragStart(event: DragEvent) {

        if (event.eventPhase != EventPhase.capturing) {
            return
        }

        this.reset()

        this.startPos.x = event.pageX
        this.startPos.y = event.pageY

        this.endPos.x = event.pageX
        this.endPos.y = event.pageY

        let target = event.target

        if (event.composed) {
            log.VV("composed event, check composed path")
            const paths = event.composedPath()
            if (paths.length) {
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
                    this.state.set(States.running)
                    this.dragTriggerSource = TriggerSource.document

                    return;
                }
                log.VV('not support anchor with javascript:')
                this.state.set(States.skip)
                return
            }

            this.sourceTarget = target
            this.state.set(States.running)
            this.dragTriggerSource = TriggerSource.document
            return
        }

        if (isInstance(target, window.HTMLImageElement)) {
            const a = target.closest("a") as HTMLAnchorElement | null
            if (a) {
                this.sourceTarget = a
            } else {
                this.sourceTarget = target
            }
            this.state.set(States.running)
            this.dragTriggerSource = TriggerSource.document
            return
        }

        if (isInstance(target, window.Text)) {
            this.sourceTarget = target
            this.state.set(States.running)
            this.dragTriggerSource = TriggerSource.document
            return
        }

        if (isInstance(target, window.HTMLInputElement)) {
            log.VV('target is input element, input type: ', target.type)
            if (["text", "number", "url"].includes(target.type.toLowerCase())) {
                this.sourceTarget = target
                this.state.set(States.running)
                this.dragTriggerSource = TriggerSource.document
                return
            }
        }

        if (isInstance(target, window.HTMLTextAreaElement)) {
            log.VV('target is text area')
            this.sourceTarget = target
            this.state.set(States.running)
            this.dragTriggerSource = TriggerSource.document
            return
        }

        // TODO: target maybe a customElement with closed mode

        log.V("unhandled target: ", target)
    }

    private checkDragEnter(event: DragEvent) {

        // always clear 'interfere' flag when DragEnter event occur.
        this.state.clear(States.interfere)

        const target = event.target!

        if (!canDestinationAcceptDrop(target)) {
            log.VV('destination target can not accept drop')
            return
        }

        if (this.state.test(States.skip)) {
            return
        }

        if (this.state.test_not(States.running)) {
            log.VV('drag enter is happened without running flag, do extra check')
            this.reset()
            if (event.dataTransfer) {
                this.state.set(States.running)
                log.VV('set trigger source to \'external\'')
                this.dragTriggerSource = TriggerSource.external
            }
        }

        if (this.state.test_not(States.running)) {
            return
        }

        log.VV('current dest target:', target)
        this.destTarget = target
    }

    private checkDragOver(event: DragEvent) {

        this.endPos.x = event.pageX
        this.endPos.y = event.pageY


        const target = event.target!

        if (!this.state.test(States.running)) {
            log.VV('drag over event is happened without running flag, skip!')
            return
        }

        if (this.checkDistance()) {
            this.state.clear(States.exceedDistance)
        } else {
            this.state.set(States.exceedDistance)
        }

        if (!canDestinationAcceptDrop(target)) {
            log.VV('drag over target can not accept drop')
            return
        }

        if (event.eventPhase === EventPhase.capturing) { // capture

        } else if (event.eventPhase === EventPhase.bubbling) { // bubble
            if (event.defaultPrevented) {
                log.VV('defaultPrevented is true, set \'interfere\' flag')
                this.state.set(States.interfere)
            }
            event.preventDefault()
        }
    }


    private checkDrop(event: DragEvent) {
        const target = event.target!

        if (!this.state.test(States.running)) {
            return
        }

        if (!canDestinationAcceptDrop(target)) {
            log.VV('event target can not accept drop')
            this.state.set(States.resolved, States.skip)
            return
        }

        if (isInputArea(target)) {
            log.VV('event target is input area')
            this.state.set(States.resolved, States.skip)
            return
        }

        if (this.dragTriggerSource === TriggerSource.external) {
            this.state.set(States.resolved)
            this.doDrop(event)
        } else if (this.dragTriggerSource === TriggerSource.document) {
            log.VV("cancel drop event")
            event.preventDefault()
            this.state.set(States.resolved)
        } else {
            throw new Error("unknown trigger source")
        }
    }

    private doDrop(event: DragEvent) {
        if (this.dragTriggerSource !== TriggerSource.external) {
            return
        }
        this.reset()
    }

    private checkDragLeave(event: DragEvent) {
        return
    }

    private checkDragEnd(event: DragEvent) {

        if (event.eventPhase !== EventPhase.bubbling) {
            return
        }

        if (this.state.test(States.skip)) {
            return
        }

        if (!this.state.test(States.resolved)) {
            log.VV("state is not resolved, maybe 'checkDrop' was not called, try re-evaluate")

            const b = [
                this.state.test(States.running),
                this.dragTriggerSource === TriggerSource.document,
                canDestinationAcceptDrop(event.target),
            ]

            if (b.every(v => v)) {
                log.VV("re-evaluate pass")
                this.state.set(States.resolved)
            } else {
                log.VV("re-evaluate failed")
                this.reset()
                return
            }
        }

        if (this.dragTriggerSource !== TriggerSource.document) {
            this.reset()
            throw new Error("trigger source is not document")
        }

        if (this.state.test(States.skip)) {
            log.VV("skip handle")
            this.reset()
            return
        }

        if (this.state.test(States.interfere)) {
            log.VV("interfere")
            this.reset()
            return
        }

        try {
            this.doDragEnd(event)
        } catch (e) {
            log.E(e)
        } finally {
            this.reset()
        }
    }

    private doDragEnd(event: DragEvent) {
        if (!this.sourceTarget) {
            log.V("missing sourceTarget")
            return
        }

        const guess = guessDragContent(
            this.sourceTarget,
            this.tmpStorage,
        )

        log.VV('dragEnd', {
            sourceTarget: this.sourceTarget,
            types: guess.types,
            key: modifierKey(event),
            textSel: guess.textSel,
            linkSel: guess.linkSel,
            imageSel: guess.imageSel,
            dt: new Map(this.tmpStorage),
            distance: this.distance,
            labels: this.labelChain.labels,
            mode: this.config.mode,
        })

        this.postCommand(guess)
    }

    private postCommand(g: Guess) {

        if (!this.config) {
            return
        }

        let action: ActionConfig | null = null

        if (this.config.mode === OperationMode.circle) {
            const id = getMenuSelectedIdProxy()
            log.VV("menu id: ", id)
            action = this.config.actions.find(c => c.id === id)
        } else {

            const actions = this.filterAction(g, this.labelChain.labels)
            log.VV("labels: ", this.labelChain.labels)
            if (actions.length) {
                action = actions[0]
            }
        }

        if (!action) {
            log.VVV("not found candidate action")
            return
        }

        log.VVV("use action:", action)

        let cmd = buildRuntimeMessage("execute", {
            action: action.toPlainObject(),
            text: g.textSel,
            link: g.linkSel,
            image: g.imageSel,
            url: location.href,
            title: document.title,
            modifierKey: ModifierKey.none,
            startPosition: this.startPos,
            endPosition: this.endPos,
        })

        log.VVV("cmd", cmd)
        browser.runtime.sendMessage(cmd);
    }

    angleToLabel(angle: number): DirectionLabel | null {

        const rangeMapping = this.getAngleRangeMapping()

        if (!rangeMapping) {
            return null
        }

        for (const obj of rangeMapping) {
            if (obj.range[0] <= angle && angle < obj.range[1]) {
                return obj.label;
            }
        }

        return null
    }

    getAngleRangeMapping(): RangeMapping[] | null {
        if (!this.config) {
            return null
        }
        if (directionLabelMapping[this.config.mode]) {
            return directionLabelMapping[this.config.mode]
        }
        log.VVV("missing mapping of mode: ", this.config.mode)
        return null
    }

    filterAction(g: Guess, labels: readonly string[]): ActionConfig[] {
        if (!this.config) {
            return
        }
        return this.config.actions
            .filter((action) => {
                return action.condition.modes.length === 0
                    // contains any of 
                    || action.condition.modes.includes(this.config.mode)
            })
            .filter((action) => {
                return action.condition.types.length === 0
                    // subset
                    || action.condition.types.every((t) => g.types.has(t))
            })
            .filter((action) => {
                return action.condition.labels.length === 0
                    // equal
                    || isEqual(action.condition.labels, labels)
            })
            .filter((action) => {
                return action.condition.extra.length === 0
                    || action.condition.extra.every((label) => g.types.has(label))
            })
    }


    checkDistance(): boolean {

        if (this.config.extension.maxDistance != 0 && this.distance > this.config.extension.maxDistance) {
            return false
        }

        if (this.config.extension.minDistance != 0 && this.distance < this.config.extension.minDistance) {
            return false
        }

        return true
    }
}
