import { assertOk } from "../utils/test_helper"
import { ActionConfig, CommandRequest, configBroadcast as configBroadcast, Configuration, type ReadonlyConfiguration } from "./config"

import chai from "chai"
const assert = chai.assert

describe("test configuration", () => {
	it("empty config", () => {
		new Configuration()
	})

	it("action config", () => {
		const action = new ActionConfig({})
		assertOk(action.toPlainObject())
	})

	it("request config", () => {
		const req = new CommandRequest({
			"url": "http://example.com"
		})
		assertOk(req.toPlainObject())
	})

	it("config listener", () => {

		let listener0Result: ReadonlyConfiguration[] = []
		let listener1Result: ReadonlyConfiguration[] = []

		function listener0(cfg: ReadonlyConfiguration) {
			listener0Result.push(cfg)
		}

		function listener1(cfg: ReadonlyConfiguration) {
			listener1Result.push(cfg)
		}

		function reset() {
			listener0Result = []
			listener1Result = []
			configBroadcast.removeListener(listener0)
			configBroadcast.removeListener(listener1)
		}

		configBroadcast.addListener(listener0)
		configBroadcast.notify(new Configuration())
		assert.isNotEmpty(listener0Result)
		assert.isEmpty(listener1Result)
		reset()

		configBroadcast.addListener(listener1)
		configBroadcast.removeListener(listener0)
		configBroadcast.notify(new Configuration())
		assert.isEmpty(listener0Result)
		assert.isNotEmpty(listener1Result)
		reset()

		configBroadcast.addListener(listener0)
		configBroadcast.addListener(listener0)
		configBroadcast.addListener(listener1)
		configBroadcast.notify(new Configuration())
		assert.isNotEmpty(listener0Result)
		assert.equal(listener0Result.length, 2, "call listener0 twice")
		assert.isNotEmpty(listener1Result)
		reset()
	})
})