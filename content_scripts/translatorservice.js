const RESULT_TYPE = {
    WORD: 0,
    SENTENCE: 1,
    PARAGRAPH: 2
}

const TranslatorService = {

    LANGUAGE_CODE_TABLE_FULL: [
        { code: "auto", name: "Auto" },
        { code: "af", name: "Afrikaans" },
        { code: "af-ZA", name: "Afrikaans (South Africa)" },
        { code: "ar", name: "Arabic" },
        { code: "ar-AE", name: "Arabic (U.A.E.)" },
        { code: "ar-BH", name: "Arabic (Bahrain)" },
        { code: "ar-DZ", name: "Arabic (Algeria)" }, { code: "ar-EG", name: "Arabic (Egypt)" }, { code: "ar-IQ", name: "Arabic (Iraq)" }, { code: "ar-JO", name: "Arabic (Jordan)" }, { code: "ar-KW", name: "Arabic (Kuwait)" }, { code: "ar-LB", name: "Arabic (Lebanon)" }, { code: "ar-LY", name: "Arabic (Libya)" }, { code: "ar-MA", name: "Arabic (Morocco)" }, { code: "ar-OM", name: "Arabic (Oman)" }, { code: "ar-QA", name: "Arabic (Qatar)" }, { code: "ar-SA", name: "Arabic (Saudi Arabia)" }, { code: "ar-SY", name: "Arabic (Syria)" }, { code: "ar-TN", name: "Arabic (Tunisia)" }, { code: "ar-YE", name: "Arabic (Yemen)" }, { code: "az", name: "Azeri (Latin)" }, { code: "az-AZ", name: "Azeri (Latin) (Azerbaijan)" }, { code: "az-AZ", name: "Azeri (Cyrillic) (Azerbaijan)" }, { code: "be", name: "Belarusian" }, { code: "be-BY", name: "Belarusian (Belarus)" }, { code: "bg", name: "Bulgarian" }, { code: "bg-BG", name: "Bulgarian (Bulgaria)" }, { code: "bs-BA", name: "Bosnian (Bosnia and Herzegovina)" }, { code: "ca", name: "Catalan" }, { code: "ca-ES", name: "Catalan (Spain)" }, { code: "cs", name: "Czech" }, { code: "cs-CZ", name: "Czech (Czech Republic)" }, { code: "cy", name: "Welsh" }, { code: "cy-GB", name: "Welsh (United Kingdom)" }, { code: "da", name: "Danish" }, { code: "da-DK", name: "Danish (Denmark)" }, { code: "de", name: "German" }, { code: "de-AT", name: "German (Austria)" }, { code: "de-CH", name: "German (Switzerland)" }, { code: "de-DE", name: "German (Germany)" }, { code: "de-LI", name: "German (Liechtenstein)" }, { code: "de-LU", name: "German (Luxembourg)" }, { code: "dv", name: "Divehi" }, { code: "dv-MV", name: "Divehi (Maldives)" }, { code: "el", name: "Greek" }, { code: "el-GR", name: "Greek (Greece)" }, { code: "en", name: "English" }, { code: "en-AU", name: "English (Australia)" }, { code: "en-BZ", name: "English (Belize)" }, { code: "en-CA", name: "English (Canada)" }, { code: "en-CB", name: "English (Caribbean)" }, { code: "en-GB", name: "English (United Kingdom)" }, { code: "en-IE", name: "English (Ireland)" }, { code: "en-JM", name: "English (Jamaica)" }, { code: "en-NZ", name: "English (New Zealand)" }, { code: "en-PH", name: "English (Republic of the Philippines)" }, { code: "en-TT", name: "English (Trinidad and Tobago)" }, { code: "en-US", name: "English (United States)" }, { code: "en-ZA", name: "English (South Africa)" }, { code: "en-ZW", name: "English (Zimbabwe)" }, { code: "eo", name: "Esperanto" }, { code: "es", name: "Spanish" }, { code: "es-AR", name: "Spanish (Argentina)" }, { code: "es-BO", name: "Spanish (Bolivia)" }, { code: "es-CL", name: "Spanish (Chile)" }, { code: "es-CO", name: "Spanish (Colombia)" }, { code: "es-CR", name: "Spanish (Costa Rica)" }, { code: "es-DO", name: "Spanish (Dominican Republic)" }, { code: "es-EC", name: "Spanish (Ecuador)" }, { code: "es-ES", name: "Spanish (Castilian)" }, { code: "es-ES", name: "Spanish (Spain)" }, { code: "es-GT", name: "Spanish (Guatemala)" }, { code: "es-HN", name: "Spanish (Honduras)" }, { code: "es-MX", name: "Spanish (Mexico)" }, { code: "es-NI", name: "Spanish (Nicaragua)" }, { code: "es-PA", name: "Spanish (Panama)" }, { code: "es-PE", name: "Spanish (Peru)" }, { code: "es-PR", name: "Spanish (Puerto Rico)" }, { code: "es-PY", name: "Spanish (Paraguay)" }, { code: "es-SV", name: "Spanish (El Salvador)" }, { code: "es-UY", name: "Spanish (Uruguay)" }, { code: "es-VE", name: "Spanish (Venezuela)" }, { code: "et", name: "Estonian" }, { code: "et-EE", name: "Estonian (Estonia)" }, { code: "eu", name: "Basque" }, { code: "eu-ES", name: "Basque (Spain)" }, { code: "fa", name: "Farsi" }, { code: "fa-IR", name: "Farsi (Iran)" }, { code: "fi", name: "Finnish" }, { code: "fi-FI", name: "Finnish (Finland)" }, { code: "fo", name: "Faroese" }, { code: "fo-FO", name: "Faroese (Faroe Islands)" }, { code: "fr", name: "French" }, { code: "fr-BE", name: "French (Belgium)" }, { code: "fr-CA", name: "French (Canada)" }, { code: "fr-CH", name: "French (Switzerland)" }, { code: "fr-FR", name: "French (France)" }, { code: "fr-LU", name: "French (Luxembourg)" }, { code: "fr-MC", name: "French (Principality of Monaco)" }, { code: "gl", name: "Galician" }, { code: "gl-ES", name: "Galician (Spain)" }, { code: "gu", name: "Gujarati" }, { code: "gu-IN", name: "Gujarati (India)" }, { code: "he", name: "Hebrew" }, { code: "he-IL", name: "Hebrew (Israel)" }, { code: "hi", name: "Hindi" }, { code: "hi-IN", name: "Hindi (India)" }, { code: "hr", name: "Croatian" }, { code: "hr-BA", name: "Croatian (Bosnia and Herzegovina)" }, { code: "hr-HR", name: "Croatian (Croatia)" }, { code: "hu", name: "Hungarian" }, { code: "hu-HU", name: "Hungarian (Hungary)" }, { code: "hy", name: "Armenian" }, { code: "hy-AM", name: "Armenian (Armenia)" }, { code: "id", name: "Indonesian" }, { code: "id-ID", name: "Indonesian (Indonesia)" }, { code: "is", name: "Icelandic" }, { code: "is-IS", name: "Icelandic (Iceland)" }, { code: "it", name: "Italian" }, { code: "it-CH", name: "Italian (Switzerland)" }, { code: "it-IT", name: "Italian (Italy)" }, { code: "ja", name: "Japanese" }, { code: "ja-JP", name: "Japanese (Japan)" }, { code: "ka", name: "Georgian" }, { code: "ka-GE", name: "Georgian (Georgia)" }, { code: "kk", name: "Kazakh" }, { code: "kk-KZ", name: "Kazakh (Kazakhstan)" }, { code: "kn", name: "Kannada" }, { code: "kn-IN", name: "Kannada (India)" }, { code: "ko", name: "Korean" }, { code: "ko-KR", name: "Korean (Korea)" }, { code: "kok", name: "Konkani" }, { code: "kok-IN", name: "Konkani (India)" }, { code: "ky", name: "Kyrgyz" }, { code: "ky-KG", name: "Kyrgyz (Kyrgyzstan)" }, { code: "lt", name: "Lithuanian" }, { code: "lt-LT", name: "Lithuanian (Lithuania)" }, { code: "lv", name: "Latvian" }, { code: "lv-LV", name: "Latvian (Latvia)" }, { code: "mi", name: "Maori" }, { code: "mi-NZ", name: "Maori (New Zealand)" }, { code: "mk", name: "FYRO Macedonian" }, { code: "mk-MK", name: "FYRO Macedonian (Former Yugoslav Republic of Macedonia)" }, { code: "mn", name: "Mongolian" }, { code: "mn-MN", name: "Mongolian (Mongolia)" }, { code: "mr", name: "Marathi" }, { code: "mr-IN", name: "Marathi (India)" }, { code: "ms", name: "Malay" }, { code: "ms-BN", name: "Malay (Brunei Darussalam)" }, { code: "ms-MY", name: "Malay (Malaysia)" }, { code: "mt", name: "Maltese" }, { code: "mt-MT", name: "Maltese (Malta)" }, { code: "nb", name: "Norwegian (Bokm?l)" }, { code: "nb-NO", name: "Norwegian (Bokm?l) (Norway)" }, { code: "nl", name: "Dutch" }, { code: "nl-BE", name: "Dutch (Belgium)" }, { code: "nl-NL", name: "Dutch (Netherlands)" }, { code: "nn-NO", name: "Norwegian (Nynorsk) (Norway)" }, { code: "ns", name: "Northern Sotho" }, { code: "ns-ZA", name: "Northern Sotho (South Africa)" }, { code: "pa", name: "Punjabi" }, { code: "pa-IN", name: "Punjabi (India)" }, { code: "pl", name: "Polish" }, { code: "pl-PL", name: "Polish (Poland)" }, { code: "ps", name: "Pashto" }, { code: "ps-AR", name: "Pashto (Afghanistan)" }, { code: "pt", name: "Portuguese" }, { code: "pt-BR", name: "Portuguese (Brazil)" }, { code: "pt-PT", name: "Portuguese (Portugal)" }, { code: "qu", name: "Quechua" }, { code: "qu-BO", name: "Quechua (Bolivia)" }, { code: "qu-EC", name: "Quechua (Ecuador)" }, { code: "qu-PE", name: "Quechua (Peru)" }, { code: "ro", name: "Romanian" }, { code: "ro-RO", name: "Romanian (Romania)" }, { code: "ru", name: "Russian" }, { code: "ru-RU", name: "Russian (Russia)" }, { code: "sa", name: "Sanskrit" }, { code: "sa-IN", name: "Sanskrit (India)" }, { code: "se", name: "Sami (Northern)" }, { code: "se-FI", name: "Sami (Northern) (Finland)" }, { code: "se-FI", name: "Sami (Skolt) (Finland)" }, { code: "se-FI", name: "Sami (Inari) (Finland)" }, { code: "se-NO", name: "Sami (Northern) (Norway)" }, { code: "se-NO", name: "Sami (Lule) (Norway)" }, { code: "se-NO", name: "Sami (Southern) (Norway)" }, { code: "se-SE", name: "Sami (Northern) (Sweden)" }, { code: "se-SE", name: "Sami (Lule) (Sweden)" }, { code: "se-SE", name: "Sami (Southern) (Sweden)" }, { code: "sk", name: "Slovak" }, { code: "sk-SK", name: "Slovak (Slovakia)" }, { code: "sl", name: "Slovenian" }, { code: "sl-SI", name: "Slovenian (Slovenia)" }, { code: "sq", name: "Albanian" }, { code: "sq-AL", name: "Albanian (Albania)" }, { code: "sr-BA", name: "Serbian (Latin) (Bosnia and Herzegovina)" }, { code: "sr-BA", name: "Serbian (Cyrillic) (Bosnia and Herzegovina)" }, { code: "sr-SP", name: "Serbian (Latin) (Serbia and Montenegro)" }, { code: "sr-SP", name: "Serbian (Cyrillic) (Serbia and Montenegro)" }, { code: "sv", name: "Swedish" }, { code: "sv-FI", name: "Swedish (Finland)" }, { code: "sv-SE", name: "Swedish (Sweden)" }, { code: "sw", name: "Swahili" }, { code: "sw-KE", name: "Swahili (Kenya)" }, { code: "syr", name: "Syriac" }, { code: "syr-SY", name: "Syriac (Syria)" }, { code: "ta", name: "Tamil" }, { code: "ta-IN", name: "Tamil (India)" }, { code: "te", name: "Telugu" }, { code: "te-IN", name: "Telugu (India)" }, { code: "th", name: "Thai" }, { code: "th-TH", name: "Thai (Thailand)" }, { code: "tl", name: "Tagalog" }, { code: "tl-PH", name: "Tagalog (Philippines)" }, { code: "tn", name: "Tswana" }, { code: "tn-ZA", name: "Tswana (South Africa)" }, { code: "tr", name: "Turkish" }, { code: "tr-TR", name: "Turkish (Turkey)" }, { code: "tt", name: "Tatar" }, { code: "tt-RU", name: "Tatar (Russia)" }, { code: "ts", name: "Tsonga" }, { code: "uk", name: "Ukrainian" }, { code: "uk-UA", name: "Ukrainian (Ukraine)" }, { code: "ur", name: "Urdu" }, { code: "ur-PK", name: "Urdu (Islamic Republic of Pakistan)" }, { code: "uz", name: "Uzbek (Latin)" }, { code: "uz-UZ", name: "Uzbek (Latin) (Uzbekistan)" }, { code: "uz-UZ", name: "Uzbek (Cyrillic) (Uzbekistan)" }, { code: "vi", name: "Vietnamese" }, { code: "vi-VN", name: "Vietnamese (Viet Nam)" }, { code: "xh", name: "Xhosa" }, { code: "xh-ZA", name: "Xhosa (South Africa)" }, { code: "zh", name: "Chinese" }, { code: "zh-CN", name: "Chinese (S)" }, { code: "zh-HK", name: "Chinese (Hong Kong)" }, { code: "zh-MO", name: "Chinese (Macau)" }, { code: "zh-SG", name: "Chinese (Singapore)" }, { code: "zh-TW", name: "Chinese (T)" }, { code: "zu", name: "Zulu" }, { code: "zu-ZA", name: "Zulu (South Africa)" }
    ],

    LANGUAGE_CODE_TABLE: [
        { code: "auto", name: "自动检测" },
        { code: "en", name: "英文" },
        { code: "zh-CN", name: "简体" },
        { code: "zh-TW", name: "繁体" },
        { code: "ja", name: "日文" },
        { code: "de", name: "德语" },
        { code: "ko", name: "韩语" },
    ],
    // see http://4umi.com/web/html/languagecodes.php
    LANGUAGE_CODE_MAP: new Map([
        ["auto", "自动检测"],
        ["en", "英文"],
        ["zh-CN", "简体"],
        ["zh-TW", "繁体"],
        ["ja", "日文"],
        ["de", "德语"],
        ["ko", "韩语"],
    ]),



    convertObjectToMap: function() {

    },
    RETRY_TIMEOUT: 2000,
    RESULT_BUFFER: {
        audio: null,
        url: "",
    },

    UI_MESSAGE: {

    },

    providers: ["google", "baidu", "bing", "youdao", "iciba"],
    timeout: 3000, //ms
    cache: {
        result: null,
        server: null,
    },
    updateCache: function() {

    },
    get RESULT_SAMPLE() {
        return {
            provider: "",
            type: RESULT_TYPE.WORD,
            host: "",
            detail: "",
            from: "", //源语言代码
            to: "", //目标语言代码
            trans: [{
                part: "",
                meaning: ""
            }, {
                part: "",
                meaning: ""
            }],
            ph_am: "",
            ph_am_mp3: "",
            ph_en: "",
            ph_en_mp3: "",
            ph_tts_mp3: "",
        }
    },

    getLangNameByLangCode(code) {
        for (const item of this.LANGUAGE_CODE_TABLE) {
            if (item.code === code) {
                return item.name;
            }
        }
        return "UNKNOWN";
    },
    transformLangCode(code = "", aMap) {
        if (aMap.has(code)) {
            return aMap.get(code);
        }
        console.assert(this.LANGUAGE_CODE_MAP.has(code), "unsupport language code")
        return code;
    },
    "google": {
        get host() {
            const arr = [PROTOCOL + "translate.google.com", PROTOCOL + "translate.google.cn"];
            if (navigator.language === "zh-CN") { //针对google.com无法访问的情况，优先使用google.cn
                return arr.reverse();
            }
            return arr;
        },
        getGoogleTK: function(str) {
            function b(a, b) {
                for (var d = 0; d < b.length - 2; d += 3) {
                    var c = b.charAt(d + 2),
                        c = "a" <= c ? c.charCodeAt(0) - 87 : Number(c),
                        c = "+" == b.charAt(d + 1) ? a >>> c : a << c;
                    a = "+" == b.charAt(d) ? a + c & 4294967295 : a ^ c
                }
                return a;
            }

            function tk(a) {
                for (var e = ['406398', '2087938574'], h = Number(e[0]) || 0, g = [], d = 0, f = 0; f < a.length; f++) {
                    var c = a.charCodeAt(f);
                    128 > c ? g[d++] = c : (2048 > c ? g[d++] = c >> 6 | 192 : (55296 == (c & 64512) && f + 1 < a.length && 56320 == (a.charCodeAt(f + 1) & 64512) ? (c = 65536 + ((c & 1023) << 10) + (a.charCodeAt(++f) & 1023), g[d++] = c >> 18 | 240, g[d++] = c >> 12 & 63 | 128) : g[d++] = c >> 12 | 224, g[d++] = c >> 6 & 63 | 128), g[d++] = c & 63 | 128)
                }
                a = h;
                for (d = 0; d < g.length; d++) a += g[d], a = b(a, "+-a^+6");
                a = b(a, "+-3^+b+-f");
                a ^= Number(e[1]) || 0;
                0 > a && (a = (a & 2147483647) + 2147483648);
                a %= 1E6;
                return a.toString() + "." + (a ^ h)
            }
            return tk(str);
        },
        audioHost: [],
        queryHeader: {},
        queryAudio: async function(sourceLang, word) {

        },
        queryTrans: async function(sourceLang, targetLang, word) {
            const url = `/translate_a/single?client=t&hl=auto&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&source=btn&srcrom=1&ssel=0&tsel=0&sl=${sourceLang}&tl=${targetLang}&tk=${this.getGoogleTK(word)}&q=${encodeURIComponent(word)}&getTime=`;
            $fetch(this.host, url).then(res => {
                return res.text();
            }).then(t => console.log(t));

            /** 对谷歌翻译返回的数组 分析
             * 
             * 0.
             *   0.
             *     0.  目标语言翻译
             *     1.  源语言
             *   1.
             *     3.  目标语言音标
             *     4.  源语言音标
             * 1.
             *   0.
             *     0.  '动词'对应的目标语言
             *     1.  目标语言的同义词数组
             *     2.  对应上面同义词的不同翻译
             *       0.
             *         0.  '同义词1'
             *         1.  同义词1可能的翻译数组
             *         3.  译文的罕见度
             *       1.
             *         0.  '同义词2'
             *         1.  同义词3可能的翻译数组
             *       ...
             *     3.  源语言
             *   
             * 2.  自动检测到的源语言代码
             * 11.  同义词
             *   0. 
             *     0.  词性
             *     1.
             *       0. 第0组同义词
             *         0. 包含同义词的数组
             *         1. m_en_us1299970
             *       1. 第1组
             *       ...
             *     2. 原单词
             * 12.  解释+例句
             *   0.
             *     0. 词性
             *     1.
             *       0.  第0组解释
             *         0.  '意思解释'
             *         1.  m_en_us
             *         2.  '对应上面意思的例句'
             *       1.  第1组解释，同上
             *       ...
             * 13.  例句
             *   0.
             *     0. 第一句例句
             *       0.  例句内容
             *     1. 第二句例句
             *       0.  例句内容
             *     ...
             * 14. 
             *    0.  包含词组的数组
             */
        }
    },
    "baidu": {
        provider: "baidu",
        host: "http://fanyi.baidu.com",
        audioHost: [],
        queryHeader: {},
        //
        //不同翻译站点提供的语言代码会有所不同，需要映射到统一的语言代码
        LANGUAGE_CODE_MAP_BAIDU: new Map([
            ["zh-CN", "zh"],
            ["zh-TW", "zht"],
            ["ja", "jp"],
            ["ko", "kor"],
        ]),

        queryAudio: async function() {},
        updateTokenAndGtk: function() {
            return fetch(this.host, { credentials: "same-origin" })
                .then(res => res.text())
                .then(html => {
                    let gtk = html.match("window\.gtk = '(.+?)';")[1]
                    let token = html.match("token: '(.+?)',")[1];
                    [gtk, token] = [gtk ? gtk : null, token ? token : null];
                    //config.translate.baidugtk = ""
                    //config.translate.baidutoken = ""

                    //call some method to store gtk and token!
                })
                .catch(error => {
                    //need login
                    console.error(error);
                    return Promise.reject(error);
                })

        },
        detechLanguage(query) {
            const url = `http://fanyi.baidu.com/langdetect`
            const form = new FormData();
            form.append('query', query);
            const request = new Request(url, {
                method: 'POST',
                body: form,
                credentials: 'same-origin'
            });
            return fetch(request)
                .then(res => res.json())
                .then(json => {
                    if (json.msg === "success") return Promise.resolve(json.lan)
                    return Promise.reject("unknown error", json);
                })
        },
        queryTrans: async function(from = "en", to = "zh", query = "") {
            if (from === "auto") {
                from = await this.detechLanguage(query);
            }
            else {
                from = TranslatorService.transformLangCode(from, this.LANGUAGE_CODE_MAP_BAIDU);
            }
            if (to === "auto") {
                to = TranslatorService.transformLangCode(navigator.language, this.LANGUAGE_CODE_MAP_BAIDU);
            }
            else {
                to = TranslatorService.transformLangCode(to, this.LANGUAGE_CODE_MAP_BAIDU);
            }


            console.log(from, to, query);

            let isLongText = true;
            query = query.trim();
            if (/^\w+$/ig.test(query) === true) {
                isLongText = false;
            }

            const gtk = "320305.131321201";
            const token = "59daf518c516e1ff0fd6b7f6893268eb";
            const data = {
                from,
                query,
                // 在获取sign时, query 中的空格要替换成 '+'
                sign: this.getSign(query, gtk),
                simple_means_flag: 3,
                to,
                token,
            }

            //用FormData处理需要post的数据
            const formData = new FormData();
            for (const k of Object.keys(data)) {
                formData.append(k, data[k]);
            }

            //创建POST请求
            //用"same-origin" 可以同时发送浏览器拥有的同源cookie
            const request = new Request("http://fanyi.baidu.com/v2transapi", {
                method: "POST",
                body: formData,
                credentials: "same-origin",
            });

            return fetch(request)
                .then(res => res.json())
                .then(json => {
                    //每个翻译网站返回的翻译结果可能不同
                    //转换成统一的内容
                    console.info(json);
                    const r = this.transform(json, isLongText);
                    console.info(r);
                    return Promise.resolve(r);
                });
        },
        detailURL: function(word) {

        },
        transform: function(src, isLongText) {
            const trans = [];
            if (isLongText === true) { //句子
                for (const x of src.trans_result.data) {
                    trans.push({ part: "", meaning: x.dst })
                }
                return {
                    provider: this.provider,
                    type: RESULT_TYPE.SENTENCE,
                    host: this.host,
                    detail: "",
                    from: src.trans_result.from, //源语言代码
                    to: src.trans_result.to, //目标语言代码
                    trans,
                    ph_am: "",
                    ph_am_mp3: "",
                    ph_en: "",
                    ph_en_mp3: "",
                    ph_tts_mp3: null,
                    isLongText: true, //长文本
                }
            }
            else { // 单独的单词
                const trans = [];
                let data = null;
                
                for (const x of src.dict_result.simple_means.symbols[0].parts) {
                    trans.push({ part: x.part, meaning: x.means });
                }
                return {
                    provider: this.provider, //翻译提供者
                    type: RESULT_TYPE.WORD, //翻译输入的类型
                    host: "", //提供翻译的网站地址
                    detail: "", //详情页面,跳转到具体的翻译网址
                    from: src.trans_result.from, //源语言代码
                    to: src.trans_result.to, //目标语言代码
                    //word_name: src.dict_result.simple_means.word_name, //词
                    ph_am: src.dict_result.simple_means.symbols[0].ph_am, //美式音标
                    ph_am_mp3: src.dict_result.simple_means.symbols[0].ph_am_mp3, //美式发音
                    ph_en: src.dict_result.simple_means.symbols[0].ph_en, //英式音标
                    ph_en_mp3: src.dict_result.simple_means.symbols[0].ph_en_mp3, //英式发音
                    ph_tts_mp3: null,
                    trans, //最终翻译的内容，数组
                    isLongText: false,
                    /*
                     * trans:[
                     *     {
                     *         part:"" //词性,
                     *         meaning:[] // 具体的翻译结果
                     *     }
                     * ]
                     */
                }
            }
        },
        getSign: function(r, gtk) {
            //来自百度翻译
            function n(r, o) {
                for (var t = 0; t < o.length - 2; t += 3) {
                    var a = o.charAt(t + 2);
                    a = a >= 'a' ? a.charCodeAt(0) - 87 : Number(a),
                        a = '+' === o.charAt(t + 1) ? r >>> a : r << a,
                        r = '+' === o.charAt(t) ? r + a & 4294967295 : r ^ a
                }
                return r
            }
            var o = r.match(/[\uD800-\uDBFF][\uDC00-\uDFFF]/g);
            if (null === o) {
                var t = r.length;
                t > 30 && (r = '' + r.substr(0, 10) + r.substr(Math.floor(t / 2) - 5, 10) + r.substr(-10, 10))
            }
            else {
                for (var e = r.split(/[\uD800-\uDBFF][\uDC00-\uDFFF]/), C = 0, h = e.length, f = []; h > C; C++) '' !== e[C] && f.push.apply(f, a(e[C].split(''))),
                    C !== h - 1 && f.push(o[C]);
                var g = f.length;
                g > 30 && (r = f.slice(0, 10).join('') + f.slice(Math.floor(g / 2) - 5, Math.floor(g / 2) + 5).join('') + f.slice(-10).join(''))
            }
            /* //从百度获得的原始代码，目的是让u=gtk
            var u = void 0,
                l = '' + String.fromCharCode(103) + String.fromCharCode(116) + String.fromCharCode(107);
            u = null !== i ? i : (i = window[l] || '') || '';
            */
            var u = gtk; //直接赋值，gtk是百度页面存放的一段字符串，通过其他手段获取
            for (var d = u.split('.'), m = Number(d[0]) || 0, s = Number(d[1]) || 0, S = [], c = 0, v = 0; v < r.length; v++) {
                var A = r.charCodeAt(v);
                128 > A ? S[c++] = A : (2048 > A ? S[c++] = A >> 6 | 192 : (55296 === (64512 & A) && v + 1 < r.length && 56320 === (64512 & r.charCodeAt(v + 1)) ? (A = 65536 + ((1023 & A) << 10) + (1023 & r.charCodeAt(++v)), S[c++] = A >> 18 | 240, S[c++] = A >> 12 & 63 | 128) : S[c++] = A >> 12 | 224, S[c++] = A >> 6 & 63 | 128), S[c++] = 63 & A | 128)
            }
            for (var p = m, F = '' + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(97) + ('' + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(54)), D = '' + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(51) + ('' + String.fromCharCode(94) + String.fromCharCode(43) + String.fromCharCode(98)) + ('' + String.fromCharCode(43) + String.fromCharCode(45) + String.fromCharCode(102)), b = 0; b < S.length; b++) p += S[b],
                p = n(p, F);
            return p = n(p, D),
                p ^= s,
                0 > p && (p = (2147483647 & p) + 2147483648),
                p %= 1000000,
                p.toString() + '.' + (p ^ m)
        },


    },
    "bing": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryAudio: function() {},
        queryTrans: function(sourceLang, destLang) {}

    },
    "youdao": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryAudio: function() {},
        queryTrans: function(sourceLang, destLang) {}
    },
    "iciba": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryAudio: function() {},
        queryTrans: function(sourceLang, destLang) {}
    },
    init: function() {
        const lang = navigator.language;
    }
}
TranslatorService.init();
Object.freeze(TranslatorService);