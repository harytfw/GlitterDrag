import { CommandKind, Direction, OperationMode, TabPosition, ContextType, ContextDataType } from "../config/config";
import { defaultLocaleMessage } from "../localization/helper";
import { titleCase } from "./utils";

export enum Tab {
	actions = "actions",
	scripts = "scripts",
	log = "log",
	assets = "assets",
	requests = "requests",
	common = "common",
	configEditor = "configEditor",
}


export type PrimitiveType = string | number | boolean;

export type OptionModel<T = string> = { label: string; value: T };
export type MultipleOptionModel<T = string> = OptionModel<T>[]


export const commands: Readonly<MultipleOptionModel<CommandKind>> = Object.values(
	CommandKind
).map((c) => {
	return {
		label: defaultLocaleMessage["command" + titleCase(c)],
		value: c,
	};
});

const enableModes = new Set([
	OperationMode.chain,
	OperationMode.circleMenu,
	OperationMode.contextMenu,
	OperationMode.normal,
]);
export const modeOptions: Readonly<MultipleOptionModel<OperationMode>> = Object.values(
	OperationMode
)
	.filter((m) => {
		return enableModes.has(m);
	})
	.map((m) => {
		return {
			label: defaultLocaleMessage["mode" + titleCase(m)],
			value: m,
		};
	});

export const contextTypeOptions: Readonly<MultipleOptionModel<ContextType>> =
	Object.values(ContextType).map((t) => {
		return {
			label: defaultLocaleMessage["contextType" + titleCase(t)],
			value: t,
		};
	});

const enableDirection = new Set([
	Direction.left,
	Direction.right,
	Direction.up,
	Direction.down,
]);
export const directionOptions: Readonly<MultipleOptionModel<Direction>> =
	Array.from(enableDirection)
		.map((l) => {
			return {
				label: defaultLocaleMessage["direction" + titleCase(l)],
				value: l,
			};
		});

export const tabPositionOptions: Readonly<MultipleOptionModel<TabPosition>> =
	Object.values(TabPosition).map((pos) => {
		return {
			label: defaultLocaleMessage["tabPosition" + titleCase(pos)],
			value: pos,
		};
	});

export const contextDataTypeOptionsForLink: Readonly<MultipleOptionModel<ContextDataType>> =
	Object.values(ContextDataType)
		.filter(t => {
			return t === ContextDataType.link || t === ContextDataType.linkText
		})
		.map((t) => {
			return {
				label: defaultLocaleMessage["contextDataType" + titleCase(t)],
				value: t,
			};
		});