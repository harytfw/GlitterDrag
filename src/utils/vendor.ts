
export function isFirefox(): boolean {
	let g: any = globalThis
	for (const k of ['browser', 'runtime']) {
		if (!g) {
			return false
		}
		g = g[k]
	}
	return g && g.getURL && g.getURL("").startsWith("moz")
}

export function isChromium(): boolean {
	return !isFirefox()
}
