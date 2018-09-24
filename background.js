const REDIRECT_URL = browser.runtime.getURL("redirect/redirect.html");
const DEFAULT_SEARCH_ENGINE = browser.i18n.getMessage("default_search_url");
var browserMajorVersion = 52;
browser.runtime.getBrowserInfo().then(info => {
    browserMajorVersion = info.version.split(".")[0];
    //$D("Browser Info:", info);
    browserMajorVersion = parseInt(browserMajorVersion);
    browser.storage.local.set({ firefoxVersion: browserMajorVersion });
    // browserMajorVersion = 56;
});


function randomString(length = 8) {
    // https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

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

const flags = {
    disableAdjustTabSequence: false,
}

const LStorage = {
    _buffer: {},
    initialize: function () {
        browser.storage.onChanged.addListener(changes => {
            for (const k of Object.keys(changes)) {
                this._buffer[k] = changes[k].newValue;
                if (k in flags) {
                    flags[k] = changes[k].newValue;
                }
            }
        });
        browser.storage.local.get(null, all => {
            for (const k of Object.keys(all)) {
                this._buffer[k] = all[k];
                if (k in flags) {
                    flags[k] = all[k];
                }
            }
        });
    },
    get: async function (thing) {
        if (!thing) return Promise.resolve(this._buffer);
        let r = {};
        r[thing] = this._buffer[thing];
        return Promise.resolve(r);
    },
    set: async function (things) {
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
        this.backgroundChildTabCount = 0;
        this.lastDownloadItemID = -1;
        this.lastDownloadObjectURL = ""; //prepare for revoke
        this.findFlag = false;

        this.regEvent();
    }

    async DO(m) {
        this.data = m;
        // console.log(this.data);
        if (Array.isArray(this.data.bookmarks)) {
            this.action = (await LStorage.get("Bookmark_Action"))["Bookmark_Action"];
            for (const bookmark of this.data.bookmarks) {
                await this.openTab(bookmark.url);
            }
            return;
        }

        else if (this.data.direction === commons.DIR_P) {
            let panelAction = await LStorage.get(this.data.key);
            this.action = panelAction[this.data.key][this.data.index];
        }
        else {
            this.action = await getAct(this.data.actionType, this.data.direction, this.data.modifierKey);
        }
        await this.execute();
        this.data = null;
        this.action = null;

    }
    async execute() {
        $D(this.action);


        if (typeof this.data.imageData === "string" && this.data.imageData.length) { //把imageData转换成File
            const { url, bin } = this.convertBase64ToObjectURL(this.data.imageData)
            this.data.selection = url;
            this.data.imageData = bin;
        }

        else if (this.data.actionType === commons.imageAction && this.data.imageData === null) {
            this.data.fileInfo = this.parsefileInfo(this.data.selection);
        }

        if (this.data.selection === "" || this.data.selection === null || this.data.selection.length === 0) {
            throw new Error('the selection can not be empty');
        }

        switch (this.action.act_name) {
            case commons.ACT_OPEN:
                await this.openHandler();
                break;
            case commons.ACT_COPY:
                await this.copyHandler();
                break;
            case commons.ACT_SEARCH:
                await this.searchHandler();
                break;
            case commons.ACT_DL:
                await this.downloadHandler();
                break;
            case commons.ACT_FIND:
                await this.findText(this.data.textSelection);
                break;
            case commons.ACT_TRANS:
                await this.translateText(this.data.textSelection);
                break;
        }
    }

    async openHandler() {
        if (this.data.actionType === commons.linkAction) {
            if (this.action.open_type === commons.OPEN_IMAGE_LINK && this.data.imageLink !== "") return this.openURL(this.data.imageLink)
            else if (this.action.open_type == commons.OPEN_TEXT) return this.openURL(this.data.textSelection);
            else return this.openURL(this.data.selection)
        }
        else if (this.data.selection.startsWith("blob:")) { // blob url
            return this.openRedirectPage({
                url: this.data.selection,
                cmd: "open"
            });
        }
        return this.openURL(this.data.selection);
    }
    async copyHandler() {
        let s = ''
        switch (this.action.copy_type) {
            case commons.COPY_IMAGE_LINK:
                if (this.data.actionType === commons.linkAction && this.data.imageLink !== "") {
                    s = this.data.imageLink;
                }
                else {
                    s = this.data.selection;
                }
                break;
            case commons.COPY_IMAGE:
                if (this.data.imageData instanceof Uint8Array) {
                    s = this.data.imageData;
                }
                else {
                    const imageData = await (this.getImageDataFromUrl(this.data.imageLink));
                    s = new Uint8Array(imageData)
                }
                break;
            case commons.COPY_TEXT:
                s = this.data.textSelection;
                break;
            case commons.COPY_LINK:
                s = this.data.selection;
                break;
        }
        return this.copy(s);
    }
    async searchHandler() {
        if (this.data.actionType === commons.linkAction) {
            let s = '';
            if (this.action.search_type === commons.SEARCH_IMAGE_LINK && this.data.imageLink !== "") {
                s = this.data.imageLink;
            }
            else if (this.action.search_type === commons.SEARCH_TEXT && this.data.textSelection !== "") {
                s = this.data.textSelection;
            }
            else {
                s = this.data.selection;
            }
            return this.searchText(s);
        }
        else if (this.data.actionType === commons.imageAction) {
            return this.searchImage(this.data.selection);
        }
        else if (this.action.search_type === commons.SEARCH_IMAGE) {
            return this.searchImage(this.data.selection);
        }
        else if (this.action.search_type === commons.SEARCH_TEXT) {
            return this.searchText(this.data.textSelection);
        }
        else {
            return this.searchText(this.data.selection);
        }
    }

    async downloadHandler() {
        if (this.data.actionType === commons.linkAction && this.action.download_type === commons.DOWNLOAD_IMAGE_LINK && this.data.imageLink !== "") {
            return this.download(this.data.imageLink);
        }
        else if (this.action.download_type === commons.DOWNLOAD_TEXT) {
            const url = createBlobObjectURLForText(this.data.textSelection);
            const date = new Date();
            return this.download(url, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.txt`);
        }
        return this.download(this.data.selection);
    }

    async openTab(url = "") {

        const onQueryTab = async tabs => {
            for (let tab of tabs) {
                if (tab.active === true) {
                    if (this.action.tab_pos === commons.TAB_CUR) return browser.tabs.update(tab.id, { url });
                    else {
                        const option = {
                            active: Boolean(this.action.tab_active),
                            index: this.getTabIndex(tabs.length, tab.index),
                            url,
                        };
                        if (browserMajorVersion >= 57) {
                            option["openerTabId"] = tab.id;
                        }
                        const newTab = await browser.tabs.create(option).catch(onError);
                        return newTab;
                    }
                }
            }
            throw new Error("No active tab was found");
        }

        $D(`openTab: url=${url}`);
        if ([commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW].includes(this.action.tab_pos)) {
            const win = await browser.windows.create({
                incognito: this.action.tab_pos === commons.TAB_NEW_PRIVATE_WINDOW ? true : false,
                url,
            });
            const tabs = await browser.tabs.query({
                windowId: win.id
            })
            return tabs[0];
        }
        else {
            const tabs = await browser.tabs.query({ currentWindow: true }).catch(onError);
            const newTab = await onQueryTab(tabs);
            return newTab;
        }
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

        return url;
    }

    async searchText(keyword) {

        // check if browser.search API available and if I should use it?
        if (browserMajorVersion >= 63 && Boolean(this.action.is_browser_search) === true) {
            const tabHoldingSearch = await this.openTab('about:blank');
            if (this.action.engine_name !== getI18nMessage('defaultText')) {
                return browser.search.search({
                    query: keyword,
                    engine: this.action.engine_name,
                    tabId: tabHoldingSearch.id
                });
            }
            else {
                return browser.search.search({
                    query: keyword,
                    tabId: tabHoldingSearch.id
                });

            }
        }
        else {
            let url = await this.getEngine();

            if (url.startsWith("{redirect.html}")) {
                return this.openRedirectPage(keyword);
            }
            else {
                if (this.action.search_onsite === commons.SEARCH_ONSITE_YES && this.data.actionType !== "imageAction") {
                    url = url.replace("%s", "%x");
                }
                return this.openTab(
                    url
                        .replace("%s", encodeURIComponent(keyword))
                        .replace("%x", encodeURIComponent(`site:${this.data.site} ${keyword}`))
                );
            }
        }
    }

    async searchImage(imageFileURL) {
        const url = await this.getEngine();

        if (url.startsWith("{redirect.html}")) {
            return this.openRedirectPage(imageFileURL)
        }
        else {
            return this.openTab(
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
            throw new Error('unknown type of redirect parameter: ' + param);
        }

        $D(aUrl.toString());
        return this.openTab(aUrl.toString());
    }

    async findText(text) {
        this.findFlag = true;
        if (text.length == 0 || !browser.find) return;
        return browser.find.find(text).then((result) => {
            if (result.count > 0) {
                browser.find.highlightResults();
            }
        });
    }
    async removeFind() {
        if (this.findFlag) { //可能有其他扩展也使用 browser.find，加一个判断
            this.findFlag = false;
            return browser.find.removeHighlighting();
        }
    }

    async download(url = "", aFilename = "") {
        let opt = {
            url,
            saveAs: this.action.download_saveas
        };
        if (url.startsWith("blob:") && this.data.fileInfo) {
            this.lastDownloadObjectURL = url;
            aFilename = this.data.fileInfo.name || "file.dat";
        }
        if (this.action.download_type !== commons.DOWNLOAD_TEXT) {
            let pathname = new URL(url).pathname;
            let parts = pathname.split("/");
            if (parts[parts.length - 1] === "" && aFilename === "") {
                //把文件名赋值为8个随机字符
                //扩展名一定是html吗？
                aFilename = randomString() + ".html";
            }
            else if (aFilename === "") {
                aFilename = parts[parts.length - 1];
            }
        }

        const CUSTOM_CODE_ENTRY_INDEX = 8;
        if (parseInt(this.action.download_directory) === CUSTOM_CODE_ENTRY_INDEX) {
            Object.assign(opt, this.data.downloadOption);
            console.assert(typeof opt.filename === "string", "error type of downloadOption.filename");
        }
        else {
            const directories = (await LStorage.get("downloadDirectories"))["downloadDirectories"];
            opt.filename = this.replaceVariables(directories[this.action.download_directory])
            opt.filename += aFilename;
        }
        try {
            this.lastDownloadItemID = await browser.downloads.download(opt);
        } catch (e) {
            // 如果文件名包含非法字符，弹出提示
            await browser.tabs.executeScript({
                code: `alert(${opt.filename}\n${e.toString()})`
            });
        }

    }
    async translateText(text) {
        const sended = {
            command: "translate",
            data: text
        }

        let portName = "sendToContentScript";
        const tabs = await browser.tabs.query({
            currentWindow: true,
            active: true
        });

        let port = browser.tabs.connect(tabs[0].id, { name: portName });
        return port.postMessage(sended);
    }

    async getImageDataFromUrl(url) {
        const res = await fetch(url);
        const ab = await res.arrayBuffer();
        return Promise.resolve(ab);
    }

    async copy(data) {
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

        const storage = document.createElement("textarea");
        storage.value = data;
        document.body.appendChild(storage);
        storage.focus();
        storage.setSelectionRange(0, storage.value.length);
        document.execCommand("copy");
        storage.remove();
    }

    async openURL(url = "") {
        function isValidURL(u) {
            try {
                new URL(u);
                return true;
            }
            catch (e) {
                if (url.startsWith('about:')) return true;
                return false;
            }
        }
        if (isValidURL(url)) {
            return this.openTab(url);
        }
        else if (commons.urlPattern.test("http://" + url)) {
            return this.openTab("http://" + url);
        }
        return this.searchText(url);
    }


    convertBase64ToObjectURL(data = '', fileInfo = { name: '', type: '' }) {
        const uint8s = new Uint8Array(data.split(","));
        console.assert(uint8s instanceof Uint8Array);
        const url = createObjectURL(
            new File([uint8s], fileInfo.name, {
                type: fileInfo.type
            })
        );
        $D("create object url: " + url);
        return {
            url: url,
            bin: uint8s,
        }
    }

    parsefileInfo(url = '') {
        const MIME_TYPE = {
            ".gif": "image/gif",
            ".jpg": "image/jpeg",
            ".jpeg": "image/jpeg",
            ".png": "image/png",
            ".bmp": "image/bmp",
        }
        const result = url.match(commons.fileExtension);
        result && (result[1] = MIME_TYPE[result[1]]);
        const [name, type] = result || ["image.jpg", "image/jpeg"];
        const fileInfo = { name, type };
        return fileInfo;
    }



    getTabIndex(tabsLength = 0, currentTabIndex = 0) {

        if (flags.disableAdjustTabSequence || this.action.tab_active === commons.FORE_GROUND) {
            this.backgroundChildTabCount = 0;
        }
        let index = 0;
        switch (this.action.tab_pos) {
            case commons.TAB_CLEFT: index = currentTabIndex; break;
            case commons.TAB_CRIGHT: index = currentTabIndex + this.backgroundChildTabCount + 1; break;
            case commons.TAB_FIRST: index = 0; break;
            case commons.TAB_LAST: index = tabsLength; break;
            default: break;
        }

        if (this.action.tab_active === commons.BACK_GROUND && this.action.tab_pos === commons.TAB_CRIGHT) {
            this.backgroundChildTabCount += 1;
        }

        $D(`getTabIndex: tabsLength=${tabsLength},
            currentTabIndex=${currentTabIndex},
            flags.disableAdjustTabSequence = ${flags.disableAdjustTabSequence},
            this.action.tab_active =${this.action.tab_active},
            this.action.tab_pos=${this.action.tab_pos},
            this.backgroundChildTabCount = ${this.backgroundChildTabCount}
            finalIndex=${index}
        `);
        return index;
    }

    replaceVariables(input) {
        const _date = new Date;
        const year = _date.getFullYear();
        const month = ((_date.getMonth() + 1) + '').padStart(2, '0');
        const date = (_date.getDate() + '').padStart(2, '0');
        const today = year + '-' + month + '-' + date;
        const host = this.data.site;
        const pagetitle = this.data.pagetitle;
        return input.replace('${year}', year)
            .replace('${month}', month)
            .replace('${date}', date)
            .replace('${today}', today)
            .replace('${host}', host)
            .replace('${pagetitle}', pagetitle);
    }
    regEvent() {
        browser.downloads.onChanged.addListener(item => {
            if (item.id === this.lastDownloadItemID && item.state.current === browser.downloads.State.COMPLETE) {
                window.URL.revokeObjectURL(this.lastDownloadObjectURL);
                this.lastDownloadItemID = -1;
                this.lastDownloadObjectURL = "";
            }
        })
        browser.tabs.onRemoved.addListener(() => {
            this.backgroundChildTabCount = 0;
        });
        browser.tabs.onActivated.addListener(() => {
            this.backgroundChildTabCount = 0;
        });
    }
}

var executor = new ExecutorClass();

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
                $D(aKey, "  ", target[aKey], " -> ", origin[aKey]);
                target[aKey] = origin[aKey];
                // console.log(aKey, origin[aKey]);
                changedflag = true;
            }
        }
    }

    async function upgrade_153() {
        console.info("upgrade v1.53.0");
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

    async function upgrade_155() {
        console.info("upgrade v1.55.0");
        for (const aKey of ["cmdPanel_textAction", "cmdPanel_linkAction", "cmdPanel_imageAction"]) {
            if (aKey in all) {
                // eslint-disable-next-line no-unused-vars
                const [a, b] = aKey.split("_");
                all["Panel_" + b] = all[aKey];
                await browser.storage.local.remove(aKey);
                delete all[aKey];
            }
        }
    }

    async function upgrade_156() {
        console.info("upgrade v1.56.0");
        for (const aKey of Object.keys(all)) {
            if (aKey.startsWith("Actions")) {
                for (const bKey of Object.keys(all[aKey])) {
                    for (const cKey of Object.keys(all[aKey][bKey])) {
                        if ("use_browser_search" in all[aKey][bKey][cKey] === false) {
                            all[aKey][bKey][cKey]["is_browser_search"] = false;
                        }
                    }
                }
            }
        }
    }

    console.info(details);

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

        if (midVer < 55) { // < 1.55.0
            changedflag = true;
            await upgrade_155();
        }

        if (midVer < 56) {// < 1.56.0
            changedflag = true;
            await upgrade_156();
        }
        assign(all, DEFAULT_CONFIG);
    }
    else if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
        changedflag = false;
        await browser.storage.local.set(DEFAULT_CONFIG);
        // await browser.storage.local.set({
        //     Engines: [{ "name": "Google Search", "url": "https://www.google.com/search?q=%s" },
        //     { "name": "Bing Search", "url": "https://www.bing.com/search?q=%s" },
        //     { "name": "DuckDuckGo Search", "url": "https://duckduckgo.com/?q=%s&ia=web" },
        //     { "name": "Yandex Search", "url": "https://www.yandex.com/search/?text=%s" }
        //     ]
        // });
    }

    if (changedflag) {
        await browser.storage.local.set(all);
    }
});

//点击工具栏图标时打开选项页
// browser.browserAction.onClicked.addListener(() => {
//     browser.runtime.openOptionsPage();
// });

browser.runtime.onMessage.addListener((m) => {
    if (m.cmd && m.cmd === "removeHighlighting") {
        executor.removeFind();
    }
    else {
        executor.DO(m);
    }
});

console.info("Glitter Drag: background script executed.")