
import cloneDeep from 'lodash-es/cloneDeep'
import isEqual from 'lodash-es/isEqual'
import browser from 'webextension-polyfill'
import { indicatorProxy } from '../components/indicator/indicator_proxy'
import { menuProxy } from '../components/menu/menu_proxy'
import { promptProxy } from '../components/prompt/prompt_proxy'
import { EventType } from '../components/types'
import { ActionConfig, configBroadcast, Configuration, ContextType, Feature, LogLevel, MenuLayout, OperationMode, type ReadonlyConfiguration } from '../config/config'
import { buildRuntimeMessage, RuntimeMessageName } from '../message/message'
import { ModifierKey, type KVRecord, type Position } from '../types'
import { rootLog } from '../utils/log'
import { VarSubstituteTemplate } from '../utils/var_substitute'
import { buildDataTransferStorage, canDestinationAcceptDropFix as canDestinationAcceptDrop, isInputArea } from './drag_utils'
import { ChainItem, DirectionChain } from './label_chain'
import { OpSource } from './op_source'
import { StateManager, States } from './state_man'
import { angleToDirection, getAngle, transformMenuItem } from './utils'

const log = rootLog.subLogger(LogLevel.VVV, 'op')

export enum OpType {
    start,
    running,
    end,
    reset,
}

export interface OpPositions {
    page: Position,
    screen: Position,
    client: Position,
    real: Position,
}

export function buildOpPosition(e: DragEvent, frameX: number = 0, frameY: number = 0): OpPositions {
    return {
        page: { x: e.pageX, y: e.pageY },
        client: { x: e.clientX, y: e.clientY },
        screen: { x: e.screenX, y: e.screenY },
        real: { x: e.clientX + frameX, y: e.clientY + frameY }
    }
}

export class Op {
    type: OpType
    source: OpSource
    positions: OpPositions
    data: Map<string, string>
    modifierKeys: Set<ModifierKey>

    private constructor() { }

    static make(opt: { type: OpType, source: OpSource, position: OpPositions, dt: DataTransfer }): Op {
        const op = new Op
        op.type = opt.type
        op.source = opt.source
        op.positions = opt.position
        op.data = buildDataTransferStorage(opt.dt)
        op.modifierKeys = new Set()
        return op
    }

    toPlainObject(): KVRecord {
        return {
            type: this.type,
            source: this.source.toPlainObject(),
            position: this.positions,
            data: Array.from(this.data.entries()),
            modifierKeys: Array.from(this.modifierKeys.entries())
        }
    }

    static fromPlainObject(obj: KVRecord): Op {
        const op = new Op
        op.type = obj.type
        op.source = OpSource.fromPlainObject(obj.source)
        op.positions = obj.position
        op.data = new Map(obj.data)
        op.modifierKeys = new Set(obj.modifierKeys)
        return op
    }

}


export interface OpResult {
    cancelDrop: boolean
}

const defaultOpResult: OpResult = { cancelDrop: false }

export interface OpSummary {
    contextTypes: readonly ContextType[]
    selection: string
    link: string
    linkText: string
    imgSrc: string
}

const forwardOpEventName = "glitter-drag:forward-op"

export class OpExecutor {
    state: StateManager
    source: OpSource | null
    startPos: Position = { x: 0, y: 0 }
    endPos: Position = { x: 0, y: 0 }
    config: ReadonlyConfiguration = new Configuration({})
    data: Map<string, string> = new Map()
    titleTemplateCache: Map<string, VarSubstituteTemplate> = new Map()
    dirChain: DirectionChain = new DirectionChain()
    selectedMenuId = ""

    constructor() {
        this.state = new StateManager()
        this.source = null
        window.addEventListener(forwardOpEventName, (event: CustomEvent<string>) => {
            this.applyOp(Op.fromPlainObject(JSON.parse(event.detail)))
        })
        window.addEventListener(EventType.MenuSelectedId, (e: CustomEvent<string>) => {
            this.selectedMenuId = e.detail
            log.VVV("new menu id: ", this.selectedMenuId)
        })
        configBroadcast.addListener(this.updateConfig.bind(this))
    }

    private async updateConfig(config: ReadonlyConfiguration) {
        this.config = config
        this.titleTemplateCache.clear()
        this.config.actions.forEach(a => {
            try {
                const t = new VarSubstituteTemplate(a.prompt ? a.prompt : a.name)
                log.V("new template: ", t.template)
                this.titleTemplateCache.set(t.template, t)
            } catch (e) {
                log.E(e)
            }
        })
        log.VVV("new config", this.config)
    }

