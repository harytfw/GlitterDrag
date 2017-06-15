//全局变量
var userActionOptions = {};
var userCustomizedSearchs = [];
var userSearchTemplate = {};
var enableSync = false;//启动数据同步
// var allowedTopLevelDomains = [];//顶级域名，如cn com org net
// var enableAnimation = false;//启用过渡动画
//var enableInterruption = false; //在拖拽过程按下鼠标右键强制打断拖拽
// var urlMatchPattern = /[A-z]/
class SimulateTabs {
    constructor() {
        this.tabs = [];
        this.currentIndex = -1;
    }
    createSomeTabs(count) {
        for (let i = 0; i < count; i++) {
            this.tabs.push(i);
        }
    }

    selectTab(index) {
        this.currentIndex = index;
    }

    openNewTab(value, pos) {
        this.tabs.splice(pos, 0, value);
    }

}

class ExecutorClass {
    constructor() {
        this.data = {
            direction: DIR_U,
            selection: "",
            type: TYPE_UNKNOWN
        };
        this.flags = null;
    }
    DO(m) {
        //console.assert(opt.target instanceof HTMLElement);
        this.data = m;

        if (this.data.type === TYPE_UNKNOWN) {
            console.error("未知的拖拽目标类型！~");
            return;
        }
        // let typeAction = EMPTY_OPTION.noAction;

        if (this.data.type === TYPE_TEXT_URL || this.data.type == TYPE_ELEM_A) {
            // typeAction = userActionOptions.linkAction;
            this.execute(config.getAct("linkAction"))
        }
        else if (this.data.type === TYPE_TEXT || this.data.type === TYPE_ELEM) {
            // typeAction = userActionOptions.textAction;
            this.execute(config.getAct("linkAction"));
        }
        else if (this.data.type === TYPE_ELEM_IMG) {
            // typeAction = userActionOptions.imageAction;
            this.execute(config.getAct("imageAction"));
        }
        else {

        }

        // this.flags = typeAction[this.data.direction];
        // this.execute();
    }
    // getSearchTemplate() {
    //     let name = "";
    //     if (this.type === TYPE_TEXT_URL || this.type == TYPE_ELEM_A) name = "linkAction";
    //     else if (this.type === TYPE_TEXT || this.type === TYPE_ELEM) name = "textAction";
    //     else if (this.type === TYPE_ELEM_IMG) name = "imageAction";

    //     if (userCustomizedSearchs.hasOwnProperty(name)) {
    //         if (userCustomizedSearchs[name].hasOwnProperty(this.data.direction)) {
    //             return userCustomizedSearchs[name][this.data.direction];
    //         }
    //     }
    //     //默认搜索
    //     return DEFAULT_SEARCH_TEMPLATE["百度"];
    // }
    getEngineByName() {

    }
    execute(act_obj) {
        // console.assert(this.flags instanceof ActClass);
        this.flags = act_obj[this.data.direction];
        if (this.data.selection.length === 0) {
            return;
        }
        if (this.flags.isset(ACT_OPEN)) {
            this.openURL(this.data.selection);
        }
        else if (this.flags.isset(ACT_COPY)) {
            alert("复制");
        }
        else if (this.flags.isset(ACT_SEARCH)) {
            this.searchText(this.getEngineByName(this.flags.engineName), this.data.selection);
            // if (this.data.type === TYPE_TEXT) {
            //     this.searchText(this.getEngineByName(this.flags.engineName),this.data.selection,);
            // }
            // else if (this.data.type === TYPE_ELEM_IMG) {
            //     this.searchText(userCustomizedSearchs,this.data.selection,);
            // }
        }
        else if (this.flags.isset(ACT_DL)) {
            this.downloadImage();
        }
        else if (this.flags.isset(ACT_TRANS)) {
            this.translateText();
        }
    }

    openTab(url) {
        let props = {};
        if (this.flags.isset(NEW_WINDOW)) {
            //TODO
        }
        if (this.flags.isset_or(TAB_CUR, TAB_CLEFT, TAB_CRIGHT)) {
            browser.tabs.query({ active: true }).then(
                //获取当前tab
                (tabs) => {
                    let tabInfo = tabs[0];
                    if (this.flags.isset(TAB_CUR)) tabInfo.url = url;
                    else {
                        let m_i = 0;
                        if (tabInfo.index !== 0) {
                            m_i = this.flags.isset(TAB_CLEFT) ? tabInfo.index : tabInfo.index + 1;
                        }
                        browser.tabs.create({
                            active: this.flags.isset(BACK_GROUND) ? false : true,
                            index: m_i,
                            url: url
                        });
                    }
                }
            ).catch(() => { });
        }
        else {
            browser.tabs.query({}).then(
                (tabs) => {
                    browser.tabs.create({
                        active: this.flags.isset(BACK_GROUND) ? false : true,
                        index: this.flags.isset(TAB_FIRST) ? 0 : tabs.length,
                        url: url
                    })
                }
            );
        }

    }

    openURL(url) {
        this.openTab(url)
    }

    copyText(text) {

    }

    searchText(url, keyword) {
        this.openURL(this.searchTemplate.replace("%s", text));
    }

    searchImage(url, keyword) {
        this.openURL(this.searchTemplate.replace("%s", text));
    }

    downloadImage(url) {

    }

    translateText(text) {

    }

    onError(error) {
        console.log(`Error: %{error}`)
    }

}

