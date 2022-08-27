import { Stub } from "../helper";
import { ProxyEventType, type Prompt } from "../types";

export class PromptProxy extends Stub implements Prompt {

	constructor() {
		super(ProxyEventType.Status)
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
