import browser from 'webextension-polyfill';

export async function closeTab(tabIds: number | number[], delayMs?: number) {
	if (typeof delayMs === 'number') {
		await new Promise(r => setTimeout(r, delayMs))
	}
	return browser.tabs.remove(tabIds)
}