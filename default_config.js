const ACTION_CONSTRUCTOR = (parameter = {}) => {
    return Object.assign({
        act_name: commons.ACT_OPEN,
        tab_active: commons.FORE_GROUND,
        tab_pos: commons.TAB_CRIGHT,
        engine_name: browser.i18n.getMessage("defaultText"),
        engine_url: browser.i18n.getMessage("default_search_url"),// when is_browser_search is set to true, this parameter has no effect since we directly call search API
        is_browser_search: true,
        open_type: commons.OPEN_LINK,
        search_type: commons.SEARCH_TEXT,
        copy_type: commons.COPY_TEXT,
        download_type: commons.DOWNLOAD_LINK,
        download_directory: 0,
        download_saveas: commons.DOWNLOAD_SAVEAS_YES,
        search_onsite: commons.SEARCH_ONSITE_NO
    }, parameter)
}
const GENERATE_DEFAULT_CONFIG = () => {

    const clone = (obj = {}) => {
        return JSON.parse(JSON.stringify(obj));
    }
    let tempAction = {
        DIR_U: null,
        DIR_D: null,
        DIR_L: null,
        DIR_R: null,
        DIR_UP_L: null,
        DIR_UP_R: null,
        DIR_LOW_L: null,
        DIR_LOW_R: null,
        DIR_OUTER: null,
    };
    for (let k of Object.keys(tempAction)) {
        tempAction[k] = ACTION_CONSTRUCTOR();
    }
    return {
        enableSync: false,
        enableIndicator: false,
        enablePrompt: false,
        enableStyle: false,
        enableTimeoutCancel: false,
        enableAutoSelectPreviousTab: true,
        enableCtrlKey: false,
        enableShiftKey: false,
        enableLockScrollbar: false,
        timeoutCancel: 2000, // ms
        triggeredDistance: 20, // px
        maxTriggeredDistance: 9999, //px
        disableAdjustTabSequence: false,
        switchToParentTab: false,
        alwaysImage: false,
        imageReferrer: false,
        extraCommands: false,
        tipsContent: {
            ACT_NONE: "%a",
            ACT_OPEN: "%a",
            ACT_COPY: "%a",
            ACT_SEARCH: "%a",
            ACT_TRANS: "%a",
            ACT_DL: "%a",
            ACT_QRCODE: "%a",
            ACT_FIND: "%a",
        },
        Actions: {
            textAction: clone(tempAction),
            linkAction: clone(tempAction),
            imageAction: clone(tempAction)
        },
        Actions_ShiftKey: {
            textAction: clone(tempAction),
            linkAction: clone(tempAction),
            imageAction: clone(tempAction)
        },
        Actions_CtrlKey: {
            textAction: clone(tempAction),
            linkAction: clone(tempAction),
            imageAction: clone(tempAction)
        },
        Engines: [],
        directionControl: {
            textAction: commons.ALLOW_NORMAL,
            linkAction: commons.ALLOW_NORMAL,
            imageAction: commons.ALLOW_V,
        },
        directionControl_CtrlKey: {
            textAction: commons.ALLOW_NORMAL,
            linkAction: commons.ALLOW_NORMAL,
            imageAction: commons.ALLOW_NORMAL
        },
        directionControl_ShiftKey: {
            textAction: commons.ALLOW_NORMAL,
            linkAction: commons.ALLOW_NORMAL,
            imageAction: commons.ALLOW_NORMAL
        },

        Panel_textAction: [
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_COPY,
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_TRANS,
                icon: "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAACJUlEQVRoge1YwbHCIBBNCYgNWMIvwRIswRIswQ5ycEKOlmAJluDRSchMSkgJ/oP4P1mWyAYIOfBm9qKGvAe7bxeLIiMjwwtcdD0XcvhEaj5kKOKvT6TmQ0YWEJDIK2WwsmdZQBaQUkAsbIS8a0SH1RLFsBXNYbTTVXNOzYkEY/fr5y41J2ewi9zru78R3S0ZmW3VHrk27/C6u357ZiO626hIL3K/AFU7uJAPndBWNAfbb83dl/cluTqR4pbJk5U9A7k/KXZRwLTAXIULWcLdX411svq5MxqQltuqVkan9M15WNX+GGvGdCsbSSVuoKYOr5qz0ZkdTMILRiqJrod5z4UsXdZSNzo4WsS92bGyZ9CVQDxc8t7o1PrpVe0xrgikHv5SytHzzZNc0HrfAvDjZ1X78/X59ynqNTPA9aIV8wR5ZxFcyBOsGWjBXMhTCvJOImDRs4vcI2kZtpjfno2Sx3bPKgLx/sfnu2hpNEX+/+VuIgzv1zq60WdC9AQX8lMi4Cg9tcuquMOlEYW8TYTekaH3Y/cEXnfXID1B5epAIW+K6Hr9c+j9GDlT5Iye4EN+JELLb8z7bR3bq5hDkNdJa4Kg96sGZo15PQGdEGeQh0AGPkrQihkUojd5bO6nBrknKBHe5IvCeqq0iH1PmBQwoyiD94S5cPF+G4L1BB8Y3k/4lyJIT/ABxfttWOyegL8ceP+MQuRL3BNswOZ+6hqrKeaMjBXiF0b+4FTz85cOAAAAAElFTkSuQmCC",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_SEARCH,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                is_browser_search: true,
                engine_name: "Wikipedia",
                engine_url: "https://en.wikipedia.org/wiki/%s",
                icon: "",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_FIND,
                icon: "",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_SEARCH,
                engine_name: "DuckDuckGo",
                engine_url: "https://duckduckgo.com/?q=%s&ia=web",
                icon: "data:image/icon;base64,AAABAAIAEBAAAAEAIABoBAAAJgAAACAgAAABACAAqBAAAI4EAAAoAAAAEAAAACAAAAABACAAAAAAAAAEAAATCwAAEwsAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA11RgALs6oACbQ9wAj0v8AI9L/ACfQ9wAu0agANdUYAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAzzN4CNdL/oK/z//////////////////////+jsPv/BDXX/wAz0t4AAAAAAAAAAAAAAAAAAAAAAAAAAAAyzvNSduD//////8jK/v+P+Lf/IbQL/17RPP+J3Y//wOKX//////9YeuX/ADLO8wAAAAAAAAAAAAAAAAAw091piOX/8/X9/1Fx5P9xhu//WOWZ/0W9Lv9Lwjn/J8BB/xyDAP9bdfL/9fP//2mI5v8AMNPdAAAAAAc610YRQ9f//////0Zr4P8AGdD/sb32////////////wrv//wAh1/8MPab/ACPc/05r4///////EkPX/wc610YANtWkrr/y/6S48P8AJ9L/AB3R/+/w/v///////////3+D7f8AQeL/AYTw/wFr5/8AMNb/p7Tv/6698v8AM9WkADLW//////8yXt//AC3V/wAw1/////////////z///8A0P7/AKb1/wWI7P8AuPf/AJ3w/zZW3P//////ADHV/wAx2P//////AzrZ/wAu1/84ZOL////////////e////AND//wC1+f8Atff/AZbv/wY62f8ELNf//////wAw1/8AMtn//////wAw2f8ALNn/kKrz////+//cwbH////////////R////Rcb8/wDO/f8A/P//AHzo//////8AMNj/ADXa//////8vXuL/ACna/4yq9///79T/jUkg/9i+r///////r2Q0/7Cozv8BKdr/AirY/zdZ4P//////ADTa/wI72tOuv/T/prr0/wAl2v+JqPb//7yW/+bUxv/9+/n////u//W+n/+Op/L/ADPd/wAv2v+ru/T/r7/0/wI72tMLQd1DEEjg//////9Cbef/ADng///////////////////////R3///AC3g/wAy3v9SeOn//////xFI4P8LQd1DAAAAAAM64PNmiuz/9/j//2mN7f/m7P3///////////9Cb+n/ACXd/wAt3v9rju3//////2iL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/P8J0vz/ELDz/xt85v8mSdj/JknY/yZJ2P8lStowJUjXYCZJ2P8nSdhwJErZryZK2f8oSNcgJUnajyZK2f8mStn/JkrZ/yZK2f8mStn/iJPA////////////////////////////0ff+/xjV/P8J0vz/Drn1/xiO6/8Yjuv/GI7r/xCw8/8Lyvr/CdL8/xmF6P8mStn/JkrZ/yVJ2o8oSNcgJkrZ/yRK2a8jStrfI0rZ3wAAAAAlSdq/Jkra/yZK2v8mStr/Jkra/yZK2v+xtsf///////////////////////////8o2Pz/CdL8/wvK+v8mStr/Jkra/yZK2v8mStr/Jkra/yZK2v8iW97/Jkra/yZK2v8mStr/JUnavwAAAAAjStnfI0ra3yZK2v8lSdq/AAAAACZH2O8mStr/Jkra/yZK2v8mStr/L1HY/9HR0f///////////////////////////yjY/P8J0vz/CdL8/xCw9P8QsPT/ELD0/xSf7/8ddeX/Jkra/yZK2v8mStr/Jkra/yZK2v8mR9jvAAAAACVJ2r8mStr/Jkvb/yVJ2r8AAAAAJkvb/yZL2/8mS9v/Jkvb/yZL2/9KZtL/4+Pj////////////////////////////4Pn//0fd/f8J0vz/CdL8/wnS/P8J0vz/CdL8/wnS/P8Lyvr/Fpfu/yJc3/8mS9v/Jkvb/yZL2/8AAAAAJUnavyZL2/8mS9z/JUncvwAAAAAmS9z/Jkvc/yZL3P8mS9z/Jkvc/26AyP/x8fH//////////////////////////////////////9H3/v/C9P7/o+7+/2fa+/8Oufb/CdL8/wnS/P8J0vz/CdL8/xiP7P8mS9z/Jkvc/wAAAAAlSdy/Jkvc/yZM3P8lTNy/AAAAACZJ2e8mTNz/Jkzc/yZM3P8mTNz/iJTB////////////qnth/5VaOf/x6eX///////////////////////Hp5f/x6eX/ydL2/yZM3P8kVN7/G37o/xKo8v8QsfT/HXbm/yZM3P8mSdnvAAAAACVM3L8mTNz/I0vc3yZJ2u8AAAAAJUzevyZM3f8mTN3/Jkzd/yZM3f+fqc3///////////+VWjn/v5yI/+re1///////////////////////jk8s/7iRe//J0vb/Jkzd/yZM3f8mTN3/Jkzd/yZM3f8mTN3/Jkzd/yVM3r8AAAAAI0vc3yNL3N8kTd2vJk3d/yhQ3yAlTd2PJk3d/yZN3f8mTd3/Jk3d/6St0v////////////Hp5f/q3tf///////////////////////////+xhm7/49PK/6Cx8P8mTd3/Jk3d/yZN3f8mTd3/Jk3d/yZN3f8mTd3/JU3djyhQ3yAmTd3/JE3drydN33AmTd7/J03fcCVK3zAmTd7/Jk3e/yZN3v8mTd7/pK7S///////Sp5r/////////////////////////////////////////////////T27k/yZN3v8mTd7/Jk3e/yZN3v8mTd7/Jk3e/yZN3v8lSt8wJ03fcCZN3v8nTd9wKFDfICZO3/8mTt3PAAAAACVN3r8mTt//Jk7f/yZO3/+EltX//////+fRyv/SqaD/59LO///////////////////////at63/vIBy/7Glxf8mTt//Jk7f/yZO3/8mTt//Jk7f/yZO3/8mTt//JU3evwAAAAAmTt3PJk7f/yhQ3yAAAAAAJE/dryZO3/8oUN9AKFDfQCZO3/8mTt//Jk7f/zhb2v/o6/T/////////////////////////////////////////////////XHrn/yZO3/8mTt//Jk7f/yZO3/8mTt//Jk7f/yZO3/8oUN9AKFDfQCZO3/8kT92vAAAAAAAAAAAoUN9AJk7g/yZO4M8AAAAAJk/hnyZO4P8mTuD/Jk7g/05v5v/k6fv//////////////////////////////////////3eR7P8mTuD/Jk7g/yZO4P8mTuD/Jk7g/yZO4P8mTuD/Jk/hnwAAAAAmTuDPJk7g/yhQ30AAAAAAAAAAAAAAAAAjT+GfJU/h/yVO4Y8gUN8QIk7gzyVP4f8lT+H/SWnW/0lp1v+bq+H/8fHx/////////////////6Cy8v9OcOb/JU/h/yVP4f8lT+H/JU/h/yVP4f8lT+H/JU/h/yJO4M8gUN8QJU7hjyVP4f8jT+GfAAAAAAAAAAAAAAAAAAAAACBQ3xAlTOHvJU/h/yVQ4mAgUN8QIk7hzyVP4f+ktOv///////////////////////H0/f9phur/JU/h/yVP4f8lT+H/JU/h/yVP4f8lT+H/JU/h/yVP4f8iTuHPIFDfECVQ4mAlT+H/JUzh7yBQ3xAAAAAAAAAAAAAAAAAAAAAAAAAAACVQ3zAlUOLvJVDi/yVQ4mAgUN8QI1Din4mb2//J0/j/ydP4/6299P93ku3/M1vk/yVQ4v8lUOL/JVDi/yVQ4v8lUOL/JVDi/yVQ4v8lUOL/I1DinyBQ3xAlUOJgJVDi/yVQ4u8lUN8wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACVQ5DAlUOLvJVDi/yVQ4o8AAAAAJFDjQCVQ4r8lUOL/JVDi/yVQ4v8lUOL/JVDi/yVQ4v8lUOL/JVDi/yVQ4v8lUOL/JVDivyRQ40AAAAAAJVDijyVQ4v8lUOLvJVDkMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACVQ5DAjUeTfJVHj/yNR5N8kUONAAAAAACVQ5DAmUuOAJVHivyNR5N8lUeP/JVHj/yNR5N8lUeK/JlLjgCVQ5DAAAAAAJFDjQCNR5N8lUeP/I1Hk3yVQ5DAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACBQ3xAjUuSfJVHk/yVR5P8jUeTfJFLkcChQ5yAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAoUOcgJFLkcCNR5N8lUeT/JVHk/yNS5J8gUN8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAkUONAI1LknyVS5P8lUuT/JVLk/yVS5O8lUeS/JVHkvyVR5L8lUeS/JVLk7yVS5P8lUuT/JVLk/yRS468kUONAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAIFDfECVS5GAjUuWfIlPlzyVS5f8lUuX/JVLl/yVS5f8iU+XPI1LlnyVS5GAgUN8QAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/AA///AAD//AAAP/ggBB/wgAEP4AAAB8AAAAPAAAADiAAAEYAAAAEQAAAIAAAAAAAAAAAgAAAEIAAABCAAAAQgAAAEIAAABCAAAAQAAAAAAAAAABAAAAiAAAABiAAAEcAAAAPAAAAD4AAAB/CAAQ/4IAQf/AfgP/8AAP//wAP/",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                icon: "",
                panel_tips: "%g-%a"
            })
        ],
        Panel_linkAction: [
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_OPEN,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                icon: "",
                panel_tips: "%g-%a",
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_COPY,
                copy_type: commons.COPY_TEXT,
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                icon: "",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_OPEN,
                tab_pos: commons.TAB_CUR,
                icon: "",
                panel_tips: "open in current"
            }),
            ACTION_CONSTRUCTOR({
                tab_pos: commons.TAB_NEW_PRIVATE_WINDOW,
                act_name: commons.ACT_OPEN,
                icon: "data:image/png;base64,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",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                tab_pos: commons.TAB_LAST,
                act_name: commons.ACT_OPEN,
                icon: "",
                panel_tips: "open at last"
            })
        ],
        Panel_imageAction: [
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_OPEN,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                search_type: commons.SEARCH_LINK,
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                download_saveas: commons.DOWNLOAD_SAVEAS_NO,
                search_type: commons.SEARCH_LINK,
                download_directory: 0,
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_SEARCH,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                search_type: commons.SEARCH_LINK,
                engine_name: "Yandex Image",
                is_browser_search: false,
                engine_url: "https://www.yandex.com/images/search?url=%s&rpt=imageview",
                icon: "",
                panel_tips: "%g-%a"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                download_saveas: commons.DOWNLOAD_SAVEAS_NO,
                search_type: commons.SEARCH_LINK,
                download_directory: 4,
                icon: "",
                panel_tips: "%a-4"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                download_saveas: commons.DOWNLOAD_SAVEAS_NO,
                search_type: commons.SEARCH_LINK,
                download_directory: 5,
                icon: "",
                panel_tips: "%a-5"
            }),
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                search_type: commons.SEARCH_LINK,
                download_saveas: commons.DOWNLOAD_SAVEAS_NO,
                download_directory: 6,
                icon: "",
                panel_tips: "%a-6"
            })
        ],
        translator: {
            baidu_gtk: "",
            baidu_token: "",
            primary_provider: "google",
            recent_sourcelang: "auto",
            recent_targetlang: "auto",
        },

        downloadDirectories: ["", "${today}/", "${today}/${host}/", "", "", "", "", "",
            "function(){\n    return `${host}/${today}/${filename}`\n}"
        ],
        exclusionRules: [],
        style: "",
        specialHosts: [], // ignore drag&drop detection on these hosts.
        allowExts: [".txt", ".jpg", ".jpeg", ".png"], // only allow the file with these extension names.
        maxProcessSize: 5, //unit is M; the file that larger than 5M won't be processed.
        debug: false,
        keepui: false,
        middleButtonSelect: false,
        version: "0.0.0"
    };
}




