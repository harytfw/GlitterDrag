
import { execSync } from 'node:child_process'

export function mustEnv(key, default_value) {
	const value = process.env[key]
	if (!value || value.length === 0) {
		if (typeof default_value !== "undefined") {
			return default_value
		}
		console.error("require environment: " + key)
		process.exit(1)
	}
	return value
}


export function readStdout(command) {
	const result = execSync(command)
	return result.toString("utf8")
}

export function isTestTarget(target) {
	return target.endsWith("test")
}
