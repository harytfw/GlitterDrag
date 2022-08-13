import cloneDeep from "lodash-es/cloneDeep"
import type { ScriptArgs } from "../message/message"


export class ScriptWrapper {

	private args: ScriptArgs

	constructor(args: ScriptArgs) {
		this.args = cloneDeep(args)
	}

	do() {
		const text = `
		{
			const selection = ${JSON.stringify(this.args.selection)};
			!(function() {
				${this.args.text}
			}).apply(selection)
		}
		`
		const elem = document.createElement("script")
		elem.text = text
		document.body.append(elem)
	}
}