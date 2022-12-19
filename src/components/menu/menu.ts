
import MenuElement from './menu.svelte';
import { ProxyEventType, type MenuInterface, type ShowMenuOptions } from '../types';
import { MessageTarget } from '../helper';
import { rootLog } from '../../utils/log';
import { LogLevel } from '../../config/config';

const log = rootLog.subLogger(LogLevel.VVV, "menu")
const tag = "glitterdrag-menu"
const style = `position: absolute;
	left: 0;
	top: 0;
	z-index: 2147483647;
`
class MenuImpl extends MessageTarget implements MenuInterface {
	elem: MenuElement & HTMLElement

	constructor() {
		super(ProxyEventType.Menu)
		customElements.define(tag, MenuElement as any);
		this.elem = document.createElement(tag) as HTMLElement & MenuElement
		this.elem.setAttribute("style", style);
	}

	show(opts: ShowMenuOptions) {
		log.V("show menu: ", opts)
		this.elem.show(opts)
		!this.elem.parentElement && document.body.append(this.elem)
	}

	hide() {
		if (!this.elem.parentElement) {
			return
		}
		log.V("hide menu")
		this.elem.reset()
		this.elem.remove()
	}

}

export const menuImpl = new MenuImpl()