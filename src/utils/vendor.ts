
export function isFirefox(): boolean {
	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/runtime/getBrowserInfo
	let g: unknown = globalThis
	for (const k of ['browser', 'runtime', 'getBrowserInfo']) {
		if (!g) {
			return false
		}
		g = g[k]
	}
	return typeof g === 'function'
}

export function isChromium(): boolean {
	return !isFirefox()
}
