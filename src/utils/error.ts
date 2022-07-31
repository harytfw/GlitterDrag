function logError(e: ErrorEvent | PromiseRejectionEvent) {
	console.error(e)
}


export function captureError() {
	globalThis.addEventListener('unhandledrejection', logError)
	globalThis.addEventListener('error', logError)
}