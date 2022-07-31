
import toPath from "lodash-es/toPath";
import set from "lodash-es/set";
import cloneDeep from "lodash-es/cloneDeep";
import browser from "webextension-polyfill";
import { CommandKind, TabPosition } from "../config/config";
import type { KVRecord } from "../types";
import { rootLog } from "../utils/log";
import type { PrimitiveType } from "./common";

export type ValueChange = {
	path: string;
	values: PrimitiveType[];
	multiple: boolean;
};

export type ValueChangeConfig = {
	path: string[];
	defaults: PrimitiveType[];
	multiple: boolean;
	requestPermission?: (value: PrimitiveType[]) => Promise<boolean>,
	transform?: (value: PrimitiveType) => PrimitiveType;
	overwrite?: (value: PrimitiveType[]) => PrimitiveType[];
}

export const actionOptionConfig: Readonly<ValueChangeConfig[]> = [
	{
		path: [
			"name",
			"prompt",
			"config.downloadDirectory",
			"config.requestId",
			"config.container"
		],
		transform: (val) => val,
		defaults: [""],
		multiple: false,
	},
	{
		path: ["command"],
		requestPermission: async (value: string[]) => {
			let c = value[0] as CommandKind
			if (c === CommandKind.copy) {
				return await browser.permissions.request({ permissions: ["clipboardWrite"] })
			}
			return true
		},
		defaults: [CommandKind.invalid],
		multiple: false,
	},
	{
		path: ["config.tabPosition"],
		transform: (val) => val,
		defaults: [TabPosition.next],
		multiple: false,
	},
	{
		path: [
			"condition.modes",
			"condition.contextTypes",
			"config.preferDataTypes",
			"condition.modes"
		],
		transform: (val) => val,
		defaults: [],
		multiple: true,
	},
	{
		path: ["config.activeTab", "config.showSaveAsDialog"],
		transform: (value: string) => {
			return value.toLowerCase() === "true";
		},
		defaults: [false],
		multiple: false,
	},
	{
		path: ["condition.directions"],
		overwrite: (value: string[]) => {
			if (value.length === 0) {
				throw new Error("require value");
			}
			const v = value[0];
			if (v.length === 0) {
				return [];
			}
			return v.split(",").map((s) => s.trim());
		},
		defaults: [],
		multiple: true,
	},
];


export const collectChange = async (target: HTMLElement, vcc?: readonly ValueChangeConfig[]): Promise<ValueChange> => {
	const c = target;
	const form = c.closest("form");
	const formData = new FormData(form);

	let values: PrimitiveType[] = [];
	let path = "";
	let multiple = false;

	if (
		c instanceof HTMLSelectElement ||
		c instanceof HTMLInputElement ||
		c instanceof HTMLTextAreaElement
	) {
		path = c.name;
		values = formData.getAll(c.name).map((entry) => entry.toString());
	} else {
		throw new Error("unknown element: " + c.tagName);
	}

	if (!path) {
		throw new Error("missing path");
	}

	if (vcc) {
		for (const cfg of vcc) {
			if (!cfg.path.includes(path)) {
				continue;
			}
			multiple = cfg.multiple;
			if (values.length === 0) {
				values = cloneDeep(cfg.defaults);
			} else if (cfg.overwrite) {
				values = cfg.overwrite(values);
			} else if (cfg.transform) {
				values = values.map((v) => cfg.transform(v));
			}
			break
		}
	}
	return {
		path,
		multiple,
		values,
	};
};


export function applyValueChange<T>(obj: T, changes: ValueChange[]): T {
	const clone = cloneDeep(obj);
	for (const change of changes) {
		// create empty object to hold value
		let cur: KVRecord = clone;
		for (const p of toPath(change.path).slice(0, -1)) {
			if (!(p in cur)) {
				cur[p] = {};
				cur = cur[p];
			}
		}

		rootLog.V(
			"path:",
			change.path,
			"multiple:",
			change.multiple,
			"values:",
			change.values
		);

		if (change.multiple) {
			set(clone as object, change.path, change.values);
		} else {
			set(clone as object, change.path, change.values[0]);
		}
	}
	return clone;
}