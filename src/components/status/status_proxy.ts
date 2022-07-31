import { EventType, type StatusMessage } from "../message";

export function updateStatusProxy(msg: StatusMessage) {
	globalThis.dispatchEvent(new CustomEvent(EventType.StatusProxy, {detail: JSON.stringify(msg)}))
}