    private get distance(): number {
        return Math.hypot(this.startPos.x - this.endPos.x, this.startPos.y - this.endPos.y);
    }

    public applyOp(op: Op): OpResult {
        if (window.top != window.self) {
            if (window.frameElement) {
                window.top.dispatchEvent(new CustomEvent(forwardOpEventName, { detail: JSON.stringify(op.toPlainObject()) }))
                return defaultOpResult
            }

            log.VVV("detect cross origin drag operation")
            return defaultOpResult
        }

        log.VVV('apply op: ', op)
        log.VVV('apply op, position: ', JSON.stringify(op.positions), JSON.stringify(this.data), JSON.stringify(this.dirChain))


        switch (op.type) {
            case OpType.start:
                this.reset()
                this.onStart(op)
                this.updateUI(op)
                this.data = new Map(op.data.entries())
                return defaultOpResult
            case OpType.running: {
                this.onRunning(op)
                this.updateUI(op)
                return defaultOpResult
            }
            case OpType.end:
                const r = this.onEnd(op)
                this.updateUI(op)
                return r
            case OpType.reset:
                this.reset()
                return defaultOpResult
            default:
                throw new Error("unknown op type: " + op.type)
        }
    }

    private updateUI(op: Op) {

        if (!this.state.test(States.running)) {
            return
        }

        const g = this.source.summary()
        const mode = this.currentMode()
        const actions = this.filterActionConfig(g)

        if (op.type === OpType.start) {
            if (this.config.common.minDistance > 0) {
                indicatorProxy.show(
                    this.config.common.minDistance,
                    op.positions.page,
                )
            }

            if (actions.length && (mode === OperationMode.circleMenu || mode === OperationMode.gridMenu)) {
                let layout = MenuLayout.circle
                if (mode === OperationMode.gridMenu) {
                    layout = MenuLayout.grid
                }
                menuProxy.show({
                    position: op.positions.page,
                    layout: layout,
                    items: transformMenuItem(actions, this.config.assets),
                })
            }
            return
        }

        if (op.type === OpType.running) {
            let action: ActionConfig | null = null

            if (mode === OperationMode.circleMenu || mode === OperationMode.gridMenu) {
                if (this.selectedMenuId.length > 0) {
                    action = this.config.actions.find(a => a.id === this.selectedMenuId)
                }
            } else if (actions.length > 0) {
                action = actions[0]
            }

            if (!this.checkDistance()) {
                promptProxy.show("<em>out of range</em>")
            } else if (action) {
                const template = action.prompt ? action.prompt : action.name
                const tmpl = this.titleTemplateCache.get(template)
                if (tmpl) {
                    const text = tmpl.substitute(new Map())
                    promptProxy.show(text)
                } else {
                    log.V(`missing template instance: "${prompt}"`)
                    promptProxy.hide()
                }
            } else {
                promptProxy.show("<em>no action</em>")
            }


            return
        }
    }


    reset() {
        this.state.reset()
        this.dirChain.reset()
        this.data.clear()
        this.source = null
        this.selectedMenuId = ""
        this.resetUI()
    }

    private resetUI() {
        if (this.config && !this.config.Enabled(Feature.retainComponent)) {
            indicatorProxy.hide()
            menuProxy.hide()
            promptProxy.hide()
        }
    }

    private updateDirChain() {
        // TODO: no magic number
        if (this.distance < 3) {
            return
        }

        const mode = this.currentMode()

        if (mode != OperationMode.chain) {
            const dir = angleToDirection(mode, getAngle(this.startPos, this.endPos))
            const latest = new ChainItem(dir, this.startPos, this.endPos)
            this.dirChain.overwrite(latest)
            return
        }

        let latest = this.dirChain.pop()
        let newChain: ChainItem | null = null

        if (!latest) {
            const dir = angleToDirection(mode, getAngle(this.startPos, this.endPos))
            latest = new ChainItem(dir, this.startPos, this.endPos)
        }

        if (Math.hypot(latest.end.x - this.endPos.x, latest.end.y - this.endPos.y) > 3) {
            const nextDir = angleToDirection(mode, getAngle(latest.end, this.endPos))
            if (latest.dir == nextDir) {
                latest.end = cloneDeep(this.endPos)
            } else {
                newChain = new ChainItem(nextDir, latest.end, this.endPos)
            }
        }

        this.dirChain.push(latest)
        if (newChain) {
            this.dirChain.push(newChain)
        }
    }

