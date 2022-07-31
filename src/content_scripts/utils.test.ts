import { assertOk } from "../utils/test_helper"
import { getAngle } from "./utils"

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
			assertOk(tt.angle === a, tt.angle, " != ", a)
		}
	})
})