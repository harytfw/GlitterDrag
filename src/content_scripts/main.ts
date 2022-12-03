import browser from 'webextension-polyfill';
import { CompatibilityRule, CompatibilityStatus, Configuration, Feature, type ReadonlyConfiguration } from '../config/config';
import { buildRuntimeMessage, RuntimeMessageName, type FetchURLReply, type RuntimeMessage, type RuntimeMessageArg, type RuntimeMessageArgsMap } from '../message/message';
import type { ExtensionStorage } from '../types';
import { configureRootLog, rootLog } from '../utils/log';
import { checkCompatibility } from './compat';
import { DragController } from "./drag";
import { MiddleButtonClose } from './features/auxclose';
import { MiddleButtonSelector } from './features/middle_button_selector';
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
}

let controller: DragController | null = null
let opExecutor: OpExecutor | null = null
async function setup() {

    browser.storage.onChanged.addListener(onConfigChange)
    browser.runtime.onMessage.addListener(dispatcher as any)


    opExecutor = new OpExecutor()
    opExecutor.reset()

    controller = new DragController(document.documentElement, opExecutor);
    controller.start()

    onDocumentLoaded(async () => {
        await browser.runtime.sendMessage(buildRuntimeMessage(RuntimeMessageName.contextScriptLoaded, null))
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
        await f.start()
    }
    if (config.features.has(Feature.auxClose)) {
        const f = new MiddleButtonClose(document.documentElement)
        await f.start()
    }
}

async function onConfigChange() {

    let storage = (await browser.storage.local.get()) as ExtensionStorage
    let config = new Configuration(storage.userConfig)

    const state = checkCompatibility(location.href, config.compatibility)
    
    rootLog.V("location: ", location.href, "compatible state: ", state)

    if (state === CompatibilityStatus.disable) {
        controller.stop()
        return
    }

    configureRootLog(config)
    manageFeatures(config)

    if (opExecutor) {
        opExecutor.updateConfig(config)
    } else {
        throw new Error("controller is null")
    }
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