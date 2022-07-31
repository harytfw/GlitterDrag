import { assertEqual } from "./test_helper"
import { VarSubstituteTemplate } from "./var_substitute"



describe('test variable substitute', () => {
	it("no substitute", () => {
		const cases = [
			"",
			"a",
			"12345",
			"hello world",
			"hello\nworld\t",
			"hello\nworld\t😀 😃 😄 😁 😆 😅 😂 🤣 🥲 ",
			"{{hello}}\nworld\t😀 😃 😄 😁 😆 😅 😂 🤣 🥲 "
		]

		const m = new Map()

		for (const c of cases) {
			const template = new VarSubstituteTemplate(c)
			const result = template.substitute(m)
			assertEqual(result, c, "expected: ", c, ", actually: ", result)
		}
	})

	it("test substitute", () => {

		const m = new Map<string, string | number>(Object.entries({
			"name": "Foo",
			"color": " red ",
			"age": 18,
			"a": "Apple",
			"b": "Banana",
			"c": "Cat",
			"s": "Super",

		}))

		const cases = [
			["Name: ${name}", "Name: Foo"],
			["Name: ${  name  }", "Name: Foo"],
			["Age: ${age}", "Age: 18"],
			["foo$$${age}", "foo$18"],
			["hello${color}world", "hello red world"],
			["Foo%a", "FooApple"],
			["%s %c", "Super Cat"],
			["%s %c ${age}", "Super Cat 18"],
			["${name}%s", "FooSuper"]
		]

		for (const [s, expected] of cases) {
			const template = new VarSubstituteTemplate(s)
			const result = template.substitute(m)
			assertEqual(result, expected, "expected: ", expected, ", actually: ", result)
		}
	})
})