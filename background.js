var supportCopyImage = false;

const TAB_ID_NONE = browser.tabs.TAB_ID_NONE;
const REDIRECT_URL = browser.runtime.getURL("redirect/redirect.html");

function createObjectURL(blob = new Blob(), revokeTime = 1000 * 60 * 5) {
    const url = window.URL.createObjectURL(blob);
    setTimeout(u => window.URL.revokeObjectURL(u), revokeTime, url); // auto revoke
    return url
}

function createBlobObjectURLForText(text = "") {
    let blob = new window.Blob([text], {
        type: "text/plain"
    });
    return createObjectURL(blob);
}

const tabsRelation = {
    _parent: TAB_ID_NONE,
    children: [],
    check: function(pid, cid = TAB_ID_NONE) {
        if (this.parent === pid) {
            if (cid !== TAB_ID_NONE) {
                this.children.push(cid);
            }
            return true;
        }
        else {
            this.parent = pid;
            return false;
        }
    },
    switchToParent: function(id) {
        let isLastChildTab = this.children.length === 1 && this.children[0] === id;
        if (this.parent === id) {
            this.parent = TAB_ID_NONE;
        }
        else {
            this.children = this.children.filter(v => {
                return v !== id
            });
        }
        // 切换到父标签页的条件：
        // 1. 父标签页id不为TAB_ID_NONE
        // 2. 所有子标签页已被全部关闭
        // 3. 子标签页只剩下唯一一个
        if (this.parent !== TAB_ID_NONE && this.children.length === 0 && isLastChildTab) {
            return true;
        }
        return false;
    }
}

Object.defineProperty(tabsRelation, "parent", {
    set: function(value) {
        if (value !== this._parent || value === TAB_ID_NONE) {
            this._parent = value;
            this.children = [];
        }
        else {
            this._parent = value;
        }
    },
    get: function() {
        return this._parent;
    }
});

