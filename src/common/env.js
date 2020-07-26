"use strict";
var env = {};
{
    const userAgent = navigator.userAgent;
    let browser = "";
    if (userAgent.includes("Firefox")) {
        browser = "firefox";
    } else if (userAgent.includes("Chrome")) {
        browser = "chromium";
    } else {
        browser = "other";
    }

    env.browser = browser;
    env.isFirefox = browser === "firefox";
    env.isChromium = browser === "chromium";
    env.isWebExtension = typeof window.browser !== "undefined" && typeof window.browser.runtime !== "undefined";
    env.isPage = typeof window.browser === "undefined" || typeof window.browser.runtime === "undefined";
    env.isChildFrame = window.top !== window;
    Object.freeze(env);
}
