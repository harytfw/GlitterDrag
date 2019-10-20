"use strict";

(function (ns) {

    const HTTP = "http://"
    const HTTPS = "https://"

    const IsIPV6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/
    const IsIPV6_Bracket_Port_Query = /^\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\](:\d{2,5})?(\/.*)?$/
    const IsIPV6_Bracket_Query = /^(p:\/\/|tp:\/\/|ttp:\/\/|s:\/\/|ps:\/\/|tps:\/\/|ttps:\/\/|:\/\/|\/\/|\/])?\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\](\/.*)?$/
    const IsIPV4_Port_Query = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})?(\/.*)?$/;

    const DomainName = /(\w+(-+\w+)*\.)+\w{2,7}/;
    const HasSpace = /\S\s+\S/;
    const KnowNameOrSlash = /^(www|bbs|forum|blog)|\//;
    const KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/;
    const KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/;

    const TABLE = Object.freeze({
        "p://": HTTP,
        "tp://": HTTP,
        "ttp://": HTTP,
        "s://": HTTPS,
        "ps://": HTTPS,
        "tps://": HTTPS,
        "ttps://": HTTPS,
        "://": HTTP,
        "//": HTTP,
        "/": HTTP,
    })

    const validateUrl = (str) => {
        str = str.toLowerCase()
        try {
            const url = new URL(str);
            // fix #106
            if (str.startsWith(`${url.protocol}//`)) {
                return true;
            }
            return false;
        }
        catch (e) {
            return false;
        }
    }

    const seemAsURL = (url) => {
        //match both ipv4 and ipv6
        if (validateUrl(url)) return true;
        //TODO
        // if (bgConfig.disableFixURL === true) return false;

        if (IsIPV4_Port_Query.test(url) || IsIPV6.test(url) || IsIPV6_Bracket_Query.test(url)) return true;

        const seemAsURL = !HasSpace.test(url) && DomainName.test(url) && (KnowNameOrSlash.test(url) || KnowTopDomain1.test(url) || KnowTopDomain2.test(url));
        return seemAsURL;
    }

    const fixSchemer = (aURI) => {

        if (IsIPV6.test(aURI)) {
            return `${HTTP}[${aURI}]`;
        }

        else if (IsIPV6_Bracket_Port_Query.test(aURI)) {
            return HTTP + aURI;
        }

        else if (IsIPV4_Port_Query.test(aURI)) {
            return HTTP + aURI;
        }

        const backup = aURI;
        for (const prefix of Object.keys(TABLE)) {
            if (aURI.startsWith(prefix)) {
                aURI = TABLE[prefix] + aURI.substr(prefix.length, aURI.length);
                break;
            }
        }

        if (validateUrl(aURI)) {
            return aURI;
        }
        else if (validateUrl(HTTP + aURI)) {
            return HTTP + aURI;
        }
        return backup;
    }

    ns.seemAsURL = seemAsURL
    ns.validateUrl = validateUrl
    ns.fixSchemer = fixSchemer

})(urlUtil || {})