class ExecutorClass {
    constructor() {
        this.data = {
            direction: commons.DIR_U,
            selection: "",
            sendToOptions: false,
            actionType: "textAction"
        };
        this.action = {};

        this.newTabId = TAB_ID_NONE;
        this.previousTabId = TAB_ID_NONE;

        this.backgroundChildTabCount = 0;

        browser.tabs.onRemoved.addListener((tabId) => {
            if (config.get("enableAutoSelectPreviousTab") === true &&
                config.get("switchToParentTab") !== true &&
                this.backgroundChildTabCount === 0 &&
                this.newTabId !== browser.tabs.TAB_ID_NONE &&
                this.previousTabId !== browser.tabs.TAB_ID_NONE &&
                this.newTabId === tabId) {
                browser.tabs.update(this.previousTabId, {
                    active: commons.FORE_GROUND
                });
            }
            if (config.get("switchToParentTab") === true && tabsRelation.switchToParent(tabId)) {
                browser.tabs.update(tabsRelation.parent, {
                    active: commons.FORE_GROUND
                });
            }
            this.backgroundChildTabCount = 0;
        });
        browser.tabs.onActivated.addListener(() => {
            this.backgroundChildTabCount = 0;
        });

    }
    DO(m) {
        this.data = m;
        if (commons._DEBUG) {
            console.table(this.data);
        }
        this.execute();
    }
    execute() {
        this.action = config.getAct(this.data.actionType, this.data.direction, this.data.modifierKey);
        let imageFile = null;
        if (this.data.selection.length === 0) {
            return;
        }
        if (this.data.hasImageBinary) {
            let array = new Uint8Array(this.data.selection.split(","));
            imageFile = new File([array], this.data.fileInfo.name, {
                type: this.data.fileInfo.type
            });
            this.data.selection = createObjectURL(imageFile);
        }
        switch (this.action.act_name) {
            case commons.ACT_OPEN:
                if (this.data.actionType === "linkAction" && this.action.open_type === commons.OPEN_IMAGE_LINK && this.data.imageLink !== "") {
                    this.openURL(this.data.imageLink)
                }
                else if (this.data.selection.startsWith("blob:")) { // blob url
                    this.openRedirectPage({
                        url: this.data.selection,
                        cmd: "open"
                    })
                }
                // else if (this.data.selection.startsWith("file:///") && typeUtil.seemAsURL(this.data.selection)) {
                //     this.openRedirectPage({
                //         cmd: "open",
                //         url: this.data.selection
                //     })
                // }
                else {
                    this.openURL(this.data.selection)
                }
                break;
            case commons.ACT_COPY:
                switch (this.action.copy_type) {
                    case commons.COPY_IMAGE_LINK:
                        if (this.data.actionType === "linkAction" && this.data.imageLink !== "") {
                            this.copy(this.data.imageLink);
                        }
                        else {
                            this.copy(this.data.selection);
                        }
                        break;
                    case commons.COPY_IMAGE:
                        if (this.data.actionType === "linkAction" && this.data.imageLink !== "") {
                            sendImageToNativeBySrc(this.data.imageLink);
                        }
                        else {
                            sendImageToNativeBySrc(this.data.selection);
                        }
                        break;
                    case commons.COPY_TEXT:
                        this.copy(this.data.textSelection);
                        break;
                    case commons.COPY_LINK:
                        this.copy(this.data.selection)
                        break;
                }
                break;
            case commons.ACT_SEARCH:

                if (this.data.actionType === "linkAction") {
                    if (this.action.search_type === commons.SEARCH_IMAGE_LINK && this.data.imageLink !== "") {
                        this.searchText(this.data.imageLink);
                    }
                    else if (this.action.search_type === commons.SEARCH_TEXT && this.data.textSelection !== "") {
                        this.searchText(this.data.textSelection);
                    }
                    else {
                        this.searchText(this.data.selection);
                    }
                }
                else if (this.data.actionType === "imageAction") {
                    this.searchImage(this.data.selection);
                }
                else if (this.action.search_type === commons.SEARCH_TEXT) {
                    this.searchText(this.data.textSelection);
                }
                else if (this.action.search_type === commons.SEARCH_IMAGE) {
                    this.searchImage(this.data.selection);
                }
                else {
                    this.searchText(this.data.selection);
                }
                break;
            case commons.ACT_DL:
                if (this.data.actionType === "linkAction" && this.action.download_type === commons.DOWNLOAD_IMAGE_LINK && this.data.imageLink !== "") {
                    this.download(this.data.imageLink);
                }
                else if (this.action.download_type === commons.DOWNLOAD_TEXT) {
                    const url = createBlobObjectURLForText(this.data.textSelection);
                    const date = new Date();
                    this.download(url, `${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.txt`);
                }
                else {
                    this.download(this.data.selection);
                }
                break;
            case commons.ACT_FIND:
                break;
            case commons.ACT_TRANS:
                break;
        }
    }
    getTabIndex(tabsLength = 0, currentTabIndex = 0) {
        let index = 0;
        if (config.get("disableAdjustTabSequence") || this.action.tab_active === commons.FORE_GROUND) {
            this.backgroundChildTabCount = 0;
        }
        switch (this.action.tab_pos) {
            case commons.TAB_CLEFT:
                index = currentTabIndex;
                break;
            case commons.TAB_CRIGHT:
                index = currentTabIndex + this.backgroundChildTabCount + 1;
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
        if (this.action.tab_active === commons.BACK_GROUND && this.action.tab_pos === commons.TAB_CRIGHT) {
            this.backgroundChildTabCount += 1;
        }
        return index;
    }

    openTab(url = "") {
        this.previousTabId = this.newTabId = browser.tabs.TAB_ID_NONE; // reset
        if ([commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW].includes(this.action.tab_pos)) {
            browser.windows.create({
                // focused: this.action.tab_active,
                // firefox don't support focused property yet;
                // so it has no effect to use.
                incognito: this.action.tab_pos === "TAB_NEW_PRIVATE_WINDOW" ? true : false,
                url,
            }).catch(e => console.error(e));
        }
        else {
            browser.tabs.query({}).then(tabs => {
                for (let tab of tabs) {
                    if (tab.active === true) {
                        tabsRelation.check(tab.id);
                        this.previousTabId = tab.id;
                        if (this.action.tab_pos === commons.TAB_CUR) browser.tabs.update(tab.id, {
                            url
                        });
                        else {
                            browser.tabs.create({
                                active: this.action.tab_active,
                                index: this.getTabIndex(tabs.length, tab.index),
                                url
                            }).then((newTab) => {
                                // 只有当在右边前台打开才记录标签页id
                                if (this.action.tab_pos === commons.TAB_CRIGHT && this.action.tab_active === commons.FORE_GROUND) {
                                    this.newTabId = newTab.id;
                                }

                                tabsRelation.check(tab.id, newTab.id);
                            });
                        }
                        break;
                    }
                }
            }, (error) => {
                console.error(error);
            });
        }
    }



    openURL(url = "") {
        function isValidURL(u) {
            let r = true;
            try {
                new URL(u);
            }
            catch (e) {
                r = false;
            }
            return r;

        }
        if (isValidURL(url)) {
            this.openTab(url);
        }
        else if (commons.urlPattern.test("http://" + url)) {
            this.openTab("http://" + url);
        }
        else {
            this.searchText(url);
        }
    }

    copy(data) {
        //发送给指定的tab
        const sended = {
            command: "copy",
            copy_type: this.action.copy_type,
            data,
        };
        let portName = this.data.sendToOptions ? "sendToOptions" : "sendToContentScript";
        browser.tabs.query({
            currentWindow: true,
            active: true
        }, (tabs) => {
            let port = browser.tabs.connect(tabs[0].id, {
                name: portName
            });
            port.postMessage(sended);
        });
    }

    searchText(keyword) {
        // const replaceTable = {
        //     "%s":keyword,
        //     "%x":`${keyword} site:${this.data.domain}`,
        // }
        let url = config.getSearchURL(this.action.engine_name)
        if (url.startsWith("{redirect.html}")) {
            this.searchImage(keyword);
            return;
        }
        if (this.action.search_onsite === commons.SEARCH_ONSITE_YES && this.data.actionType !== "imageAction") {
            url = url.replace("%s", "%x");
        }
        this.openTab(
            url.replace("%s", encodeURIComponent(keyword)).replace("%x", encodeURIComponent(`site:${this.data.site} ${keyword}`))
        );
    }

    searchImage(imageFileURL) {
        let url = config.getSearchURL(this.action.engine_name);
        if (url.startsWith("{redirect.html}")) {
            let params = url.replace("{redirect.html}", "").replace("{url}", encodeURIComponent(imageFileURL));
            // pass string of params.
            this.openRedirectPage(params)
        }
        else {
            this.searchText(this.data.selection);
        }
    }

    openRedirectPage(params) {
        if ("fileInfo" in this.data === false) {
            this.data.fileInfo = {
                name: "example.jpg",
                type: "image/jpeg",
            }
        }
        if (typeof params === "string") {
            this.openTab(REDIRECT_URL + params + `&fileName=${this.data.fileInfo.name}&fileType=${this.data.fileInfo.type}`);
        }
        else {
            const url = new URL(REDIRECT_URL);
            for (const key of Object.keys(params)) {
                url.searchParams.append(key, params[key]);
            }
            this.openTab(url.toString());
        }
    }

    randomString(length = 8) {
        // https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    download(url = "", filename = "") {
        let opt = {
            url,
            saveAs: this.action.download_saveas
        };
        const directories = config.get("downloadDirectories");
        if (url.startsWith("blob:") && this.data.fileInfo) {
            filename = this.data.fileInfo.name || "file.dat";
        }
        if (this.action.download_type !== commons.DOWNLOAD_TEXT) {

            let pathname = new URL(url).pathname;
            let parts = pathname.split("/");
            if (parts[parts.length - 1] === "" && filename === "") {
                //把文件名赋值为8个随机字符
                //扩展名一定是html吗？
                filename = this.randomString() + ".html";
            }
            else if (filename === "") {
                filename = parts[parts.length - 1];
            }
        }
        opt.filename = directories[this.action.download_directory] + filename;

        // console.log(opt.filename);
        browser.downloads.download(opt);
    }
    translateText(text) {}

}

var executor = new ExecutorClass();
var config = new ConfigClass();
var promptString = {
    "%a": {}, // action
    "%g": {}, // background foreground
    "%t": {}, // tabs position
    "%d": {}, // download directory
    "%s": null, // selection
    "%e": null, // engines' name
    "%y": {}, // type of action.
};

function updatePromptString() {
    for (const key of Object.keys(commons)) {
        if (/^ACT_/.test(key)) {
            promptString["%a"][key] = getI18nMessage(key);
        }
        else if (/^(FORE|BACK)_GROUND/.test(key)) {
            promptString["%g"][key] = getI18nMessage(key);
        }
        else if (/^TAB_/.test(key)) {
            promptString["%t"][key] = getI18nMessage(key);
        }
    }
    for (let i = 0; i < 8; i++) {
        promptString["%d"][i.toString()] = browser.i18n.getMessage("DownloadDirectory", i);
    }
    promptString["%y"] = {
        "textAction": browser.i18n.getMessage("textType"),
        "imageAction": browser.i18n.getMessage("imageType"),
        "linkAction": browser.i18n.getMessage("linkType"),
    }
}


config.load().then(() => {
    updatePromptString();
});

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    executor.DO(m);
});

browser.runtime.onConnect.addListener((port) => {
    // console.log("port",port);
    if (port.name === "initial") {
        port.postMessage({
            config: JSON.stringify(config.storage),
            promptString,
        });
        //自定义样式
        if (config.get("enableStyle") === true) {
            browser.tabs.insertCSS({
                code: config.get("style")
            });
        }
    }
});