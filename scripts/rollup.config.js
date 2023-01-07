import { mustEnv, readStdout } from "./utils.js"

import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import pathLib from 'node:path'
import os from "node:os"

const BUILD_COMMIT_ID = readStdout("git rev-parse --short HEAD")
const BUILD_DATE = readStdout("date --rfc-3339=seconds")
const BUILD_NODE_VERSION = readStdout("node --version")
const BUILD_ROLLUP_VERSION = readStdout("npx rollup --version")
const BUILD_OS = os.platform()
const BUILD_PROFILE = mustEnv("BUILD_PROFILE")
const BUILD_WEBSOCKET_SERVER = mustEnv("BUILD_WEBSOCKET_SERVER", "")

const isProd = BUILD_PROFILE.toLowerCase() === 'prod';
const sourceMap = !isProd
const src = mustEnv("SRC")
const dist = mustEnv("TARGET_DIST")
const entryPoints = mustEnv("ENTRY_POINTS").split(" ")

const safeEnvVar = {
	BUILD_COMMIT_ID,
	BUILD_DATE,
	BUILD_NODE_VERSION,
	BUILD_ROLLUP_VERSION,
	BUILD_OS,
	BUILD_PROFILE,
	BUILD_WEBSOCKET_SERVER,
}

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
			__BUILD_PROFILE: JSON.stringify(BUILD_PROFILE),
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

console.log("sourcemap: ", sourceMap)

const output = []

for (const e of entryPoints) {
	output.push({
		external: ["chai", "mocha", "Mocha"],
		input: pathLib.join(src, e, "main.ts"),
		output: {
			sourcemap: sourceMap,
			globals: {
				"chai": "chai",
				"mocha": "mocha",
				"Mocha": "Mocha"
			},
			file: pathLib.join(dist, e, "main.js"),
			format: 'iife'
		},
		plugins: getPlugins(e)
	})
}

export default output
