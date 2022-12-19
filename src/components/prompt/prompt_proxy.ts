import { Stub } from "../helper";
import { ProxyEventType, type PromptInterface } from "../types";

export class PromptProxy extends Stub implements PromptInterface {

	constructor() {
		super(ProxyEventType.Prompt)
	}

	show(text: string) {
		this.forwardMessage({
			name: "show",
			args: [text],
		})
	}

	hide() {
		this.forwardMessage({
			name: "hide",
			args: [],
		})
	}
}

export const promptProxy = new PromptProxy()
