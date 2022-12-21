
import MenuElement from './menu.svelte';
import { ProxyEventType, type MenuInterface, type ShowMenuOptions } from '../types';
import { MessageTarget } from '../helper';
import { rootLog } from '../../utils/log';
import { LogLevel } from '../../config/config';

const log = rootLog.subLogger(LogLevel.VVV, "menu")
const tag = "glitterdrag-menu"

function computeStyle(x: number, y: number, width: number, height: number) {
	const style = `position: absolute;
		left: ${x}px;
		top: ${y}px;
		z-index: 2147483647;
		width: ${width}px;
		height: ${height}px;
	`
	return style
}

class MenuImpl extends MessageTarget implements MenuInterface {
	elem: MenuElement & HTMLElement

	constructor() {
		super(ProxyEventType.Menu)
		customElements.define(tag, MenuElement as any);
		this.elem = document.createElement(tag) as HTMLElement & MenuElement
		this.elem.setAttribute("style", computeStyle(0, 0, 0, 0));
	}


	show(opts: ShowMenuOptions) {
		log.V("show menu: ", opts)
		const [width, height] = this.elem.box()
		const x = opts.position.x - width / 2
		const y = opts.position.y - height / 2
		this.elem.setAttribute("style", computeStyle(x, y, width, height));
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