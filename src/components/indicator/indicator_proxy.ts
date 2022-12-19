import type { Position } from "../../types";
import { Stub } from "../helper";
import { ProxyEventType, type IndicatorInterface } from "../types";


export class IndicatorProxy extends Stub implements IndicatorInterface {

	constructor() {
		super(ProxyEventType.Indicator)
	}

	show(radius: number, center: Position) {
		this.forwardMessage({
			name: "show",
			args: [radius, center]
		})
	}

	hide() {
		this.forwardMessage({
			name: "hide",
			args: []
		})
	}
}

export const indicatorProxy = new IndicatorProxy()
