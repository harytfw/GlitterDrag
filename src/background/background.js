
window.onerror = function () {
    console.trace(...arguments)
}

window.onrejectionhandled = function () {
    console.trace(...arguments)
}

window.onunhandledrejection = function () {
    console.trace(...arguments)
}


const REDIRECT_URL = browser.runtime.getURL("redirect/redirect.html");
const DEFAULT_SEARCH_ENGINE = browser.i18n.getMessage("default_search_url");

function randomString(length = 8) {
    // https://stackoverflow.com/questions/10726909/random-alpha-numeric-string-in-javascript
    const chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    let result = '';
    for (var i = length; i > 0; --i) result += chars[Math.floor(Math.random() * chars.length)];
    return result;
}

function safeFilename(filename) {
    const pattern = /[<>:"|?*]/;
    if (navigator.platform.startsWith("Win")) {
        return filename.split(pattern).join("_");
    }
    return filename;
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

class ExecutorClass {
    constructor() {
        //template

        this.backgroundChildTabCount = 0;
        this.lastDownloadItemID = -1;
        this.lastDownloadObjectURL = ""; //prepare for revoke
        this.findFlag = false;
        this.bgConfig = null;
        this.temporaryDataStorage = new Map()

        browser.storage.local.get().then(a => {
            this.bgConfig = a
        })

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
        this.sender = null
    }

    async DO(actionWrapper, sender) {
        this.data = actionWrapper
        this.sender = sender
        if (this.data.direction === commons.DIR_P) {
            // let panelAction = await LStorage.get(this.data.key);
            // this.data.action = panelAction[this.data.key][this.data.index];
        }
        await this.execute();
        this.data = null
        this.sender = null
    }
    async execute() {
        console.log("execute")
        switch (this.data.action.act_name) {
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
                await this.findText(this.data.selection.text);
                break;
            case commons.ACT_TRANS:
                await this.translateText(this.data.selection.text);
                break;
        }
    }

    async openHandler() {
        console.log("openHandler")
        if (this.data.actionType === commons.textAction) {
            return this.searchHandler();
        }
        else if (this.data.actionType === commons.linkAction) {
            if (this.data.action.open_type === commons.OPEN_IMAGE_LINK) {
                return this.openURL(this.data.selection.imageLink)
            }
            else if (this.data.action.open_type === commons.OPEN_TEXT) {
                return this.openURL(this.data.selection.text);
            }
            else return this.openURL(this.data.selection.plainUrl)
        }
        else if (this.data.actionType === commons.imageAction) {
            if (this.data.selection.imageLink !== "") {
                return this.openTab(this.data.selection.imageLink)
            } else {
                return this.fetchImagePromise(this.data.extraImageInfo)
                    .then(u8Array => {
                        this.openImageViewer(u8Array)
                    })
            }
        }
    }
    async copyHandler() {
        console.log("copyHandler")
        if (commons.linkAction === this.data.actionType) {
            switch (this.data.action.copy_type) {
                case commons.COPY_IMAGE_LINK:
                    return this.copyText(this.data.selection.imageLink)
                case commons.COPY_TEXT:
                    return this.copyText(this.data.selection.text)
                case commons.COPY_LINK:
                    return this.copyText(this.data.selection.plainUrl)
            }
        } else if (commons.textAction === this.data.actionType) {
            return this.copyText(this.data.selection.text)
        } else if (commons.imageAction === this.data.actionType) {
            switch (this.data.action.copy_type) {
                case commons.COPY_IMAGE:
                    return this.fetchImagePromise(this.data.extraImageInfo)
                        .then((u8Array) => {
                            this.copyImage(u8Array)
                        })
                case commons.COPY_IMAGE_LINK:
                    return this.copyText(this.data.selection.imageLink)
                case commons.COPY_LINK:
                    //TODO
                    break
            }
        }

    }

    async searchHandler() {
        if (this.data.actionType === commons.linkAction) {
            if (this.data.action.search_type === commons.SEARCH_IMAGE_LINK) {
                return this.searchText(this.data.selection.imageLink);
            }
            else if (this.data.action.search_type === commons.SEARCH_TEXT) {
                return this.searchText(this.data.selection.text);
            }
            else {
                return this.searchText(this.data.selection.plainUrl);
            }
        }
        else if (this.data.actionType === commons.imageAction) {
            if (this.data.action.search_type === commons.SEARCH_IMAGE) {
                if (this.data.selection.imageLink === null) {
                    return this.fetchImagePromise(this.data.extraImageInfo)
                        .then(u8Array => {
                            this.searchImageByPostMethod(u8Array)
                        })
                } else {
                    return this.searchImage(this.data.selection.imageLink);
                }
            }
        }
        else if (this.data.action.search_type === commons.SEARCH_TEXT) {
            return this.searchText(this.data.selection.text);
        }
        else {
            //TODO: 
            return this.searchText(this.data.selection.text);
        }
    }

    async downloadHandler() {
        if (this.data.actionType === commons.linkAction && this.data.action.download_type === commons.DOWNLOAD_IMAGE_LINK) {
            //TODO: 
            return this.download(this.data.selection.imageLink);
        }
        else if (this.data.action.download_type === commons.DOWNLOAD_TEXT) {
            //TODO: 
            const url = createBlobObjectURLForText(this.data.textSelection);
            const date = new Date();
            return this.download(url, `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.txt`);
        }
        return this.download(this.data.selection);
    }

    async openTab(url = "") {
        console.log("open tab", url)
        const onQueryTab = async tabs => {
            for (let tab of tabs) {
                if (tab.active === true) {
                    if (this.data.action.tab_pos === commons.TAB_CUR) return browser.tabs.update(tab.id, { url });
                    else {
                        const option = {
                            active: Boolean(this.data.action.tab_active),
                            index: this.getTabIndex(tabs.length, tab.index),
                            url,
                        };
                        option["openerTabId"] = tab.id;
                        const newTab = await browser.tabs.create(option).catch(onError);
                        return newTab;
                    }
                }
            }
            throw new Error("No active tab was found");
        }

        $D(`openTab: url=${url}`);
        if ([commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW].includes(this.data.action.tab_pos)) {
            const win = await browser.windows.create({
                incognito: this.data.action.tab_pos === commons.TAB_NEW_PRIVATE_WINDOW ? true : false,
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
        //TODO: 
        let url = DEFAULT_SEARCH_ENGINE;
        if (this.data.action.engine_url && this.data.action.engine_url.length != 0) { //new engine_url property in v1.53
            url = this.data.action.engine_url;
        }
        else { // old method
            const engines = this.bgConfig["Engines"];
            for (const e of engines) {
                if (e.name === this.data.action.engine_name) {
                    url = e.url;
                    break;
                }
            }
        }

        return url;
    }

    async searchText(keyword) {

        // check if browser.search API available and if I should use it?
        if (Boolean(this.data.action.is_browser_search) === true) {
            const tabHoldingSearch = await this.openTab('about:blank');
            if (this.data.action.engine_name !== getI18nMessage('defaultText')) {
                return browser.search.search({
                    query: keyword,
                    engine: this.data.action.engine_name,
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
                if (this.data.action.search_onsite === commons.SEARCH_ONSITE_YES && this.data.actionType !== "imageAction") {
                    url = url.replace("%s", "%x");
                }

                // 二级域名 (host)
                let secondaryDomain = '';
                // 完整域名
                let domainName = '';
                // 参数部分
                let parameter = '';
                // protocol部分
                let protocol = '';
                try {
                    let urlKeyword = new URL(keyword);
                    protocol = urlKeyword.protocol;
                    parameter = urlKeyword.pathname.substr(1) + urlKeyword.search;
                    domainName = urlKeyword.hostname;
                    let domainArr = domainName.split('.');
                    if (domainArr.length < 2) {
                        // 链接不包含二级域名(例如example.org, 其中example为二级域, org为顶级域) 使用domainName替代
                        secondaryDomain = domainName;
                    } else {
                        secondaryDomain = domainArr[domainArr.length - 2] + "." + domainArr[domainArr.length - 1]
                    }
                } catch (Error) {
                    // 这里的异常用作流程控制: 非链接 -> 不作处理(使用''替换可能存在的误用占位符即可)
                }

                // 大写的占位符表示此字段无需Base64编码(一般是非参数)
                url = url
                    .replace("%S", keyword)
                    .replace("%X", `site:${this.data.site} ${keyword}`)
                    .replace("%O", protocol)
                    .replace("%D", domainName)
                    .replace("%H", secondaryDomain)
                    .replace("%P", parameter)

                url = url
                    .replace("%s", encodeURIComponent(keyword))
                    .replace("%x", encodeURIComponent(`site:${this.data.site} ${keyword}`))
                    .replace("%o", encodeURIComponent(protocol))
                    .replace("%d", encodeURIComponent(domainName))
                    .replace("%h", encodeURIComponent(secondaryDomain))
                    .replace("%p", encodeURIComponent(parameter))

                return this.openTab(url);
            }
        }
    }

    async searchImage(imageUrl) {
        let url = await this.getEngine();

        return this.openTab(
            url
                .replace("%s", encodeURIComponent(imageUrl))
                .replace("%x", encodeURIComponent(`site:${this.data.site} ${imageUrl}`))
        );
    }

    async searchImageByPostMethod(u8Array) {
        //TODO
        const key = randomString(10)
        this.temporaryDataStorage.set(key, {
            cmd: "search",
            data: u8Array
        })
        //TODO: 不允许在 private window 打开 redirect页面，需要检查
        return this.openTab(REDIRECT_URL + "?key=" + key)
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
        //TODO
        let opt = {
            url,
            saveAs: this.data.action.download_saveas
        };
        if (url.startsWith("blob:") && this.data.fileInfo) {
            this.lastDownloadObjectURL = url;
            aFilename = this.data.fileInfo.name || "file.dat";
        }
        if (this.data.action.download_type !== commons.DOWNLOAD_TEXT) {
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
        if (parseInt(this.data.action.download_directory) === CUSTOM_CODE_ENTRY_INDEX) {
            Object.assign(opt, this.data.downloadOption);
            console.assert(typeof opt.filename === "string", "error type of downloadOption.filename");
        }
        else {
            const directories = this.bgConfig["downloadDirectories"];
            opt.filename = this.replaceVariables(directories[this.data.action.download_directory])
            opt.filename += aFilename;
        }
        opt.filename = decodeURIComponent(opt.filename);
        opt.filename = safeFilename(opt.filename);

        this.lastDownloadItemID = await browser.downloads.download(opt);

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

    async copyText(data) {
        const storage = document.createElement("textarea");
        storage.value = data;
        document.body.appendChild(storage);
        storage.focus();
        storage.setSelectionRange(0, storage.value.length);
        document.execCommand("copy");
        storage.remove();
    }

    async copyImage(u8Array) {
        browser.clipboard.setImageData(u8Array,
            this.data.extraImageInfo.extension === ".png" ? "png" : "jpeg");
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

    getTabIndex(tabsLength = 0, currentTabIndex = 0) {

        if (this.bgConfig.disableAdjustTabSequence || this.data.action.tab_active === commons.FORE_GROUND) {
            this.backgroundChildTabCount = 0;
        }
        let index = 0;
        switch (this.data.action.tab_pos) {
            case commons.TAB_CLEFT: index = currentTabIndex; break;
            case commons.TAB_CRIGHT: index = currentTabIndex + this.backgroundChildTabCount + 1; break;
            case commons.TAB_FIRST: index = 0; break;
            case commons.TAB_LAST: index = tabsLength; break;
            default: break;
        }

        if (this.data.action.tab_active === commons.BACK_GROUND && this.data.action.tab_pos === commons.TAB_CRIGHT) {
            this.backgroundChildTabCount += 1;
        }

        $D(`getTabIndex: tabsLength=${tabsLength},
            currentTabIndex=${currentTabIndex},
            flags.disableAdjustTabSequence = ${this.bgConfig.disableAdjustTabSequence},
            this.data.action.tab_active =${this.data.action.tab_active},
            this.data.action.tab_pos=${this.data.action.tab_pos},
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


    async fetchImagePromise(extraImageInfo) {
        return new Promise((resolve, reject) => {
            const port = browser.tabs.connect(this.sender.tabId)
            if (port.error) {
                console.trace(port, port.error)
                return
            }
            port.onMessage.addListener(u8Array => {
                console.log('get u8Array, start disconnect')
                port.disconnect()
                resolve(u8Array)
            })
            port.postMessage(extraImageInfo.token)
        })
    }


    async openImageViewer(u8Array) {

    }
}

var executor = new ExecutorClass();

//点击工具栏图标时打开选项页
// browser.browserAction.onClicked.addListener(() => {
//     browser.runtime.openOptionsPage();
// });

async function insertCSS(sender) {
    browser.tabs.insertCSS(sender.tab.id, {
        frameId: sender.frameId,
        file: browser.runtime.getURL("content_scripts/content_script.css"),
        runAt: "document_end"
    });
    const storage = await (browser.storage.local.get(["enableStyle", "style"]));
    if (storage["enableStyle"] === true) {
        browser.tabs.insertCSS(sender.tab.id, { frameId: sender.frameId, code: storage.style, runAt: "document_end" });
    }
}

browser.runtime.onMessage.addListener(async (m, sender) => {
    switch (m.cmd) {
        case "removeHighlighting":
            executor.removeFind();
            break;
        case "insertCSS":
            insertCSS(sender);
            break;
        default:
            executor.DO(m, sender);
            break;
    }
});

console.info("Glitter Drag: background script executed.")