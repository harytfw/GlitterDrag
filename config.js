class ConfigClass {
    constructor() {
        this.onStorageChange = this.onStorageChange.bind(this);
        this.set("version", browser.runtime.getManifest().version);
        this.set("addon", "Glitter Drag");
        browser.storage.onChanged.addListener(this.onStorageChange);
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
        for (const key of Object.keys(changes)) {
            this[key] = changes[key].newValue;
        }
        // this.sendConfigToActiveTab();
    }
    clear() {
        return browser.storage.local.clear();
    }
    save() {
        return browser.storage.local.set(JSON.parse(JSON.stringify(this)));
    }
    async load() {
        return new Promise(async(resolve) => {
            const result = await browser.storage.local.get();
            let keys = Object.keys(result);
            if (keys.length === 0) {
                await this.loadDefault();
            }
            else {
                for (let key of keys) {
                    this[key] = result[key];
                }
            }
            //检查是否有新的选项出现在DEFAULT_CONFIG.js，有的话添加进来
            for (let key1 of Object.keys(DEFAULT_CONFIG)) {
                if (this[key1] === undefined) {
                    this[key1] = DEFAULT_CONFIG[key1];
                }
            }
            resolve(true);
        })
    }
    get(key, callback) {
        if (this[key] === undefined) {
            if (key in DEFAULT_CONFIG) {

                this[key] = DEFAULT_CONFIG[key]
            }
            else {
                throw "Unknow key: " + key;
            }
        }
        if (callback) callback(this[key]);
        return this[key];
    }
    set(key, val) {
        // if (key === "storageArea") {
        //     val = this.enableSync ? browser.storage.sync : browser.storage.local;
        //     this[key] = val;
        //     return new Promise(resolve => resolve(true));
        // }
        if (typeof val === "object") {
            val = JSON.parse(JSON.stringify(val));
        }
        const toStored = {};
        toStored[key] = val;
        return browser.storage.local.set(toStored);
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
        if (parsed.addon !== "Glitter Drag") {
            throw "Invalid json";
        }
        for (let key of Object.keys(parsed)) {
            this.set(key, parsed[key]);
        }
    }
    async loadDefault() {
        return new Promise(async(resolve) => {
            await this.clear();
            for (let k of Object.keys(DEFAULT_CONFIG)) {
                this.set(k, DEFAULT_CONFIG[k]);
            }
            resolve(true);
        });
    }
    synchronize() {
        // TODO
    }
}