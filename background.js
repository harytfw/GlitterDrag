
const TAB_ID_NONE = browser.tabs.TAB_ID_NONE;
const REDIRECT_URL = browser.runtime.getURL("redirect/redirect.html");
const DEFAULT_SEARCH_ENGINE = browser.i18n.getMessage("default_search_url");


function createObjectURL(blob = new Blob(), revokeTime = 1000 * 60 * 3) {
    const url = window.URL.createObjectURL(blob);
    setTimeout(u => window.URL.revokeObjectURL(u), revokeTime, url); // auto revoke
    return url;
}

function createBlobObjectURLForText(text = "") {
    let blob = new window.Blob([text], {
        type: "text/plain"
    });
    return createObjectURL(blob);
}

function onError(e) {
    $D(e);
    console.error(e);
}


const tabsRelation = {
    _parent: TAB_ID_NONE,
    children: [],
    check: function(pid, cid = TAB_ID_NONE) {
        //pid: id of parent tab.
        //cid: id of child tab.
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
            //父标签页被关闭，那么重置this.parent
            this.parent = TAB_ID_NONE;
        }
        else {
            //把被关闭的标签页id从children中删除
            this.children = this.children.filter(v => {
                return v !== id
            });
        }
        // 切换到父标签页的条件：
        // 1. 父标签页id不为TAB_ID_NONE
        // 2. 所有子标签页已被全部关闭
        // 3. 先前关闭的标签页是最后一个子标签页
        $D("" + this._parent, this.children.join(","));
        if (this.parent !== TAB_ID_NONE && this.children.length === 0 && isLastChildTab) {
            return true; //需要切换到父标签页
        }
        return false; //不需要切换
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

const flags = {
    initialize: function() {
        browser.storage.onChanged.addListener(changes => {
            for (const k of Object.keys(changes)) {
                if (k in this) this[k] = changes[k].newValue;
            }
        });
        browser.storage.local.get(all => {
            for (const k of Object.keys(this)) {
                if (k === "initialize") continue;
                this[k] = all[k];
            }
        });
    },
    // enableSync: false,
    // enableIndicator: false,
    // enablePrompt: false,
    // enableStyle: false,
    // enableTimeoutCancel: false,
    enableAutoSelectPreviousTab: true,
    // enableCtrlKey: false,
    // enableShiftKey: false,
    // timeoutCancel: 2000,
    // triggeredDistance: 20,
    disableAdjustTabSequence: false,
    switchToParentTab: false,
}
flags.initialize();

const LStorage = {
    _buffer: {},
    initialize: function() {
        browser.storage.onChanged.addListener(changes => {
            for (const k of Object.keys(changes)) {
                this._buffer[k] = changes[k].newValue;
            }
        });
        browser.storage.local.get(all => {
            for (const k of Object.keys(all)) {
                this._buffer[k] = all[k];
            }
        });
    },
    get: async function(thing) {
        if (!thing) return Promise.resolve(this._buffer);
        let r = {};
        r[thing] = this._buffer[thing];
        return Promise.resolve(r);
    },
    set: async function(things) {
        return browser.storage.local.set(things);
    },
};
LStorage.initialize();
// const LStorage = browser.storage.local;
async function getAct(type, dir, key) {
    let r = null;
    if (key === commons.KEY_CTRL) {
        r = (await LStorage.get("Actions_CtrlKey"))["Actions_CtrlKey"][type][dir];
    }
    else if (key === commons.KEY_SHIFT) {
        r = (await LStorage.get("Actions_ShiftKey"))["Actions_ShiftKey"][type][dir];
    }
    else {
        r = (await LStorage.get("Actions"))["Actions"][type][dir];
    }
    return r ? r : DEFAULT_CONFIG.Actions[type][dir];
}


class ExecutorClass {
    constructor() {
        //template
        this.data = {
            direction: commons.DIR_U,
            selection: "",
            textSelection: "",
            imageLink: "",
            site: "",
            actionType: commons.textAction,
            fileInfo: null || {
                type: "",
                name: "",
            },
            imageData: null,
        };
        this.action = {};

        this.newTabId = TAB_ID_NONE;
        this.previousTabId = TAB_ID_NONE;

        this.backgroundChildTabCount = 0;

        this.lastDownloadItemID = -1;
        this.lastDownloadObjectURL = ""; //prepare for revoke
        browser.downloads.onChanged.addListener(item => {
            if (item.id === this.lastDownloadItemID && item.state.current === browser.downloads.State.COMPLETE) {
                window.URL.revokeObjectURL(this.lastDownloadObjectURL);
                this.lastDownloadItemID = -1;
                this.lastDownloadObjectURL = "";
            }
        })


        browser.tabs.onRemoved.addListener((tabId) => {
            if (flags.enableAutoSelectPreviousTab &&
                !flags.switchToParentTab &&
                this.backgroundChildTabCount === 0 &&
                this.newTabId !== browser.tabs.TAB_ID_NONE &&
                this.previousTabId !== browser.tabs.TAB_ID_NONE &&
                this.newTabId === tabId) {
                browser.tabs.update(this.previousTabId, {
                    active: commons.FORE_GROUND
                });
            }
            if (flags.switchToParentTab && tabsRelation.switchToParent(tabId)) {
                browser.tabs.update(tabsRelation.parent, {
                    active: commons.FORE_GROUND
                });
            }
            this.backgroundChildTabCount = 0;
        });
        browser.tabs.onActivated.addListener(() => {
            this.backgroundChildTabCount = 0;
        });

        this.findFlag = false;
    }
    async DO(m) {
        this.data = m;
        // if (commons._DEBUG) {
        //     console.table(this.data);
        // }
        // $D(this.data);
        if (this.data.direction === commons.DIR_P) {
            let panelAction = await LStorage.get(this.data.key);
            this.action = panelAction[this.data.key][this.data.index];
        }
        else {
            this.action = await getAct(this.data.actionType, this.data.direction, this.data.modifierKey);
        }
        await this.execute();
        this.data.imageData = null;

    }
    async execute() {
        $D(this.action);

        if (typeof this.data.imageData === "string") { //把imageData转换成File
            this.data.imageData = new Uint8Array(this.data.imageData.split(","));
            console.assert(this.data.imageData instanceof Uint8Array);
            this.data.selection = createObjectURL(
                new File([this.data.imageData], this.data.fileInfo.name, {
                    type: this.data.fileInfo.type
                })
            );
            $D("create object url: " + this.data.selection);
        }

        else if (this.data.actionType === commons.imageAction && this.data.imageData === null) {
            const MIME_TYPE = {
                ".gif": "image/gif",
                ".jpg": "image/jpeg",
                ".jpeg": "image/jpeg",
                ".png": "image/png",
                ".bmp": "image/bmp",
            }
            const result = this.data.selection.match(commons.fileExtension);
            result && (result[1] = MIME_TYPE[result[1]]);
            const [name, type] = result || ["image.jpg", "image/jpeg"];
            this.data.fileInfo = { name, type };
        }

        if (this.data.selection === "" || this.data.selection === null || this.data.selection.length === 0) {
            const e = "the selection is empty";
            $D(e);
            return Promise.reject(e);
        }

        switch (this.action.act_name) {
            case commons.ACT_OPEN:
                if (this.data.actionType === commons.linkAction) {
                    if (this.action.open_type === commons.OPEN_IMAGE_LINK && this.data.imageLink !== "") this.openURL(this.data.imageLink)
                    else if (this.action.open_type == commons.OPEN_TEXT) this.openURL(this.data.textSelection);
                    else this.openURL(this.data.selection)
                }
                else if (this.data.selection.startsWith("blob:")) { // blob url
                    this.openRedirectPage({
                        url: this.data.selection,
                        cmd: "open"
                    });
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
                        if (this.data.actionType === commons.linkAction && this.data.imageLink !== "") {
                            this.copy(this.data.imageLink);
                        }
                        else {
                            this.copy(this.data.selection);
                        }
                        break;
                    case commons.COPY_IMAGE:
                        this.copy(this.data.imageData);
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
                if (this.data.actionType === commons.linkAction) {
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
                else if (this.data.actionType === commons.imageAction) {
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
                if (this.data.actionType === commons.linkAction && this.action.download_type === commons.DOWNLOAD_IMAGE_LINK && this.data.imageLink !== "") {
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
                this.findText(this.data.textSelection);
                break;
            case commons.ACT_TRANS:
                break;
        }
        return Promise.resolve();
    }
    getTabIndex(tabsLength = 0, currentTabIndex = 0) {
        let index = 0;
        if (flags.disableAdjustTabSequence || this.action.tab_active === commons.FORE_GROUND) {
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
        $D(`getTabIndex: tabsLength=${tabsLength},
            currentTabIndex=${currentTabIndex},
            flags.disableAdjustTabSequence = ${flags.disableAdjustTabSequence},
            this.action.tab_active =${this.action.tab_active },
            this.action.tab_pos=${this.action.tab_pos},
            this.backgroundChildTabCount = ${this.backgroundChildTabCount}
            finalIndex=${index}
        `);
        return index;
    }

    async openTab(url = "") {

        const onCreateTab = (newTab, parentTab) => {
            // 只有当在右边前台打开才记录标签页id
            if (this.action.tab_pos === commons.TAB_CRIGHT && this.action.tab_active === commons.FORE_GROUND) {
                this.newTabId = newTab.id;
            }
            tabsRelation.check(parentTab.id, newTab.id);
        }

        const onQueryTab = tabs => {
            for (let tab of tabs) {
                if (tab.active === true) {

                    tabsRelation.check(tab.id);
                    this.previousTabId = tab.id;

                    if (this.action.tab_pos === commons.TAB_CUR) browser.tabs.update(tab.id, { url });
                    else browser.tabs
                        .create({ active: Boolean(this.action.tab_active), index: this.getTabIndex(tabs.length, tab.index), url })
                        .then(newTab => onCreateTab(newTab, tab))
                        .catch(onError);
                    break;
                }
            }
        }

        $D(`openTab: url=${url}`);
        this.previousTabId = this.newTabId = browser.tabs.TAB_ID_NONE; // reset
        if ([commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW].includes(this.action.tab_pos)) {
            browser.windows.create({
                incognito: this.action.tab_pos === commons.TAB_NEW_PRIVATE_WINDOW ? true : false,
                url,
            }).catch(onError);
        }
        else browser.tabs
            .query({ currentWindow: true })
            .then(onQueryTab)
            .catch(onError);

        return Promise.resolve();
    }


    openURL(url = "") {
        function isValidURL(u) {
            try {
                new URL(u);
                return true;
            }
            catch (e) {
                return false;
            }
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
        if (data instanceof Uint8Array) {
            const len = "image/".length;
            const ext = this.data.fileInfo.type.substring(len, len + 4);
            //the file extendsion usually has 3 or 4 characters.
            // console.log(ext);
            if (browser.clipboard && ["png", "jpeg"].includes(ext)) {
                browser.clipboard.setImageData(data.buffer, ext);
            }
            return;
        }
        const sended = {
            command: "copy",
            copy_type: this.action.copy_type,
            data,
        };
        let portName = "sendToContentScript";
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

    async getEngine() {
        let url = DEFAULT_SEARCH_ENGINE;
        if (this.action.engine_url && this.action.engine_url.length != 0) { //new engine_url property in v1.53
            url = this.action.engine_url;
        }
        else { // old method
            const engines = (await LStorage.get("Engines"))["Engines"];
            for (const e of engines) {
                if (e.name === this.action.engine_name) {
                    url = e.url;
                    break;
                }
            }
        }

        return Promise.resolve(url);
    }

    async searchText(keyword) {
        let url = await this.getEngine();

        if (url.startsWith("{redirect.html}")) {
            this.openRedirectPage(keyword);
        }
        else {
            if (this.action.search_onsite === commons.SEARCH_ONSITE_YES && this.data.actionType !== "imageAction") {
                url = url.replace("%s", "%x");
            }
            this.openTab(
                url
                .replace("%s", encodeURIComponent(keyword))
                .replace("%x", encodeURIComponent(`site:${this.data.site} ${keyword}`))
            );
        }
    }

    async searchImage(imageFileURL) {
        const url = await this.getEngine();

        if (url.startsWith("{redirect.html}")) {
            this.openRedirectPage(imageFileURL)
        }
        else {
            this.openTab(
                url
                .replace("%s", encodeURIComponent(imageFileURL))
                .replace("%x", encodeURIComponent(`site:${this.data.site} ${imageFileURL}`))
            );
        }

    }

    async openRedirectPage(param) {
        const SUPPORT_CMD = ["open", "search"]


        const aUrl = new URL(REDIRECT_URL);
        if (typeof param === "string") {
            //param 是图像文件地址
            const engine = (await this.getEngine()).replace("{redirect.html}", REDIRECT_URL);
            //替换{redirect.html}是为了让new URL识别不出错
            console.assert(engine.startsWith("{redirect.html}") === false);
            const url = new URL(engine);

            aUrl.searchParams.append("url", param);
            aUrl.searchParams.append("cmd", "search");
            aUrl.searchParams.append("engineName", url.searchParams.get("engineName"));
            aUrl.searchParams.append("fileName", this.data.fileInfo.name);
            aUrl.searchParams.append("fileType", this.data.fileInfo.type);
        }
        else if (param instanceof Object) {
            for (const key of Object.keys(param)) {
                if (key === "cmd") console.assert(SUPPORT_CMD.includes(key));
                aUrl.searchParams.append(key, param[key]);
            }
        }
        else {
            $D("unknown type of redirect param", param);
            return Promise.reject();
        }

        $D(aUrl.toString());
        this.openTab(aUrl.toString());

        return Promise.resolve();
    }

    findText(text) {
        this.findFlag = true;
        if (text.length == 0 || !browser.find) return;
        browser.find.find(text).then((result) => {
            if (result.count > 0) {
                browser.find.highlightResults();
            }
        });
    }
    removeFind() {
        if (this.findFlag) { //可能有其他扩展也使用 browser.find，加一个判断
            this.findFlag = false;
            browser.find.removeHighlighting();
        }
    }


    randomString(length = 8) {
        // https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
        const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result = '';
        for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
        return result;
    }
    async download(url = "", filename = "") {
        let opt = {
            url,
            saveAs: this.action.download_saveas
        };
        const directories = (await LStorage.get("downloadDirectories"))["downloadDirectories"];
        if (url.startsWith("blob:") && this.data.fileInfo) {
            this.lastDownloadObjectURL = url;
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
        return browser.downloads.download(opt).then(id => {
            this.lastDownloadItemID = id;
            return Promise.resolve();
        });

    }
    translateText() {}

}

var executor = new ExecutorClass();
// var config = new ConfigClass();

// config.load()

//保存到firefox的同步存储区
// browser.storage.onChanged.addListener(async(changes) => {
//     if (flags.enableSync || ("enableSync" in changes && changes["enableSync"].newValue === true)) {
//         browser.storage.sync.set((await browser.storage.local.get()));
//     }
// });

//在安装扩展时(含更新)触发，更新缺少的配置选项
browser.runtime.onInstalled.addListener(async (details) => {
    let changedflag = false;
    const all = await (browser.storage.local.get());

    function assign(target, origin) {
        for (const aKey of Object.keys(origin)) {
            if (aKey in target) {
                if (typeof target[aKey] === "object") {
                    assign(target[aKey], origin[aKey]);
                }
            }
            else {
                target[aKey] = origin[aKey];
                // console.log(aKey, origin[aKey]);
                changedflag = true;
            }
        }
    }

    async function upgrade_153() {
        const engines = (await LStorage.get("Engines"))["Engines"];
        for (const aKey of Object.keys(all)) {
            if (aKey.startsWith("Actions")) {
                for (const bKey of Object.keys(all[aKey])) {
                    for (const cKey of Object.keys(all[aKey][bKey])) {
                        if ("engine_url" in all[aKey][bKey][cKey] === false) {
                            let url = getI18nMessage("default_search_url");
                            let n = all[aKey][bKey][cKey]["engine_name"];
                            for (let obj of engines) {
                                if (obj.name === n) {
                                    url = obj.url;
                                    break;
                                }
                            }
                            all[aKey][bKey][cKey]["engine_url"] = url;
                        }
                    }
                }
            }
        }
    }
    console.log(details);

    if (details.reason === browser.runtime.OnInstalledReason.UPDATE) {

        let midVer = 0;
        try {
            midVer = parseInt(details.previousVersion.split(".")[1])
        }
        catch (error) {
            console.error(error);
            midVer = 0;
        }
        if (midVer < 53) { // < 1.53.0
            changedflag = true;
            await upgrade_153();
        }
        assign(all, DEFAULT_CONFIG);
    }
    else if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
        changedflag = false;
        await browser.storage.local.set(DEFAULT_CONFIG);
    }

    if (changedflag) {
        await browser.storage.local.set(all);
    }
});

//点击工具栏图标时打开选项页
browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    if (m.cmd && m.cmd === "removeHighlighting") {
        executor.removeFind();
    }
    else {
        executor.DO(m);
    }
});

browser.runtime.onConnect.addListener(port => {
    if (port.name === "initial") {
        LStorage.get().then(all => { //test purpose, mark for delete
            port.postMessage(all);
        });
    }
});
console.info("Glitter Drag: background script executed.")