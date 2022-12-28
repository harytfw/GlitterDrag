import { v4 } from 'uuid';
import browser from "webextension-polyfill";
import { type PlainCommandRequest } from '../config/config';

export function uuidv4() {
	return v4()
}

export function titleCase(s: string): string {
	if (!s.length) {
		return
	}
	return s.charAt(0).toUpperCase() + s.slice(1)
}


export function isValueInputElement(elem: any): elem is HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement {
	return elem instanceof HTMLInputElement ||
		elem instanceof HTMLSelectElement ||
		elem instanceof HTMLTextAreaElement
}