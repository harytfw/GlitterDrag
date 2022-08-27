import { MessageTarget } from '../helper';
import { ProxyEventType, type Prompt } from '../types';
import App from './prompt.svelte';


interface PromptElement extends HTMLElement {
	update(text: string)
}

export const promptApp = new App({ target: undefined }) as any as PromptElement;


export class PromptImpl extends MessageTarget implements Prompt {

	constructor() {
		super(ProxyEventType.Status)
	}

	show(text: string) {
		promptApp.update(text)
		!promptApp.parentElement && document.body.append(promptApp)
	}

	hide() {
		promptApp.remove()
	}
}

export const promptImpl = new PromptImpl()
