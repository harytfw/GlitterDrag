const service = {
    WORD: 0,
    SENTENCE: 1,
    PARAGRAPH: 2,
    PROVIDERS: ["google"],
    google: {
        languageCode(val) {
            switch (val) {
                case "sch":
                    return "zh-CN"
                case "tch":
                    return "zh-TW"
                default:
                    return val
            }
        },

        get host() {
            const PROTOCOL = "https://"
            if (navigator.language === "zh-CN") {
                //针对 google.com 无法访问的情况，优先使用google.cn
                return PROTOCOL + "translate.google.cn";
            }
            return PROTOCOL + "translate.google.com";
        },

        queryTrans: async function (sourceLang = "", targetLang = "", query = "") {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(query)}`
            return fetch(url)
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    return {
                        type: service.RESULT_TYPE.SENTENCE,
                        host: this.host,
                        trans: [{ part: "", meaning: json[0][0][0] }]
                    }
                });

        },

    },
}

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