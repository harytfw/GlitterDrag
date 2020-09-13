import 'webextension-polyfill'

import * as logUtil from '../utils/log'
import {
    Executor
}
from './executor'




logUtil.logErrorEvent();


var executor = new Executor();


async function insertCSS(sender) {
    browser.tabs.insertCSS(sender.tab.id, {
        frameId: sender.frameId,
        file: browser.runtime.getURL("content_scripts/content_script.css"),
        runAt: "document_end",
    });
    const storage = await (browser.storage.local.get(["enableStyle", "style"]));
    if (storage.enableStyle === true) {
        browser.tabs.insertCSS(sender.tab.id, {
            frameId: sender.frameId,
            code: storage.style,
            runAt: "document_end"
        });
    }
}

browser.runtime.onMessage.addListener(async(m, sender) => {
    switch (m.msgCmd) {
        case "removeHighlighting":
            executor.removeHighlighting();
            break;
        case "insertCSS":
            insertCSS(sender);
            break;
        case "postAction":
            executor.DO(m, sender);
            break;
    }
});
console.info("Glitter Drag: background script executed.");
console.info(env);
