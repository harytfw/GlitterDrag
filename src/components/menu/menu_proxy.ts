import { Stub } from "../helper";
import { ProxyEventType, type MenuInterface, type ShowMenuOptions } from "../types";



// TODO: test menu under iframe
export class MenuProxy extends Stub implements MenuInterface {

	constructor() {
		super(ProxyEventType.Menu)
	}

	show(opts: ShowMenuOptions) {
		this.forwardMessage({
			name: "show",
			args: [opts],
		})
	}

	hide() {
		this.forwardMessage({
			name: "hide",
			args: []
		})
	}
}

export const menuProxy = new MenuProxy()
