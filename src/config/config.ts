import defaultTo from 'lodash-es/defaultTo'
import cloneDeep from 'lodash-es/cloneDeep'
import type { KVRecord } from "../types";


export enum LogLevel {
	Silent = 0,
	S = 0,
	V = 1,
	VV = 2,
	VVV = 3
}


export enum CommandKind {
	invalid = 'invalid',
	copy = 'copy',
	request = 'request',
	open = 'open',
	download = 'download',
	dump = "dump",
	script = "script",
}

export enum OperationMode {
	chain = 'chain',
	normal = 'normal',
	leftRightUpDown = 'leftRightUpDown',
	upDown = 'upDown',
	leftRight = 'leftRight',
	diagonal = 'diagonal',
	upperLeftLowerRight = 'upperLeftLowerRight',
	upperRightLowerLeft = 'upperRightLowerLeft',
	full = 'full',
	any = 'any',
	circleMenu = 'circleMenu',
	gridMenu = 'gridMenu',
	contextMenu = 'contextMenu',
}


export enum TabPosition {
	ignore = 'ignore',
	after = 'after',
	next = 'next',
	prev = 'prev',
	start = 'start',
	end = 'end',
	current = 'current',
	newWindow = 'newWindow',
	privateWindow = 'privateWindow',
}


export enum Direction {
	any = 'any',
	left = 'left',
	right = 'right',
	up = 'up',
	down = 'down',
	upperLeft = 'upperLeft',
	upperRight = 'upperRight',
	lowerLeft = 'lowerLeft',
	lowerRight = 'lowerRight',
}

export enum ContextType {
	selection = 'selection',
	image = 'image',
	link = 'link',
}

export enum ContextDataType {
	selection = 'selection',
	image = "image",
	imageSource = 'imageSource',
	link = 'link',
	linkText = 'linkText',
}

export type ContextData = {
	selection: string
	imageSource: string
	link: string
	linkText: string
};

export enum Feature {
	featureTab = "featureTab",
	middleButtonSelector = "middleButtonSelector",
	retainComponent = "retainComponent",
	auxClose = "auxClose"
}

export class LogConfig {

	private cfg: PlainLogConfig

	constructor(cfg: PlainLogConfig) {
		this.cfg = cfg
	}

	get level(): LogLevel {
		return defaultTo(this.cfg.level, LogLevel.S)
	}
}

export interface PlainLogConfig {
	level?: number
}

export class SmartURLConfig {

	cfg: PlainSmartURLConfig

	constructor(cfg: PlainSmartURLConfig) {
		this.cfg = cfg
	}

	get protocols(): string[] {
		return defaultTo(this.cfg.protocols, [])
	}
}

export interface PlainSmartURLConfig {
	protocols?: string[]
}

export class ModeConfig {

	private cfg: PlainModeConfig

	constructor(cfg: PlainModeConfig) {
		this.cfg = cfg
	}

	get link(): OperationMode {
		return defaultTo(this.cfg.link, OperationMode.normal)
	}

	get selection(): OperationMode {
		return defaultTo(this.cfg.selection, OperationMode.normal)
	}

	get image(): OperationMode {
		return defaultTo(this.cfg.image, OperationMode.normal)
	}

}

export interface PlainModeConfig {
	link?: OperationMode
	selection?: OperationMode
	image?: OperationMode
}

export class CommonConfig {
	private cfg: PlainCommonConfig
	private _mode: ModeConfig

	constructor(cfg: PlainCommonConfig) {
		this.cfg = cfg
		this._mode = new ModeConfig(defaultTo(this.cfg.mode, {}))
	}

	get mode(): ModeConfig {
		return this._mode
	}

	get minDistance(): number {
		return defaultTo(this.cfg.minDistance, 0)
	}

	get maxDistance(): number {
		return defaultTo(this.cfg.maxDistance, 0)
	}
}

export interface PlainCommonConfig {
	mode?: PlainModeConfig
	minDistance?: number
	maxDistance?: number
}

