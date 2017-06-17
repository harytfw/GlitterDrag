//全局变量
// var Actions = {};
// var userCustomizedSearchs = [];
// var userSearchTemplate = {};
// var enableSync = false;//启动数据同步
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
        this.action = null;
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
            this.execute(config.getAct("linkAction",this.data.direction))
        }
        else if (this.data.type === TYPE_TEXT || this.data.type === TYPE_ELEM) {
            this.execute(config.getAct("linkAction",this.data.direction));
        }
        else if (this.data.type === TYPE_ELEM_IMG) {
            this.execute(config.getAct("imageAction",this.data.direction));
        }
        else {

        }
    }
    execute(action) {
        this.action = action
        if (this.data.selection.length === 0) {
            return;
        }
        switch(this.action.act_name){
            case ACT_OPEN:this.openURL(this.data.selection);break;
            case ACT_COPY:this.copyText(); break;
            case ACT_SEARCH:this.searchText();break;
            case ACT_DL:break;
            case ACT_TRANS:break;
        }
        // if (this.action.isAct(ACT_OPEN)) {
        //     this.openURL(this.data.selection);
        // }
        // else if (this.action.isAct(ACT_COPY)) {
        //     alert("复制");
        // }
        // else if (this.action.isAct(ACT_SEARCH)) {
        //     this.searchText(this.getEngineByName(this.flags.engine_name), this.data.selection);
        //     // if (this.data.type === TYPE_TEXT) {
        //     //     this.searchText(this.getEngineByName(this.flags.engine_name),this.data.selection,);
        //     // }
        //     // else if (this.data.type === TYPE_ELEM_IMG) {
        //     //     this.searchText(userCustomizedSearchs,this.data.selection,);
        //     // }
        // }
        // else if (this.action.isAct(ACT_DL)) {
        //     this.downloadImage();
        // }
        // else if (this.action.isAct(ACT_TRANS)) {
        //     this.translateText();
        // }
    }
    openTab(url) {
        browser.tabs.query({}).then(tabs => {
            let tab_pos = this.action.tab_pos;
            let tab_active = this.action.tab_active;
            tabs.forEach(tab => {
                if (tab.active === true) {
                    if (this.action.tab_pos == TAB_CUR) browser.tabs.update(tab.id, { url: url });
                    else {
                        let index = 0;
                        switch (tab_pos) {
                            case TAB_CLEFT: index = tab.index; break;
                            case TAB_CRIGHT: index = tab.index + 1; break;
                            case TAB_FIRST: index = 0; break;
                            case TAB_LAST: index = tabs.length; break;
                            default: break;
                        }
                        browser.tabs.create({
                            active: tab_active,
                            index: index,
                            url: url
                        })
                    }
                }
            });
        }, (error) => {
            console.error(error);
        });
    }

    openURL(url) {
        this.openTab(url);
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
        this.Actions = {};
        this.Engines = [];
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
        else if (key === "Actions") {
            let oldval = val;
            val = {};
            val = this.Actions;
            for (let t of Object.keys(oldval)) {
                val[t] = {};
                for (let d of Object.keys(oldval[t])) {
                    let a = oldval[t][d];
                    val[t][d] = new ActClass(a.act_name,a.tab_active,a.tab_pos,a.engine_name)
                }
            }
        }
        this[key] = val;
    }
    getAct(type, dir) {
        return this.Actions[type][dir]
    }
    setAct(type, dir, act) {
        this.Actions[type][dir] = act;
    }
    backup() {
        return JSON.stringify(this, null, 2);
    }
    recover(json) {
        let parsed = JSON.parse(json);
        for (let key of Object.keys(parsed)) {
            this.set(key, parsed[key]);
        }
    }
    loadDefault(callback) {
        this.clear(() => {
            let _default = {
                Actions: {
                    textAction: {
                        DIR_U: new ActClass(), DIR_D: new ActClass(), DIR_L: new ActClass(),
                        DIR_R: new ActClass(),
                    },
                    linkAction: {
                        DIR_U: new ActClass(),
                        DIR_D: new ActClass(),
                        DIR_L: new ActClass(),
                        DIR_R: new ActClass(),
                    },
                    imageAction: {
                        DIR_U: new ActClass(),
                        DIR_D: new ActClass(),
                        DIR_L: new ActClass(),
                        DIR_R: new ActClass(),
                    },
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


// function initActionOptions(raw_act) {
//     for (let act in raw_act) {
//         for (let dir in raw_act[act]) {
//             raw_act[act][dir] = new ActClass(raw_act[act][dir].act_val);
//         }
//     }
//     return raw_act;
// }


// function tryAssignValue(result) {
//     if (result.hasOwnProperty("enableSync")) {
//         enableSync = result.enableSync;
//     }

//     if (result.hasOwnProperty("Actions")) {
//         Actions = initActionOptions(result.Actions);
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
//         Actions: Actions,
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
    config.recover(raw_json);
    config.save();
    // if (raw_json.length === 0) return;
    // let result = JSON.parse(raw_json, jsonParser);
    // tryAssignValue(result);
}

function loadDefaultOptions() {
    config.save();
    // Actions = DEFAULT_OPTIONS;
    // saveUserOptions();
}

function updateUserActionOptions(type, dir, act_value) {
    config.setAct(type, dir, new ActClass(act_value));
    config.save();
    // Actions[act][dir].clear_self_set(parseInt(value));
    // saveUserOptions();
}

function updateUserCustomizedSearch(index, name, url, remove = false) {
    let searchList = config.userCustomizedSearchs;
    if (index === -1) {
        searchList.push({ name: name, url: url });
    }
    else if (remove) {
        searchsList.splice(index, 1);
    }
    else {
        searchsList[index] = { name: name, url: url };
    }
    // if (remove) {
    //     delete searchList[oldName];
    // }
    // else if (oldName != newName) {
    //     delete searchList[oldName];
    //     searchList[newName] = templateURL;
    // }
    // else {
    //     searchList[newName] = templateURL;
    // }
    config.set("userCustomizedSearchs", searchList);
    config.save();
}


browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    executor.DO(m);
});

config.load();
