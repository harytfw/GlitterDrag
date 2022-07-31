
export const builtinSearchEngines = {
	general: [
		{ name: "Google Search", url: " https://www.google.com/search?q=%s", },
		{ name: "Bing Search", url: "https://www.bing.com/search?q=%s", },
		{ name: "DuckDuckGo Search", url: "https://duckduckgo.com/?q=%s&ia=web", },
		{ name: "Yahoo Search", url: "https://search.yahoo.com/search;?p=%s", },
		{ name: "Yandex Search", url: "https://www.yandex.com/search/?text=%s", },
		{ name: "Youtube Search", url: "https://www.youtube.com/results?search_query=%s", },
		{ name: "Wikipedia(English)", url: "https://en.wikipedia.org/wiki/%s", },
		{ name: "Amazon Search", url: "https://www.amazon.com/s/?field-keywords=%s", },
		{ name: "Qwant Search", url: "https://www.qwant.com/?q=%s&t=all", },
		{ name: "StartPage Search", url: "https://www.startpage.com/do/search?&cat=web&query=%s", }
	],
	chinese: [
		{ name: "百度搜索", url: "https://www.baidu.com/baidu?wd=%s", },
		{ name: "360 搜索", url: "https://www.so.com/s?q=%s", },
		{ name: "Acfun搜索", url: "http://www.acfun.cn/search/#query=%s", },
		{ name: "哔哩哔哩搜索", url: "https://search.bilibili.com/all?keyword=%s", },
		{ name: "优酷搜索", url: "http://www.soku.com/search_video/q_%s", },
		{ name: "网易云音乐搜索", url: "https://music.163.com/#/search/m/?s=%s", },
		{ name: "豆瓣搜索", url: "https://www.douban.com/search?q=", },
		{ name: "知乎搜索", url: "https://www.zhihu.com/search?q=%s", },
		{ name: "中文维基百科", url: "https://zh.wikipedia.org/wiki/%s", },
	],
}
