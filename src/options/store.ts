
import cloneDeep from 'lodash-es/cloneDeep';
import defaultTo from "lodash-es/defaultTo";
import { derived, readable, writable } from 'svelte/store';
import browser from 'webextension-polyfill';
import { type PlainActionConfig, type PlainAsset, type PlainCommandRequest, type PlainCommonConfig, type PlainConfiguration, type PlainScript } from '../config/config';
import { ExtensionStorageKey, type ExtensionStorage } from '../types';
import { isFirefox } from '../utils/vendor';
import { Tab } from './common';

function fillDefaultValue(uc: PlainConfiguration) {
	uc.scripts = defaultTo(uc.scripts, [])
	uc.actions = defaultTo(uc.actions, [])
	uc.requests = defaultTo(uc.requests, [])
	uc.assets = defaultTo(uc.assets, [])
	uc.common = defaultTo(uc.common, {})
}

export const userConfig = writable({} as PlainConfiguration, (set) => {
	(async () => {
		const storage = (await browser.storage.local.get(
			ExtensionStorageKey.userConfig
		)) as ExtensionStorage;
		let uc = defaultTo(storage.userConfig, {})
		fillDefaultValue(uc)
		set(uc)
	})()
})

let skipChanges = 2;
userConfig.subscribe(async (uc) => {
	console.log("skipChanges", skipChanges, "uc: ", uc)
	if (skipChanges > 0) {
		skipChanges -= 1
		return;
	}
	fillDefaultValue(uc)
	await browser.storage.local.set({ userConfig: uc })
	console.log("save config done")
});

export const scripts = derived(userConfig, (pc) => {
	return cloneDeep(defaultTo(pc.scripts, []));
}, [] as PlainScript[])

export const actions = derived(userConfig, (pc) => {
	return cloneDeep(defaultTo(pc.actions, []));
}, [] as PlainActionConfig[])

export const requests = derived(userConfig, (pc) => {
	return cloneDeep(defaultTo(pc.requests, []))
}, [] as PlainCommandRequest[])

export const assets = derived(userConfig, (pc) => {
	return cloneDeep(defaultTo(pc.assets, []))
}, [] as PlainAsset[])

export const common = derived(userConfig, (pc) => {
	return cloneDeep(defaultTo(pc.common, {}))
}, {} as PlainCommonConfig)

export const containers = readable([] as string[], (set) => {
	if (!isFirefox()) {
		return
	}
	browser.contextualIdentities.query({}).then(response => {
		const names = response.map(r => r.name)
		set(cloneDeep(names))
	})
})

export const currentTab = writable(Tab.actions);

