import { assertOk } from "../utils/test_helper"
import { ActionConfig, CommandRequest, Configuration } from "./config"


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
})