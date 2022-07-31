import { EventType, type MenuMessage,  } from "../message";

export function updateMenuProxy(msg: MenuMessage) {
	globalThis.dispatchEvent(new CustomEvent(EventType.MenuProxy, {detail: JSON.stringify(msg)}))
}

export function getMenuSelectedIdProxy(): string {
	globalThis.dispatchEvent(new CustomEvent(EventType.MenuSelectedIDProxy))
	const id = document.head.getAttribute("gd-menu-selected-id")
	return id ? id : ""
}
