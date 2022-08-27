import { copyFile, mkdir,  } from 'node:fs/promises';
import { join as joinPath, dirname } from 'node:path';

function requireEnv(name) {
	const value = process.env[name]
	if (!value) {
		console.error("require env: " + name)
		process.exit(1)
	}
	return value
}

const node_modules = requireEnv("NODE_MODULES") 
const dist = requireEnv("DIST")

const src = joinPath(node_modules, "simpledotcss", "simple.min.css")
const dest = joinPath(dist, "res", "simple.min.css")

try {
	await mkdir(dirname(dest))
} catch (_e) {}

await copyFile(src, dest)