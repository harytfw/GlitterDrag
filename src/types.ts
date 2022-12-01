export type KVRecord<V = any> = Record<string, V>

export interface Position {
	readonly x: number,
	readonly y: number
}

export enum ModifierKey {
	none = 0,
	shift,
	ctrl,
	alt,
}

export enum ExtensionStorageKey {
	userConfig = 'userConfig',
	firstTimeUse = "firstTimeUse"
}

export type ExtensionStorage = { [key in ExtensionStorageKey]?: KVRecord<unknown> | unknown }
