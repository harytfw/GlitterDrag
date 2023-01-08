import { Logger, rootLog } from "./log"
import { parse } from 'tldts';
import { LogLevel } from "../config/config";
import { TinyLRU } from "../content_scripts/utils";

const whiteSpace = /\s+/
const likeDomainName = /(\w+(-+\w+)*\.)+\w{2,7}/g
const ipv4Like = /^\d{1,3}.\d{1,3}.\d{1,3}.\d{1,3}$/g
const httpPrefixes = [
    "p://",
    "tp://",
    "ttp://",
    "s://",
    "ps://",
    "tps://",
    "ttps://",
    "p://",
    "tp://",
    "ttp://",
    "/",
    "://",
    "//",
]


function matchRe(s: string, pat: RegExp): boolean {
    const r = s.match(pat)
    return r && r.length > 0
}

const log = rootLog.subLogger(LogLevel.VVV, "urlFixer")
const urlLRU = new TinyLRU<string, null | URL>()

export class URLFixer {

    private protocol = "https://"
    private specialProtocols: Set<string> = new Set()

    constructor(extraProtocols?: string[]) {
        if (Array.isArray(extraProtocols)) {
            this.specialProtocols = new Set(extraProtocols)
        }
    }

    fix(urlLike?: string): URL | null {
        let res = urlLRU.get(urlLike)
        if (typeof res !== "undefined") {
            return res
        }
        res = this.internalFix(urlLike)
        urlLRU.put(urlLike, res)
        return res
    }

    private isTopLevelDomain(url: URL): boolean {
        if (parse(url.hostname).isIcann) {
            return true
        }
    }

    private internalFix(urlLike?: string): URL | null {

        log.VVV("try fix url: ", urlLike)

        if (typeof urlLike !== 'string') {
            return null
        }

        urlLike = urlLike.trim()

        if (matchRe(urlLike, whiteSpace)) {
            log.VVV("hit", whiteSpace)
            return null
        }


        if (matchRe(urlLike, ipv4Like)) {
            log.VVV("hit", ipv4Like)
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        if (urlLike.startsWith("[")) {
            log.VVV(urlLike, " maybe ipv6")
            // maybe it is ipv6:  [2001:db8::1]:80
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        for (const prefix of httpPrefixes) {
            if (urlLike.startsWith(prefix)) {
                log.VVV(urlLike, "has prefix: ", prefix)
                const url = this.tryBuildURL(this.protocol + urlLike.substring(prefix.length))
                if (url) {
                    return url
                }
            }
        }

        const url = this.tryBuildURL(urlLike)
        if (url) {
            if (this.isTopLevelDomain(url)) {
                log.VVV(urlLike, "is top level domain")
                return url
            }
            if (this.specialProtocols.has(url.protocol)) {
                log.VVV(urlLike, "has special protocol", url.protocol)
                return url
            }
            return null
        }

        if (matchRe(urlLike, likeDomainName)) {
            log.VVV("hit", likeDomainName)
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        return null
    }

    private tryBuildURL(urlLike: string): URL | null {
        log.VVV("try build url:", urlLike)
        try {
            return new URL(urlLike)
        } catch (err) {
            log.VVV(err)
            return null
        }
    }
}
