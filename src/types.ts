export type KVRecord<V = any> = Record<string, V>

export interface Position {
	x: number,
	y: number
}

export enum ModifierKey {
	none = 0,
	shift = 1,
	ctrl = 2,
	alt = 3,
}

export const enum ExtensionStorageKey {
	userConfig = 'userConfig'
}

export type ExtensionStorage = { [key in ExtensionStorageKey]: KVRecord<unknown> }
