
import browser from 'webextension-polyfill';
import { degToRad, polar2cartesian, rebuildMenu, SVG_NAMESPACE, toDataURL } from "./menu_builder"
import chai from 'chai'
const assert = chai.assert
describe("menu builder", () => {

	it("degToRad", () => {
		assert.closeTo(degToRad(0), 0, 0.001)
		assert.closeTo(degToRad(45), Math.PI / 4, 0.001)
		assert.closeTo(degToRad(90), Math.PI / 2, 0.001)
		assert.closeTo(degToRad(180), Math.PI, 0.001)
		assert.closeTo(degToRad(360), 2 * Math.PI, 0.001)
	})

	it("polar2cartesian", () => {

		const c30 = polar2cartesian(2, degToRad(30))
		assert.closeTo(c30[0], Math.sqrt(3), 0.0001)
		assert.closeTo(c30[1], 1, 0.0001)

		const c45 = polar2cartesian(2, degToRad(45))
		assert.closeTo(c45[0], Math.sqrt(2), 0.001)
		assert.closeTo(c45[1], Math.sqrt(2), 0.001)
	})


	it("toDataURL", async () => {
		const data = await toDataURL("hello world", "text/plain")
		assert.equal(data, "data:text/plain;base64,aGVsbG8gd29ybGQ=")
	})

	it("rebuiltMenu", async () => {
		const svg = document.createElementNS(SVG_NAMESPACE, "svg")
		await rebuildMenu(svg, {
			circleRadius: 10,
			items: [
				{
					title: "menu1",
					id: "1",
					html: `<svg version="1.1"
						width="300" height="200"
						xmlns="http://www.w3.org/2000/svg">
							<rect width="100%" height="100%" fill="red" />
							<circle cx="150" cy="100" r="80" fill="green" />
							<text x="150" y="125" font-size="60" text-anchor="middle" fill="white">SVG</text>
						</svg>
					`
				},
				{
					title: "menu1",
					id: "1",
					html: `<img src="${browser.runtime.getURL("icon/drag.png")}">`
				}
			],
			dividerLineLength: 10,
			iconOffset: 10,
			iconSize: 10,
			textOffset: 10,
			fontSize: 4,
			width: 100,
			height: 100
		})
		assert.equal(svg.querySelectorAll("g").length, 2)
	})
})
