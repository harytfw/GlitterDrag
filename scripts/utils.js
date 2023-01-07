
import { execSync } from 'node:child_process'

export function mustEnv(key) {
	const value = process.env[key]
	if (!value || value.length === 0) {
		console.error("require environment: " + key)
		process.exit(1)
	}
	return value
}


export function readStdout(command) {
	const result = execSync(command)
	return result.toString("utf8")
}