const DEFAULT_CONFIG_A = (() => {
    let a = GENERATE_DEFAULT_CONFIG();

    Object.assign(a.Actions.textAction, {
        DIR_U: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.FORE_GROUND,
            open_type: commons.OPEN_TEXT,
            download_type: commons.DOWNLOAD_TEXT
        }),
        DIR_D: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.BACK_GROUND,
            open_type: commons.OPEN_TEXT,
            download_type: commons.DOWNLOAD_TEXT
        }),
        DIR_L: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_PANEL,
        }),
        DIR_R: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_SEARCH,
            open_type: commons.OPEN_TEXT,
            download_type: commons.DOWNLOAD_TEXT
        }),
    });

    Object.assign(a.Actions.linkAction, {
        DIR_U: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.FORE_GROUND
        }),
        DIR_D: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.BACK_GROUND
        }),
        DIR_L: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_COPY,
            copy_type: commons.COPY_LINK
        }),
        DIR_R: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_SEARCH,
            search_type: commons.SEARCH_TEXT
        }),
    });
    Object.assign(a.Actions.imageAction, {
        DIR_U: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.FORE_GROUND,
        }),
        DIR_D: ACTION_CONSTRUCTOR({
            act_name: commons.ACT_OPEN,
            tab_active: commons.BACK_GROUND,
        }),
    });

    for (const p of Object.keys(a.Actions)) {
        for (const k of ["DIR_U", "DIR_D", "DIR_L", "DIR_R", "DIR_LOW_L", "DIR_LOW_R", "DIR_UP_L", "DIR_UP_R", "DIR_OUTER",]) {
            if (p === "textAction") {
                Object.assign(a.Actions[p][k], {
                    open_type: commons.OPEN_TEXT,
                    search_type: commons.SEARCH_TEXT,
                    copy_type: commons.COPY_TEXT,
                    download_type: commons.DOWNLOAD_TEXT,
                })
            }
            else if (p === "imageAction") {
                Object.assign(a.Actions[p][k], {
                    open_type: commons.OPEN_IMAGE,
                    search_type: commons.SEARCH_LINK,
                    copy_type: commons.COPY_IMAGE,
                    download_type: commons.DOWNLOAD_IMAGE,
                })
            }
        }
    }
    return a;
})();
const DEFAULT_CONFIG_B = () => {
    return DEFAULT_CONFIG_A;
}

const DEFAULT_CONFIG = DEFAULT_CONFIG_A;
Object.freeze(DEFAULT_CONFIG);

//TODO: user can select built-in configuration
Object.freeze(DEFAULT_CONFIG_A);
Object.freeze(DEFAULT_CONFIG_B);
