//TODO:减少全局变量,修改变量名
const ACTION_CONSTRUCTOR = (parameter = {}) => {
    return Object.assign({
        act_name: commons.ACT_OPEN,
        tab_active: commons.FORE_GROUND,
        tab_pos: commons.TAB_CRIGHT,
        engine_name: browser.i18n.getMessage("defaultText"),
        engine_url: browser.i18n.getMessage("default_search_url"),
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
                engine_name: "Wikipedia",
                engine_url: "https://en.wikipedia.org/wiki/%s",
                icon: "",
                panel_tips: "%g-%a"
            }),
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
        ],
        Panel_imageAction: [
            ACTION_CONSTRUCTOR({
                act_name: commons.ACT_OPEN,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_DL,
                download_saveas: commons.DOWNLOAD_SAVEAS_NO,
                download_directory: "img/",
                icon: "",
                panel_tips: "%g-%a"
            }), ACTION_CONSTRUCTOR({
                act_name: commons.ACT_SEARCH,
                tab_active: commons.FORE_GROUND,
                tab_pos: commons.TAB_CRIGHT,
                engine_name: "Bing Search",
                engine_url: "https://www.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi&imgurl=%s",
                icon: "",
                panel_tips: "%g-%a"
            }),
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
        style: "",
        specialHosts: [], // ignore drag&drop detection on these hosts.
        allowExts: [".txt", ".jpg", ".jpeg", ".png"], // only allow the file with these extension names.
        maxProcessSize: 5, //unit is M; the file that larger than 5M won't be processed.
        debug: false,
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
        for (const k of ["DIR_U", "DIR_D", "DIR_L", "DIR_R", "DIR_LOW_L", "DIR_LOW_R", "DIR_UP_L", "DIR_UP_R", "DIR_OUTER", ]) {
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