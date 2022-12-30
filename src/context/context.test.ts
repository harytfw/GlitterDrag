import { blankExecuteContext } from "./test_helper"
import { ContextType } from "../config/config"
import { assertEqual } from "../utils/test_helper"
import { primaryContextType } from "./utils"


describe("test context", () => {
	it("primary type",async () => {
		let ctx =  await blankExecuteContext()
		ctx.data.selection = "hello"
		assertEqual(primaryContextType(ctx), ContextType.selection)

		ctx =  await blankExecuteContext()
		ctx.data.link = "http://example.com/"
		assertEqual(primaryContextType(ctx), ContextType.link)

		ctx =  await blankExecuteContext()
		ctx.data.imageSource = "http://example.com/a.jpg"
		assertEqual(primaryContextType(ctx), ContextType.image)
	})
})