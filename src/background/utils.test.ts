import browser from 'webextension-polyfill'
import { assertOk } from "../utils/test_helper"
import { blankExecuteContext } from "./helper.test"
import { bufferToObjectURL, buildDownloadableURL, dateTimeAsFileName, generatedDownloadFileName } from "./utils"

describe("background utils", () => {

	describe("resolve download filename", () => {
		it("text", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.selection = "hello world"
			assertOk(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

		it("image", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.imageSource = "http://example.com/a.jpg"
			assertOk(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

		it("link", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.link = "http://example.com/"
			assertOk(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

	})


	it("buffer to object url", () => {
		assertOk(bufferToObjectURL(new ArrayBuffer(10)))
	})

	it("dateTime as filename", () => {
		const name = dateTimeAsFileName(new Date("2022-01-01"))
		assertOk(name.startsWith("2022"))
	})


	it("build url for text", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.selection = "hello"
		assertOk(buildDownloadableURL(ctx))
	})

	it("build url for image", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.imageSource = browser.runtime.getURL("icon/drag.png")
		assertOk(buildDownloadableURL(ctx))
	})

	it("build url for link", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.link = "http://www.example.com"
		assertOk(buildDownloadableURL(ctx))

	})
})