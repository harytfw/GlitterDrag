import browser from 'webextension-polyfill';
import { CompatibilityStatus, configBroadcast, Configuration } from '../config/config';
import { buildRuntimeMessage, RuntimeMessageName, type RuntimeMessage } from '../message/message';
import type { ExtensionStorage } from '../types';
import { rootLog } from '../utils/log';
import { checkCompatibility } from './compat';
import { DragController } from "./drag";
import { manageFeatures } from './features/features';
import { OpExecutor } from './op';
import { ScriptWrapper as UserScriptWrapper } from './script';
import { onDocumentLoaded } from './utils';

async function dispatcher(m: any) {
    rootLog.V("content script dispatcher:", m)
    const cmd = m.cmd as RuntimeMessageName;
    switch (cmd) {
        case RuntimeMessageName.copy: {
            const args = (m as RuntimeMessage<typeof cmd>).args
            const storage = document.createElement("textarea");
            storage.value = args;
            storage.setAttribute('readonly', '');
            storage.style.position = 'absolute';
            storage.style.width = '0px';
            storage.style.height = '0px';
            document.body.appendChild(storage);
            storage.select();
            document.execCommand("copy");
            storage.remove();
            return
        }
        case RuntimeMessageName.executeScript: {
            const args = (m as RuntimeMessage<typeof cmd>).args
            const wrapper = new UserScriptWrapper(args)
            wrapper.do()
            return
        }
        default:
            return
    }
}

function setupComponents() {
    const s = document.createElement("script")
    s.src = browser.runtime.getURL("components/main.js")
    document.body.appendChild(s)
    // prevent script exposes to web page
    setTimeout(() => { s.remove() }, 0)
}

let controller: DragController | null = null

async function setup() {

    configBroadcast.addListener(manageFeatures)

    browser.storage.onChanged.addListener(onConfigChange)
    browser.runtime.onMessage.addListener(dispatcher as any)

    const opExecutor = new OpExecutor()
    opExecutor.reset()

    controller = new DragController(document.documentElement, opExecutor);

    onDocumentLoaded(async () => {
        await browser.runtime.sendMessage(buildRuntimeMessage(RuntimeMessageName.contextScriptLoaded, null))
        onConfigChange()
        setupComponents()
    })
}

async function onConfigChange() {
    const storage = (await browser.storage.local.get()) as ExtensionStorage
    const config = new Configuration(storage.userConfig)
    configBroadcast.notify(config)

    let status = CompatibilityStatus.enable

    try {
        status = checkCompatibility(location.href, config.compatibility)
    } catch (e) {
        console.error(e)
    }

    rootLog.V("location: ", location.href, "compatible status: ", status)

    if (status === CompatibilityStatus.disable) {
        controller.stop()
        return
    }

    controller.start(status)
}


async function main() {
    try {
        await setup()
    }
    catch (error) {
        rootLog.E("failed to setup extension: ", window.self);
        rootLog.E(error);
        rootLog.E(error.stack)
    }
}

main()