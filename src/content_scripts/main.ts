import browser from 'webextension-polyfill';
import { Configuration, Feature, type ReadonlyConfiguration } from '../config/config';
import { buildRuntimeMessage, type FetchURLReply, type RuntimeMessage, type RuntimeMessageArgs } from '../message/message';
import type { ExtensionStorage } from '../types';
import { configureRootLog, rootLog } from '../utils/log';
import { Controller } from "./drag";
import { MiddleButtonSelector } from './features/middle_button_selector';
import { ScriptWrapper as UserScriptWrapper } from './script';
import { onDocumentLoaded } from './utils';

async function dispatcher(message: RuntimeMessage<keyof RuntimeMessageArgs>) {
    rootLog.V("content script dispatcher:", message)

    switch (message.cmd) {
        case "fetchURL":
            return onFetchURLMessage(message as any)
        case "ping":
            return "pong"
        case "copy":
            const storage = document.createElement("textarea");
            storage.value = message.args;
            storage.setAttribute('readonly', '');
            storage.style.position = 'absolute';
            storage.style.width = '0px';
            storage.style.height = '0px';
            document.body.appendChild(storage);
            storage.select();
            document.execCommand("copy");
            storage.remove();
            return
        case "doScript": {
            const wrapper = new UserScriptWrapper(message.args)
            wrapper.do()
        }
        default:
            return
    }
}

async function onFetchURLMessage(message: RuntimeMessage<"fetchURL">) {

    const controller = new AbortController();
    const signal = controller.signal;

    setTimeout(() => { controller.abort("timeout: " + message.args.timeoutMs + " ms") }, message.args.timeoutMs)

    return window.fetch(message.args.url, { signal }).then((resp) => {
        return resp.arrayBuffer()
    }).then(content => {
        let fetchURLResp: FetchURLReply = {
            data: String.fromCharCode(...new Uint8Array(content))
        }
        if ("base64" === message.args.encoding) {
            fetchURLResp.data = btoa(fetchURLResp.data);
        }
        return fetchURLResp
    })
}

function setupComponents() {
    const s = document.createElement("script")
    s.src = browser.runtime.getURL("components/main.js")
    document.body.appendChild(s)
}

let controller: Controller | null = null
async function setup() {

    browser.storage.onChanged.addListener(onConfigChange)
    browser.runtime.onMessage.addListener(dispatcher as any)

    controller = new Controller(document.documentElement);
    controller.start()

    onDocumentLoaded(async () => {
        await browser.runtime.sendMessage(buildRuntimeMessage("contentScriptLoaded", null))
        onConfigChange()
        setupComponents()
    })
}


let featureManagedFlag = false

async function manageFeatures(config: ReadonlyConfiguration) {
    // TODO: allow initialize feature multiple times
    if (featureManagedFlag) {
        rootLog.VV("already manage feature")
        return
    }

    featureManagedFlag = true
    if (config.features.has(Feature.middleButtonSelector)) {
        const f = new MiddleButtonSelector(document.getSelection(), document.documentElement)
        f.start()
    }
}

async function onConfigChange() {
    let storage = (await browser.storage.local.get()) as ExtensionStorage
    let config = new Configuration(storage.userConfig)

    configureRootLog(config)
    manageFeatures(config)

    if (controller) {
        controller.updateStorage(config)
    } else {
        throw new Error("controller is null")
    }
}


async function main() {
    try {
        await setup()
    }
    catch (error) {
        rootLog.E("failed to setup glitter drag extension");
        rootLog.E(error);
    }
}

main()