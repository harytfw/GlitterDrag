import browser from 'webextension-polyfill'
import { ActionConfig, Configuration } from "../config/config"
import { ModifierKey } from "../types"
import type { ExecuteContext } from "./context"

export async function blankExecuteContext(action?: ActionConfig): Promise<ExecuteContext> {
    const tabs = await browser.tabs.query({title: "*Mocha*"})
    const tab = tabs[0]
    if (!tab) {
        throw new Error("no active tab")
    }
    return {
        windowId: tab.windowId,
        tabId: tab.id,
        tabIndex: tab.index,
        action: action ? action : new ActionConfig({}),
        config: new Configuration({}),
        text: "",
        image: "",
        link: "",
        url: "",
        title: "",
        modifierKey: ModifierKey.none,
        startPosition: { x: 0, y: 0 },
        endPosition: { x: 0, y: 0 },
        backgroundTabCounter: 0,
        frameId: 0,
        tabURL: "http://example.com"
    }
}
