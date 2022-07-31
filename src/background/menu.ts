import defaultTo from 'lodash-es/defaultTo';
import browser from 'webextension-polyfill'
import { Configuration, OperationMode, ContextType } from "../config/config";
import type { ExecuteArgs } from '../message/message';
import { buildExecuteContext } from './context';
import { Executor } from './executor';
import { ExtensionStorageKey, ModifierKey } from '../types';
import { rootLog } from '../utils/log';

type BrowserContextType = browser.Menus.ContextType

function actionTypeToContextType(tc: ContextType[]): BrowserContextType[] {
	const result: BrowserContextType[] = []
	for (const t of tc) {
		result.push(t)
	}
	return result
}

export async function registerContextMenuActions(config: Configuration) {
	browser.contextMenus.removeAll()

	for (const action of config.actions) {
		if (!action.condition.modes.includes(OperationMode.contextMenu)) {
			continue
		}
		const contexts: BrowserContextType[] = actionTypeToContextType(action.condition.contextTypes)
		contexts.push("frame")
		browser.contextMenus.create(
			{
				id: action.id,
				title: action.name,
				contexts: contexts,
			}
		)
		rootLog.V("add context menu: ", action.id)
	}
}

const defaultPosition: Readonly<{ x: number, y: number }> = { x: 0, y: 0 }

export async function onMenuItemClick(info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) {

	const config = await browser.storage.local.get(ExtensionStorageKey.userConfig).then((storage) => {
		return new Configuration(storage.userConfig)
	})

	const action = config.actions.find(action => action.id === info.menuItemId);

	if (!action) {
		rootLog.E("action with menu id %s not found", info.menuItemId)
		return
	}

	let text = info.selectionText
	if (!text) {
		text = defaultTo(info.linkText, "")
	}

	const args: ExecuteArgs = {
		action: action,
		data: {
			selection: text,
			imageSource: defaultTo(info.srcUrl, ""),
			link: defaultTo(info.linkUrl, ""),
			linkText: defaultTo(info.linkText, ""),
		},
		url: defaultTo(tab.url, ""),
		title: defaultTo(tab.title, ""),
		modifierKey: ModifierKey.none,

		startPosition: defaultPosition,
		endPosition: defaultPosition,
	}

	const ctx = await buildExecuteContext(args, tab, info.frameId)
	const executor = new Executor();
	executor.execute(ctx)
}