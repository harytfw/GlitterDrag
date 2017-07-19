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
                if (this.action.search_type === commons.SEARCH_LINK) {
                    this.searchText(this.data.selection);
                }
                // this.data.selection is image's url
                // TODO: how to get the ALT attribute or event.
                /*else if (this.action.search_type === commons.SEARCH_IMAGE) {
                    console.dir(e);
                }*/
                else {
                    this.searchText(this.data.textSelection);
                }
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
            }
        }, (error) => {
            console.error(error);
        });
    }



    openURL(url = "") {
        function validURL(u) {
            let r = true;
            try {
                new URL(u);
            }
            catch (e) {
                r = false;
            }
            return r;

        }
        if (validURL(url)) {
            this.openTab(url);
        }
        else if (commons.urlPattern.test("http://" + url)) {
            this.openTab("http://" + url);
        }
        else {
            this.searchText(url);
        }
    }

    copy() {
        //发送给指定的tab
        const sended = { command: "copy", copy_type: this.action.copy_type };
        let portName = this.data.sendToOptions ? "sendToOptions" : "sendToContentScript";
        browser.tabs.query({ currentWindow: true, active: true }, (tabs) => {
            let port = browser.tabs.connect(tabs[0].id, { name: portName });
            port.postMessage(sended);
        });
    }

    searchText(keyword) {
        this.openTab(config.getSearchURL(this.action.engine_name).replace("%s", keyword));
    }

    searchImage(url, keyword) { // unused
        this.openURL(this.searchTemplate.replace("%s", keyword));
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
        this.storageArea.clear().then(callback, () => {}, (e) => { console.error(e) });
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
        }, (e) => { console.error(e) });
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
        const r = this.Actions[type][dir];
        return r ? r : _default_config.Actions[type][dir];
    }
    // setAct(type, dir, act) {
    //     if (act instanceof ActClass) {
    //         this.Actions[type][dir] = act;
    //     }
    // }
    getSearchURL(name) {
        let defaultUrl = browser.i18n.getMessage('default_search_url');
        if (defaultUrl === "" || defaultUrl === "??") {
            console.warn('get default_search_url fail, fallback to Google.')
            defaultUrl = "https://www.google.com/search?q=%s";
        }
        let searchUrl = defaultUrl;
        this.get("Engines").every(engine => engine.name === name ? (searchUrl = engine.url, false) : true);
        return (searchUrl);
    }
    restore(json) {
        const parsed = JSON.parse(json);
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

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.sendNativeMessage(commons.appName, "test").then(
    response => {
        // console.log("From native app:" + response);
        supportCopyImage = true;
    },
    error => supportCopyImage = false
);

function convertImageSrcToBase64(src) {
    const request = new Request(src);
    return fetch(request)
        .then(response => {
            return response.blob();
        })
        .then(blob => {
            const reader = new FileReader();
            reader.readAsDataURL(blob);
            return new Promise(resolve => {
                reader.onloadend = () => {
                    resolve(reader.result.split(",")[1]);
                }
            });
        })
        .then(base64 => {
            return new Promise(resolve => {
                resolve(base64);
            });
        });
}

function sendImageToNativeBySrc(src) {
    convertImageSrcToBase64(src)
        .then(base64 => {
            return browser.runtime.sendNativeMessage(commons.appName, base64);
        })
        .then(rec => {
            console.log("Receive: ", rec);
        })
        .catch(error => {
            console.log("Error:" + error);
        });
}

function sendImageToNative(base64) {
    const sending = browser.runtime.sendNativeMessage(commons.appName, base64);
    sending.then((response) => {
        console.log("Receive:" + response);
    }, (error) => {
        console.log("Error:" + error);
    });
}

browser.runtime.onMessage.addListener((m) => {
    m.sendToOptions = false;
    if (("imageBase64" in m || "imageSrc" in m) && supportCopyImage) {
        if (m.imageBase64) sendImageToNative(m.imageBase64);
        else if (m.imageSrc) sendImageToNativeBySrc(m.imageSrc);
    }
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