class ConfigClass {
    constructor() {
        this.enableSync = false;
        this.userActionOptions = {};
        this.userCustomizedSearchs = [];
        this.storageArea = this.enableSync ? browser.storage.sync : browser.storage.local;
    }
    clear(callback) {
        this.storageArea.clear().then(callback, () => { });
    }
    save() {
        this.storageArea.set(this);
    }
    load(callback) {
        let promise = this.storageArea.get();
        promise.then((result) => {
            let keys = Object.keys(result);
            if (keys.length === 0) {
                this.loadDefault(callback);
            }
            else {
                for (let key of keys) {
                    this.set(key, result[key]);
                }
                callback ? callback() : null;
            }
            return true;
        });
    }
    get(key, callback) {
        if (callback) callback(this[key]);
        return this[key];
    }
    set(key, val) {
        if (key === "storageArea") {
            val = this.enableSync ? browser.storage.sync : browser.storage.local;
        }
        else if (key === "userActionOptions") {
            val = initActionOptions(val);
        }
        this[key] = val;
    }
    getAct(typeKey) {
        return this.userActionOptions[typeKey]
    }
    setAct(type, dir, act, sname) {
        this.userActionOptions[type][dir] = act;
    }
    setSearchName(type, dir, sname) {
        this.userActionOptions[type][dir].engineName = sname;
    }
    backup() {
        return JSON.stringify(this, null, 2);
    }
    recover(json) {

    }
    loadDefault(callback) {
        this.clear(() => {
            let _default = {
                userActionOptions: {
                    textAction: {
                        DIR_U: ACT_NONE,
                        DIR_D: ACT_NONE,
                        DIR_L: ACT_NONE,
                        DIR_R: ACT_NONE
                    },
                    linkAction: {
                        DIR_U: ACT_NONE,
                        DIR_D: ACT_NONE,
                        DIR_L: ACT_NONE,
                        DIR_R: ACT_NONE
                    },
                    imageAction: {
                        DIR_U: ACT_NONE,
                        DIR_D: ACT_NONE,
                        DIR_L: ACT_NONE,
                        DIR_R: ACT_NONE
                    }
                },
                userCustomizedSearchs: [],
                enableSync: false
            }
            for (let k of Object.keys(_default)) {
                this.set(k, _default[k]);
            }
            if (callback) callback();
            return true;
        });

    }
}


var executor = new ExecutorClass();
var config = new ConfigClass();


function initActionOptions(raw_act) {
    for (let act in raw_act) {
        for (let dir in raw_act[act]) {
            raw_act[act][dir] = new ActClass(raw_act[act][dir].f);
        }
    }
    return raw_act;
}


// function tryAssignValue(result) {
//     if (result.hasOwnProperty("enableSync")) {
//         enableSync = result.enableSync;
//     }

//     if (result.hasOwnProperty("userActionOptions")) {
//         userActionOptions = initActionOptions(result.userActionOptions);
//     }

//     if (result.hasOwnProperty("userCustomizedSearchs")) {
//         userCustomizedSearchs = result.userCustomizedSearchs;
//     }

//     if (result.hasOwnProperty("userSearchTemplate")) {
//         //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
//         //第3个对象的属性会覆盖第2个
//         //目标是让用户自定义的搜索覆盖扩展自带的搜索
//         Object.assign(userSearchTemplate, result.userSearchTemplate, DEFAULT_SEARCH_TEMPLATE)
//     }
// }

// function collectOptions() {
//     return {
//         userActionOptions: userActionOptions,
//         enableSync: enableSync,
//         userCustomizedSearchs: userCustomizedSearchs,
//         userSearchTemplate: userSearchTemplate,
//         allowTopDomains: allowTopDomains,
//         enableAnimation: enableAnimation
//     }
// }


function loadUserOptions(callback) {
    config.load(callback);
    // let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    // let promise = storageArea.get();
    // promise.then((result) => {
    //     tryAssignValue(result);
    //     callback ? callback() : null;
    // });
}


function saveUserOptions(callback) {
    config.save(callback);
    // let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    // storageArea.set(collectOptions());
    // callback ? callback() : null;
}



function convertOptionsToJson() {
    return config.backup();
}


function loadUserOptionsFromBackUp(raw_json = "", save_after = true) {
    config.recover(json);
    // if (raw_json.length === 0) return;
    // let result = JSON.parse(raw_json, jsonParser);
    // tryAssignValue(result);
}

function loadDefaultOptions() {
    config.loadDefault();
    config.save();
    // userActionOptions = DEFAULT_OPTIONS;
    // saveUserOptions();
}

function updateUserActionOptions(type, dir, act_value) {
    config.setAct(type, dir, new ActClass(act_value));
    config.save();
    // userActionOptions[act][dir].clear_self_set(parseInt(value));
    // saveUserOptions();
}

function updateUserCustomizedSearch(index, name, url, remove = false) {
    let searchList = config.userCustomizedSearchs;
    if (index === -1) {
        searchs.push({ name: name, url: url });
    }
    else if (remove) {
        searchs.splice(index, 1);
    }
    else {
        searchs[index] = { name: name, url: url };
    }
    if (remove) {
        delete searchs[oldName];
    }
    else if (oldName != newName) {
        delete searchs[oldName];
        searchs[newName] = templateURL;
    }
    else {
        searchs[newName] = templateURL;
    }
    config.set("userCustomizedSearchs", searchList);
    config.save();
}


browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    executor.DO(m);
});

loadUserOptions();
