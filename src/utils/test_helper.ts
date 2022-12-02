
import browser from 'webextension-polyfill';
import isEqual from "lodash-es/isEqual"

export function assertEqual(expected: any, actual: any, ...message: any[]) {
	return assertOk(isEqual(actual, expected), ...message)
}

export function assertOk(value: any, ...message: any[]) {
	if (!value) {
		throw new Error(message.join(" "))
	}
}

export function assertFail(value: any, ...message: any[]) {
	if (!!value) {
		throw new Error(message.join(" "))
	}
}

export async function closeTab(tabIds: number | number[], delayMs?: number) {
	if (typeof delayMs === 'number') {
		await new Promise(r => setTimeout(r, delayMs))
	}
	return browser.tabs.remove(tabIds)
}