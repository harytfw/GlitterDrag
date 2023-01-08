
import browser from 'webextension-polyfill';
import { assert } from 'chai'

export function assertEqual(expected: any, actual: any, ...message: any[]) {
	return assert.deepEqual(actual, expected, ...message)
}

export function assertOk(value: any, ...message: any[]) {
	return assert.ok(value, ...message)
}

export function assertFail(value: any, ...message: any[]) {
	return assert.notOk(value, ...message)
}

export async function closeTab(tabIds: number | number[], delayMs?: number) {
	if (typeof delayMs === 'number') {
		await new Promise(r => setTimeout(r, delayMs))
	}
	return browser.tabs.remove(tabIds)
}