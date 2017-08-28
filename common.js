const commons = {
    urlPattern: /^(https?:\/\/)?((\w|-)*\.){0,3}((\w|-)+)\.(com|net|org|gov|edu|mil|biz|cc|info|fm|mobi|tv|ag|am|asia|at|au|be|br|bz|ca|cn|co|de|do|ee|es|eu|fr|gd|gl|gs|im|in|it|jp|la|ly|me|mp|ms|mx|nl|pe|ph|ru|se|so|tk|to|tt|tw|us|uk|ws|xxx)(\/(\w|%|&|-|_|\||\?|\.|=|\/|#|~|!|\+|,|\*|@)*)?$/i,
    //from superdrag   https://addons.mozilla.org/en-US/firefox/addon/super-drag/
    appName: "setClipboard",


    TYPE_UNKNOWN: -1, //未知类型
    TYPE_TEXT: 0, //文本,包含普通文本、链接
    TYPE_TEXT_URL: 1, //链接
    TYPE_TEXT_AREA: 5,
    TYPE_ELEM: 2, //元素，主要是没有选中文本，对元素进行了拖拽
    TYPE_ELEM_A: 3, //超链接，a元素
    TYPE_ELEM_A_IMG: 6, //a元素里面包含图片，但把它当做图片处理
    TYPE_ELEM_IMG: 4, //图片


    DIR_U: "DIR_U",
    DIR_D: "DIR_D",
    DIR_L: "DIR_L",
    DIR_R: "DIR_R",
    DIR_UP_L: "DIR_UP_L",
    DIR_UP_R: "DIR_UP_R",
    DIR_LOW_L: "DIR_LOW_L",
    DIR_LOW_R: "DIR_LOW_R",
    DIR_OUTER: "DIR_OUTER",

    PLACE_HOLDER: "PLACE_HOLDER",

    ACT_NONE: "ACT_NONE", // 无动作
    ACT_OPEN: "ACT_OPEN", // 打开
    ACT_COPY: "ACT_COPY", // 复制
    ACT_SEARCH: "ACT_SEARCH", // 搜索
    ACT_TRANS: "ACT_TRANS", // 翻译
    ACT_DL: "ACT_DL", // 下载
    ACT_QRCODE: "ACT_QRCODE", // 二维码
    ACT_FIND: "ACT_FIND", // 查找
    // ACT_BOOKMARK: "ACT_BOOKMARK",

    OPEN_LINK: "OPEN_LINK",
    OPEN_IMAGE: "OPEN_IMAGE",
    OPEN_IMAGE_LINK: "OPEN_IMAGE_LINK",

    COPY_LINK: "COPY_LINK",
    COPY_IMAGE_LINK: "COPY_IMAGE_LINK",
    COPY_TEXT: "COPY_TEXT",
    COPY_IMAGE: "COPY_IMAGE",

    SEARCH_LINK: "SEARCH_LINK",
    SEARCH_IMAGE_LINK: "SEARCH_IMAGE_LINK",
    SEARCH_TEXT: "SEARCH_TEXT",
    SEARCH_IMAGE: "SEARCH_IMAGE",

    SEARCH_ONSITE_YES: true,
    SEARCH_ONSITE_NO: false,

    DOWNLOAD_TEXT: "DOWNLOAD_TEXT",
    DOWNLOAD_LINK: "DOWNLOAD_LINK",
    DOWNLOAD_IMAGE_LINK: "DOWNLOAD_IMAGE_LINK",
    DOWNLOAD_IMAGE: "DOWNLOAD_IMAGE",

    DOWNLOAD_SAVEAS_YES: true,
    DOWNLOAD_SAVEAS_NO: false,

    TAB_NEW_WINDOW: "TAB_NEW_WINDOW", //新窗口打开
    TAB_NEW_PRIVATE_WINDOW: "TAB_NEW_PRIVATE_WINDOW",
    TAB_CUR: "TAB_CUR", //当前标签页
    TAB_FIRST: "TAB_FIRST", //新建标签页在最左边
    TAB_LAST: "TAB_LAST", //最右边
    TAB_CLEFT: "TAB_CLEFT", //新建的标签页在当前标签页的左边
    TAB_CRIGHT: "TAB_CRIGHT", //右边

    FORE_GROUND: true, //前台打开
    BACK_GROUND: false, //后台打开

    DEFAULT_SEARCH_ENGINE: "DEFAULT_SEARCH_ENGINE",
    DEFAULT_DOWNLOAD_DIRECTORY: "DEFAULT_DOWNLOAD_DIRECTORY",

    ALLOW_NORMAL: "ALLOW_NORMAL",
    ALLOW_QUADRANT: "ALLOW_QUADRANT",
    ALLOW_H: "ALLOW_H",
    ALLOW_V: "ALLOW_V",

    ALLOW_LOW_L_UP_R: "ALLOW_LOW_L_UP_R",
    ALLOW_UP_L_LOW_R: "ALLOW_UP_L_LOW_R",

    ALLOW_ALL: "ALLOW_ALL",
    ALLOW_ONE: "ALLOW_ONE",

    //ALLOW_NOT:"ALLOW_NOT",

    KEY_CTRL: 0, //ctrl键
    KEY_SHIFT: 1, //shift键
    KEY_NONE: -1,
};
//freezing them, avoid modify them in unconscious.
Object.freeze(commons);

const eventUtil = {
    attachEventAll: function(selector = "body", func = () => {}, eventName = "click") {
        for (let el of document.querySelectorAll(selector)) {
            this.attachEventT(el, func, eventName);
        }
    },
    attachEventS: function(selector = "body", func = () => {}, eventName = "click") {
        this.attachEventT($E(selector), func, eventName);
    },
    attachEventT: function(target = document, func = () => {}, eventName = "click") {
        target.addEventListener(eventName, func);
    }
}
Object.freeze(eventUtil);

const typeUtil = {
    getActionType: (t) => {
        if (t === commons.TYPE_UNKNOWN) {
            console.error("未知的拖拽目标类型！~");
            return;
        }
        if (t === commons.TYPE_TEXT_URL || t === commons.TYPE_ELEM_A || t === commons.TYPE_ELEM_A_IMG) return "linkAction";
        else if (t === commons.TYPE_TEXT || t === commons.TYPE_ELEM || t === commons.TYPE_TEXT_AREA) return "textAction";
        else if (t === commons.TYPE_ELEM_IMG) return "imageAction";
        else alert("Not Support Type!");
    },
    checkDragTargetType: (selection, textSelection, imageLink, target) => {
        if (!selection && selection.length === 0) {
            return commons.TYPE_ELEM
        }
        if (["A", "#text"].includes(target.nodeName) && typeUtil.seemAsURL(selection)) {
            if (target.nodeName === "#text") {
                return commons.TYPE_TEXT_URL;
            }
            else if (target instanceof HTMLAnchorElement) {
                if (imageLink === "") {
                    return commons.TYPE_ELEM_A;
                }
                else {
                    return commons.TYPE_ELEM_A_IMG;
                }
            }
            else if (target instanceof HTMLImageElement) {
                return commons.TYPE_ELEM_IMG;
            }
        }
        else if (target.nodeName === "IMG") {
            return commons.TYPE_ELEM_IMG;
        }
        else if (target.nodeName === "#text") {
            return commons.TYPE_TEXT;
        }
        else if (target.tagName === "TEXTAREA") {
            return commons.TYPE_TEXT_AREA
        }
        else if (target instanceof Element) {
            return commons.TYPE_ELEM;
        }

        return commons.TYPE_UNKNOWN;
    },
    seemAsURL: (url) => {
        // from dragtogo
        const DomainName = /(\w+(-+\w+)*\.)+\w{2,7}/;
        const HasSpace = /\S\s+\S/;
        const KnowNameOrSlash = /^(www|bbs|forum|blog)|\//;
        const KnowTopDomain1 = /\.(com|net|org|gov|edu|info|mobi|mil|asia)$/;
        const KnowTopDomain2 = /\.(de|uk|eu|nl|it|cn|be|us|br|jp|ch|fr|at|se|es|cz|pt|ca|ru|hk|tw|pl|me|tv|cc)$/;
        const IsIpAddress = /^([1-2]?\d?\d\.){3}[1-2]?\d?\d/;
        const seemAsURL = !HasSpace.test(url) && DomainName.test(url) && (KnowNameOrSlash.test(url) || KnowTopDomain1.test(url) || KnowTopDomain2.test(url) || IsIpAddress.test(url));
        return seemAsURL;
    },
    fixupSchemer: (aURI) => {
        // from dragtogo
        var RegExpURL = /(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-/]))?/;
        if (aURI.match(RegExpURL)) return aURI;

        if (/^(?::\/\/|\/\/|\/)?(([1-2]?\d?\d\.){3}[1-2]?\d?\d(\/.*)?|[a-z]+[-\w]+\.[-\w.]+(\/.*)?)$/i.test(aURI)) aURI = "http://" + RegExp.$1;
        else {
            let table = "ttp=>http,tp=>http,p=>http,ttps=>https,tps=>https,ps=>https,s=>https";
            let regexp = new RegExp();
            if (aURI.match(regexp.compile('^(' + table.replace(/=>[^,]+|=>[^,]+$/g, '').replace(/\s*,\s*/g, '|') + '):', 'g'))) {
                var target = RegExp.$1;
                table.match(regexp.compile('(,|^)' + target + '=>([^,]+)'));
                aURI = aURI.replace(target, RegExp.$2);
            }
        }
        return aURI;
    }
}
Object.freeze(typeUtil);

