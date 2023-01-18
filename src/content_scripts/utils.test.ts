import { assert } from "chai"
import { getAngle, TinyLRU } from "./utils"

describe("content script utils", () => {
	it("get angle", () => {
		let testCases = [
			{
				args: [{ x: 0, y: 0 }, { x: 1, y: 0 }],
				angle: 0,
			},
			{
				args: [{ x: 0, y: 0 }, { x: 1, y: -1 }],
				angle: 45,
			},
			{
				args: [{ x: 0, y: 0 }, { x: 0, y: -1 }],
				angle: 90,
			},
			{
				args: [{ x: 0, y: 0 }, { x: 0, y: 1 }],
				angle: 270,
			},
			{
				args: [{ x: 0, y: 0 }, { x: 1, y: 1 }],
				angle: 315,
			},
		]
		for (const tt of testCases) {
			let a = getAngle(tt.args[0], tt.args[1])
			assert.ok(tt.angle === a)
		}
	})

	it('tiny lru', () => {
		const lru = new TinyLRU<number, number>()

		assert.ok(lru.get(1) === undefined)
		assert.ok(lru.get(2) === undefined)
		assert.ok(lru.get(undefined) === undefined)

		lru.put(1, 1)
		lru.put(2, 2)

		assert.ok(lru.get(1) === 1)
		assert.ok(lru.get(2) === 2)

		assert.ok(lru.get(0) === undefined)
		assert.ok(lru.size() === 2)

		lru.clear()

		assert.ok(lru.size() === 0)
	})
})