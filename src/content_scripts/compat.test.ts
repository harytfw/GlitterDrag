import { CompatibilityRule, CompatibilityStatus, type PlainCompatibilityRule } from "../config/config"

import chai from "chai"
import { checkCompatibility } from "./compat"

const assert = chai.assert

describe("compatibility", () => {
	it("check compatibility", () => {
		const testCases: { location: string, rules: readonly PlainCompatibilityRule[], result: CompatibilityStatus }[] = [
			{
				// builtin rules
				location: "http://example.com/not-compatible?builtin-disable",
				rules: [],
				result: CompatibilityStatus.disable
			},
			{
				location: "https://store.epicgames.com/en-US/?builtin-disable",
				rules: [],
				result: CompatibilityStatus.force,
			},
			{
				// user's rule work firstly
				location: "http://example.com/not-compatible?force-enable",
				rules: [
					{ regexp: "^https?:\/\/example\.com\/not-compatible", status: CompatibilityStatus.force }
				],
				result: CompatibilityStatus.force
			},
			{
				// disable
				location: "http://example.com/?user-disable",
				rules: [
					{ regexp: "^https?:\/\/example\.com/.*", status: CompatibilityStatus.disable }
				],
				result: CompatibilityStatus.disable
			},
			{
				// empty rules mean alway enable 
				location: "http://example.com/?default-enable",
				rules: [
				],
				result: CompatibilityStatus.enable
			},
			{
				location: "http://example.com/?host-force",
				rules: [
					{ host: "example.com", status: CompatibilityStatus.force }
				],
				result: CompatibilityStatus.force
			},
			{
				location: "http://a.example.com/?host-force",
				rules: [
					{ host: "a.example.com", status: CompatibilityStatus.force }
				],
				result: CompatibilityStatus.force
			}
		]

		for (const tc of testCases) {
			const rules = tc.rules.map(r => new CompatibilityRule(r))
			const result = checkCompatibility(tc.location, rules)
			assert.equal(result, tc.result, "check location: " + tc.location)
		}
	})
})
