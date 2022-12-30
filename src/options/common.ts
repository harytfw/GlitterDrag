import { CommandKind, Direction, OperationMode, TabPosition, ContextType, ContextDataType, CompatibilityStatus } from "../config/config";
import { LocaleMessageHelper } from "../locale";
import { titleCase } from "./utils";


const localeHelper = new LocaleMessageHelper()

export enum Tab {
	actions = "actions",
	scripts = "scripts",
	log = "log",
	assets = "assets",
	requests = "requests",
	common = "common",
	configEditor = "configEditor",
	compatibility = "compatibility",
}


export type PrimitiveType = string | number | boolean;

export type OptionModel<T = string> = { label: string; value: T };
export type MultipleOptionModel<T = string> = OptionModel<T>[]


export const commands: Readonly<MultipleOptionModel<CommandKind>> = Object.values(
	CommandKind
).map((c) => {
	return {
		label: localeHelper.command(c),
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
			label: localeHelper.mode(m),
			value: m,
		};
	});

export const contextTypeOptions: Readonly<MultipleOptionModel<ContextType>> =
	Object.values(ContextType).map((t) => {
		return {
			label: localeHelper.contextType(t),
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
				label: localeHelper.direction(l),
				value: l,
			};
		});

export const tabPositionOptions: Readonly<MultipleOptionModel<TabPosition>> =
	Object.values(TabPosition).map((pos) => {
		return {
			label: localeHelper.tabPosition(pos),
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
				label: localeHelper.contextDataType(t),
				value: t,
			};
		});

export const compatibilityStatusOptions: Readonly<MultipleOptionModel<CompatibilityStatus>> = Object.values(CompatibilityStatus)
	.map(s => {
		return {
			label: localeHelper.compatibilityStatus(s),
			value: s
		}
	})