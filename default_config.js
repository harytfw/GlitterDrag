//TODO:减少全局变量,修改变量名
const ACTION_CONSTRUCTOR = (
    act = "",
    active = "",
    pos = "", en = "",
    open_type = "",
    search_type = "",
    copy_type = "",
    download_type = "",
    download_directory = "",
    download_saveas = "",
    search_onsite = "",
) => {
    return {
        act_name: act,
        tab_active: active,
        tab_pos: pos,
        engine_name: en,
        open_type,
        search_type,
        download_type,
        download_directory,
        download_saveas,
        copy_type,
        search_onsite,
    }
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
        DIR_OUTER: null
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
            imageAction: commons.ALLOW_NORMAL
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
        downloadDirectories: ["", "", "", "", "", "", "", ""],
        style: "",
    };
}


const DEFAULT_CONFIG = GENERATE_DEFAULT_CONFIG();
const DEFAULT_CONFIG_A = () => {
    let a = DEFAULT_CONFIG;

    Object.assign(a.Actions.textAction, {
        DIR_U: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.FORGE_GROUND, commons.TAB_CLEFT),
        DIR_D: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.BACK_GROUND, commons.TAB_CLEFT),
    });
    Object.assign(a.Actions.linkAction, {
        DIR_U: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.FORGE_GROUND, commons.TAB_CLEFT),
        DIR_D: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.BACK_GROUND, commons.TAB_CLEFT),
    });
    Object.assign(a.Actions.imageAction, {
        DIR_U: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.FORGE_GROUND, commons.TAB_CLEFT),
        DIR_D: ACTION_CONSTRUCTOR(commons.ACT_OPEN, commons.BACK_GROUND, commons.TAB_CLEFT),
    });
    return a;
}
const DEFAULT_CONFIG_B = () => {
    return DEFAULT_CONFIG_A;
}

Object.freeze(DEFAULT_CONFIG);

//TODO: user can select built-in configuration
Object.freeze(DEFAULT_CONFIG_A);
Object.freeze(DEFAULT_CONFIG_B);