



//Deprecated 

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

    get(key = "") {
        // console.table(r);
        if (key in this.storage === false) {
            this.storage[key] = DEFAULT_CONFIG[key];
        }
        return this.storage[key];
    }

    async async_get(key = "") {

        let obj = await browser.storage.local.get(key);
        let val = obj[key];
        if (!val) {
            val = DEFAULT_CONFIG[key];
        }
        return Promise.resolve(val);
    }

    // restore(json) {
    //     const parsed = JSON.parse(json);

    //     if ("Actions" in parsed === false) {
    //         throw "Invalid JSON File";
    //     }
    //     for (const key of Object.keys(parsed)) {
    //         if (key in DEFAULT_CONFIG === false) {
    //             // throw "Invalid JSON File";
    //         }
    //     }
    //     return browser.storage.local.set(parsed);
    // }

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
        for (let key1 of Object.keys(DEFAULT_CONFIG)) {
            if (this.storage[key1] === undefined) {
                this.storage[key1] = DEFAULT_CONFIG[key1];
            }
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

    async async_getAct(type, dir, key) {
        let r = null;
        if (key === commons.KEY_CTRL) {
            r = (await this.async_get("Actions_CtrlKey"))[type][dir];
        }
        else if (key === commons.KEY_SHIFT) {
            r = (await this.async_get("Actions_ShiftKey"))[type][dir];
        }
        else {
            r = (await this.async_get("Actions"))[type][dir];
        }
        return Promise.resolve(r);
    }

    getSearchURL(name) {
        let searchUrl = this.defaultURL;
        this.get("Engines").every(engine => engine.name === name ? (searchUrl = engine.url, false) : true);
        return searchUrl;
    }
}