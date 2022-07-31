import { Logger, rootLog } from "./log"
import { parse } from 'tldts';
import { LogLevel } from "../config/config";

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

function isTopLevelDomain(url: URL): boolean {
    return parse(url.hostname).isIcann
}

export class URLFixer {

    private protocol = "https://"
    private log: Logger
    constructor() {
        this.log = rootLog.subLogger(LogLevel.VVV, "urlFixer")
    }

    fix(urlLike?: string): URL | null {

        this.log.VVV("try fix url: ", urlLike)

        if (typeof urlLike !== 'string') {
            return null
        }

        urlLike = urlLike.trim()

        if (matchRe(urlLike, whiteSpace)) {
            this.log.VVV("hit", whiteSpace)
            return null
        }


        if (matchRe(urlLike, ipv4Like)) {
            this.log.VVV("hit", ipv4Like)
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        if (urlLike.startsWith("[")) {
            this.log.VVV("maybe ipv6")
            // maybe it is ipv6:  [2001:db8::1]:80
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        for (const prefix of httpPrefixes) {
            if (urlLike.startsWith(prefix)) {
                this.log.VVV("has prefix: ", prefix)
                const url = this.tryBuildURL(this.protocol + urlLike.substring(prefix.length))
                if (url) {
                    return url
                }
            }
        }


        const url = this.tryBuildURL(urlLike)
        if (url) {
            if (isTopLevelDomain(url)) {
                return url
            }
            return null
        }

        if (matchRe(urlLike, likeDomainName)) {
            this.log.VVV("hit", likeDomainName)
            const url = this.tryBuildURL(this.protocol + urlLike)
            if (url) {
                return url
            }
        }

        return null
    }

    private tryBuildURL(urlLike: string): URL | null {
        this.log.VVV("try build url:", urlLike)
        try {
            return new URL(urlLike)
        } catch (err) {
            this.log.VVV(err)
            return null
        }
    }
}
