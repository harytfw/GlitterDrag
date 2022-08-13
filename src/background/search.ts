
import browser from 'webextension-polyfill';
import { isFirefox } from '../utils/vendor';
export interface SearchTextOption {
	query: string
	engine?: string
	tabId?: number
}

export async function searchText(opt: SearchTextOption): Promise<void> {
	if (isFirefox()) {
		return browser.search.search({
			query: opt.query,
			engine: opt.engine,
			tabId: opt.tabId,
		})
	} else {
		// https://developer.chrome.com/docs/extensions/reference/search/
		return chrome.search.query({
			text: opt.query,
			tabId: opt.tabId,
		})
	}
}