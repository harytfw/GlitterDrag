import browser from 'webextension-polyfill';
import { ActionConfig, Configuration, TypeConstraint, TypePriority } from "../config/config";
import type { ExecuteArgs } from "../message/message";
import type { ExtensionStorage } from '../types';
import { defaultVolatileState } from './volatile_state';

export interface ExecuteContext extends ExecuteArgs {
	readonly action: ActionConfig
	readonly windowId: number
	readonly tabId: number,
	readonly tabIndex: number,
	readonly tabURL: string,
	readonly frameId: number,
	readonly config: Readonly<Configuration>,
	readonly backgroundTabCounter: number,
	readonly hostname: string,
}


export async function buildExecuteContext(args: ExecuteArgs, sender: browser.Runtime.MessageSender): Promise<Readonly<ExecuteContext>> {
	const storage = (await browser.storage.local.get('userConfig')) as ExtensionStorage
	const state = await defaultVolatileState()
	const config = new Configuration(storage.userConfig)
	const urlObj = new URL(args.url)
	return Object.assign({}, {
		backgroundTabCounter: state.backgroundTabCounter,
		windowId: sender.tab.windowId,
		tabId: sender.tab.id,
		tabIndex: sender.tab.index,
		frameId: sender.frameId,
		tabURL: sender.tab.url,
		action: new ActionConfig(args.action),
		hostname: urlObj.hostname,
		config,
	}, args)
}


export function primaryType(ctx: ExecuteContext): "text" | "link" | "image" {

	for (const p of ctx.action.config.priorities) {
		if (TypePriority.text === p && ctx.text) {
			return TypePriority.text
		}
		if (TypePriority.link === p && ctx.link) {
			return TypePriority.link
		}
		if (TypePriority.image === p && ctx.image) {
			return TypePriority.image
		}
	}

	for (const t of ctx.action.condition.types) {

		if (TypeConstraint.text === t && ctx.text) {
			return TypeConstraint.text
		}

		if (TypeConstraint.link === t && ctx.link) {
			return TypeConstraint.link
		}

		if (TypeConstraint.image === t && ctx.image) {
			return TypeConstraint.image
		}
	}

	if (ctx.image) {
		return "image"
	}

	if (ctx.link) {
		return "link"
	}

	return "text"
}


export function primarySelection(ctx: ExecuteContext): string {
	const t = primaryType(ctx)
	switch (t) {
		case "text": return ctx.text
		case "link": return ctx.link
		case "image": return ctx.image
		default: throw new Error("unreachable")
	}
}

