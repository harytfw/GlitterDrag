//TODO:减少全局变量,修改变量名
const ACTION_CONSTRUCTOR = (
    act = commons.ACT_OPEN,
    active = commons.BACK_GROUND,
    pos = commons.TAB_LAST, en = "",
    open_type = commons.OPEN_IMAGE,
    search_type = commons.SEARCH_TEXT,
    copy_type = commons.COPY_LINK,
    download_type = commons.DOWNLOAD_TEXT,
    download_directory = "0",
    download_saveas = commons.DOWNLOAD_SAVEAS_YES,
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
        timeoutCancel: 2000,
        triggeredDistance: 20, //px
        Actions: {
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