export enum MenuLayout {
	circle = "circle",
	grid = "grid"
}

export class MenuConfig {
	cfg: PlainMenuConfig

	constructor(cfg: PlainMenuConfig) {
		this.cfg = cfg
	}

}

export interface PlainMenuConfig {

}

export class Script {

	private cfg: PlainScript

	constructor(cfg: PlainScript) {
		this.cfg = cfg
	}

	toPlainObject() {
		return {
			id: this.id,
			text: this.text
		}
	}

	get id() {
		return defaultTo<string>(this.cfg.id, "")
	}

	get text() {
		return defaultTo<string>(this.cfg.text, "")
	}

	get name() {
		return defaultTo<string>(this.cfg.name, this.id)
	}
}

export interface PlainScript {
	id?: string
	text?: string
	name?: string
}



export class CommandRequest {

	private _url: string
	private _query: KVRecord<string>
	private _protocol: string
	private cfg: PlainCommandRequest

	constructor(cfg: PlainCommandRequest) {
		this.cfg = cloneDeep(cfg)

		const urlObj = new URL(cfg.url)

		this._query = defaultTo(cfg.query, {})
		for (const [k, v] of urlObj.searchParams) {
			this._query[k] = cloneDeep(v)
		}

		//strip query parameter
		urlObj.search = ""
		this._url = urlObj.toString()
		this._protocol = urlObj.protocol

	}

	toPlainObject(): PlainCommandRequest {
		return {
			"id": this.id,
			"name": this.name,
			"url": this.url,
			"query": this.query,
		}
	}

	get protocol() {
		return this._protocol
	}

	get id() {
		return defaultTo(this.cfg.id, '')
	}

	get name() {
		return defaultTo(this.cfg.name, this.id)
	}

	get method() {
		return "GET"
	}

	get url(): Readonly<string> {
		return this._url
	}

	get query(): Readonly<KVRecord<string>> {
		return this._query
	}

	mergeURLAndQuery(): URL {
		const clone = new URL(this.url)
		for (const [k, v] of Object.entries(this.query)) {
			clone.searchParams.set(k, v)
		}
		return clone
	}
}



export interface PlainCommandRequest {
	id?: string
	name?: string
	url?: string
	query?: KVRecord
}

export const enum AssetType {
	html = "html",
}

export class Asset {
	private cfg: PlainAsset

	constructor(cfg: PlainAsset) {
		this.cfg = cfg
	}

	get id(): string {
		return defaultTo(this.cfg.id, "")
	}

	get name(): string {
		return defaultTo(this.cfg.name, this.id)
	}

	get type(): AssetType {
		return defaultTo(this.cfg.type, AssetType.html)
	}

	get data(): string {
		return defaultTo(this.cfg.data, "")
	}
}

export interface PlainAsset {
	id?: string
	name?: string
	type?: AssetType
	data?: string
}

export class CommandConfig {

	private cfg: PlainCommandConfig

	constructor(cfg: PlainCommandConfig) {
		this.cfg = cfg
	}

	toPlainObject(): PlainCommandConfig {
		return {
			activeTab: cloneDeep(this.activeTab),
			tabPosition: cloneDeep(this.tabPosition),
			requestId: cloneDeep(this.requestId),
			directory: cloneDeep(this.directory),
			showSaveAsDialog: cloneDeep(this.showSaveAsDialog),
			scriptId: cloneDeep(this.scriptId),
			preferDataTypes: cloneDeep(this.preferDataTypes),
			container: cloneDeep(this.container),
		}
	}

	get activeTab(): boolean {
		return defaultTo<boolean>(this.cfg.activeTab, true)
	}

	get tabPosition(): TabPosition {
		return defaultTo<TabPosition>(this.cfg.tabPosition, TabPosition.ignore)
	}

	get requestId(): string {
		return defaultTo<string>(this.cfg.requestId, "")
	}

	get scriptId(): string {
		return defaultTo<string>(this.cfg.scriptId, "")
	}

