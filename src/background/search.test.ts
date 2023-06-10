import browser from 'webextension-polyfill'
import { closeTab } from '../utils/test'
import { searchText } from './search'

describe("test browser search", () => {

	it("with tab id", async () => {
		const t = await browser.tabs.create({})

		await new Promise(r => setTimeout(r, 50))

		try {
			await searchText({
				query: "hello",
				tabId: t.id,
			})

			await searchText({
				query: "world",
				tabId: t.id,
			})

		} finally {
			closeTab(t.id, 1000)
		}
	})
})