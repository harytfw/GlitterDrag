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
            direction: commons.DIR_U,
            selection: "",
            sendToOptions: false,
            actionType: "textAction"
        };
        this.action = {

        };
    }
    DO(m) {
        this.data = m;
        this.execute();
    }
    execute() {
        this.action = config.getAct(this.data.actionType, this.data.direction);
        if (this.data.selection.length === 0) {
            return;
        }
        switch (this.action.act_name) {
            case commons.ACT_OPEN:
                this.openURL(this.data.selection);
                break;
            case commons.ACT_COPY:
                this.copy();
                break;
            case commons.ACT_SEARCH:
                if (this.action.search_type === commons.SEARCH_LINK) this.searchText(this.data.selection);
                else this.searchText(this.data.textSelection);
                break;
            case commons.ACT_DL:
                this.downloadImage(this.data.selection);
                break;
            case commons.ACT_TRANS:
                break;
        }
    }
    getTabIndex(tabsLength = 0, currentTabIndex = 0) {
        let index = 0;
        switch (this.action.tab_pos) {
            case commons.TAB_CLEFT:
                index = currentTabIndex;
                break;
            case commons.TAB_CRIGHT:
                index = currentTabIndex + 1;
                break;
            case commons.TAB_FIRST:
                index = 0;
                break;
            case commons.TAB_LAST:
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
                    if (this.action.tab_pos == commons.TAB_CUR) browser.tabs.update(tab.id, { url: url });
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
        browser.downloads.download({
            url: url,
            saveAs: true
        });
    }

    translateText(text) {}

}

class ConfigClass {
    constructor() {
        // this.enableSync = false;
        // this.Actions = {};
        // this.Engines = [];
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
            //检查是否有新的选项出现在_default_config.js，有的话添加进来
            for (let key1 of Object.keys(_default_config)) {
                if (this[key1] === undefined) {
                    this[key1] = _default_config[key1];
                }
            }
            
            return true;
        });
    }
    get(key, callback) {
        if (this[key] === undefined) this[key] = _default_config[key];
        if (callback) callback(this[key]);
        return this[key];
    }
    set(key, val) {
        if (key === "storageArea") {
            val = this.enableSync ? browser.storage.sync : browser.storage.local;
        }
        else if (typeof val === "object") {
            val = JSON.parse(JSON.stringify(val));
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
            for (let k of Object.keys(_default_config)) {
                this.set(k, _default_config[k]);
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

browser.runtime.sendNativeMessage(commons.appName, "test").then(
    response => {
        console.log("From native app:" + response);
        supportCopyImage = true;
    },
    error => supportCopyImage = false
);

function sendImageToNative(base64) {
    let sending = browser.runtime.sendNativeMessage(commons.appName, base64);
    sending.then((response) => {
        console.log("Receive:" + response);
    }, (error) => {
        console.log("Error:" + error);
    });
}

browser.runtime.onMessage.addListener((m) => {
    m.sendToOptions = false;
    if (m.imageBase64) sendImageToNative(m.imageBase64);
    else executor.DO(m);
});


// var myPort;
// 

function connected(port) {
    // console.log("port",port);
    if (port.name === "getConfig") {
        // // console.log("connected")
        // port.onMessage.addListener(m=>{
        //     if(m==="iam ready"){
        // console.log("postmessage");
        port.postMessage(JSON.stringify(config));
        // }
        // });
    }
}
browser.runtime.onConnect.addListener(connected)

config.load();