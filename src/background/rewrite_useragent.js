"use strict";

const MOBILE_UA = `Mozilla/5.0 (Linux; Android 7.0; SM-G892A Build/NRD90M; wv) AppleWebKit/537.36 (KHTML, like Gecko) Version/4.0 Chrome/67.0.3396.87 Mobile Safari/537.36`;

function rewriteUserAgentHeader(e) {
    for (var header of e.requestHeaders) {
        if (header.name.toLowerCase() === "user-agent") {
            consoleUtil.log("find bing dict page, rewrite ua");
            header.value = MOBILE_UA;
        }
    }
    return { requestHeaders: e.requestHeaders };
}

browser.webRequest.onBeforeSendHeaders.addListener(
    rewriteUserAgentHeader,
    { urls: ["https://bing.com/dict/*", "https://cn.bing.com/dict/*"] },
    ["blocking", "requestHeaders"],
);

