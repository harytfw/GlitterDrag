import type { Position } from "../../types";
import { Stub } from "../helper";
import { ProxyEventType, type Indicator } from "../types";


export class IndicatorProxy extends Stub implements Indicator {

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
