import { CompatibilityRule, CompatibilityStatus, type PlainCompatibilityRule } from "../config/config";

const rules: PlainCompatibilityRule[] = [
	{
		regexp: "^https?://store.epicgames.com",
		status: CompatibilityStatus.force
	},
	{
		regexp: "^https?:\/\/example.com\/not-compatible",
		status: CompatibilityStatus.disable
	}
]

const builtinCompatibilityRules: CompatibilityRule[] = rules.map(r => new CompatibilityRule(r))

export function checkCompatibility(location: string, userRules: readonly CompatibilityRule[]): CompatibilityStatus {

	const url = new URL(location)

	let status: CompatibilityStatus = CompatibilityStatus.enable

	for (const rule of [...userRules, ...builtinCompatibilityRules]) {
		if (rule.host && rule.host === url.host) {
			status = rule.status
			break
		}
		if (rule.regexp) {
			try {
				const re = new RegExp(rule.regexp)
				if (re.test(url.href)) {
					status = rule.status
					break
				}
			} catch (e) {
				console.error("build compatibility rule for regexp failed: ", rule.regexp)
			}
		}
	}

	return status
}
