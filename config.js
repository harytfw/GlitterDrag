class _ConfigClass {
    constructor() {
        this.onStorageChange = this.onStorageChange.bind(this);
        this.storage = {};
        this.storage["version"] = browser.runtime.getManifest().version;
        this.storage["addon"] = "Glitter Drag";

    }

    // sendConfigToActiveTab(config) {
    //     browser.tabs.query({
    //         currentWindow: true,
    //         active: true
    //     }, (tabs) => {
    //         let port = browser.tabs.connect(tabs[0].id, {
    //             name: "updateConfig"
    //         });
    //         port.postMessage(JSON.stringify(this));
    //     });
    // }

    onStorageChange(changes, area) {
        if (area === "sync") return;
        for (const key of Object.keys(changes)) {
            this.storage[key] = changes[key].newValue;
        }
        // this.sendConfigToActiveTab();
    }
    clear() {
        this.storage = {};
        return browser.storage.local.clear();
    }
    save() {
        const temp = JSON.parse(JSON.stringify(this.storage));
        if (this.storage["enableSync"] && browser.storage.sync) {
            browser.storage.sync.set(temp);
        }
        return browser.storage.local.set(temp);
    }
    async load(sync = false) {
        return new Promise(async(resolve) => {
            let result = null;
            if (sync && browser.storage.sync) {
                result = await browser.storage.sync.get();
                if (!Object.keys(result).length) {
                    result = await browser.storage.local.get();
                }
            }
            else {
                result = await browser.storage.local.get();
            }
            let keys = Object.keys(result);
            if (keys.length === 0) {
                await this.loadDefault();
                // await this.save();
            }
            else {
                for (let key of keys) {
                    this.storage[key] = result[key];
                }
            }
            //检查是否有新的选项出现在DEFAULT_CONFIG.js，有的话添加进来
            for (let key1 of Object.keys(DEFAULT_CONFIG)) {
                if (this.storage[key1] === undefined) {
                    this.storage[key1] = DEFAULT_CONFIG[key1];
                }
            }
            resolve(true);
        })
    }
    get(key, callback) {
        if (this.storage[key] === undefined) {
            if (key in DEFAULT_CONFIG) {
                this.storage[key] = DEFAULT_CONFIG[key]
            }
            else {
                throw "Unknow key: " + key;
            }
        }
        if (callback) callback(this.storage[key]);
        return this.storage[key];
    }
    set(key, val) {
        const toStored = {};
        toStored[key] = val;
        const p = browser.storage.local.set(toStored);
        if (browser.storage.sync) {
            if (this.get("enableSync") === true || (key === "enableSync" && val === true)) {
                browser.storage.sync.set(toStored);
            }
        }
        return p;
    }
    getAct(type, dir, key) {
        let r = null;
        if (key === commons.KEY_CTRL) {
            r = this.get("Actions_CtrlKey")[type][dir];
        }
        else if (key === commons.KEY_SHIFT) {
            r = this.get("Actions_ShiftKey")[type][dir];
        }
        else {
            r = this.get("Actions")[type][dir];
        }
        return r ? r : DEFAULT_CONFIG.Actions[type][dir];
    }

    // setAct(type, dir, act) {
    //     if (act instanceof ActClass) {
    //         this.Actions[type][dir] = act;
    //     }
    // }
    getSearchURL(name) {
        let defaultUrl = browser.i18n.getMessage('default_search_url');
        if (defaultUrl === "") {
            console.warn('get default_search_url fail, fallback to Google.')
            defaultUrl = "https://www.google.com/search?q=%s";
        }
        let searchUrl = defaultUrl;
        this.get("Engines").every(engine => engine.name === name ? (searchUrl = engine.url, false) : true);
        return (searchUrl);
    }
    restore(json) {
        const parsed = JSON.parse(json);
        // if (parsed.addon !== "Glitter Drag") {
        //     throw "Invalid json";
        // }
        return new Promise(async(resolve, reject) => {
            // for (let key of Object.keys(parsed)) {
            //     this.set(key, parsed[key]);
            // }
            if ("Actions" in parsed) {
                await browser.storage.local.set(parsed);
                resolve(true);
            }
            else {
                reject("Invalid config file");
            }
        })
    }
    async loadDefault() {
        return new Promise(async(resolve) => {
            await this.clear();
            await browser.storage.local.set(DEFAULT_CONFIG);
            resolve(true);
        });
    }
    async loadSync() {
        let enableSync = (await browser.storage.local.get("enableSync")).enableSync;
        return this.load(enableSync ? true : false);
    }

}

class ConfigClass {
    constructor() {
        this.storage = {};
        this.defaultURL = browser.i18n.getMessage('default_search_url');

        if (this.defaultURL === "") {
            console.warn('get default_search_url fail, fallback to Google.')
            this.defaultURL = "https://www.google.com/search?q=%s";
        }
        browser.storage.onChanged.addListener((changes, area) => {
            if (area === "sync") return;
            for (const key of Object.keys(changes)) {
                this.storage[key] = changes[key].newValue;
            }
        });
    }

    set(key, val) {
        this.storage[key] = val;
        const stored = {};
        stored[key] = val;
        if (this.storage["enableSync"] === true && "sync" in browser.storage) {
            if (key === "enableSync") {
                browser.storage.sync.set(this.storage);
            }
            else {
                browser.storage.sync.set(stored);
            }
        }
        return browser.storage.local.set(stored);
    }
    get(key) {
        // console.table(r);
        if (key in this.storage) {
            return this.storage[key];
        }
        return DEFAULT_CONFIG[key];
    }
    restore(json) {

        const parsed = JSON.parse(json);
        // if (parsed.addon !== "Glitter Drag") {
        //     throw "Invalid json";
        // }
        if("Actions" in parsed === false){
            throw "Invalid JSON File";
        }
        for (const key of Object.keys(parsed)) {
            if (key in DEFAULT_CONFIG === false) {
                // throw "Invalid JSON File";
            }
        }
        return browser.storage.local.set(parsed);
    }

    async clear() {
        await browser.storage.local.clear();
        await browser.storage.sync.clear();
        return Promise.resolve();
    }
    async load() {
        let syncFlag = (await browser.storage.local.get("enableSync"))["enableSync"] ? true : false;
        if (syncFlag) {
            Object.assign(this.storage, await browser.storage.sync.get());
        }
        else {
            Object.assign(this.storage, await browser.storage.local.get());
        }
        return Promise.resolve();
    }
    loadSync() {
        return this.load(true);
    }
    async loadDefault() {

        return browser.storage.local.set(DEFAULT_CONFIG);
    }
    getAct(type, dir, key) {
        let r = null;
        if (key === commons.KEY_CTRL) {
            r = this.get("Actions_CtrlKey")[type][dir];
        }
        else if (key === commons.KEY_SHIFT) {
            r = this.get("Actions_ShiftKey")[type][dir];
        }
        else {
            r = this.get("Actions")[type][dir];
        }
        return r ? r : DEFAULT_CONFIG.Actions[type][dir];
    }
    getSearchURL(name) {
        let searchUrl = this.defaultURL;
        this.get("Engines").every(engine => engine.name === name ? (searchUrl = engine.url, false) : true);
        return searchUrl;
    }
}