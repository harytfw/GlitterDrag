import defaultTo from "lodash-es/defaultTo"


const enum ParserNodeType {
	plain,
	var,
}

class ParserNode {
	type: ParserNodeType
	data: string

	constructor(type: ParserNodeType, data: string) {
		this.type = type
		this.data = data
	}
}

type char = string

const dollar = '$' as char
const percent = '%' as char
const specialChar = [dollar, percent]


class TemplateParser {

	buf: string[]
	pos: 0

	constructor(raw: string) {
		this.buf = raw.split("")
		this.pos = 0
	}

	parse(): ParserNode[] {
		let result: ParserNode[] = []

		while (this.hasMore()) {
			switch (this.currentChar()) {
				case dollar: {
					result.push(this.parseDollar())
					break
				}
				case percent: {
					result.push(this.parsePercent())
					break
				}
				default: {
					result.push(this.parsePlain())
					break
				}
			}
		}
		return result
	}

	parseDollar(): ParserNode {
		this.consumeChar(dollar)

		if (this.currentChar() == dollar) {
			return new ParserNode(ParserNodeType.plain, this.consumeChar())
		}

		this.consumeChar("{")
		let varBuf: char[] = []
		while (this.hasMore() && this.currentChar() != '}') {
			varBuf.push(this.consumeChar())
		}
		this.consumeChar("}")

		return new ParserNode(ParserNodeType.var, varBuf.join("").trim())
	}

	parsePercent(): ParserNode {
		this.consumeChar(percent)
		const ch = this.consumeChar()
		if (ch === percent) {
			return new ParserNode(ParserNodeType.plain, percent)
		}
		return new ParserNode(ParserNodeType.var, ch)
	}

	parsePlain(): ParserNode {
		let tmp: char[] = []
		while (this.hasMore() && !specialChar.includes(this.currentChar())) {
			tmp.push(this.consumeChar())
		}
		return new ParserNode(ParserNodeType.plain, tmp.join(""))
	}

	currentChar(): char {
		if (this.pos >= this.buf.length) {
			throw new Error("position out of bound")
		}
		return this.buf[this.pos]
	}

	hasMore() {
		return this.pos < this.buf.length
	}

	consumeChar(expected?: char): char {
		const ch = this.currentChar()
		if (expected !== undefined) {
			if (ch !== expected) {
				throw new Error(`expected character: "${expected}" , but got:"${ch}"`)
			}
		}
		this.pos += 1
		return ch
	}
}


export class VarSubstituteTemplate {

	private s: string
	private nodes: ParserNode[]

	constructor(s: string) {
		this.s = s
		this.nodes = (new TemplateParser(this.s)).parse()
	}

	get template(): string {
		return this.s
	}

	substitute(vars: Map<string, string | number>): string {
		return this.nodes.map((node) => {
			if (node.type === ParserNodeType.var) {
				return defaultTo(vars.get(node.data), "")
			}
			return node.data
		}).join("")
	}

}