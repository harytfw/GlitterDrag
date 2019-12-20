var environment = Object.freeze({
    isFirefox: true,
    isChrome: false,
    isEdge: false,
    isNode: false,
    isWebExtension: typeof window.browser === 'undefined',
    isNormalDocument: typeof window.browser === 'object'
})

