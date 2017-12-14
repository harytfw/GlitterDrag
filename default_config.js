//TODO:减少全局变量,修改变量名
const ACTION_CONSTRUCTOR = (parameter = {}) => {
    return Object.assign({ act_name: commons.ACT_OPEN, tab_active: commons.FORE_GROUND, tab_pos: commons.TAB_CRIGHT, engine_name: browser.i18n.getMessage("defaultText"), engine_url: browser.i18n.getMessage("default_search_url"), open_type: commons.OPEN_LINK, search_type: commons.SEARCH_TEXT, copy_type: commons.COPY_TEXT, download_type: commons.DOWNLOAD_LINK, download_directory: 0, download_saveas: commons.DOWNLOAD_SAVEAS_YES, search_onsite: commons.SEARCH_ONSITE_NO }, parameter)
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
        timeoutCancel: 2000, // ms
        triggeredDistance: 20, // px
        disableAdjustTabSequence: false,
        switchToParentTab: false,
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

        cmdPanel_textAction: [
            ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }),
        ],
        cmdPanel_linkAction: [
            ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }),
        ],
        cmdPanel_imageAction: [
            ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }), ACTION_CONSTRUCTOR({ icon: "" }),
        ],
        downloadDirectories: ["", "", "", "", "", "", "", ""],
        style: "",
        /*
        specialSites:[], // ignore drag&drop detection on these site.
        specialExts:[], // don't process the file with these extensions.
        */
        debug: false,
    };
}




const DEFAULT_CONFIG_A = (() => {
    let a = GENERATE_DEFAULT_CONFIG();

    Object.assign(a.Actions.textAction, {
        DIR_U: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.FORE_GROUND, }),
        DIR_D: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.BACK_GROUND, }),
        DIR_L: ACTION_CONSTRUCTOR({ act_name: commons.ACT_COPY, open_type: commons.OPEN_TEXT, }),
        DIR_R: ACTION_CONSTRUCTOR({ act_name: commons.ACT_SEARCH, open_type: commons.OPEN_TEXT, }),
    });

    Object.assign(a.Actions.linkAction, {
        DIR_U: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.FORE_GROUND }),
        DIR_D: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.BACK_GROUND }),
        DIR_L: ACTION_CONSTRUCTOR({ act_name: commons.ACT_COPY, copy_type: commons.COPY_LINK }),
        DIR_R: ACTION_CONSTRUCTOR({ act_name: commons.ACT_SEARCH, search_type: commons.SEARCH_TEXT }),
    });
    Object.assign(a.Actions.imageAction, {
        DIR_U: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.FORE_GROUND, }),
        DIR_D: ACTION_CONSTRUCTOR({ act_name: commons.ACT_OPEN, tab_active: commons.BACK_GROUND, }),
    });

    for (const p of Object.keys(a.Actions)) {
        for (const k of ["DIR_U", "DIR_D", "DIR_L", "DIR_R", "DIR_LOW_L", "DIR_LOW_R", "DIR_UP_L", "DIR_UP_R", "DIR_OUTER", ]) {
            if (p === "textAction") {
                Object.assign(a.Actions[p][k], { open_type: commons.OPEN_TEXT, search_type: commons.SEARCH_TEXT, copy_type: commons.COPY_TEXT, download_type: commons.DOWNLOAD_TEXT, })
            }
            else if (p === "imageAction") {
                Object.assign(a.Actions[p][k], { open_type: commons.OPEN_IMAGE, search_type: commons.SEARCH_LINK, copy_type: commons.COPY_IMAGE, download_type: commons.DOWNLOAD_IMAGE, })
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