import browser from 'webextension-polyfill';
import { CommandKind, ContextDataType, ContextType, Direction, OperationMode, TabPosition } from './config/config';
import { titleCase } from './options/utils';

export class LocaleMessageHelper {
	constructor() {
	}

	get(name: string, substitutions?: string | string[]): string {
		const m = browser.i18n.getMessage(name, substitutions)
		if (m) {
			return m
		}
		return name
	}

	getDefault(name: string, defaultValue?: string): string {
		const m = browser.i18n.getMessage(name)
		if (m) {
			return m
		}
		if (defaultValue) {
			return defaultValue
		}
		console.warn("i18n message not found: ", name)
		return name
	}

	command(cmd: CommandKind): string {
		return this.get("command" + titleCase(cmd))
	}

	mode(mode: OperationMode): string {
		return this.get("mode" + titleCase(mode))
	}

	contextType(type: ContextType): string {
		return this.get("contextType" + titleCase(type))
	}

	direction(dir: Direction): string {
		return this.get("direction" + titleCase(dir))
	}

	tabPosition(pos: TabPosition): string {
		return this.get("tabPosition" + titleCase(pos))
	}

	contextDataType(type: ContextDataType): string {
		return this.get("contextDataType" + titleCase(type))
	}
}

export function localeMessageProxy(): {
	[key: string]: string
} {
	return new Proxy({}, {
		get(_target, p) {
			if (typeof p === 'string') {
				const m = browser.i18n.getMessage(p)
				if (!m) {
					return p
				}
				return m
			}
			return p
		}
	})
}