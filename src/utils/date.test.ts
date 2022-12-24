
import { assert } from 'chai'
import { formatDateWithZeroPadding } from './date'

describe("test utils", function () {
	it("format date", function () {
		const d = new Date(2022, 0, 31, 12, 15, 4, 0)
		assert.sameOrderedMembers(formatDateWithZeroPadding(d), ["2022", "01", "31", "12", "15", "04"])
	})
})