import { rootLog } from "../../utils/log";
import { Stub } from "../helper";
import { EventType, ProxyEventType, type Menu, type ShowMenuOptions, } from "../types";



// TODO: test menu under iframe
export class MenuProxy extends Stub implements Menu {

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
