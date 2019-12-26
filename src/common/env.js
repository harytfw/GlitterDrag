"use strict";
var environment = Object.freeze({
    isFirefox: true,
    isChrome: false,
    isEdge: false,
    isNode: false,
    isWebExtension: typeof window.browser !== "undefined" && typeof window.browser.runtime !== "undefined",
    isNormalDocument: typeof window.browser === "undefined" || typeof window.browser.runtime === "undefined"
})

