import defaultTo from 'lodash-es/defaultTo';
import browser from 'webextension-polyfill'
import { Configuration, OperationMode, ContextType, type ReadonlyConfiguration, LogLevel } from "../config/config";
import type { ExecuteArgs } from '../message/message';
import { buildExecuteContext } from '../context/utils';
import { Executor } from './executor';
import { ExtensionStorageKey, ModifierKey } from '../types';
import { rootLog } from '../utils/log';

const log = rootLog.subLogger(LogLevel.VVV, "contextMenu")

type BrowserContextType = browser.Menus.ContextType

function actionTypeToContextType(tc: ContextType[]): BrowserContextType[] {
	const result: BrowserContextType[] = []
	for (const t of tc) {
		result.push(t)
	}
	return result
}

export async function registerContextMenuActions(config: ReadonlyConfiguration) {
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
		log.V("add context menu: ", action.id)
	}
}

const defaultPosition: Readonly<{ x: number, y: number }> = { x: 0, y: 0 }

export async function onMenuItemClick(info: browser.Menus.OnClickData, tab: browser.Tabs.Tab) {

	const config = await browser.storage.local.get(ExtensionStorageKey.userConfig).then((storage) => {
		return new Configuration(storage.userConfig)
	})

	const action = config.actions.find(action => action.id === info.menuItemId);

	if (!action) {
		log.E("action with menu id %s not found", info.menuItemId)
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