import * as logUtil from '../utils/log'
const REDIRECT_URL = browser.runtime.getURL("redirect/redirect.html");

function returnFirstNotNull() {
    return [...arguments].find(a => a !== null && a !== undefined);
}
export class Executor {
    constructor() {
        //template

        this.backgroundChildTabCount = 0;
        this.lastDownloadItemID = -1;
        this.lastDownloadObjectURL = ""; //prepare for revoke
        this.findFlag = false;
        this.bgConfig = null;
        this.sender = null;
        this.data = null;
        this.temporaryDataStorage = new Map();

        this.downloadIdSetToRevoke = new Map();

        browser.storage.onChanged.addListener((_, areaName) => {
            if (areaName === "local") {
                this.refreshBackgroundConfig();
            }
        });

        browser.downloads.onChanged.addListener(item => {
            if (this.downloadIdSetToRevoke.has(item.id)) {
                if (item.state.current === "interrupted" || item.state.current === "complete") {
                    window.URL.revokeObjectURL(this.lastDownloadObjectURL);
                    this.downloadIdSetToRevoke.delete(item.id);
                }
            }
        });

        browser.tabs.onRemoved.addListener(() => {
            this.backgroundChildTabCount = 0;
        });

        browser.tabs.onActivated.addListener(() => {
            this.backgroundChildTabCount = 0;
        });

        this.refreshBackgroundConfig();

        this.doFlag = false;
    }

    async refreshBackgroundConfig() {
        console.info("refresh background config");
        browser.storage.local.get().then(a => {
            this.bgConfig = a;
        });
    }

    async DO(actionWrapper, sender) {
        if (this.doFlag) {
            console.error("while one action is executing, another action want to execute. It is not allowed", actionWrapper);
            return;
        }
        console.time("do action");
        this.data = actionWrapper;
        this.sender = sender;
        this.doFlag = true;
        try {
            await this.execute();
        }
        finally {
            this.data = null;
            this.sender = null;
            this.doFlag = false;
            console.timeEnd("do action");
        }
    }

    async execute(data) {
        logUtil.log("execute command: ", this.data.command);
        switch (this.data.command) {
            case "open":
                return this.openHandler();
            case "copy":
                return this.copyHandler();
            case "search":
                return this.searchHandler();
            case "download":
                return this.downloadHandler();
            case "query":
                return this.queryHandler();
            case "find":
                return this.findText(this.data.selection.text);
            case "translate":
                return this.translateText(this.data.selection.text);
            case "runScript":
                // ignore result
                this.runScript();
                return;
            case "":
                logUtil.warn("no operation");
                browser.notifications.create("nooperation", {
                    message: `No Operation`,
                    title: "Glitter Drag Notification",
                    type: "basic",
                });
                return;
            default:
                console.error(`unexcepted commond: "${this.data.command}"`);
        }
    }

    async openHandler(data) {
        console.time("openHandler");
        switch (this.data.actionType) {
            case "text":
                {
                    await this.searchText(this.data.selection.text);
                    break;
                }
            case "link":
                {
                    if (this.data.commandTarget === "text") {
                        await this.searchText(this.data.selection.text);
                    }
                    else {
                        await this.openURL(this.data.selection.plainUrl);
                    }
                    break;
                }
            case "image":
                {
                    if (this.data.selection.imageLink !== "") {
                        await this.openURL(this.data.selection.imageLink);
                    }
                    else {
                        await this.fetchImagePromise(this.data.extraImageInfo)
                            .then(u8Array => {
                                this.openImageViewer(u8Array);
                            });
                    }
                    break;
                }
            case "linkAndImage":
                {
                    if (this.data.commandTarget === "link") {
                        await this.openTab(this.data.selection.plainUrl);
                    }
                    else {
                        await this.openTab(this.data.selection.imageLink);
                    }
                    break;
                }
        }
        console.timeEnd("openHandler");
    }

    async copyHandler() {
        logUtil.log("copyHandler");
        let p;
        switch (this.data.actionType) {
            case "link":
                {
                    switch (this.data.commandTarget) {
                        case "image":
                            p = this.copyText(
                                returnFirstNotNull(
                                    this.data.selection.imageLink,
                                    this.data.selection.link,
                                ));
                            break;
                        case "text":
                            p = this.copyText(
                                returnFirstNotNull(
                                    this.data.selection.text,
                                    this.data.selection.link,
                                ));
                            break;
                        case "link":
                            p = this.copyText(this.data.selection.plainUrl);
                            break;
                    }
                    break;
                }
            case "text":
                {
                    p = this.copyText(this.data.selection.text);
                    break;
                }
            case "image":
                {
                    p = this.fetchImagePromise(this.data.extraImageInfo)
                    .then(u8Array => {
                        this.copyImage(u8Array);
                    });
                    break;
                }
            case "linkAndImage":
                {
                    if (this.data.commandTarget === "link") {
                        p = this.copyText(this.data.selection.plainUrl)
                    }
                    else {
                        p = this.fetchImagePromise(this.data.extraImageInfo)
                            .then(u8Array => {
                                this.copyImage(u8Array);
                            });
                    }
                    break;
                }
        }
        if (this.bgConfig.features.showNotificationAfterCopy) {
            p = p.then(this.showCopyNotificaion);
        }
        return p;
    }

