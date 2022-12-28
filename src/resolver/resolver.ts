
import { parse } from 'tldts';
import defaultTo from "lodash-es/defaultTo"
import { CommandRequest } from "../config/config"
import type { KVRecord } from "../types"
import { VarSubstituteTemplate } from "../utils/var_substitute"

export enum Protocol {
	http = "http:",
	https = "https:",
	browserSearch = "ext-gdp:",
	extension = "extension:",
}

export const browserSearchEngineURL = `${Protocol.browserSearch}//browser-search`

export class RequestResolver {

	private req: CommandRequest

	constructor(req: CommandRequest) {
		this.req = req
	}

	get protocol() {
		return this.req.protocol as Protocol
	}

	resolveEngine(): string {
		const engine = defaultTo(this.req.query["engine"], "")
		if (!engine) {
			return ""
		}
		return engine
	}

	resolveURL(query: string): URL {

		const vars = this.buildVars(query ? query : "")

		const clone = new URL(this.req.url)
		const pathTemplate = new VarSubstituteTemplate(clone.pathname)
		clone.pathname = pathTemplate.substitute(vars)

		const newQuery: KVRecord<string> = {}
		for (const [k, v] of Object.entries(this.req.query)) {
			const template = new VarSubstituteTemplate(v)
			newQuery[k] = template.substitute(vars)
		}

		for (let [k, v] of Object.entries(newQuery)) {
			clone.searchParams.set(k, v)
		}
		clone.searchParams.sort()
		return clone
	}

	private buildVars(query: string): Map<string, string> {
		const merged = this.req.mergeURLAndQuery()

		const result = parse(merged.hostname)

		return new Map([
			["s", query],
			["d", result.domain], // top level domain + 1
			["h", result.hostname], // host name
			["x", `site:${merged.hostname} ${query}`], // search on site
		])
	}

}