const $E = (s = "") => {
    let r = document.querySelector(s);
    if (!r) {
        console.trace("No Result: document.querySelector", s)
    }
    return r;
}

const getI18nMessage = (strName = "") => {
    const message = browser.i18n.getMessage(strName);
    if (message === "") {
        return strName;
    }
    return message;
}

const testCheckDragTargetType = () => {
    const assert = console.assert;
    const fn = typeUtil.checkDragTargetType;
    let selection = "hello world";
    let textSelection = "hello world";
    let imageLink = "";
    let target = document.createTextNode("hello");

    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_TEXT, "text");

    selection = "http://www.example.com";
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_TEXT_URL, "text_url");

    target = document.createElement("textarea");
    selection = "http://www.example.com/example.jpg";
    imageLink = "";
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_TEXT_AREA, "text_area");

    target = document.createElement("a");
    selection = "http://www.example.com";
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_ELEM_A, "elem_a");

    target = document.createElement("a");
    selection = "http://www.example.com";
    imageLink = "http://www.example.com/example.jpg";
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_ELEM_A_IMG, "elem_a_img");

    target = document.createElement("img");
    selection = "http://www.example.com/example.jpg";
    imageLink = "";
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_ELEM_IMG, "elem_img");


    selection = "";
    imageLink = "";
    target = document.createElement("div");
    assert(fn(selection, textSelection, imageLink, target) === commons.TYPE_ELEM, "elem");
}

// testCheckDragTargetType()