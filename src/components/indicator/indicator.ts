
import IndicatorElement from './indicator.svelte';
import { ProxyEventType, type IndicatorInterface } from '../types';
import type { Position } from '../../types';
import { MessageTarget } from '../helper';



const tag = "glitterdrag-indicator"
const style = `position: absolute;
	left: 0;
	top: 0;
	pointer-events: none;
	z-index: 2147483647;
`
class IndicatorImpl extends MessageTarget implements IndicatorInterface {
	elem: IndicatorElement & HTMLElement
	constructor() {
		super(ProxyEventType.Indicator)
		customElements.define(tag, IndicatorElement as any);
		this.elem = document.createElement(tag) as typeof this.elem;
		this.elem.setAttribute("style", style);
	}

	show(radius: number, pos: Position) {
		this.elem.show(radius, pos);
		!this.elem.parentElement && document.body.append(this.elem)
	}

	hide() {
		this.elem.remove()
	}
}

export const indicatorImpl = new IndicatorImpl()

