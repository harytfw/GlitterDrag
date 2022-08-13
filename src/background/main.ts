import browser from 'webextension-polyfill'
import buildInfo from "../build_info";
import { Configuration } from "../config/config";
import { type RuntimeMessage, type RuntimeMessageArgs } from "../message/message";
import type { ExtensionStorage } from "../types";
import { captureError } from '../utils/error';
import { configureRootLog, rootLog } from '../utils/log';
import { buildExecuteContext } from './context';
import { Executor } from "./executor";
import { defaultVolatileState } from './volatile_state';

captureError()

async function onLoadConfiguration(config: Configuration) {
    configureRootLog(config)
}

async function onContentScriptLoaded(tabId: number, frameId?: number) {
    let frameIds = frameId ? [frameId] : undefined

    await browser.scripting.insertCSS({
        target: {
            tabId,
            frameIds
        },
        files: [
            "content_scripts/content_script.css"
        ]
    })
}

browser.tabs.onRemoved.addListener(async () => {
    rootLog.VVV("a tab is remove, reset tab counter")
    const state = await defaultVolatileState()
    state.backgroundTabCounter = 0;
});

browser.tabs.onActivated.addListener(async () => {
    rootLog.VVV("a tab is activate, reset tab counter")
    const state = await defaultVolatileState()
    state.backgroundTabCounter = 0;
});

browser.runtime.onSuspend.addListener(async () => {
    rootLog.V("saving volatile state")
    const state = await defaultVolatileState()
    await state.save()
});

browser.runtime.onMessage.addListener(async (m: RuntimeMessage<keyof RuntimeMessageArgs>, sender: browser.Runtime.MessageSender) => {

    rootLog.VVV("cmd: ", m.cmd, "sender tabId: ", sender.tab)

    switch (m.cmd) {
        case "execute": {
            const executor = new Executor();
            let ctx = await buildExecuteContext(m.args, sender)
            executor.execute(ctx)
            return
        }
        case "contentScriptLoaded": {
            if (sender.tab) {
                return onContentScriptLoaded(sender.tab.id, sender.frameId)
            }
            return
        }
        case "closeCurrentTab": {
            await browser.tabs.remove(sender.tab.id)
            return
        }
        default: {
            rootLog.E("unhandled message: ", m)
            return
        }
    }
});

browser.storage.local.get().then((storage) => {
    onLoadConfiguration(new Configuration(storage.userConfig))
})

browser.storage.local.onChanged.addListener(async () => {
    const storage = (await browser.storage.local.get('userConfig')) as ExtensionStorage
    onLoadConfiguration(new Configuration(storage.userConfig))
})

rootLog.V("background script executed.")
rootLog.V(buildInfo)

if (__BUILD_PROFILE === "test") {
    const url = new URL(browser.runtime.getURL("test/mocha.html"))
    if (buildInfo.mochaFilter) {
        url.searchParams.set("grep", `/${buildInfo.mochaFilter}/`)
    }
    browser.tabs.create({
        url: url.toString()
    })
}