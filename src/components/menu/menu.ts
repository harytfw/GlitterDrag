
import App from './menu.svelte';
import { ProxyEventType, type Menu, type ShowMenuOptions } from '../types';
import { MessageTarget } from '../helper';
import { rootLog } from '../../utils/log';
import { LogLevel } from '../../config/config';

const log = rootLog.subLogger(LogLevel.VVV, "menu")

interface MenuElement extends HTMLElement {
	update(opts: ShowMenuOptions)
	reset()
}

const menuApp = new App({ target: undefined }) as any as MenuElement;

class MenuImpl extends MessageTarget implements Menu {
	constructor() {
		super(ProxyEventType.Menu)
	}

	hide() {
		if (!menuApp.parentElement) {
			return
		}
		log.V("hide menu")
		menuApp.reset()
		menuApp.remove()
	}

	show(opts: ShowMenuOptions) {
		log.V("show menu: ", opts)
		menuApp.update(opts)
		!menuApp.parentElement && document.body.append(menuApp)
	}
}

export const menuImpl = new MenuImpl()