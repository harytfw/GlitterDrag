import { Mocha } from 'mocha'


export declare global {
	export const __ENV: Record<string, string>
	export const __BUILD_PROFILE: 'prod' | 'debug'
	export const chrome: any
	export const Mocha: Mocha
}
