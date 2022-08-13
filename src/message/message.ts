import { CommandRequest, Script } from "../config/config"
import type { ModifierKey, Position, KVRecord } from "../types"



export interface ExecuteArgs {
	action: KVRecord,

	text: string
	image: string
	link: string

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

export interface openTabArgs {
	url: string,
}

export interface ScriptArgs {
	text: string
	selection: {
		text: string,
		image: string
		link: string
		primary: string
	}
}

export interface RuntimeMessageArgs {
	"execute": ExecuteArgs
	"contentScriptLoaded": any
	"ping": any
	"fetchURL": FetchURLArgs
	"closeCurrentTab": null
	"copy": string
	"doScript": ScriptArgs
}

export interface RuntimeMessage<K extends keyof RuntimeMessageArgs = any> {
	cmd: K,
	args: RuntimeMessageArgs[K]
}


export function buildRuntimeMessage<K extends keyof RuntimeMessageArgs>(cmd: K, args: RuntimeMessageArgs[K]): RuntimeMessage<K> {
	return {
		cmd,
		args
	}
}