    async searchHandler() {
        let p;
        switch (this.data.actionType) {
            case "link":
                {
                    if (this.data.commandTarget === "text") {
                        p = this.searchText(this.data.selection.text);
                    }
                    else {
                        p = this.searchText(this.data.selection.plainUrl);
                    }
                    break;
                }
            case "image":
                {
                    p = this.searchText(this.data.selection.imageLink);
                    break;
                }
            case "text":
                {
                    p = this.searchText(this.data.selection.text);
                    break;
                }
            case "linkAndImage":
                {
                    if (this.data.commandTarget === "link") {
                        p = this.searchText(this.data.selection.plainUrl);
                    }
                    else {
                        p = this.searchImage(this.data.selection.imageLink);
                    }
                }
        }

        return p;
    }

    async downloadHandler() {
        if (this.data.selection.imageLink === null) {
            console.error("image link is null, could not start download")
            return;
        }
        switch (this.data.actionType) {
            case "image":
                {
                    return this.download(this.data.selection.imageLink);
                }
            case "linkAndImage":
                {
                    if (this.data.commandTarget === "image") {
                        return this.download(this.data.selection.imageLink);
                    }
                    console.error("could not start download because commandTarget != image");
                    break;
                }
            default:
                {
                    console.error("could not download image");
                    break;
                }
        }
    }

    async queryHandler() {
        logUtil.log("queryHandler");
        if (this.data.actionType !== "text") {
            console.error(`unsuuport "query" command under ${this.data.actionType}`);
            return;
        }
        const tabId = this.sender.tab.id;
        logUtil.log(`send activeQueryWindow to tab ${tabId}`);
        return browser.tabs.sendMessage(tabId, {
            msgCmd: "activeQueryWindow",
            text: this.data.selection.text,
        }, {
            frameId: 0
        });
    }

    async searchText(keyword) {
        logUtil.log("search text: ", keyword);
        if (env.isFirefox && (this.data.searchEngine.url === "" || this.data.searchEngine.builtin === true)) {
            const tabHoldingSearch = await this.openTab("about:blank");

            const option = {
                query: keyword,
                tabId: tabHoldingSearch.id,
            };
            if (this.data.searchEngine.name !== "") {
                option.engine = this.data.searchEngine.name;
            }
            logUtil.log("call browser search api",
                ", engine name:", this.data.searchEngine.name,
                ", tab holds search page:", tabHoldingSearch,
                ", option: ", option);
            return browser.search.search(option);
        }

        if (!env.isFirefox && this.data.searchEngine.url === "") {
            browser.notifications.create({
                type: "basic",
                title: "No Search Engine",
                message: "No search engine is speficied to performed search",
            });
            return;
        }
        // TODO: check chromium
        logUtil.log(`search engine name: "${this.data.searchEngine.name}" , url: "${this.data.searchEngine.url}"`);
        return this.openURL(processURLPlaceholders(this.data.searchEngine.url, keyword, {
            site: this.data.site,
        }));

    }

    async searchImage(imageUrl) {
        //TODO
        return this.openTab();
    }

    async searchImageByPostMethod(u8Array) {
        //TODO
        const key = randomString(10);
        this.temporaryDataStorage.set(key, {
            cmd: "search",
            data: u8Array,
        });
        return this.openTab(REDIRECT_URL + "?key=" + key);
    }

    async findText(text = "") {
        logUtil.log("find text:", text);
        if (text.length === 0) {
            return;
        }
        const result = await browser.find.find(text);
        if (result.count > 0) {
            this.findFlag = true;
            browser.find.highlightResults();
        }
    }

    async removeHighlighting() {
        logUtil.log("remove highlight");
        if (this.findFlag) {
            this.findFlag = false;
            return browser.find.removeHighlighting();
        }
    }

    async download(url) {
        const path = `${this.data.download.directory.trim()}${fileUtil.getFilename(url).trim()}`;
        logUtil.log("download: ", url, ", path: ", path, ", site: ", this.data.site);
        const headers = [];
        if (env.isFirefox) {
            headers.push({
                name: "Referer",
                value: this.data.site
            });
        }
        browser.downloads.download({
            url,
            filename: path,
            saveAs: this.data.download.showSaveAsDialog,
            headers: headers,
        });
    }

