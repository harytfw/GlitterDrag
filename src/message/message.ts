import { type ContextData } from "../config/config"
import type { ModifierKey, Position, KVRecord } from "../types"



export type ExecuteArgs = {
	action: KVRecord,
	data: ContextData,
	url: string
	title: string
	modifierKey: ModifierKey
	startPosition: Position
	endPosition: Position
}


export type ResponseEncoding = "plain" | "base64"

export interface FetchURLArgs {
	url: string
	timeoutMs: number
	encoding: ResponseEncoding
}


export interface FetchURLReply {
	data: string
}

export interface ScriptArgs {
	text: string
	data: {
		text: string,
		imageSource: string
		linkText: string,
		link: string
		primary: string
	}
}

export enum RuntimeMessageName {
	execute = "execute",
	contextScriptLoaded = "contentScriptLoaded",
	ping = "ping",
	fetchURL = "fetchURL",
	closeCurrentTab = "closeCurrentTab",
	copy = "copy",
	executeScript = "doScript"
}

export interface RuntimeMessageArgsMap {
	"execute": ExecuteArgs
	"fetchURL": FetchURLArgs
	"closeCurrentTab": null
	"contentScriptLoaded": null
	"ping": null
	"copy": string
	"doScript": ScriptArgs

}

export type RuntimeMessageArg<K> =
	K extends RuntimeMessageName.execute ? ExecuteArgs
	: K extends RuntimeMessageName.executeScript ? ScriptArgs
	: K extends RuntimeMessageName.fetchURL ? FetchURLArgs
	: K extends RuntimeMessageName.copy ? string
	: null

export interface RuntimeMessage<K extends RuntimeMessageName> {
	cmd: K,
	args: RuntimeMessageArg<K>
}

export function buildRuntimeMessage<K extends RuntimeMessageName>(cmd: K, args: RuntimeMessageArg<K>): RuntimeMessage<K> {
	return {
		cmd,
		args
	}
}
