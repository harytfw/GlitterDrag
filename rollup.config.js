import svelte from 'rollup-plugin-svelte';
import resolve from '@rollup/plugin-node-resolve';
import typescript from '@rollup/plugin-typescript';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';
import autoPreprocess from 'svelte-preprocess';
import commonjs from '@rollup/plugin-commonjs';
import pathLib from 'path'

const PROD = process.env.BUILD_ENV === 'prod';
const src = process.env.src
const dist = process.env.dist;
const entryPoints = process.env.entryPoints.split(" ")


const safeEnvVar = Object.fromEntries(Object.entries(process.env).filter((entry) => entry[0].startsWith("BUILD")))

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
			customElement: true
		}
	}),
	typescript({ sourceMap: false }),
	resolve({ browser: true }),
]

if (PROD) {
	plugins.push(terser())
}


const output = []

for (const e of entryPoints) {
	output.push({
		input: pathLib.join(src, e, "main.ts"),
		output: {
			sourcemap: !PROD,
			file: pathLib.join(dist, e, "main.js"),
			format: 'iife'
		},
		plugins: plugins
	})
}

export default output
