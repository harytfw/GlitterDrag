import { assertEqual, assertFail } from "../utils/test_helper"
import { primaryType } from "./context"
import { blankExecuteContext } from "./helper.test"


describe("test context", () => {
	it("primary type",async () => {
		let ctx =  await blankExecuteContext()
		ctx.text = "hello"
		assertEqual(primaryType(ctx), "text")

		ctx =  await blankExecuteContext()
		ctx.link = "http://example.com/"
		assertEqual(primaryType(ctx), "link")

		ctx =  await blankExecuteContext()
		ctx.image = "http://example.com/a.jpg"
		assertEqual(primaryType(ctx), "image")
	})
})