    async translateText(text) {
        const sended = {
            command: "translate",
            data: text,
        };

        let portName = "sendToContentScript";
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true,
        });

        let port = browser.tabs.connect(tabs[0].id, {
            name: portName
        });
        return port.postMessage(sended);
    }

    async copyText(data) {
        logUtil.log("copy text:", data);
        return navigator.clipboard.writeText(data);
    }

    async copyImage(u8Array) {
        logUtil.log("copy image, length:", u8Array);
        browser.clipboard.setImageData(u8Array,
            this.data.extraImageInfo.extension === ".png" ? "png" : "jpeg");
    }

    //TODO remove this method
    async openURL(url) {
        if (typeof url !== "string") {
            console.error(`url is ${url} rather than string`);
            return;
        }
        await this.openTab(url);
        // return this.searchText(url);
    }

    async openTab(url) {
        if (typeof url !== "string") {
            console.error(`url is ${url} rather than string`);
            return;
        }
        console.trace("open tab: ", url, ", tabPosition: ", this.data.tabPosition, ", activeTab: ", this.data.activeTab);

        if (["newWindow", "privateWindow"].includes(this.data.tabPosition)) {
            let win;
            if ("newWindow" === this.data.tabPosition) {
                logUtil.log("create window");
                win = await browser.windows.create();
            }
            else {
                logUtil.log("attempt to reuse icongito window");
                win = (await browser.windows.getAll({
                    windowTypes: ["normal"]
                })).find(w => w.incognito);
                if (!win) {
                    logUtil.log("create new icongito window");
                    win = await browser.windows.create({
                        incognito: true
                    });
                }
            }
            const tab = await browser.tabs.create({
                url: url,
                windowId: win.id,
                active: this.data.activeTab,
            });
            if (true === this.data.activeTab) {
                browser.windows.update(win.id, {
                    focused: true
                });
            }
            return tab;
        }
        else {
            console.time("query tabs");
            const tabs = await browser.tabs.query({
                currentWindow: true
            });
            console.timeEnd("query tabs");
            const activatedTab = tabs.find(t => t.active);
            if (!activatedTab) {
                throw new Error("No actived tab is found");
            }
            if (this.data.tabPosition === "current") {
                browser.tabs.update(activatedTab.id, {
                    url
                });
            }
            else {
                const option = {
                    active: this.data.activeTab,
                    url,
                    openerTabId: activatedTab.id,
                };
                if (this.data.tabPosition !== "") {
                    option.index = this.getTabIndex(tabs.length, activatedTab.index);
                }
                // console.time("create tab")
                /*const newTab = */
                return browser.tabs.create(option);
                // console.timeEnd("create tab")
            }
        }
    }

    getTabIndex(tabsLength = 0, currentTabIndex = 0) {
        logUtil.log("calc the index of new created tab",
            ", tabsLength:", tabsLength,
            ", currentTabIndex:", currentTabIndex,
            ", backgroundChildCount:", this.backgroundChildTabCount);
        if (this.data.activeTab) {
            this.backgroundChildTabCount = 0;
        }

        let index = 0;
        switch (this.data.tabPosition) {
            case "left":
                index = currentTabIndex;
                break;
            case "right":
                index = currentTabIndex + this.backgroundChildTabCount + 1;
                break;
            case "start":
                index = 0;
                break;
            case "end":
                index = tabsLength;
                break;
            default:
                break;
        }

        if (!this.data.activeTab && this.data.tabPosition === "right") {
            this.backgroundChildTabCount += 1;
            logUtil.log("increase backgroundChildTabCount: ", this.backgroundChildTabCount);
        }
        logUtil.log("the index of tab maybe: ", index);
        return index;
    }

    async fetchImagePromise(extraImageInfo) {
        logUtil.log("create fetch image promise");
        return new Promise((resolve, reject) => {
            const port = browser.tabs.connect(this.sender.tab.id);
            if (port.error) {
                console.trace(port, port.error);
                reject(port.error);
                return;
            }
            port.onMessage.addListener(u8Array => {
                logUtil.log("got u8Array, call disconnect then resolve promise");
                port.disconnect();
                resolve(u8Array);
            });
            port.postMessage(extraImageInfo.token);
        });
    }

    async runScript() {
        return browser.tabs.executeScript({
            code: `{
                ${this.data.script};
                ;
            }`,
        });
    }

    async openImageViewer(u8Array) {

    }

    async showCopyNotificaion() {
        setTimeout(async() => {
            await browser.notifications.clear("copynotification");
        }, 2000);
        return browser.notifications.create("copynotification", {
            message: `Copy Complete`,
            title: "Glitter Drag Notification",
            type: "basic",
        });
    }
}
