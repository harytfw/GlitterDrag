
const env = __ENV

export default {
	commitId: env["BUILD_COMMIT_ID"],
	date: env["BUILD_DATE"],
	nodeVersion: env["BUILD_NODE_VERSION"],
	rollupVersion: env["BUILD_ROLLUP_VERSION"],
	os: env["BUILD_OS"],
	websocketServer: env["BUILD_WEBSOCKET_SERVER"],
	profile: env["BUILD_PROFILE"],
} as const