    private onStart(op: Op) {

        this.reset()

        this.startPos = op.positions.real
        this.endPos = op.positions.real

        this.source = op.source.clone()
        this.state.set(States.running)
    }

    private onRunning(op: Op) {

        if (!this.state.test(States.running)) {
            return
        }

        this.updateDirChain()

        this.endPos = op.positions.real

        if (this.checkDistance()) {
            this.state.set(States.distanceOk)
        } else {
            this.state.clear(States.distanceOk)
        }
    }

    private onEnd(op: Op): OpResult {

        if (!this.state.test(States.running)) {
            log.VV("state: not running")
            return { cancelDrop: false }
        }

        if (!canDestinationAcceptDrop(op.source)) {
            log.VV('event target can not accept drop')
            this.state.set(States.resolved, States.skip)
            return { cancelDrop: false }
        }

        if (isInputArea(op.source)) {
            log.VV('event target is input area')
            this.state.set(States.resolved, States.skip)
            return { cancelDrop: false }
        }

        if (this.state.test(States.skip)) {
            log.VV("state: skip")
            this.reset()
            return { cancelDrop: false }
        }

        if (this.state.test_not(States.distanceOk)) {
            log.VV("out of distance")
            this.reset()
            return { cancelDrop: true }
        }

        try {

            const g = this.source.summary()

            log.VV('before post command', {
                sourceTarget: this.source,
                contextTypes: g.contextTypes,
                key: Array.from(op.modifierKeys)[0],
                text: g.selection,
                link: g.link,
                image: g.imgSrc,
                dt: new Map(this.data),
                distance: this.distance,
                labels: this.dirChain.directions,
                mode: this.currentMode(),
            })
            this.postCommand(g)
        } catch (e) {
            log.E(e)
        } finally {
            this.reset()
        }
        return { cancelDrop: true }
    }

    private postCommand(g: OpSummary) {

        if (!this.config) {
            log.VV("no config")
            return
        }

        if (g.contextTypes.length === 0) {
            throw new Error("missing context types")
        }

        let action: ActionConfig | null = null
        const mode = this.currentMode()
        if (mode === OperationMode.circleMenu || mode === OperationMode.gridMenu) {
            const id = this.selectedMenuId
            action = this.config.actions.find(c => c.id === id)
        } else {
            const actions = this.filterActionConfig(g)
            if (actions.length) {
                action = actions[0]
            }
        }

        if (!action) {
            log.VVV("not found candidate action")
            return
        }

        log.VVV("use action:", action)

        let cmd = buildRuntimeMessage(RuntimeMessageName.execute, {
            action: action.toPlainObject(),
            data: {
                selection: g.selection,
                link: g.link,
                linkText: g.linkText,
                imageSource: g.imgSrc,
            },
            url: location.href,
            title: document.title,
            modifierKey: ModifierKey.none,
            startPosition: this.startPos,
            endPosition: this.endPos,
        })

        log.VVV("cmd", cmd)
        browser.runtime.sendMessage(cmd);
    }



    filterActionConfig(g: OpSummary): ActionConfig[] {
        if (!this.config) {
            throw new Error("missing config")
        }
        const mode = this.currentMode()
        const dirs = this.dirChain.directions
        return this.config.actions
            .filter((action) => {
                return action.condition.modes.length === 0
                    // contains any of 
                    || action.condition.modes.includes(mode)
            })
            .filter((action) => {
                return action.condition.contextTypes.length === 0
                    // subset
                    || action.condition.contextTypes.every((t) => g.contextTypes.includes(t))
            })
            .filter((action) => {
                return action.condition.directions.length === 0
                    // equal
                    || isEqual(action.condition.directions, dirs)
            })
            .filter((action) => {
                return action.condition.extra.length === 0
                    || action.condition.extra.every((label) => g.contextTypes.includes(label))
            })
    }


    checkDistance(): boolean {

        if (this.config.common.maxDistance > 0 && this.distance > this.config.common.maxDistance) {
            return false
        }

        if (this.config.common.minDistance > 0 && this.distance < this.config.common.minDistance) {
            return false
        }

        return true
    }

    currentMode(): OperationMode {

        if (!this.config) {
            throw new Error("require config")
        }

        const g = this.source.summary()

        if (!g.contextTypes.length) {
            throw new Error("require context type")
        }

        let contextType = g.contextTypes[0]

        switch (contextType) {
            case ContextType.selection:
                return this.config.common.mode.selection
            case ContextType.link:
                return this.config.common.mode.link
            case ContextType.image:
                return this.config.common.mode.image
            default:
                throw new Error("unreachable: " + contextType)
        }
    }
}

