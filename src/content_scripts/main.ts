import browser from 'webextension-polyfill';
import { CompatibilityStatus, configBroadcast, Configuration, LogLevel } from '../config/config';
import { buildRuntimeMessage, RuntimeMessageName, type RuntimeMessage } from '../message/message';
import { ExtensionStorageKey, type ExtensionStorage } from '../types';
import { rootLog } from '../utils/log';
import { checkCompatibility } from './compat';
import { DragController } from "./drag";
import { manageFeatures } from './features/features';
import { OpExecutor } from './op';
import { ScriptWrapper as UserScriptWrapper } from './script';
import { onDocumentLoaded } from './utils';

const log = rootLog.subLogger(LogLevel.VVV, "cs")

async function dispatcher(m: any) {
    log.V("content script dispatcher:", m)
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

    browser.storage.onChanged.addListener((detail) => {
        if (ExtensionStorageKey.userConfig in detail) {
            loadConfig()
        } else {
            log.VVV("not interesting storage key changed: ", Object.keys(detail))
        }
    })
    browser.runtime.onMessage.addListener(dispatcher as any)

    const opExecutor = new OpExecutor()
    opExecutor.reset()

    controller = new DragController(window, opExecutor);

    onDocumentLoaded(async () => {
        await browser.runtime.sendMessage(buildRuntimeMessage(RuntimeMessageName.contextScriptLoaded, null))
        loadConfig()
        setupComponents()
    })
}

async function loadConfig() {
    log.VVV("load user config from storage")
    const storage = (await browser.storage.local.get()) as ExtensionStorage
    const config = new Configuration(storage.userConfig)
    configBroadcast.notify(config)

    let status = CompatibilityStatus.enable

    try {
        status = checkCompatibility(location.href, config.compatibility)
    } catch (e) {
        console.error(e)
    }

    log.V("location: ", location.href, "compatible status: ", status)

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
        log.E("failed to setup extension: ", window.self);
        log.E(error);
        log.E(error.stack)
    }
}

main()