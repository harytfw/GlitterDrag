import browser from 'webextension-polyfill'
import { assert } from "chai"
import { blankExecuteContext } from "../context/test_helper"
import { bufferToObjectURL, buildDownloadableURL, generatedDownloadFileName } from "./utils"

describe("background utils", () => {

	describe("resolve download filename", () => {
		it("text", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.selection = "hello world"
			assert.ok(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

		it("image", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.imageSource = "http://example.com/a.jpg"
			assert.ok(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

		it("link", async () => {
			const ctx = await blankExecuteContext()
			ctx.data.link = "http://example.com/"
			assert.ok(generatedDownloadFileName(ctx, await buildDownloadableURL(ctx)))
		})

	})


	it("buffer to object url", () => {
		assert.ok(bufferToObjectURL(new ArrayBuffer(10)))
	})

	it("build url for text", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.selection = "hello"
		assert.ok(buildDownloadableURL(ctx))
	})

	it("build url for image", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.imageSource = browser.runtime.getURL("icon/drag.png")
		assert.ok(buildDownloadableURL(ctx))
	})

	it("build url for link", async () => {
		let ctx = await blankExecuteContext()
		ctx.data.link = "http://www.example.com"
		assert.ok(buildDownloadableURL(ctx))

	})
})