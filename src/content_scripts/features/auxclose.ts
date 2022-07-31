import browser from 'webextension-polyfill';
import { buildRuntimeMessage, RuntimeMessageName } from '../../message/message';

export class MiddleButtonClose {
	target: HTMLElement
	constructor(target: HTMLElement) {
		this.target = target
		this.auxclick = this.auxclick.bind(this);
	}

	async start() {
		this.target.addEventListener("auxclick", this.auxclick);
	}

	async stop() {
		this.target.removeEventListener("mouseup", this.auxclick)
	}

	auxclick(e: MouseEvent) {
		const target = e.target
		if (target instanceof HTMLElement) {
			if (target.closest("a")) {
				return
			}
			if (e.defaultPrevented) {
				return
			}
			// https://developer.mozilla.org/en-US/docs/Web/API/MouseEvent/button
			if (e.button != 1) {
				return
			}
			e.preventDefault()
			browser.runtime.sendMessage(buildRuntimeMessage(RuntimeMessageName.closeCurrentTab, null))
		}
	}
};

