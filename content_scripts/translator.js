const RESULT_TYPE = {
    WORD: 0,
    SENTENCE: 1,
    PARAGRAPH: 2
}

const Translator = {
    LANGUAGE_CODE: ["auto", "zh-cn", "zh-tw", "zh-hk", "en-hk", "en-us", "en-gb", "en-ww", "en-ca", "en-au", "en-ie", "en-fi", "fi-fi", "en-dk", "da-dk", "en-il", "he-il", "en-za", "en-in", "en-no", "en-sg", "en-nz", "en-id", "en-ph", "en-th", "en-my", "en-xa", "ko-kr", "ja-jp", "nl-nl", "nl-be", "pt-pt", "pt-br", "fr-fr", "fr-lu", "fr-ch", "fr-be", "fr-ca", "es-la", "es-es", "es-ar", "es-us", "es-mx", "es-co", "es-pr", "de-de", "de-at", "de-ch", "ru-ru", "it-it", "el-gr", "no-no", "hu-hu", "tr-tr", "cs-cz", "sl-sl", "pl-pl", "sv-se", "es-cl"],

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
        queryTrans: async function(from = "en", to = "zh", query = "") {
            let isLongText = false;
            query = query.trim();
            if (query.split(" ").length > 1) { //句子
                isLongText = true;
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
            else { // 单个词
                const trans = [];
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