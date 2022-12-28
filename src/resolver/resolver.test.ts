
import { assert } from "chai"
import { CommandRequest } from "../config/config"
import { buildSearchEngineCommandRequest } from "./engine"
import { Protocol, RequestResolver } from "./resolver"

describe("request resolver", function () {

	it("normal url", function () {
		const resolver = new RequestResolver(new CommandRequest({ url: "http://example.com", query: { "name": "foo", "query": "%s" } }))
		assert.equal(resolver.protocol, Protocol.http)

		const url = resolver.resolveURL("bar")
		assert.equal(url.searchParams.get("name"), "foo")
		assert.equal(url.searchParams.get("query"), "bar")
	})

	it("complex url", function () {
		const resolver = new RequestResolver(new CommandRequest({ url: "http://demo.example.com/%s", query: { "s": "%s", "o": "%o", "d": "%d", "h": "%h", "x": "%x", "empty": "%a" } }))
		assert.equal(resolver.protocol, "http:")

		const url = resolver.resolveURL("bar")
		assert.equal(url.searchParams.get("s"), "bar")
		assert.equal(url.searchParams.get("d"), "example.com")
		assert.equal(url.searchParams.get("h"), "demo.example.com")
		assert.equal(url.searchParams.get("x"), "site:demo.example.com bar")
		assert.equal(url.searchParams.get("empty"), "")
	})

	it("browser search engine", function () {
		const resolver = new RequestResolver(new CommandRequest(buildSearchEngineCommandRequest("bar")))
		assert.deepEqual(resolver.protocol, Protocol.browserSearch)
		assert.deepEqual(resolver.resolveEngine(), "bar")
	})
})