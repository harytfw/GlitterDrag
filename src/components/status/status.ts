import { EventType, type StatusMessage } from '../message';
import App from './status.svelte';

export const statusApp = new App({ target: undefined }) as any as HTMLElement;

export function updateStatus(msg: StatusMessage) {
	if (msg.type === 'hide') {
		statusApp.remove()
	} else {
		statusApp.dispatchEvent(new CustomEvent(EventType.Status, { detail: { content: msg.text } }))
		!statusApp.parentElement && document.body.append(statusApp)
	}
}

globalThis.addEventListener(EventType.StatusProxy, (event: CustomEvent<string>) => {
	updateStatus(JSON.parse(event.detail) as StatusMessage)
})
