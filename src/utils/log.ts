import { configBroadcast, LogLevel } from "../config/config"

function buildTag(tag: string, parentTag: string): string {

	return parentTag + ":" + tag
}

export class Logger {
	private parent: Logger = null
	private tag: string | null = null
	private level: LogLevel
	private jsonify: boolean

	constructor(level: LogLevel, tag: string) {
		this.level = level
		this.tag = tag
		this.jsonify = false
	}

	subLogger(level: LogLevel, tag: string): Logger {
		const log = new Logger(level, buildTag(tag, this.tag))
		log.parent = this
		return log
	}

	setLevel(level: LogLevel) {
		this.level = level
	}

	V(...args: any[]) {
		if (this.isEnable(LogLevel.V)) {
			this.log(...args)
		}
	}

	VV(...args: any[]) {
		if (this.isEnable(LogLevel.VV)) {
			this.log(...args)
		}
	}

	VVV(...args: any[]) {
		if (this.isEnable(LogLevel.VVV)) {
			this.log(...args)
		}
	}

	E(...args: any[]) {
		console.error(...args)
	}

	trace(...args: any[]) {
		console.trace(...args)
	}

	public isEnable(level: LogLevel) {
		if (this.parent && !this.parent.isEnable(level)) {
			return false
		}
		return this.level >= level
	}

	protected log(...args: any[]) {
		let transformed: any[]
		if (this.jsonify) {
			transformed = args.map(item => JSON.stringify(item))
		} else {
			transformed = args
		}

		if (this.tag) {
			console.debug(`%c${this.tag}: `, 'color: red', ...transformed)
		} else {
			console.debug(...transformed)
		}
	}
}


export const rootLog = new Logger(__BUILD_PROFILE === "prod" ? LogLevel.S : LogLevel.VVV, "root")

configBroadcast.addListener(cfg => {
	rootLog.setLevel(cfg.log.level)
})