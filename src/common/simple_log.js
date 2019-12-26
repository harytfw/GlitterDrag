"use strict";
class SimpleLog {
    
    static get PERMIT_LOG_LEVEL() {
        return ["log", "info", "debug", "warn", "error"]
    }

    static get PERMIT_DEBUG_LEVEL() {
        return ["debug", "debug", "warn", "error"]
    }

    static get PERMIT_INFO_LEVEL() {
        return ["info", "warn", "error"]
    }

    static get PERMIT_WARN_LEVEL() {
        return ["warn", "error"]
    }

    static get PERMIT_ERROR_LEVEL() {
        return ["error"]
    }

    static SIMPLE_PREFIX(level) {
        return `[${new Date().toISOString()}] - [${level.toUpperCase()}]`
    }

    constructor() {
        this.level = ""
        this.useConsole = true
        this.prefixCallback = SimpleLog.SIMPLE_PREFIX
        this.callbacks = []
    }

    log() {
        if (SimpleLog.PERMIT_LOG_LEVEL.includes(this.level)) {
            const prefix = this.prefixCallback("log")
            if (this.useConsole) super.log(prefix, ...arguments)
            
            this.callbacks.forEach(fn => fn.apply(this, ["log", ...arguments]))
        }
    }

    debug() {
        if (SimpleLog.PERMIT_DEBUG_LEVEL.includes(this.level)) {
            const prefix = this.prefixCallback("debug")
            if (this.useConsole) super.debug(prefix, ...arguments)

            this.callbacks.forEach(fn => fn.apply(this, ["debug", ...arguments]))
        }
    }

    info() {
        if (SimpleLog.PERMIT_INFO_LEVEL.includes(this.level)) {
            const prefix = this.prefixCallback("info")
            if (this.useConsole) super.info(prefix, ...arguments)

            this.callbacks.forEach(fn => fn.apply(this, ["info", ...arguments]))
        }
    }

    warn() {
        if (SimpleLog.PERMIT_INFO_LEVEL.includes(this.level)) {
            const prefix = this.prefixCallback("warn")
            if (this.useConsole) super.warn(prefix, ...arguments)

            this.callbacks.forEach(fn => fn.apply(this, "warn", ...arguments))
        }
    }

    error() {
        if (SimpleLog.PERMIT_ERROR_LEVEL.includes(this.level)) {
            const prefix = this.prefixCallback("error")
            if (this.useConsole) super.error(prefix, ...arguments)

            this.callbacks.forEach(fn => fn.apply(this, "error", ...arguments))
        }
    }
}

Object.setPrototypeOf(SimpleLog.prototype, console)