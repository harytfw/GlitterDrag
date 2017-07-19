const _act = (act = commons.ACT_NONE, active = commons.BACK_GROUND, pos = commons.TAB_LAST, en = "", search_type = commons.SEARCH_TEXT, copy_type = commons.COPY_LINK) => {
    return {
        act_name: act,
        tab_active: active,
        tab_pos: pos,
        engine_name: en,
        copy_type: copy_type,
        search_type: search_type,
    }
}
const _clone = (obj = {}) => {
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
};
for (let k of Object.keys(tempAction)) {
    tempAction[k] = _act();
}

var _default_config = {
    enableSync: false,
    enableIndicator: false,
    enablePrompt: false,
    triggeredDistance: 20, //px
    Actions: {
        textAction: _clone(tempAction),
        linkAction: _clone(tempAction),
        imageAction: _clone(tempAction)
    },
    Engines: [],
    directionControl: {
        textAction: commons.ALLOW_ALL,
        linkAction: commons.ALLOW_ALL,
        imageAction: commons.ALLOW_ALL
    },
}