	get directory(): string {
		return defaultTo<string>(this.cfg.directory, "")
	}

	get showSaveAsDialog(): boolean {
		return defaultTo<boolean>(this.cfg.showSaveAsDialog, false)
	}

	get preferDataTypes(): ContextDataType[] {
		return defaultTo<ContextDataType[]>(this.cfg.preferDataTypes, [])
	}

	get container(): string {
		return defaultTo<string>(this.cfg.container, "")
	}
}

export interface PlainCommandConfig {
	activeTab?: boolean
	tabPosition?: TabPosition
	requestId?: string
	scriptId?: string
	directory?: string
	showSaveAsDialog?: boolean
	preferDataTypes?: ContextDataType[]
	container?: string
}

export class ConditionConfig {
	private cfg: PlainConditionConfig

	constructor(cfg: PlainConditionConfig) {
		this.cfg = cfg
	}

	toPlainObject(): PlainConditionConfig {
		return {
			contextTypes: cloneDeep(this.contextTypes),
			directions: cloneDeep(this.directions),
			modes: cloneDeep(this.modes),
		}
	}

	get modes(): OperationMode[] {
		return defaultTo<OperationMode[]>(this.cfg.modes, [])
	}

	get contextTypes(): ContextType[] {
		return defaultTo<ContextType[]>(this.cfg.contextTypes, [])
	}

	get directions(): Direction[] {
		return defaultTo<Direction[]>(this.cfg.directions, [])
	}

	get extra(): ContextType[] {
		return defaultTo<ContextType[]>(this.cfg.extra, [])
	}
}

export interface PlainConditionConfig {
	modes?: OperationMode[]
	contextTypes?: ContextType[],
	directions?: Direction[],
	extra?: ContextType[]
}

export class ActionConfig {

	private cfg: PlainActionConfig
	private _conditionConfig: ConditionConfig
	private _config: CommandConfig

	constructor(cfg: PlainActionConfig) {
		this.cfg = cfg
		this._conditionConfig = new ConditionConfig(defaultTo(cfg.condition, {}))
		this._config = new CommandConfig(defaultTo(cfg.config, {}))
	}

	toPlainObject(): PlainActionConfig {
		return {
			id: cloneDeep(this.id),
			command: cloneDeep(this.command),
			condition: this.condition.toPlainObject(),
			config: this.config.toPlainObject(),
			icon: this.icon,
			iconAssetId: this.iconAssetId,
			prompt: this.prompt
		}
	}

	get id(): string {
		return defaultTo<string>(this.cfg.id, "")
	}

	get name(): string {
		return defaultTo<string>(this.cfg.name, this.id)
	}

	get prompt(): string {
		return defaultTo<string>(this.cfg.prompt, "")
	}

	get condition(): Readonly<ConditionConfig> {
		return this._conditionConfig
	}

	get command(): CommandKind {
		return defaultTo(this.cfg.command, CommandKind.invalid)
	}

	get config(): CommandConfig {
		return this._config
	}

	get icon(): string {
		return defaultTo<string>(this.cfg.icon, "")
	}

	get iconAssetId(): string {
		return defaultTo<string>(this.cfg.iconAssetId, "")
	}
}

export interface PlainActionConfig {
	id?: string
	name?: string
	condition?: PlainConditionConfig
	command?: CommandKind
	config?: PlainCommandConfig
	icon?: string
	iconAssetId?: string
	prompt?: string
}


export enum CompatibilityStatus {
	enable = "enable",
	force = "force",
	disable = "disable"
}

export interface PlainCompatibilityRule { host?: string, regexp?: string, status?: CompatibilityStatus }

export class CompatibilityRule {

	private _host: string
	private _regexp: string
	private _status: CompatibilityStatus

	constructor(cfg: PlainCompatibilityRule) {
		this._host = defaultTo(cfg.host, "")
		this._regexp = defaultTo(cfg.regexp, "")
		this._status = defaultTo(cfg.status, CompatibilityStatus.enable)
	}

