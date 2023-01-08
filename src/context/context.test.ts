import { blankExecuteContext } from "./test_helper"
import { ContextType } from "../config/config"
import { primaryContextType } from "./utils"
import { assert } from 'chai'

describe("test context", () => {
	it("primary type", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.selection = "hello"
		assert.deepEqual(primaryContextType(ctx), ContextType.selection)

		ctx = await blankExecuteContext()
		ctx.data.link = "http://example.com/"
		assert.deepEqual(primaryContextType(ctx), ContextType.link)

		ctx = await blankExecuteContext()
		ctx.data.imageSource = "http://example.com/a.jpg"
		assert.deepEqual(primaryContextType(ctx), ContextType.image)
	})
})