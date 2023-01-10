import { readStdout } from "./utils.mjs";

import commonjs from '@rollup/plugin-commonjs';
import resolve from '@rollup/plugin-node-resolve';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import typescript from '@rollup/plugin-typescript';
import os from "node:os";
import pathLib from 'node:path';
import svelte from 'rollup-plugin-svelte';
import autoPreprocess from 'svelte-preprocess';


const useCustomElement = ["components"]

export default function (opts) {
	const { profile, websocketServer, src, dist, entryPoints, target } = opts

	const isProd = profile.toLowerCase() === 'prod';
	const sourceMap = !isProd

	const safeEnvVar = {
		commitId: readStdout("git rev-parse --short HEAD"),
		date: readStdout("date --rfc-3339=seconds"),
		nodeVersion: readStdout("node --version"),
		rollupVersion: readStdout("npx rollup --version"),
		os: os.platform(),
		profile,
		websocketServer,
		target,
	}

	function getPlugins(entrypoint) {
		return [
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
				__BUILD_PROFILE: JSON.stringify(profile),
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
			isProd && terser(),
		]
	}

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

	return output
}