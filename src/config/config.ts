import defaultTo from 'lodash-es/defaultTo'
import cloneDeep from 'lodash-es/cloneDeep'
import type { KVRecord } from "../types";


export const enum LogLevel {
	Silent = 0,
	S = 0,
	V = 1,
	VV = 2,
	VVV = 3
}


export const enum CommandKind {
	invalid = 'invalid',
	copy = 'copy',
	request = 'request',
	open = 'open',
	download = 'download',
	dump = "dump",
	script = "script",
}

export const enum OperationMode {
	chain = 'chain',
	normal = 'normal',
	leftRightUpDown = 'normal',
	upDown = 'upDown',
	leftRight = 'leftRight',
	diagonal = 'diagonal',
	upperLeftLowerRight = 'upperLeftLowerRight',
	upperRightLowerLeft = 'upperRightLowerLeft',
	full = 'full',
	any = 'any',
	circle = 'circle',
	grid = 'grid',
}

// 类型优先级
export enum TypePriority {
	image = 'image',
	link = 'link',
	text = 'text',
}

export const enum TabPosition {
	start = 'start',
	end = 'end',
	before = 'before',
	next = 'next',
	current = 'current',
	window = 'newWindow',
	privateWindow = 'privateWindow'
}


export enum DirectionLabel {
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

export enum TypeConstraint {
	text = 'text',
	image = 'image',
	link = 'link',
}


export enum Feature {
	middleButtonSelector = "middleButtonSelector"
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

export class SmartURLConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}
}

export class ExtensionConfig {
	private _allow: string[] = [];
	private _disallow: string[] = [];
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
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


export enum MenuLayout {
	circle = "circle",
	grid = "grid"
}

export class MenuModeConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

}

export class ListModeConfig {
	cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}
}

export class Script {

	private cfg: KVRecord

	constructor (cfg: KVRecord) {
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
}

export class CommandRequest {

	private _url: URL
	private _query: KVRecord<string>

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
		this._url = new URL(cfg['url'])
		this._query = defaultTo(cfg['query'], {})
	}

	toPlainObject() {
		return {
			"id": this.id,
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

export const enum AssetType {
	html = "html",
}

export class Asset {
	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	get id() {
		return defaultTo(this.cfg["id"], "")
	}

	get type(): AssetType {
		return defaultTo(this.cfg["type"], AssetType.html)
	}

	get data(): string {
		return defaultTo(this.cfg["data"], "")
	}
}

export class CommandConfig {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	toPlainObject(): KVRecord {
		return {
			activeTab: cloneDeep(this.activeTab),
			tabPosition: cloneDeep(this.tabPosition),
			requestId: cloneDeep(this.requestId),
			directory: cloneDeep(this.directory),
			showSaveAsDialog: cloneDeep(this.showSaveAsDialog),
			scriptId: cloneDeep(this.scriptId),
			priorities: cloneDeep(this.priorities),
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

	get priorities(): TypePriority[] {
		return defaultTo<TypePriority[]>(this.cfg['priorities'], [])
	}

	get container(): string {
		return defaultTo<string>(this.cfg['container'], "")
	}
}

export class ActionStyleConfig {

	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	toPlainObject(): KVRecord {
		return {
			menuIcon: cloneDeep(this.menuIconId),
		}
	}

	get menuIconId(): string {
		return defaultTo<string>(this.cfg['menuIconId'], "")
	}

}


export class ConditionConfig {
	private cfg: KVRecord

	constructor(cfg: KVRecord) {
		this.cfg = cfg
	}

	toPlainObject(): KVRecord {
		return {
			types: cloneDeep(this.types),
			labels: cloneDeep(this.labels),
			modes: cloneDeep(this.modes),
		}
	}

	get modes(): OperationMode[] {
		return defaultTo<OperationMode[]>(this.cfg['modes'], [])
	}

	get types(): TypeConstraint[] {
		return defaultTo<TypeConstraint[]>(this.cfg['types'], [])
	}

	get labels(): DirectionLabel[] {
		return defaultTo<DirectionLabel[]>(this.cfg['labels'], [])
	}

	get extra(): TypeConstraint[] {
		return defaultTo<TypeConstraint[]>(this.cfg['extra'], [])
	}
}

export class ActionConfig {

	private cfg: KVRecord
	private _conditionConfig: ConditionConfig
	private _config: CommandConfig
	private _style: ActionStyleConfig

	constructor(cfg: KVRecord) {
		this.cfg = cfg
		this._conditionConfig = new ConditionConfig(defaultTo(cfg['condition'], {}))
		this._config = new CommandConfig(defaultTo(cfg['config'], {}))
		this._style = new ActionStyleConfig(defaultTo(cfg['style'], {}))
	}

	toPlainObject(): KVRecord {
		return {
			id: cloneDeep(this.id),
			command: cloneDeep(this.command),
			condition: this.condition.toPlainObject(),
			config: this.config.toPlainObject(),
			style: this.style.toPlainObject(),
		}
	}

	toJSON() {
		return this.toPlainObject()
	}

	get id(): string {
		return defaultTo<string>(this.cfg['id'], "")
	}

	get title(): string {
		return defaultTo<string>(this.cfg['title'], this.id)
	}

	get condition(): ConditionConfig {
		return this._conditionConfig
	}

	get command(): CommandKind {
		return defaultTo(this.cfg['command'], CommandKind.invalid)
	}

	get config(): CommandConfig {
		return this._config
	}

	get style(): ActionStyleConfig {
		return this._style
	}

}


export class Configuration {

	private _features: Set<string> = new Set();
	private _mode: OperationMode;
	private _actions: ActionConfig[] = [];
	private _log: LogConfig
	private _smartURL: SmartURLConfig
	private _extension: ExtensionConfig
	private _menu: MenuModeConfig
	private _requests: CommandRequest[]
	private _assets: Asset[]
	private _scripts: Script[]

	constructor(data?: KVRecord) {
		data = defaultTo(data, {})

		this._mode = defaultTo(data['mode'], OperationMode.chain)
		this._log = new LogConfig(defaultTo(data['log'], {}))
		this._smartURL = new SmartURLConfig(defaultTo(data['smartURL'], {}))
		this._extension = new ExtensionConfig(defaultTo(data['extension'], {}))
		this._menu = new MenuModeConfig(defaultTo(data['grid'], {}))
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

	get extension(): ExtensionConfig {
		return this._extension
	}

	get menu(): MenuModeConfig {
		return this._menu
	}

	get mode(): OperationMode {
		return this._mode
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
}

export type ReadonlyConfiguration = Readonly<Configuration>