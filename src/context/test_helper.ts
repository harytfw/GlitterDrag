import browser from 'webextension-polyfill'
import { ActionConfig, Configuration } from "../config/config"
import type { ExecuteContext } from './context'
import { ModifierKey } from "../types"
import { defaultVolatileState } from '../state/state'

export async function blankExecuteContext(action?: ActionConfig): Promise<ExecuteContext> {
    const tabs = await browser.tabs.query({ title: "*Mocha*" })
    const tab = tabs[0]
    if (!tab) {
        throw new Error("no active tab")
    }
    return {
        tab: {} as browser.Tabs.Tab,
        state: await defaultVolatileState(),
        action: action ? action : new ActionConfig({}),
        config: new Configuration({}),
        data: {
            selection: "",
            imageSource: "",
            link: "",
            linkText: "",
        },
        url: "",
        title: "",
        modifierKey: ModifierKey.none,
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 },
        frameId: 0,
        tabURL: "http://example.com",
        hostname: "example.com"
    }
}
