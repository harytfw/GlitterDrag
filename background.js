//全局变量
// var Actions = {};
// var Engines = [];
// var userSearchTemplate = {};
// var enableSync = false;//启动数据同步
// var allowedTopLevelDomains = [];//顶级域名，如cn com org net
// var enableAnimation = false;//启用过渡动画
//var enableInterruption = false; //在拖拽过程按下鼠标右键强制打断拖拽
// var urlMatchPattern = /[A-z]/


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
        this.data = m;

        if (this.data.type === TYPE_UNKNOWN) {
            console.error("未知的拖拽目标类型！~");
            return;
        }

        if (this.data.type === TYPE_TEXT_URL || this.data.type == TYPE_ELEM_A) {
            this.execute(config.getAct("linkAction", this.data.direction))
        }
        else if (this.data.type === TYPE_TEXT || this.data.type === TYPE_ELEM) {
            this.execute(config.getAct("textAction", this.data.direction));
        }
        else if (this.data.type === TYPE_ELEM_IMG) {
            this.execute(config.getAct("imageAction", this.data.direction));
        }
        else {

        }
    }
    execute(action) {
        this.action = action
        if (this.data.selection.length === 0) {
            return;
        }
        switch (this.action.act_name) {
            case ACT_OPEN: this.openURL(this.data.selection); break;
            case ACT_COPY: this.copy(); break;
            case ACT_SEARCH:
                if (this.action.search_type === SEARCH_LINK) this.searchText(this.data.selection);
                else this.searchText(this.data.textSelection);
                break;
            case ACT_DL: break;
            case ACT_TRANS: break;
        }
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
    copy() {
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            browser.tabs.sendMessage(tabs[0].id, { command: "copy", copy_type: this.action.copy_type });
        })
    }
    searchText(keyword) {
        this.openURL(config.getSearchURL(this.action.engine_name).replace("%s", keyword));
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
                    //NEW OPT
                    val[t][d] = new ActClass(a.act_name, a.tab_active, a.tab_pos, a.engine_name, a.search_type, a.copy_type)
                }
            }
        }
        else if (key === "Engines") {
            val = Array.from(val, v => ({ name: v.name, url: v.url }))
        }
        this[key] = val;
    }
    getAct(type, dir) {
        return this.Actions[type][dir]
    }
    setAct(type, dir, act) {
        if (act instanceof ActClass) {
            this.Actions[type][dir] = act;
        }
    }
    getSearchURL(name) {
        let url = "http://www.baidu.com/s?wd=%s";
        this.get("Engines").every(engine => engine.name === name ? (url = engine.url, false) : true);
        return url;
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
                Engines: [],
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

function loadUserOptions(callback) {
    config.load(callback);
}


function saveUserOptions(callback) {
    config.save(callback);
}



function convertOptionsToJson() {
    return config.backup();
}


function loadUserOptionsFromBackUp(raw_json = "", save_after = true) {
    config.recover(raw_json);
    config.save();
}

function loadDefaultOptions() {
    config.save();
}

function updateUserActionOptions(type, dir, act_value) {
    config.setAct(type, dir, new ActClass(act_value));
    config.save();
}

function updateUserCustomizedSearch(index, name, url, remove = false) {
    let searchList = config.Engines;
    if (index === -1) {
        searchList.push({ name: name, url: url });
    }
    else if (remove) {
        searchsList.splice(index, 1);
    }
    else {
        searchsList[index] = { name: name, url: url };
    }
    config.set("Engines", searchList);
    config.save();
}


browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    executor.DO(m);
});

config.load();
