import { rootLog } from "../utils/log";
import type { GenericFunction } from "./types";

export class Stub {

	eventName: string

	constructor(eventName: string) {
		this.eventName = eventName
	}

	forwardMessage(msg: GenericFunction) {
		window.dispatchEvent(new CustomEvent(this.eventName, { detail: JSON.stringify(msg) }))
	}
}

export class MessageTarget {

	event: string

	constructor(event: string) {
		this.event = event
		globalThis.addEventListener(this.event, (event: CustomEvent<string>) => {
			this.onMessage(JSON.parse(event.detail) as any as GenericFunction)
		})
	}

	onMessage(msg: GenericFunction) {
		const fn = this[msg.name as any] as any
		if (typeof fn !== 'function') {
			rootLog.E("method %s not found", msg.name)
			return
		}
		fn.apply(this, msg.args);
	}
}