import { Mocha } from 'mocha'

type EnvVariable = {
	commitId: string
	date: string
	nodeVersion: string
	rollupVersion: string
	os: string
	webSocketServer: string
	profile: string
	target: string
}

export declare global {
	export const __ENV: EnvVariable
	export const __BUILD_PROFILE: 'prod' | 'debug'
	export const chrome: any
	export const Mocha: Mocha
}
