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
    TYPE_ELEM_IMG: 4,

    DIR_U: "DIR_U",
    DIR_D: "DIR_D",
    DIR_L: "DIR_L",
    DIR_R: "DIR_R",
    DIR_UP_L: "DIR_UP_L",
    DIR_UP_R: "DIR_UP_R",
    DIR_LOW_L: "DIR_LOW_L",
    DIR_LOW_R: "DIR_LOW_R",

    ACT_NONE: "ACT_NONE", //无动作
    ACT_OPEN: "ACT_OPEN", //打开
    ACT_COPY: "ACT_COPY", //复制
    ACT_SEARCH: "ACT_SEARCH", //搜索
    ACT_TRANS: "ACT_TRANS", //翻译
    ACT_DL: "ACT_DL", //下载
    ACT_QRCODE: "ACT_QRCODE", //二维码
    COPY_LINK: "COPY_LINK",
    COPY_TEXT: "COPY_TEXT",
    COPY_IMAGE: "COPY_IMAGE",
    SEARCH_TEXT: "SEARCH_TEXT",
    SEARCH_LINK: "SEARCH_LINK",
    SEARCH_IMAGE: "SEARCH_IMAGE",

    // KEY_CTRL: 0,//ctrl键
    // KEY_SHIFT: 1,//shift键

    NEW_WINDOW: "NEW_WINDOW", //新窗口打开?
    TAB_CUR: "TAB_CUR", //当前标签页
    TAB_FIRST: "TAB_FIRST", //新建标签页在最左边
    TAB_LAST: "TAB_LAST", //最右边
    TAB_CLEFT: "TAB_CLEFT", //新建的标签页在当前标签页的左边
    TAB_CRIGHT: "TAB_CRIGHT", //右边

    FORE_GROUND: true, //前台打开
    BACK_GROUND: false, //后台打开

    ALLOW_NORMAL: "ALLOW_NORMAL",
    ALLOW_H: "ALLOW_H",
    ALLOW_V: "ALLOW_V",
    ALLOW_ALL: "ALLOW_ALL",
    ALLOW_ONE: "ALLOW_ONE",

    _DEBUG: true
};

function $E(s = "") {
    let r = document.querySelector(s);
    if (!r) {
        console.trace("No Result: document.querySelector", s)
    }
    return r;
}

function attachEventS(selector = "body", func = () => {}, eventName = "click") {
    attachEventT($E(selector), func, eventName);
}

function attachEventT(target = document, func = () => {}, eventName = "click") {
    target.addEventListener(eventName, func);
}

function getActionType(t) {
    if (t === commons.TYPE_UNKNOWN) {
        console.error("未知的拖拽目标类型！~");
        return;
    }
    if (t === commons.TYPE_TEXT_URL || t == commons.TYPE_ELEM_A) return "linkAction";
    else if (t === commons.TYPE_TEXT || t === commons.TYPE_ELEM || t === commons.TYPE_TEXT_AREA) return "textAction";
    else if (t === commons.TYPE_ELEM_IMG) return "imageAction";
}

function checkDragTargetType(selection, target) {
    if (selection && selection.length !== 0) {
        if (commons.urlPattern.test(selection)) {
            return commons.TYPE_TEXT_URL;
        }
        return commons.TYPE_TEXT;
    }
    else if (target !== null) {
        if (target instanceof HTMLAnchorElement) {
            return commons.TYPE_ELEM_A;
        }
        else if (target instanceof HTMLImageElement) {
            return commons.TYPE_ELEM_IMG;
        }
        else if (target instanceof HTMLTextAreaElement) {
            return commons.TYPE_TEXT_AREA;
        }
        return commons.TYPE_ELEM;
    }
    return commons.TYPE_UNKNOWN;
}

function geti18nMessage(strName) {
    const message = browser.i18n.getMessage(strName);
    if (message === "" || message === "??") {
        return strName;
    }
    return message;
}