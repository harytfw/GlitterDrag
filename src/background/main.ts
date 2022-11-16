import browser from 'webextension-polyfill';
import buildInfo from "../build_info";
import { Configuration } from "../config/config";
import { RuntimeMessageName, type RuntimeMessage, type RuntimeMessageArgsMap } from "../message/message";
import { ExtensionStorageKey, type ExtensionStorage } from "../types";
import { captureError } from '../utils/error';
import { configureRootLog, rootLog } from '../utils/log';
import { buildExecuteContextFromMessageSender } from './context';
import { Executor } from "./executor";
import { onMenuItemClick, registerContextMenuActions } from './menu';
import { defaultVolatileState } from './volatile_state';

captureError()

async function onLoadConfiguration(config: Configuration) {
    configureRootLog(config)
    registerContextMenuActions(config)
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

browser.tabs.onRemoved.addListener(async (tabId,) => {
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

browser.runtime.onMessage.addListener(async (m: any, sender: browser.Runtime.MessageSender) => {

    rootLog.VVV("cmd: ", m.cmd, "sender tabId: ", sender.tab)
    const cmd = m.cmd as string
    switch (cmd) {
        case RuntimeMessageName.execute: {
            const args = (m as RuntimeMessage<typeof cmd>).args
            const executor = new Executor();
            let ctx = await buildExecuteContextFromMessageSender(args, sender)
            executor.execute(ctx)
            return
        }
        case RuntimeMessageName.contextScriptLoaded: {
            if (sender.tab) {
                return onContentScriptLoaded(sender.tab.id, sender.frameId)
            }
            return
        }
        case RuntimeMessageName.closeCurrentTab: {
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
    const config = new Configuration(storage[ExtensionStorageKey.userConfig])
    onLoadConfiguration(config)
})

browser.storage.local.onChanged.addListener(async () => {
    const storage = (await browser.storage.local.get(ExtensionStorageKey.userConfig)) as ExtensionStorage
    onLoadConfiguration(new Configuration(storage.userConfig))
})

browser.contextMenus.onClicked.addListener(onMenuItemClick)


console.log("background script executed.")
console.log(buildInfo)

if (__BUILD_PROFILE === "debug") {
    const url = new URL(browser.runtime.getURL("test/mocha.html"))
    if (buildInfo.mochaFilter) {
        url.searchParams.set("grep", `/${buildInfo.mochaFilter}/`)
    }
    browser.tabs.create({
        url: url.toString()
    })
}