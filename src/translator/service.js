const TranslatorService = {
    RESULT_TYPE: {
        WORD: 0,
        SENTENCE: 1,
        PARAGRAPH: 2
    },
    /*
    LANGUAGE_CODE_TABLE_FULL: [
        { code: "auto", name: "Auto" },
        { code: "af", name: "Afrikaans" },
        { code: "af-ZA", name: "Afrikaans (South Africa)" },
        { code: "ar", name: "Arabic" },
        { code: "ar-AE", name: "Arabic (U.A.E.)" },
        { code: "ar-BH", name: "Arabic (Bahrain)" },
        { code: "ar-DZ", name: "Arabic (Algeria)" }, { code: "ar-EG", name: "Arabic (Egypt)" }, { code: "ar-IQ", name: "Arabic (Iraq)" }, { code: "ar-JO", name: "Arabic (Jordan)" }, { code: "ar-KW", name: "Arabic (Kuwait)" }, { code: "ar-LB", name: "Arabic (Lebanon)" }, { code: "ar-LY", name: "Arabic (Libya)" }, { code: "ar-MA", name: "Arabic (Morocco)" }, { code: "ar-OM", name: "Arabic (Oman)" }, { code: "ar-QA", name: "Arabic (Qatar)" }, { code: "ar-SA", name: "Arabic (Saudi Arabia)" }, { code: "ar-SY", name: "Arabic (Syria)" }, { code: "ar-TN", name: "Arabic (Tunisia)" }, { code: "ar-YE", name: "Arabic (Yemen)" }, { code: "az", name: "Azeri (Latin)" }, { code: "az-AZ", name: "Azeri (Latin) (Azerbaijan)" }, { code: "az-AZ", name: "Azeri (Cyrillic) (Azerbaijan)" }, { code: "be", name: "Belarusian" }, { code: "be-BY", name: "Belarusian (Belarus)" }, { code: "bg", name: "Bulgarian" }, { code: "bg-BG", name: "Bulgarian (Bulgaria)" }, { code: "bs-BA", name: "Bosnian (Bosnia and Herzegovina)" }, { code: "ca", name: "Catalan" }, { code: "ca-ES", name: "Catalan (Spain)" }, { code: "cs", name: "Czech" }, { code: "cs-CZ", name: "Czech (Czech Republic)" }, { code: "cy", name: "Welsh" }, { code: "cy-GB", name: "Welsh (United Kingdom)" }, { code: "da", name: "Danish" }, { code: "da-DK", name: "Danish (Denmark)" }, { code: "de", name: "German" }, { code: "de-AT", name: "German (Austria)" }, { code: "de-CH", name: "German (Switzerland)" }, { code: "de-DE", name: "German (Germany)" }, { code: "de-LI", name: "German (Liechtenstein)" }, { code: "de-LU", name: "German (Luxembourg)" }, { code: "dv", name: "Divehi" }, { code: "dv-MV", name: "Divehi (Maldives)" }, { code: "el", name: "Greek" }, { code: "el-GR", name: "Greek (Greece)" }, { code: "en", name: "English" }, { code: "en-AU", name: "English (Australia)" }, { code: "en-BZ", name: "English (Belize)" }, { code: "en-CA", name: "English (Canada)" }, { code: "en-CB", name: "English (Caribbean)" }, { code: "en-GB", name: "English (United Kingdom)" }, { code: "en-IE", name: "English (Ireland)" }, { code: "en-JM", name: "English (Jamaica)" }, { code: "en-NZ", name: "English (New Zealand)" }, { code: "en-PH", name: "English (Republic of the Philippines)" }, { code: "en-TT", name: "English (Trinidad and Tobago)" }, { code: "en-US", name: "English (United States)" }, { code: "en-ZA", name: "English (South Africa)" }, { code: "en-ZW", name: "English (Zimbabwe)" }, { code: "eo", name: "Esperanto" }, { code: "es", name: "Spanish" }, { code: "es-AR", name: "Spanish (Argentina)" }, { code: "es-BO", name: "Spanish (Bolivia)" }, { code: "es-CL", name: "Spanish (Chile)" }, { code: "es-CO", name: "Spanish (Colombia)" }, { code: "es-CR", name: "Spanish (Costa Rica)" }, { code: "es-DO", name: "Spanish (Dominican Republic)" }, { code: "es-EC", name: "Spanish (Ecuador)" }, { code: "es-ES", name: "Spanish (Castilian)" }, { code: "es-ES", name: "Spanish (Spain)" }, { code: "es-GT", name: "Spanish (Guatemala)" }, { code: "es-HN", name: "Spanish (Honduras)" }, { code: "es-MX", name: "Spanish (Mexico)" }, { code: "es-NI", name: "Spanish (Nicaragua)" }, { code: "es-PA", name: "Spanish (Panama)" }, { code: "es-PE", name: "Spanish (Peru)" }, { code: "es-PR", name: "Spanish (Puerto Rico)" }, { code: "es-PY", name: "Spanish (Paraguay)" }, { code: "es-SV", name: "Spanish (El Salvador)" }, { code: "es-UY", name: "Spanish (Uruguay)" }, { code: "es-VE", name: "Spanish (Venezuela)" }, { code: "et", name: "Estonian" }, { code: "et-EE", name: "Estonian (Estonia)" }, { code: "eu", name: "Basque" }, { code: "eu-ES", name: "Basque (Spain)" }, { code: "fa", name: "Farsi" }, { code: "fa-IR", name: "Farsi (Iran)" }, { code: "fi", name: "Finnish" }, { code: "fi-FI", name: "Finnish (Finland)" }, { code: "fo", name: "Faroese" }, { code: "fo-FO", name: "Faroese (Faroe Islands)" }, { code: "fr", name: "French" }, { code: "fr-BE", name: "French (Belgium)" }, { code: "fr-CA", name: "French (Canada)" }, { code: "fr-CH", name: "French (Switzerland)" }, { code: "fr-FR", name: "French (France)" }, { code: "fr-LU", name: "French (Luxembourg)" }, { code: "fr-MC", name: "French (Principality of Monaco)" }, { code: "gl", name: "Galician" }, { code: "gl-ES", name: "Galician (Spain)" }, { code: "gu", name: "Gujarati" }, { code: "gu-IN", name: "Gujarati (India)" }, { code: "he", name: "Hebrew" }, { code: "he-IL", name: "Hebrew (Israel)" }, { code: "hi", name: "Hindi" }, { code: "hi-IN", name: "Hindi (India)" }, { code: "hr", name: "Croatian" }, { code: "hr-BA", name: "Croatian (Bosnia and Herzegovina)" }, { code: "hr-HR", name: "Croatian (Croatia)" }, { code: "hu", name: "Hungarian" }, { code: "hu-HU", name: "Hungarian (Hungary)" }, { code: "hy", name: "Armenian" }, { code: "hy-AM", name: "Armenian (Armenia)" }, { code: "id", name: "Indonesian" }, { code: "id-ID", name: "Indonesian (Indonesia)" }, { code: "is", name: "Icelandic" }, { code: "is-IS", name: "Icelandic (Iceland)" }, { code: "it", name: "Italian" }, { code: "it-CH", name: "Italian (Switzerland)" }, { code: "it-IT", name: "Italian (Italy)" }, { code: "ja", name: "Japanese" }, { code: "ja-JP", name: "Japanese (Japan)" }, { code: "ka", name: "Georgian" }, { code: "ka-GE", name: "Georgian (Georgia)" }, { code: "kk", name: "Kazakh" }, { code: "kk-KZ", name: "Kazakh (Kazakhstan)" }, { code: "kn", name: "Kannada" }, { code: "kn-IN", name: "Kannada (India)" }, { code: "ko", name: "Korean" }, { code: "ko-KR", name: "Korean (Korea)" }, { code: "kok", name: "Konkani" }, { code: "kok-IN", name: "Konkani (India)" }, { code: "ky", name: "Kyrgyz" }, { code: "ky-KG", name: "Kyrgyz (Kyrgyzstan)" }, { code: "lt", name: "Lithuanian" }, { code: "lt-LT", name: "Lithuanian (Lithuania)" }, { code: "lv", name: "Latvian" }, { code: "lv-LV", name: "Latvian (Latvia)" }, { code: "mi", name: "Maori" }, { code: "mi-NZ", name: "Maori (New Zealand)" }, { code: "mk", name: "FYRO Macedonian" }, { code: "mk-MK", name: "FYRO Macedonian (Former Yugoslav Republic of Macedonia)" }, { code: "mn", name: "Mongolian" }, { code: "mn-MN", name: "Mongolian (Mongolia)" }, { code: "mr", name: "Marathi" }, { code: "mr-IN", name: "Marathi (India)" }, { code: "ms", name: "Malay" }, { code: "ms-BN", name: "Malay (Brunei Darussalam)" }, { code: "ms-MY", name: "Malay (Malaysia)" }, { code: "mt", name: "Maltese" }, { code: "mt-MT", name: "Maltese (Malta)" }, { code: "nb", name: "Norwegian (Bokm?l)" }, { code: "nb-NO", name: "Norwegian (Bokm?l) (Norway)" }, { code: "nl", name: "Dutch" }, { code: "nl-BE", name: "Dutch (Belgium)" }, { code: "nl-NL", name: "Dutch (Netherlands)" }, { code: "nn-NO", name: "Norwegian (Nynorsk) (Norway)" }, { code: "ns", name: "Northern Sotho" }, { code: "ns-ZA", name: "Northern Sotho (South Africa)" }, { code: "pa", name: "Punjabi" }, { code: "pa-IN", name: "Punjabi (India)" }, { code: "pl", name: "Polish" }, { code: "pl-PL", name: "Polish (Poland)" }, { code: "ps", name: "Pashto" }, { code: "ps-AR", name: "Pashto (Afghanistan)" }, { code: "pt", name: "Portuguese" }, { code: "pt-BR", name: "Portuguese (Brazil)" }, { code: "pt-PT", name: "Portuguese (Portugal)" }, { code: "qu", name: "Quechua" }, { code: "qu-BO", name: "Quechua (Bolivia)" }, { code: "qu-EC", name: "Quechua (Ecuador)" }, { code: "qu-PE", name: "Quechua (Peru)" }, { code: "ro", name: "Romanian" }, { code: "ro-RO", name: "Romanian (Romania)" }, { code: "ru", name: "Russian" }, { code: "ru-RU", name: "Russian (Russia)" }, { code: "sa", name: "Sanskrit" }, { code: "sa-IN", name: "Sanskrit (India)" }, { code: "se", name: "Sami (Northern)" }, { code: "se-FI", name: "Sami (Northern) (Finland)" }, { code: "se-FI", name: "Sami (Skolt) (Finland)" }, { code: "se-FI", name: "Sami (Inari) (Finland)" }, { code: "se-NO", name: "Sami (Northern) (Norway)" }, { code: "se-NO", name: "Sami (Lule) (Norway)" }, { code: "se-NO", name: "Sami (Southern) (Norway)" }, { code: "se-SE", name: "Sami (Northern) (Sweden)" }, { code: "se-SE", name: "Sami (Lule) (Sweden)" }, { code: "se-SE", name: "Sami (Southern) (Sweden)" }, { code: "sk", name: "Slovak" }, { code: "sk-SK", name: "Slovak (Slovakia)" }, { code: "sl", name: "Slovenian" }, { code: "sl-SI", name: "Slovenian (Slovenia)" }, { code: "sq", name: "Albanian" }, { code: "sq-AL", name: "Albanian (Albania)" }, { code: "sr-BA", name: "Serbian (Latin) (Bosnia and Herzegovina)" }, { code: "sr-BA", name: "Serbian (Cyrillic) (Bosnia and Herzegovina)" }, { code: "sr-SP", name: "Serbian (Latin) (Serbia and Montenegro)" }, { code: "sr-SP", name: "Serbian (Cyrillic) (Serbia and Montenegro)" }, { code: "sv", name: "Swedish" }, { code: "sv-FI", name: "Swedish (Finland)" }, { code: "sv-SE", name: "Swedish (Sweden)" }, { code: "sw", name: "Swahili" }, { code: "sw-KE", name: "Swahili (Kenya)" }, { code: "syr", name: "Syriac" }, { code: "syr-SY", name: "Syriac (Syria)" }, { code: "ta", name: "Tamil" }, { code: "ta-IN", name: "Tamil (India)" }, { code: "te", name: "Telugu" }, { code: "te-IN", name: "Telugu (India)" }, { code: "th", name: "Thai" }, { code: "th-TH", name: "Thai (Thailand)" }, { code: "tl", name: "Tagalog" }, { code: "tl-PH", name: "Tagalog (Philippines)" }, { code: "tn", name: "Tswana" }, { code: "tn-ZA", name: "Tswana (South Africa)" }, { code: "tr", name: "Turkish" }, { code: "tr-TR", name: "Turkish (Turkey)" }, { code: "tt", name: "Tatar" }, { code: "tt-RU", name: "Tatar (Russia)" }, { code: "ts", name: "Tsonga" }, { code: "uk", name: "Ukrainian" }, { code: "uk-UA", name: "Ukrainian (Ukraine)" }, { code: "ur", name: "Urdu" }, { code: "ur-PK", name: "Urdu (Islamic Republic of Pakistan)" }, { code: "uz", name: "Uzbek (Latin)" }, { code: "uz-UZ", name: "Uzbek (Latin) (Uzbekistan)" }, { code: "uz-UZ", name: "Uzbek (Cyrillic) (Uzbekistan)" }, { code: "vi", name: "Vietnamese" }, { code: "vi-VN", name: "Vietnamese (Viet Nam)" }, { code: "xh", name: "Xhosa" }, { code: "xh-ZA", name: "Xhosa (South Africa)" }, { code: "zh", name: "Chinese" }, { code: "zh-CN", name: "Chinese (S)" }, { code: "zh-HK", name: "Chinese (Hong Kong)" }, { code: "zh-MO", name: "Chinese (Macau)" }, { code: "zh-SG", name: "Chinese (Singapore)" }, { code: "zh-TW", name: "Chinese (T)" }, { code: "zu", name: "Zulu" }, { code: "zu-ZA", name: "Zulu (South Africa)" }
    ],
*/
    // see http://4umi.com/web/html/languagecodes.php
    LANGUAGE_CODE_MAP: new Map([
        ["auto", i18nUtil.getI18n("language_auto")],
        ["en", i18nUtil.getI18n("language_english")],
        ["zh-CN", i18nUtil.getI18n("language_simplified_chinese")],
        ["zh-TW", i18nUtil.getI18n("language_traditional_chinese")],
        ["ja", i18nUtil.getI18n("language_japanese")],
        ["ru", i18nUtil.getI18n("language_russian")],
        ["fr", i18nUtil.getI18n("language_french")],
        ["de", i18nUtil.getI18n("language_german")],
        ["ko", i18nUtil.getI18n("language_korean")],
    ]),
    PROVIDER_LIST: ["google", "baidu"],

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
            // const url = this.host+`/translate_a/single?client=t&hl=auto&dt=bd&dt=ex&dt=ld&dt=md&dt=qca&dt=rw&dt=rm&dt=ss&dt=t&dt=at&ie=UTF-8&oe=UTF-8&source=btn&srcrom=1&ssel=0&tsel=0&sl=${src}&tl=${tar}&tk=${this.getGoogleTK(query)}&q=${encodeURIComponent(query)}&getTime=`;
            const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${src}&tl=${tar}&dt=t&q=${encodeURIComponent(query)}`
            return fetch(url)
                .then(res => {
                    return res.json();
                })
                .then(json => {
                    return {
                        type: TranslatorService.RESULT_TYPE.SENTENCE,
                        host: this.host,
                        trans: [{ part: "", meaning: json[0][0][0] }]
                    }
                    // json = this.transform(json);
                    // return Promise.resolve(json);
                });

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
        },

        // transform: function(json) {
        //     const trans = [];
        //     if (Array.isArray(json[1])) {
        //         for (const x of json[1]) {
        //             const part = x[0];
        //             const meaning = [];
        //             for (const y of x[1]) {
        //                 meaning.push(y);
        //             }
        //             trans.push({ part, meaning: meaning.join(", ") });
        //         }
        //         return {
        //             type: TranslatorService.RESULT_TYPE.WORD,
        //             host: this.host,
        //             trans,
        //             ph_am: json[0][1][3],
        //         }
        //     }
        //     else {
        //         return {
        //             type: TranslatorService.RESULT_TYPE.SENTENCE,
        //             host: this.host,
        //             trans: [{ part: "", meaning: json[0][0][0] }]
        //         }
        //     }
        // }
    },
    /* eslint-disable */
    "bing": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryAudio: function () { },
        queryTrans: function (sourceLang, destLang) { }

    },
    "youdao": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryAudio: function () { },
        queryTrans: function (sourceLang, destLang) { }
    },
    "iciba": {
        host: [],
        audioHost: [],
        queryHeader: {},
        queryTrans: function (sourceLang, destLang) { }
    },
    /* eslint-enable */
}
Object.freeze(TranslatorService);