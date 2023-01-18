import { assert } from "chai"
import { ActionConfig, BroadcastEventTarget, CommandRequest, configBroadcast as configBroadcast, Configuration, type ReadonlyConfiguration } from "./config"

describe("test configuration", () => {
	it("empty config", () => {
		new Configuration()
	})

	it("action config", () => {
		const action = new ActionConfig({})
		assert.ok(action.toPlainObject())
	})

	it("request config", () => {
		const req = new CommandRequest({
			"url": "http://example.com"
		})
		assert.ok(req.toPlainObject())
	})

	it("broadcast", () => {

		const broadcast = new BroadcastEventTarget<ReadonlyConfiguration>()
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
			broadcast.removeListener(listener0)
			broadcast.removeListener(listener1)
		}

		broadcast.addListener(listener0)
		broadcast.notify(new Configuration())
		assert.isNotEmpty(listener0Result)
		assert.isEmpty(listener1Result)
		reset()

		broadcast.addListener(listener1)
		broadcast.removeListener(listener0)
		broadcast.notify(new Configuration())
		assert.isEmpty(listener0Result)
		assert.isNotEmpty(listener1Result)
		reset()

		broadcast.addListener(listener0)
		broadcast.addListener(listener0)
		broadcast.addListener(listener1)
		broadcast.notify(new Configuration())
		assert.isNotEmpty(listener0Result)
		assert.equal(listener0Result.length, 2, "call listener0 twice")
		assert.isNotEmpty(listener1Result)
		reset()
	})
})