import browser from 'webextension-polyfill'
import type { VolatileState } from "../state/state"
import { ActionConfig, Configuration } from "../config/config"
import type { ExecuteArgs } from "../message/message"

export type ExecuteContext = Readonly<ExecuteArgs & {
	action: ActionConfig
	tabURL: string,
	frameId: number,
	config: Readonly<Configuration>,
	hostname: string,
	tab: browser.Tabs.Tab,
	state: VolatileState
}>
