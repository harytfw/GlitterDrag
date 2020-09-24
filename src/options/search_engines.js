export const searchEngines = {
    "General": [{
        name: "Google Search",
        url: " https://www.google.com/search?q=%s",
        icon: ""
    }, {
        name: "Bing Search",
        url: "https://www.bing.com/search?q=%s",
        icon: ""
    }, {
        name: "DuckDuckGo Search",
        url: "https://duckduckgo.com/?q=%s&ia=web",
        icon: ""
    }, {
        name: "Yahoo Search",
        url: "https://search.yahoo.com/search;?p=%s",
        icon: ""
    }, {
        name: "Yandex Search",
        url: "https://www.yandex.com/search/?text=%s",
        icon: ""
    }, {
        name: "Youtube Search",
        url: "https://www.youtube.com/results?search_query=%s",
        icon: ""
    }, {
        name: "Wikipedia(English)",
        url: "https://en.wikipedia.org/wiki/%s",
        icon: ""
    }, {
        name: "Amazon Search",
        url: "https://www.amazon.com/s/?field-keywords=%s",
        icon: ""
    }, {
        name: "Qwant Search",
        url: "https://www.qwant.com/?q=%s&t=all",
        icon: ""
    }, {
        name: "StartPage Search",
        url: "https://www.startpage.com/do/search?&cat=web&query=%s",
        icon: ""
    }],
    "Chinese": [{
        name: "百度搜索",
        url: "https://www.baidu.com/baidu?wd=%s",
        icon: ""
    }, {
        name: "360 搜索",
        url: "https://www.so.com/s?q=%s",
        icon: ""
    }, {
        name: "Acfun搜索",
        urL: "http://www.acfun.cn/search/#query=%s",
        icon: ""
    }, {
        name: "哔哩哔哩搜索",
        url: "https://search.bilibili.com/all?keyword=%s",
        icon: ""
    }, {
        name: "优酷搜索",
        url: "http://www.soku.com/search_video/q_%s",
        icon: ""
    }, {
        name: "网易云音乐搜索",
        url: "https://music.163.com/#/search/m/?s=%s",
        icon: ""
    }, {
        name: "豆瓣搜索",
        url: "https://www.douban.com/search?q=%s",
        icon: ""
    }, {
        name: "知乎搜索",
        url: "https://www.zhihu.com/search?q=%s",
        icon: ""
    }, {
        name: "中文维基百科",
        url: "https://zh.wikipedia.org/wiki/%s",
        icon: ""
    }, ],
    "Image Search": [{
        name: "Baidu Image",
        url: "https://image.baidu.com/n/pc_search?queryImageUrl=%s",
        icon: ""
    }, {
        name: "Bing Image",
        url: "https://www.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi&imgurl=%s",
        icon: ""
    }, {
        name: "Google Image",
        url: "https://www.google.com/searchbyimage?image_url=%s",
        icon: ""
    }, {
        name: "IQDB",
        url: "https://iqdb.org/?url=%s",
        icon: ""
    }, {
        name: "SauceNAO",
        url: "https://saucenao.com/search.php?db=999&url=%s",
        icon: ""
    }, {
        name: "Sogou Image",
        url: "https://pic.sogou.com/ris?query=%s&flag=1",
        icon: ""
    }, {
        name: "Yandex",
        url: "https://www.yandex.com/images/search?url=%s&rpt=imageview",
        icon: ""
    }, ],
    "Image Search(via upload)": [{
        name: "Baidu Image",
        url: "{redirect.html}?cmd=search&url={url}&engineName=baidu",
        icon: ""
    }, {
        name: "Google Image",
        url: "{redirect.html}?cmd=search&url={url}&engineName=google",
        icon: ""
    }, {
        name: "Tineye",
        url: "{redirect.html}?cmd=search&url={url}&engineName=tineye",
        icon: ""
    }, {
        name: "Yandex",
        url: "{redirect.html}?cmd=search&url={url}&engineName=yandex",
        icon: ""
    }, ]
}
