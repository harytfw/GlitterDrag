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
	start = 'start',
	end = 'end',
	prev = 'prev',
	next = 'next',
	current = 'current',
	newWindow = 'newWindow',
	privateWindow = 'privateWindow'
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
	imageSource = 'imageSource',
	link = 'link',
	linkText = 'linkText',
}

export type ContextData = {
	[k in ContextDataType]: string;
};

export enum Feature {
	middleButtonSelector = "middleButtonSelector",
	retainComponent = "retainComponent",
	auxClose = "auxClose",
}

export class LogConfig {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	get level(): LogLevel {
		return defaultTo(this.cfg['level'], LogLevel.S)
	}
}

export interface PlainLogConfig {
	level: number
}

export class SmartURLConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}
}


export class ModeConfig {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	get link(): OperationMode {
		return defaultTo(this.cfg['link'], OperationMode.normal)
	}

	get selection(): OperationMode {
		return defaultTo(this.cfg['selection'], OperationMode.normal)
	}

	get image(): OperationMode {
		return defaultTo(this.cfg['image'], OperationMode.normal)
	}

}

export class CommonConfig {
	private cfg: KVRecord
	private _mode: ModeConfig

	constructor(cfg: KVRecord) {
		this.cfg = cfg
		this._mode = new ModeConfig(defaultTo(this.cfg['mode'], {}))
	}

	get mode(): ModeConfig {
		return this._mode
	}

	get allow(): string[] {
		return defaultTo(this.cfg['allow'], [])
	}

	get disallow(): string[] {
		return defaultTo(this.cfg['disallow'], [])
	}

	get minDistance(): number {
		return defaultTo(this.cfg['minDistance'], 0)
	}

	get maxDistance(): number {
		return defaultTo(this.cfg['maxDistance'], 0)
	}
}

export interface PlainCommonConfig {
	mode?: string
	allowHost?: string[]
	disallowHost?: string[]
	minDistance?: number
	maxDistance?: number
}

export enum MenuLayout {
	circle = "circle",
	grid = "grid"
}

export class MenuConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

}

export interface PlainMenuConfig {

}

export class ListModeConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}
}

export class Script {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	toPlainObject() {
		return {
			id: this.id,
			text: this.text
		}
	}

	get id() {
		return defaultTo<string>(this.cfg['id'], "")
	}

	get text() {
		return defaultTo<string>(this.cfg['text'], "")
	}

	get name() {
		return defaultTo<string>(this.cfg['name'], this.id)
	}
}

export interface PlainScript {
	id?: string
	text?: string
	name?: string
}



export class CommandRequest {

	private _url: URL
	private _query: KVRecord<string>

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
		this._url = new URL(cfg['url'])
		this._query = defaultTo(cfg['query'], {})
		for (const [k, v] of this._url.searchParams) {
			this._query[k] = cloneDeep(v)
		}
	}

	toPlainObject(): PlainCommandRequest {
		return {
			"id": this.id,
			"name": this.name,
			"url": this.url.toString(),
			"query": this.query
		}
	}

	get protocol() {
		return this._url.protocol
	}

	get id() {
		return defaultTo(this.cfg['id'], '')
	}

	get name() {
		return defaultTo(this.cfg["name"], this.id)
	}

	get method() {
		return "GET"
	}

	get url(): Readonly<URL> {
		return this._url
	}

	get query() {
		return this._query
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
	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	get id(): string {
		return defaultTo(this.cfg["id"], "")
	}

	get name(): string {
		return defaultTo(this.cfg["name"], this.id)
	}

	get type(): AssetType {
		return defaultTo(this.cfg["type"], AssetType.html)
	}

	get data(): string {
		return defaultTo(this.cfg["data"], "")
	}
}

export interface PlainAsset {
	id?: string
	name?: string
	type?: string
	data?: string
}

