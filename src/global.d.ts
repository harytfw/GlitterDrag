export declare global {
	export const __ENV: Record<string,string>
	export const __BUILD_PROFILE: 'prod' | 'test' | 'debug'
}