	toPlainObject(): PlainCompatibilityRule {
		return {
			host: this._host,
			regexp: this.regexp,
			status: this.status,
		}
	}

	get host() {
		return this._host
	}

	get regexp() {
		return this._regexp
	}

	get status(): CompatibilityStatus {
		return this._status
	}
}

export class Configuration {

	private _features: Set<Feature> = new Set();
	private _actions: ActionConfig[] = [];
	private _log: LogConfig
	private _smartURL: SmartURLConfig
	private _common: CommonConfig
	private _menu: MenuConfig
	private _requests: CommandRequest[]
	private _assets: Asset[]
	private _scripts: Script[]
	private _compatibility: CompatibilityRule[]

	constructor(cfg?: PlainConfiguration) {
		cfg = defaultTo(cfg, {})

		this._log = new LogConfig(defaultTo(cfg.log, {}))
		this._smartURL = new SmartURLConfig(defaultTo(cfg.smartURL, {}))
		this._common = new CommonConfig(defaultTo(cfg.common, {}))
		this._menu = new MenuConfig(defaultTo(cfg.menu, {}))
		this._actions = defaultTo(cfg.actions, []).map((c: PlainActionConfig) => new ActionConfig(c))
		this._requests = defaultTo(cfg.requests, []).map((r: PlainCommandRequest) => new CommandRequest(r))
		this._assets = defaultTo(cfg.assets, []).map((r: PlainAsset) => new Asset(r))
		this._scripts = defaultTo(cfg.scripts, []).map((r: PlainScript) => new Script(r))
		this._compatibility = defaultTo(cfg.compatibility, []).map((r: PlainCompatibilityRule) => new CompatibilityRule(r))
		this._features = new Set(defaultTo(cfg.features as Feature[], []))
	}

	get features(): Set<string> {
		return this._features
	}

	get log(): LogConfig {
		return this._log
	}

	get smartURL(): SmartURLConfig {
		return this._smartURL
	}

	get common(): CommonConfig {
		return this._common
	}

	get menu(): MenuConfig {
		return this._menu
	}

	get actions(): readonly ActionConfig[] {
		return this._actions
	}

	get requests(): readonly CommandRequest[] {
		return this._requests
	}

	get assets(): readonly Asset[] {
		return this._assets
	}

	get scripts(): readonly Script[] {
		return this._scripts
	}

	get compatibility(): readonly CompatibilityRule[] {
		return this._compatibility
	}

	Enabled(f: Feature): boolean {
		return this._features.has(f)
	}
}

export type ReadonlyConfiguration = Readonly<Configuration>

export interface PlainConfiguration {
	log?: PlainLogConfig
	common?: PlainCommonConfig
	menu?: PlainMenuConfig,
	actions?: PlainActionConfig[],
	requests?: PlainCommandRequest[],
	assets?: PlainAsset[],
	scripts?: PlainScript[],
	compatibility?: PlainCompatibilityRule[],
	smartURL?: PlainSmartURLConfig,
	features?: string[]
}

export class BroadcastEventTarget<T> {

	private target: EventTarget
	private callbacks: { origin: Function, wrap: EventListener }[]

	constructor() {
		this.target = new EventTarget()
		this.callbacks = []
	}

	addListener(cb: (cfg: T) => any) {
		const wrap = (event: CustomEvent<T>) => {
			cb(event.detail)
		}
		this.callbacks.push({ origin: cb, wrap: wrap })
		this.target.addEventListener("data", wrap)
	}

	removeListener(cb: (cfg: T) => any) {
		while (true) {
			const item = this.callbacks.find(item => item.origin === cb)
			if (!item) {
				return
			}
			this.callbacks = this.callbacks.filter(a => a !== item)
			this.target.removeEventListener("data", item.wrap)
		}
	}

	notify(cfg: T) {
		this.target.dispatchEvent(new CustomEvent("data", { detail: cfg }))
	}
}

export const configBroadcast = new BroadcastEventTarget<ReadonlyConfiguration>()