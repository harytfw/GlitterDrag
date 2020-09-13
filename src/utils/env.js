const userAgent = navigator.userAgent;
let browser = "";
if (userAgent.includes("Firefox")) {
    browser = "firefox";
}
else if (userAgent.includes("Chrome")) {
    browser = "chromium";
}
else {
    browser = "other";
}

export const isFirefox = browser === "firefox";
export const isChromium = browser === "chromium";
export const isWebExtension = typeof window.browser !== "undefined" && typeof window.browser.runtime !== "undefined";
export const isPage = typeof window.browser === "undefined" || typeof window.browser.runtime === "undefined";
export const isChildFrame = window.top !== window;
