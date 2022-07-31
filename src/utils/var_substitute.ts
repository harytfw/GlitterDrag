import defaultTo from "lodash-es/defaultTo"


const enum NodeType {
	plain,
	var,
}

class Node {
	type: NodeType
	data: string

	constructor(type: NodeType, data: string) {
		this.type = type
		this.data = data
	}
}

type char = string

const dollar = '$' as char
const percent = '%' as char
const specialChar = [dollar, percent]


class Parser {

	buf: string[]
	pos: 0

	constructor(raw: string) {
		this.buf = raw.split("")
		this.pos = 0
	}

	parse(): Node[] {
		let result: Node[] = []

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

	parseDollar(): Node {
		this.consumeChar(dollar)

		if (this.currentChar() == dollar) {
			return new Node(NodeType.plain, this.consumeChar())
		}

		this.consumeChar("{")
		let varBuf: char[] = []
		while (this.hasMore() && this.currentChar() != '}') {
			varBuf.push(this.consumeChar())
		}
		this.consumeChar("}")

		return new Node(NodeType.var, varBuf.join("").trim())
	}

	parsePercent(): Node {
		this.consumeChar(percent)
		const ch = this.consumeChar()
		if (ch === percent) {
			return new Node(NodeType.plain, percent)
		}
		return new Node(NodeType.var, ch)
	}

	parsePlain(): Node {
		let tmp: char[] = []
		while (this.hasMore() && !specialChar.includes(this.currentChar())) {
			tmp.push(this.consumeChar())
		}
		return new Node(NodeType.plain, tmp.join(""))
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
	private nodes: Node[]

	constructor(s: string) {
		this.s = s
		this.nodes = (new Parser(this.s)).parse()
	}

	substitute(vars: Map<string, string | number>): string {
		return this.nodes.map((node) => {
			if (node.type === NodeType.var) {
				return defaultTo(vars.get(node.data), "")
			}
			return node.data
		}).join("")
	}

}