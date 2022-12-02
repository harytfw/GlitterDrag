import browser from 'webextension-polyfill';
import { ActionConfig, Configuration, ContextType, ContextDataType, TabPosition } from "../config/config";
import type { ExecuteArgs } from "../message/message";
import { ExtensionStorageKey, type ExtensionStorage } from '../types';
import { defaultVolatileState, type VolatileState } from './volatile_state';

export type ExecuteContext = Readonly<ExecuteArgs & {
	action: ActionConfig
	tabURL: string,
	frameId: number,
	config: Readonly<Configuration>,
	hostname: string,
	tab: browser.Tabs.Tab,
	state: VolatileState
}>


export async function buildExecuteContextFromMessageSender(args: ExecuteArgs, sender: browser.Runtime.MessageSender): Promise<Readonly<ExecuteContext>> {
	return buildExecuteContext(args, sender.tab, sender.frameId)
}


export async function buildExecuteContext(args: ExecuteArgs, tab: browser.Tabs.Tab, frameId: number): Promise<Readonly<ExecuteContext>> {
	const storage = (await browser.storage.local.get(ExtensionStorageKey.userConfig)) as ExtensionStorage
	const permissions = (await browser.permissions.getAll())
	const state = await defaultVolatileState()
	const config = new Configuration(storage.userConfig)
	const urlObj = new URL(args.url)
	return {
		data: args.data,
		url: args.url,
		title: args.title,
		modifierKey: args.modifierKey,
		startPosition: args.startPosition,
		endPosition: args.endPosition,
		action: new ActionConfig(args.action),
		frameId: frameId,
		tabURL: tab.url,
		hostname: urlObj.hostname,
		config: config,
		tab,
		state,
	}
}

export function primaryContextType(ctx: ExecuteContext): ContextType {

	for (const t of ctx.action.condition.contextTypes) {

		if (ContextType.selection === t && ctx.data.selection) {
			return ContextType.selection
		}

		if (ContextType.link === t && ctx.data.link) {
			return ContextType.link
		}

		if (ContextType.image === t && ctx.data.imageSource) {
			return ContextType.image
		}
	}

	if (ctx.data.imageSource) {
		return ContextType.image
	}

	if (ctx.data.link) {
		return ContextType.link
	}

	return ContextType.selection
}


export function primaryContextData(ctx: ExecuteContext): string {
	const t = primaryContextType(ctx)
	switch (t) {
		case ContextType.selection: return ctx.data.selection
		case ContextType.link: {
			for (const p of ctx.action.config.preferDataTypes) {
				if (p == ContextDataType.linkText) {
					return ctx.data.linkText
				} else if (p === ContextDataType.link) {
					return ctx.data.link
				}
			}
			return ctx.data.link
		}
		case ContextType.image: return ctx.data.imageSource
		default: throw new Error("unreachable")
	}
}

export async function handlePreferContextData(ctx: ExecuteContext, defaultCallback: (ExecuteContext) => Promise<void>, callbacks?: { [key in ContextDataType]?: (ExecuteContext) => Promise<void> }) {

	for (const p of ctx.action.config.preferDataTypes) {
		if (callbacks && callbacks[p]) {
			callbacks[p](ctx)
			return
		}
	}

	defaultCallback(ctx)
}


export function getTabIndex(ctx: ExecuteContext, tabsLength = 0): number {

	let index = 0;
	switch (ctx.action.config.tabPosition) {
		case TabPosition.prev: index = ctx.tab.index; break;
		case TabPosition.next: index = ctx.tab.index + ctx.state.backgroundTabCounter + 1; break;
		case TabPosition.start: index = 0; break;
		case TabPosition.end: index = tabsLength; break;
		default: throw new Error("unknown tab position: " + ctx.action.config.tabPosition);
	}

	return index;
}