export class CommandConfig {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
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
		return defaultTo<boolean>(this.cfg['activeTab'], true)
	}

	get tabPosition(): TabPosition {
		return defaultTo<TabPosition>(this.cfg['tabPosition'], TabPosition.next)
	}

	get requestId(): string {
		return defaultTo<string>(this.cfg['requestId'], "")
	}

	get scriptId(): string {
		return defaultTo<string>(this.cfg['scriptId'], "")
	}

	get directory(): string {
		return defaultTo<string>(this.cfg['directory'], "")
	}

	get showSaveAsDialog(): boolean {
		return defaultTo<boolean>(this.cfg['showSaveAsDialog'], false)
	}

	get preferDataTypes(): ContextDataType[] {
		return defaultTo<ContextDataType[]>(this.cfg['preferDataTypes'], [])
	}

	get container(): string {
		return defaultTo<string>(this.cfg['container'], "")
	}
}

export interface PlainCommandConfig {
	activeTab?: boolean
	tabPosition?: string
	requestId?: string
	scriptId?: string
	directory?: string
	showSaveAsDialog?: boolean
	preferDataTypes?: string[]
	container?: string
}

export class ConditionConfig {
	private cfg: KVRecord

	constructor(cfg: KVRecord) {
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
		return defaultTo<OperationMode[]>(this.cfg['modes'], [])
	}

	get contextTypes(): ContextType[] {
		return defaultTo<ContextType[]>(this.cfg['contextTypes'], [])
	}

	get directions(): Direction[] {
		return defaultTo<Direction[]>(this.cfg['directions'], [])
	}

	get extra(): ContextType[] {
		return defaultTo<ContextType[]>(this.cfg['extra'], [])
	}
}

export interface PlainConditionConfig {
	modes?: string[]
	contextTypes?: string[],
	directions?: string[],
	extra?: string[]
}

export class ActionConfig {

	private cfg: KVRecord
	private _conditionConfig: ConditionConfig
	private _config: CommandConfig

	constructor(cfg: KVRecord) {
		this.cfg = cfg
		this._conditionConfig = new ConditionConfig(defaultTo(cfg['condition'], {}))
		this._config = new CommandConfig(defaultTo(cfg['config'], {}))
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
		return defaultTo<string>(this.cfg['id'], "")
	}

	get name(): string {
		return defaultTo<string>(this.cfg['name'], this.id)
	}

	get prompt(): string {
		return defaultTo<string>(this.cfg['prompt'], "")
	}

	get condition(): Readonly<ConditionConfig> {
		return this._conditionConfig
	}

	get command(): CommandKind {
		return defaultTo(this.cfg['command'], CommandKind.invalid)
	}

	get config(): CommandConfig {
		return this._config
	}

	get icon(): string {
		return defaultTo<string>(this.cfg['icon'], "")
	}

	get iconAssetId(): string {
		return defaultTo<string>(this.cfg['iconAssetId'], "")
	}
}

export interface PlainActionConfig {
	id?: string
	name?: string
	condition?: PlainConditionConfig
	command?: string
	config?: PlainCommandConfig
	icon?: string
	iconAssetId?: string
	prompt?: string
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

	constructor(data?: KVRecord) {
		data = defaultTo(data, {})

		this._log = new LogConfig(defaultTo(data['log'], {}))
		this._smartURL = new SmartURLConfig(defaultTo(data['smartURL'], {}))
		this._common = new CommonConfig(defaultTo(data['common'], {}))
		this._menu = new MenuConfig(defaultTo(data['grid'], {}))
		this._actions = defaultTo(data['actions'], []).map((c: KVRecord) => new ActionConfig(c))
		this._features = new Set(defaultTo(data['features'], []))
		this._requests = defaultTo(data['requests'], []).map((r: KVRecord) => new CommandRequest(r))
		this._assets = defaultTo(data['assets'], []).map((r: KVRecord) => new Asset(r))
		this._scripts = defaultTo(data['scripts'], []).map((r: KVRecord) => new Script(r))
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
}