//全局变量
// var Actions = {};
// var Engines = [];
// var userSearchTemplate = {};
// var enableSync = false;//启动数据同步
// var allowedTopLevelDomains = [];//顶级域名，如cn com org net
// var enableAnimation = false;//启用过渡动画
//var enableInterruption = false; //在拖拽过程按下鼠标右键强制打断拖拽
// var urlMatchPattern = /[A-z]/
// 关闭左右方向
// 关闭上下方向
// 关闭左右下方向
// 右键打断
// 触发距离
// 动作提示
var supportCopyImage = false;



class ExecutorClass {
    constructor() {
        this.data = {
            direction: DIR_U,
            selection: "",
            type: TYPE_UNKNOWN,
            sendToOptions: false
        };
        this.action = {

        };
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
        else if (this.data.type === TYPE_TEXT || this.data.type === TYPE_ELEM || this.data.type === TYPE_TEXT_AREA) {
            this.execute(config.getAct("textAction", this.data.direction));
        }
        else if (this.data.type === TYPE_ELEM_IMG) {
            this.execute(config.getAct("imageAction", this.data.direction));
        }
    }
    execute(action) {
        this.action = action
        if (this.data.selection.length === 0) {
            return;
        }
        switch (this.action.act_name) {
            case ACT_OPEN:
                this.openURL(this.data.selection);
                break;
            case ACT_COPY:
                this.copy();
                break;
            case ACT_SEARCH:
                if (this.action.search_type === SEARCH_LINK) this.searchText(this.data.selection);
                else this.searchText(this.data.textSelection);
                break;
            case ACT_DL:
                break;
            case ACT_TRANS:
                break;
        }
    }
    getTabIndex(tabsLength = 0, currentTabIndex = 0) {
        let index = 0;
        switch (this.action.tab_pos) {
            case TAB_CLEFT:
                index = currentTabIndex;
                break;
            case TAB_CRIGHT:
                index = currentTabIndex + 1;
                break;
            case TAB_FIRST:
                index = 0;
                break;
            case TAB_LAST:
                index = tabsLength;
                break;
            default:
                break;
        }
        return index;
    }
    openTab(url) {
        browser.tabs.query({}).then(tabs => {
            for (let tab of tabs) {
                if (tab.active === true) {
                    if (this.action.tab_pos == TAB_CUR) browser.tabs.update(tab.id, { url: url });
                    else {
                        browser.tabs.create({
                            active: this.action.tab_active,
                            index: this.getTabIndex(tabs.length, tab.index),
                            url: url
                        });
                    }
                    break;
                }
            };
        }, (error) => {
            console.error(error);
        });
    }

    openURL(url) {
        this.openTab(url);
    }

    copy() {
        //发送给指定的tab
        let sended = { command: "copy", copy_type: this.action.copy_type };
        let portName = this.data.sendToOptions ? "sendToOptions" : "sendToContentScript";
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            let port = browser.tabs.connect(tabs[0].id, { name: portName });
            port.postMessage(sended);
        });
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
        this.storageArea.clear().then(callback, () => {});
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
                    //NEW SELECT
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
                        DIR_U: new ActClass(),
                        DIR_D: new ActClass(),
                        DIR_L: new ActClass(),
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
    config.loadDefault();
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

browser.runtime.sendNativeMessage(appName, "test").then(
    response => {
        console.log("From native app:" + response);
        supportCopyImage = true;
    },
    error => supportCopyImage = false
);

function sendImageToNative(base64) {
    let sending = browser.runtime.sendNativeMessage(appName, base64);
    sending.then((response) => {
        console.log("Receive:" + response);
    }, (error) => {
        console.log("Error:" + error);
    });
}
//这条线路只限与content_script通信
//包括在options.html里
//有发送和接收

browser.runtime.onMessage.addListener((m) => {
    m.sendToOptions = false;
    if (m.imageBase64) sendImageToNative(m.imageBase64);
    else executor.DO(m);
});

// var myPort;
// 
// function connected(port) {
//     if (port.name === "cs") {

//         //从content_script连接port和发送信息并不是同时进行的，所以myPort不可确定
//         //不过可以肯定的是，myPort是最后一次连接进来的
//         myPort.onMessage.addListener((m) => {
//             m.sendToOptions = true;
//             if (m.imageBase64) executor.DO(m);
//             else executor.DO(m);
//         });
//     }
// }
// browser.runtime.onConnect.addListener(connected)

config.load();