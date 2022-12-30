import browser from 'webextension-polyfill';
import buildInfo from "../build_info";
import { configBroadcast, Configuration } from "../config/config";
import { RuntimeMessageName, type RuntimeMessage } from "../message/message";
import { ExtensionStorageKey, type ExtensionStorage } from "../types";
import { captureError } from '../utils/error';
import { rootLog } from '../utils/log';
import { buildExecuteContextFromMessageSender } from '../context/utils';
import { Executor } from "./executor";
import { onMenuItemClick, registerContextMenuActions } from './menu';
import { defaultVolatileState } from '../state/state';

captureError()

configBroadcast.addListener(cfg => {
    registerContextMenuActions(cfg)
})

async function onContentScriptLoaded(tabId: number, frameId?: number) {

}

async function saveVolatileState() {
    rootLog.V("saving volatile state")
    const state = await defaultVolatileState()
    await state.save()
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


browser.alarms.create("save-state", { periodInMinutes: 3.0 })

browser.alarms.onAlarm.addListener(async (alarm) => {
    if (alarm.name === "save-state") {
        await saveVolatileState()
    }
})

browser.runtime.onSuspend.addListener(async () => {
    await saveVolatileState()
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



browser.storage.local.onChanged.addListener(async () => {
    const storage = (await browser.storage.local.get(ExtensionStorageKey.userConfig)) as ExtensionStorage
    const config = new Configuration(storage.userConfig)
    configBroadcast.notify(config)
})

browser.contextMenus.onClicked.addListener(onMenuItemClick)

async function openMocha() {
    const url = new URL(browser.runtime.getURL("test/mocha.html"))

    try {
        const res = await fetch(url)
        if (!res.ok) {
            return
        }
        const text = await res.text()
        if (text.length <= 0) {
            return
        }
    } catch (e) {
        console.error(e)
        return
    }

    browser.tabs.create({
        url: url.toString()
    })

}

browser.runtime.onInstalled.addListener((detail) => {
    console.log("on installed: ", detail)
    if (__BUILD_PROFILE === "debug") {
        openMocha()
    }
})

console.log("background script executed.")
console.log("build info: ", buildInfo)

browser.storage.local.get().then((storage) => {
    const config = new Configuration(storage[ExtensionStorageKey.userConfig])
    configBroadcast.notify(config)
})