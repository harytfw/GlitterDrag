import browser from 'webextension-polyfill';
import { Direction } from '../config/config';

export interface LocaleMessage {
	[key: string]: string
}


export const defaultLocaleMessage = new Proxy({}, {
	get(_target, p) {
		if (typeof p === 'string') {
			const m = browser.i18n.getMessage(p)
			if (!m) {
				return p
			}
			return m
		}
		return p
	}
}) as LocaleMessage
