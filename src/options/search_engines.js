
let _engines = {
    "General": [
        { name: "Google Search", url: " https://www.google.com/search?q=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Bing Search", url: "https://www.bing.com/search?q=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "DuckDuckGo Search", url: "https://duckduckgo.com/?q=%s&ia=web", isBrowserSearch: false, favIconUrl: "" },
        { name: "Yahoo Search", url: "https://search.yahoo.com/search;?p=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Yandex Search", url: "https://www.yandex.com/search/?text=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Youtube Search", url: "https://www.youtube.com/results?search_query=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Wikipedia(English)", url: "https://en.wikipedia.org/wiki/%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Amazon Search", url: "https://www.amazon.com/s/?field-keywords=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Qwant Search", url: "https://www.qwant.com/?q=%s&t=all", isBrowserSearch: false, favIconUrl: "" },
        { name: "StartPage Search", url: "https://www.startpage.com/do/search?&cat=web&query=%s", isBrowserSearch: false, favIconUrl: "" }
    ],
    "Chinese": [
        { name: "百度搜索", url: "https://www.baidu.com/baidu?wd=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "360 搜索", url: "https://www.so.com/s?q=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Acfun搜索", urL: "http://www.acfun.cn/search/#query=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "哔哩哔哩搜索", url: "https://search.bilibili.com/all?keyword=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "优酷搜索", url: "http://www.soku.com/search_video/q_%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "网易云音乐搜索", url: "https://music.163.com/#/search/m/?s=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "豆瓣搜索", url: "https://www.douban.com/search?q=", isBrowserSearch: false, favIconUrl: "" },
        { name: "知乎搜索", url: "https://www.zhihu.com/search?q=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "中文维基百科", url: "https://zh.wikipedia.org/wiki/%s", isBrowserSearch: false, favIconUrl: "" },
    ],
    "Image Search": [
        { name: "Baidu Image", url: "https://image.baidu.com/n/pc_search?queryImageUrl=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Bing Image", url: "https://www.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi&imgurl=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Google Image", url: "https://www.google.com/searchbyimage?image_url=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "IQDB", url: "https://iqdb.org/?url=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "SauceNAO", url: "https://saucenao.com/search.php?db=999&url=%s", isBrowserSearch: false, favIconUrl: "" },
        { name: "Sogou Image", url: "https://pic.sogou.com/ris?query=%s&flag=1", isBrowserSearch: false, favIconUrl: "" },
        { name: "Yandex", url: "https://www.yandex.com/images/search?url=%s&rpt=imageview", isBrowserSearch: false, favIconUrl: "" },
    ],
    "Image Search(via upload)": [
        { name: "Baidu Image", url: "{redirect.html}?cmd=search&url={url}&engineName=baidu", isBrowserSearch: false, favIconUrl: "" },
        { name: "Google Image", url: "{redirect.html}?cmd=search&url={url}&engineName=google", isBrowserSearch: false, favIconUrl: "" },
        { name: "Tineye", url: "{redirect.html}?cmd=search&url={url}&engineName=tineye", isBrowserSearch: false, favIconUrl: "" },
        { name: "Yandex", url: "{redirect.html}?cmd=search&url={url}&engineName=yandex", isBrowserSearch: false, favIconUrl: "" },
    ]
}

class Engines {
    constructor() {
        this.key_names = [];
    }

    async init(browserMajorVersion = 63) {
        // 控制ENGINES的keys的顺序
        this.key_names = Object.keys(_engines);
        // TODO: remove limitation
        if (browserMajorVersion >= 63) {
            const browserEngines = await browser.search.get();
            for (const eng of browserEngines) {
                eng.isBrowserSearch = true;
            }
            _engines["Browser"] = browserEngines;
            this.key_names.unshift("Browser");
        }
    }
    keys() {
        return this.key_names;
    }
    get(key) {
        return _engines[key];
    }
}

// eslint-disable-next-line no-unused-vars
var searchEngines = new Engines();