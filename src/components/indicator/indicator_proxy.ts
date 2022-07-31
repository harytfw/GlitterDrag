import { EventType, type IndicatorMessage } from "../message";

export function updateIndicatorProxy(msg: IndicatorMessage) {
	globalThis.dispatchEvent(new CustomEvent(EventType.IndicatorProxy, {detail: JSON.stringify(msg)}))
}
