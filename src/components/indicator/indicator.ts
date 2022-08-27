
import App from './indicator.svelte';
import { ProxyEventType, type Indicator } from '../types';
import type { Position } from '../../types';
import { MessageTarget } from '../helper';


interface IndicatorElement extends HTMLElement {
	update(radius: number, position: Position)
}

const indicatorElem = new App({ target: undefined }) as any as IndicatorElement;

class IndicatorImpl extends MessageTarget implements Indicator {

	constructor() {
		super(ProxyEventType.Indicator)
	}

	show(radius: number, pos: Position) {
		indicatorElem.update(radius, pos);
		!indicatorElem.parentElement && document.body.append(indicatorElem)
	}

	hide() {
		indicatorElem.remove()
	}
}

export const indicatorImpl = new IndicatorImpl()

