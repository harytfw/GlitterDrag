const TranslatorService = {
    RESULT_TYPE: {
        WORD: 0,
        SENTENCE: 1,
        PARAGRAPH: 2
    },

    PROVIDER_LIST: ["google"],

    transformLangCode(code = "", aMap) {
        if (aMap.has(code)) {
            return aMap.get(code);
        }
        console.assert(this.LANGUAGE_CODE_MAP.has(code), "unsupported language code")
        return code;
    },
    "google": {
        name: "",

        get host() {
            const PROTOCOL = "https://"
            if (navigator.language === "zh-CN") { //针对google.com无法访问的情况，优先使用google.cn
                return PROTOCOL + "translate.google.cn";
            }
            return PROTOCOL + "translate.google.com";
        },

        queryTrans: async function (src = "", tar = "", query = "") {
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tar}&dt=t&q=${encodeURIComponent(query)}`
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
                    // json = this.transform(json);
                    // return Promise.resolve(json);
                });

        },

    },
}
Object.freeze(service);