const HTTP = "http://";
const HTTPS = "https://";

const IsIPV6 = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))/;
const IsIPV6_Bracket_Port_Query = /^\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\](:\d{2,5})?(\/.*)?$/;
const IsIPV6_Bracket_Query = /^(p:\/\/|tp:\/\/|ttp:\/\/|s:\/\/|ps:\/\/|tps:\/\/|ttps:\/\/|:\/\/|\/\/|\/])?\[(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\](\/.*)?$/;
const IsIPV4_Port_Query = /^(([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])\.){3}([0-9]|[1-9][0-9]|1[0-9]{2}|2[0-4][0-9]|25[0-5])(:\d{2,5})?(\/.*)?$/;

const DomainName = /(\w+(-+\w+)*\.)+\w{2,7}/;
const HasSpace = /\S\s+\S/;
const KnowNameOrSlash = /^(www|bbs|forum|blog)|\//;
const KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/;
const KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/;

const FULL_URI_SCHEME = [
    "http:", "https:", "ftp:",
    "ws:", "wss:",
    "data:", "file:",
    "magnet:",
    "sms:",
    "bitcoin:",
    "about:",
    "view-source:",
];

const PARTIAL_URI_SCHEME = [
    // partial http scheme
    "ttp:", "tp:", "p:",
    // partial https scheme
    "ttps:", "tps:", "ps:", "s:",
];

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
});

export const validateUrl = (str) => {
    str = str.trim();
    try {
        const url = new URL(str);
        if (FULL_URI_SCHEME.includes(url.protocol)) {
            return true;
        }

    }
    catch {
        // ignore
    }

    return false;
};

export const seemAsURL = (url) => {
    try {
        const urlObj = new URL(url);
        if (FULL_URI_SCHEME.includes(urlObj.protocol) || PARTIAL_URI_SCHEME.includes(urlObj.protocol)) {
            return true;
        }
    }
    catch {
        // ignore
    }

    if (IsIPV4_Port_Query.test(url) || IsIPV6.test(url) || IsIPV6_Bracket_Query.test(url)) {
        return true;
    }

    const ret = !HasSpace.test(url) &&
        DomainName.test(url) &&
        (KnowNameOrSlash.test(url) ||
            KnowTopDomain1.test(url) ||
            KnowTopDomain2.test(url)
        );
    return ret;
};

export const fixSchemer = (aURI) => {
    if (!seemAsURL(aURI)) {
        return aURI;
    }
    if (validateUrl(aURI)) {
        return aURI;
    }

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
};


export function processURLPlaceholders(url, keyword, args) {
    // 二级域名 (host)
    let secondaryDomain = "";
    // 完整域名
    let domainName = "";
    // 参数部分
    let parameter = "";
    // protocol部分
    let protocol = "";
    try {
        let urlKeyword = new URL(keyword);
        protocol = urlKeyword.protocol;
        parameter = urlKeyword.pathname.substr(1) + urlKeyword.search;
        domainName = urlKeyword.hostname;
        let domainArr = domainName.split(".");
        if (domainArr.length < 2) {
            // 链接不包含二级域名(例如example.org, 其中example为二级域, org为顶级域) 使用domainName替代
            secondaryDomain = domainName;
        }
        else {
            secondaryDomain = domainArr[domainArr.length - 2] + "." + domainArr[domainArr.length - 1];
        }
    }
    catch (Error) {
        // 这里的异常用作流程控制: 非链接 -> 不作处理(使用''替换可能存在的误用占位符即可)
    }

    // 大写的占位符表示此字段无需Base64编码(一般是非参数)
    url = url
        .replace("%S", keyword)
        .replace("%X", `site:${args.site} ${keyword}`)
        .replace("%O", protocol)
        .replace("%D", domainName)
        .replace("%H", secondaryDomain)
        .replace("%P", parameter);

    url = url
        .replace("%s", encodeURIComponent(keyword))
        .replace("%x", encodeURIComponent(`site:${args.site} ${keyword}`))
        .replace("%o", encodeURIComponent(protocol))
        .replace("%d", encodeURIComponent(domainName))
        .replace("%h", encodeURIComponent(secondaryDomain))
        .replace("%p", encodeURIComponent(parameter));

    return url;
}
