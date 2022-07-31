
import App from './indicator.svelte';
import { EventType, type IndicatorMessage } from '../message';

const indicatorApp = new App({ target: undefined }) as any as HTMLElement;

export function updateIndicator(msg: IndicatorMessage) {
	if (msg.type === "hide") {
		indicatorApp.remove()
	} else {
		indicatorApp.dispatchEvent(new CustomEvent(EventType.Indicator, { detail: msg }))
		!indicatorApp.parentElement && document.body.append(indicatorApp)
	}
}

globalThis.addEventListener("indicator-proxy", (event: CustomEvent<string>) => {
	updateIndicator(JSON.parse(event.detail) as IndicatorMessage)
})
