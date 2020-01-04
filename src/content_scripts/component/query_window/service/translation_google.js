(function (ns) {
    ns.name = "Google Translate"
    ns.init = () => { }
    ns.translate = async (sourceLang, targetLang, query) => {
        const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`
        const res = await fetch(url)
        const json = await res.json()
        return {
            sourceLang,
            result: json[0][0][0],
            meanings: []
        }
    }
})({})
/**
 *
 *
 *
 *
 *     RESULT_TYPE: {
        WORD: 0,
        SENTENCE: 1,
        PARAGRAPH: 2
    },
    "google": {

        mapLanguageCode(val) {

        },

        get host() {
            const PROTOCOL = "https://"
            if (navigator.language === "zh-CN") { //针对google.com无法访问的情况，优先使用google.cn
                return PROTOCOL + "translate.google.cn";
            }
            return PROTOCOL + "translate.google.com";
        },

        translate: async function (sourceLang, targetLang, query) {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tar}&dt=t&q=${encodeURIComponent(query)}`
            return fetch(url)
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    return {
                        type: service.RESULT_TYPE.SENTENCE,
                    }
                });
        },

    },

class Translator {

    static get HTML_PATH() {
        return "/component/translator/translator.html"
    }

    constructor() {

        this.container = document.createElement("div")

        const root = this.container.attachShadow({
            mode: "closed"
        })
        const style = document.createElement("link")
        style.rel = "stylesheet"
        style.href = browser.runtime.getURL("/libs/bulma.min.css")
        root.appendChild(style)

        fetch(browser.runtime.getURL(Translator.HTML_PATH))
            .then((res) => res.text())
            .then(html => {
                root.innerHTML += html
            })
    }
}
 *
 *
 *
 *
 *
 *
 */