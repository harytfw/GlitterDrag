
import App from './menu.svelte';
import { EventType, type MenuItem, type MenuMessage } from '../message';

export const menuApp = new App({ target: undefined }) as any as HTMLElement;

export function updateMenu(msg: MenuMessage) {
	if (msg.type === "hide") {
		menuApp.dispatchEvent(new CustomEvent<MenuMessage>(EventType.Menu, {
			detail: {
				type: "reset"
			}
		}))
		menuApp.remove()
		return
	}

	menuApp.dispatchEvent(new CustomEvent(EventType.Menu, { detail: msg }))
	!menuApp.parentElement && document.body.append(menuApp)
}

export function getMenuSelectedId(): string {
	if ('id' in menuApp.dataset) {
		return menuApp.dataset['id']
	}
	return ""
}

globalThis.addEventListener(EventType.MenuProxy, (event: CustomEvent<string>) => {
	updateMenu(JSON.parse(event.detail) as MenuMessage)
})

globalThis.addEventListener(EventType.MenuSelectedIDProxy, (event: CustomEvent) => {
	const id = getMenuSelectedId()
	document.head.setAttribute("gd-menu-selected-id", id)
})