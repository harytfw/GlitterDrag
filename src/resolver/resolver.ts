
import { CommandRequest } from "../config/config"
import type { ExecuteContext } from "../context/context"
import { primaryContextData } from "../context/utils"
import type { KVRecord } from "../types"
import { VarSubstituteTemplate } from "../utils/var_substitute"

export type RequestParameterResolver = (key: string, value: string | string[]) => string | string[]

function requestFunc(rawReq: KVRecord) {
	const req = new CommandRequest(rawReq)
	console.debug(req)
}


export enum Protocol {
	http = "http:",
	https = "https:",
	browserSearch = "browser:",
	extension = "extension:",
}

export class RequestResolver {

	private req: CommandRequest
	private ctx: ExecuteContext

	constructor(ctx: ExecuteContext, req: CommandRequest) {
		this.req = req
		this.ctx = ctx
	}

	get protocol() {
		return this.req.url.protocol as Protocol
	}

	resolveExtensionId() {
		return this.req.url.host
	}

	resolveEngine(): string | undefined {
		const url = this.resolveURL()
		const engine = url.searchParams.get("engine")
		if (!engine) {
			return undefined
		}
		return engine
	}

	resolveURL(): URL {

		// TODO: CACHE
		const vars = this.buildVars()

		const url = new URL(this.req.url)

		const pathTemplate = new VarSubstituteTemplate(this.req.url.pathname)
		url.pathname = pathTemplate.substitute(vars)

		for (let [k, v] of Object.entries(this.req.query)) {
			url.searchParams.set(k, v)
		}

		for (const [k, v] of url.searchParams) {
			const template = new VarSubstituteTemplate(v)
			const result = template.substitute(vars)
			url.searchParams.set(k, result)
		}

		return url
	}

	resolveMessage(): KVRecord {
		let msg = {
			"content": primaryContextData(this.ctx)
		}
		return msg
	}


	private buildVars(): Map<string, string> {
		const domainName = this.req.url.hostname;
		let mainHost = domainName
		let tmp = domainName.split('.');
		if (tmp.length < 2) {
			// 链接不包含二级域名(例如example.org, 其中example为二级域, org为顶级域) 使用domainName替代
			mainHost = domainName;
		} else {
			mainHost = tmp[tmp.length - 2] + "." + tmp[tmp.length - 1]
		}

		return new Map([
			["s", primaryContextData(this.ctx)],
			["o", this.req.url.protocol],
			["d", this.req.url.hostname],
			["h", mainHost],
			["p", this.req.url.pathname.substring(1) + this.req.url.search],
			["x", `site:${this.req.url.hostname} ${primaryContextData(this.ctx)}`],
		])
	}

}
