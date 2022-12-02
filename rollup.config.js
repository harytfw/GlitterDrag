import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import pathLib from 'path'

function mustEnv(name) {
	const value = process.env[name]
	if (!value) {
		console.error("require env: " + name)
		process.exit(1)
	}
	return value
}

const isProd = mustEnv("BUILD_PROFILE").toLowerCase() === 'prod';
const src = mustEnv("SRC")
const dist = mustEnv("TARGET_DIST")
const entryPoints = mustEnv("ENTRY_POINTS").split(" ")

const safeEnvVar = Object.fromEntries(Object.entries(process.env).filter((entry) => entry[0].startsWith("BUILD")))

const useCustomElement = ["components"]

function getPlugins(entrypoint) {
	const plugins = [
		commonjs(),
		replace({
			values: {
				// avoid "Function constructor" warning
				"Function('return this')()": "globalThis",
			},
			delimiters: ["", ""],
			preventAssignment: true
		}),
		replace({
			__ENV: JSON.stringify(safeEnvVar),
			__BUILD_PROFILE: JSON.stringify(process.env.BUILD_PROFILE),
			preventAssignment: true
		}),
		svelte({
			preprocess: autoPreprocess(),
			compilerOptions: {
				customElement: useCustomElement.includes(entrypoint)
			}
		}),
		typescript({ sourceMap: false }),
		resolve({ browser: true }),
	]

	if (isProd) {
		plugins.push(terser())
	}

	return plugins
}

const output = []
console.log("sourcemap: ", !isProd)

for (const e of entryPoints) {
	output.push({
		external: ["chai"],
		input: pathLib.join(src, e, "main.ts"),
		output: {
			sourcemap: !isProd,
			globals: {
				"chai": "chai"
			},
			file: pathLib.join(dist, e, "main.js"),
			format: 'iife'
		},
		plugins: getPlugins(e)
	})
}

export default output
