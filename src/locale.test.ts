import { assertOk } from "./utils/test_helper"
import { LocaleMessageHelper, localeMessageProxy } from "./locale"

describe("locale", () => {
	
	it("proxy", () => {
		const locale = localeMessageProxy()
		assertOk(locale.extensionName)
	})

	it("helper", () => {
		const localeHelper = new LocaleMessageHelper()
		assertOk(localeHelper.get("extensionName"))
	})
})