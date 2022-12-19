import { MessageTarget } from '../helper';
import { ProxyEventType, type PromptInterface } from '../types';
import PromptElement from './prompt.svelte';

export class PromptImpl extends MessageTarget implements PromptInterface {

	elem: HTMLElement & PromptElement

	constructor() {
		super(ProxyEventType.Prompt)
		customElements.define('glitterdrag-prompt', PromptElement as any);
		this.elem = document.createElement("glitterdrag-prompt") as HTMLElement & PromptElement;
	}

	show(text: string) {
		this.elem.show(text)
		!this.elem.parentElement && document.body.append(this.elem);
	}

	hide() {
		this.elem.remove()
	}
}

export const promptImpl = new PromptImpl()
