function _act(act = ACT_NONE, active = BACK_GROUND, pos = TAB_LAST, en = "", search_type = SEARCH_TEXT, copy_type = COPY_LINK) {
    return {
        act_name: act,
        tab_active: active,
        tab_pos : pos,
        engine_name : en,
        copy_type : copy_type,
        search_type : search_type,
    }
}
var _default_config = {
    enableSync: false,
    enableIndicator:false,
    enablePrompt:false,
    triggeredDistance:20,//px
    Actions: {
        textAction: {
            DIR_U: _act(),
            DIR_D: _act(),
            DIR_L: _act(),
            DIR_R: _act(),
        },
        linkAction: {
            DIR_U: _act(),
            DIR_D: _act(),
            DIR_L: _act(),
            DIR_R: _act(),
        },
        imageAction: {
            DIR_U: _act(),
            DIR_D: _act(),
            DIR_L: _act(),
            DIR_R: _act(),
        },
    },
    Engines: [],
    directionControl: {
        textAction: ALLOW_ALL,
        linkAction: ALLOW_ALL,
        imageAction: ALLOW_ALL
    },
}