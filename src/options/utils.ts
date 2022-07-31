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

const browserSearchEngineURL = "browser://search"

export function buildSearchEngineCommandRequest(name: string): PlainCommandRequest {
	return {
		id: uuidv4(),
		name: name,
		url: browserSearchEngineURL,
		query: {
			"engine": name
		}
	}

}

export function getBrowserSearchEngineName(req: PlainCommandRequest): string {
	if (req.url === browserSearchEngineURL && typeof req.query.engine === "string") {
		return req.query.engine
	}
	return ""
}

export async function browserSearchEngineToCommandRequest(): Promise<PlainCommandRequest[]> {
	const searchEngines = await browser.search.get()
	return searchEngines.map(se => {
		return buildSearchEngineCommandRequest(se.name)
	})
}


export function isValueInputElement(elem: any): elem is HTMLInputElement & HTMLSelectElement & HTMLTextAreaElement {
	return elem instanceof HTMLInputElement ||
		elem instanceof HTMLSelectElement ||
		elem instanceof HTMLTextAreaElement
}