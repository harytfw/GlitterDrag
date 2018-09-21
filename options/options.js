const ENGINES = [{
    groupName: "General",
    "Google Search": " https://www.google.com/search?q=%s",
    "Bing Search": "https://www.bing.com/search?q=%s",
    "DuckDuckGo Search": "https://duckduckgo.com/?q=%s&ia=web",
    "Yahoo Search": "https://search.yahoo.com/search;?p=%s",
    "Yandex Search": "https://www.yandex.com/search/?text=%s",
    "Youtube Search": "https://www.youtube.com/results?search_query=%s",
    "Wikipedia(English)": "https://en.wikipedia.org/wiki/%s",
    "Amazon Search": "https://www.amazon.com/s/?field-keywords=%s",
    "Qwant Search": "https://www.qwant.com/?q=%s&t=all",
    "StartPage Search": "https://www.startpage.com/do/search?&cat=web&query=%s"
}, {
    groupName: "Chinese",
    "百度搜索": "https://www.baidu.com/baidu?wd=%s",
    "360 搜索": "https://www.so.com/s?q=%s",
    "Acfun搜索": "http://www.acfun.cn/search/#query=%s",
    "哔哩哔哩搜索": "https://search.bilibili.com/all?keyword=%s",
    "优酷搜索": "http://www.soku.com/search_video/q_%s",
    "网易云音乐搜索": "https://music.163.com/#/search/m/?s=%s",
    "豆瓣搜索": "https://www.douban.com/search?q=",
    "知乎搜索": "https://www.zhihu.com/search?q=%s",
    "中文维基百科": "https://zh.wikipedia.org/wiki/%s",
}, {
    groupName: "Image Search",
    "Baidu Image": "https://image.baidu.com/n/pc_search?queryImageUrl=%s",
    "Bing Image": "https://www.bing.com/images/searchbyimage?FORM=IRSBIQ&cbir=sbi&imgurl=%s",
    "Google Image": "https://www.google.com/searchbyimage?image_url=%s",
    "IQDB": "https://iqdb.org/?url=%s",
    "SauceNAO": "https://saucenao.com/search.php?db=999&url=%s",
    "Sogou Image": "https://pic.sogou.com/ris?query=%s&flag=1",
    "Yandex": "https://www.yandex.com/images/search?url=%s&rpt=imageview",
}, {
    groupName: "Image Search(via upload)",
    "Baidu Image": "{redirect.html}?cmd=search&url={url}&engineName=baidu",
    "Google Image": "{redirect.html}?cmd=search&url={url}&engineName=google",
    "Tineye": "{redirect.html}?cmd=search&url={url}&engineName=tineye",
    "Yandex": "{redirect.html}?cmd=search&url={url}&engineName=yandex",
}];

window.addEventListener("beforeunload", () => {
    LStorage.set({
        "version": browser.runtime.getManifest().version
    });
});

document.title = getI18nMessage("option_page_title");

const LStorage = browser.storage.local;

console.info("UILanguage: " + browser.i18n.getUILanguage());

function doI18n(scope = document) {
    for (let elem of scope.querySelectorAll("[data-i18n]")) {
        let prefix = "elem_";
        if ("i18nPrefix" in elem.dataset) {
            prefix = elem.dataset.i18nPrefix;
        }
        let content = "";
        if ("i18nPlaceholders" in elem.dataset) {
            let placeholders = elem.dataset.i18nPlaceholders.split(",");
            content = getI18nMessage(`${prefix}${elem.dataset.i18n}`, placeholders);
        }
        else {
            content = getI18nMessage(`${prefix}${elem.dataset.i18n}`);
        }

        if (content === elem.dataset.i18n) {
            console.warn(elem, "misses i18n message");
        }

        if ("i18nAttach" in elem.dataset) {
            elem[elem.dataset.i18nAttach] = content;
        }
        else {
            elem.textContent = content;
        }
    }
}

$A("template").forEach(t => {
    //初始化template里面的内容
    doI18n(t.content);
});

//hacking label + input[type='radio']
document.addEventListener("click", e => {
    if (e.target.nodeName === "LABEL" && e.target.getAttribute("for") !== null) {
        const t = $E("." + e.target.getAttribute("for"), e.target.parentElement);
        if (t && t.type === "radio") {
            // t.checked = !t.checked;
            t.dispatchEvent(new Event("radiochange", {
                bubbles: true
            }));
        }
    }
})
//手动处理选择单选按钮
document.addEventListener("radiochange", e => {
    //把同一个父元素的radio当成一组
    let checked = $A("input[type='radio']:checked", e.target.parentElement);
    for (const c of checked) {
        c.checked = false;
    }
    e.target.checked = true;
    //radiochange也是一种change事件，手动触发，传给上级
    e.target.dispatchEvent(new Event("change", {
        bubbles: true
    }));
})

class ActionsWrapper {
    constructor() {
        this.parent = $E("#tab-actions");

        this.template4Direction = $E("#template-for-single-direction")
        this.template4Type = $E("#template-for-single-action-type")
        this.template4Container = $E("#template-for-actions-container")

        this.fillContent();
        this.parent.addEventListener("tabshow", e => {
            $E(".Actions", this.parent).dispatchEvent(new Event("radiochange", {
                bubbles: true
            }));
        });
    }
    async fillContent() {

        const cclone = document.importNode(this.template4Container.content, true);
        $E("#tab-actions").appendChild(cclone);

        for (const subcontainer of $A("#tab-actions #actions-container div")) {
            const label = document.createElement("h3");
            label.textContent = getI18nMessage(subcontainer.className.split("Action")[0] + "Type");
            subcontainer.appendChild(label);
            const tclone = document.importNode(this.template4Type.content, true);
            subcontainer.appendChild(tclone);

            const dirs = subcontainer.querySelectorAll(".direction");
            for (const d of dirs) {
                d.appendChild(document.importNode(this.template4Direction.content, true))
            }

            switch (subcontainer.className) {
                case commons.textAction:
                    $H([".tab-pos", ".download-type", ".open-type", ".search-type", ".copy-type"], "none", subcontainer);
                    break;
                case commons.linkAction:
                    $H(["option[value=OPEN_IMAGE]", "option[value=COPY_IMAGE]", "option[value=SEARCH_IMAGE]", "option[value=DOWNLOAD_IMAGE]"], "none", subcontainer);
                    break;
                case commons.imageAction:
                    $H(["option[value=ACT_FIND]",
                        "option[value=ACT_TRANS]",
                        "option[value=OPEN_TEXT]",
                        "option[value=COPY_TEXT]",
                        "option[value=SEARCH_TEXT]",
                        "option[value=DOWNLOAD_TEXT]",
                        "option[value=OPEN_IMAGE_LINK]",
                        "option[value=SEARCH_IMAGE_LINK]",
                        "option[value=DOWNLOAD_IMAGE_LINK]",
                        "option[COPY_IMAGE_LINK]"
                    ], "none", subcontainer);
                    $H([".download-directory option[value='8']"], "initial", subcontainer);
                    break;
                default:
                    break;
            }
        }

        this.parent.addEventListener("change", e => this.onchange(e));
        this.parent.addEventListener("updateengines", e => this.onupdate(e));
    }

    async onDirectionControlChange(e) {
        function show(re) {
            for (const elem of $A(".direction", context.parentElement.parentElement)) {
                if (re.test(elem.getAttribute("value"))) {
                    elem.parentElement.style.display = "block";
                }
                else {
                    elem.parentElement.style.display = "none";
                }
            }
        }
        const context = e.target.parentElement;
        switch (e.target.value) {
            case commons.ALLOW_ALL:
                show(/.*/);
                break;
            case commons.ALLOW_NORMAL:
                show(/^DIR_([UDLR]|OUTER)$/);
                break;
            case commons.ALLOW_H:
                show(/^DIR_([LR]|OUTER)$/);
                break;
            case commons.ALLOW_V:
                show(/^DIR_([UD]|OUTER)$/);
                break;
            case commons.ALLOW_ONE:
                // TODO: 显示为“上”，实际为该动作允许任何方向触发
                show(/^DIR_(U|OUTER)$/);
                break;
            case commons.ALLOW_LOW_L_UP_R:
                show(/^DIR_(UP_R|LOW_L|OUTER)$/);
                break;
            case commons.ALLOW_UP_L_LOW_R:
                show(/^DIR_(UP_L|LOW_R|OUTER)$/);
                break;
            case commons.ALLOW_QUADRANT:
                show(/^DIR_(UP_L|LOW_R|UP_R|LOW_L|OUTER)$/);
                break;
            case commons.ALLOW_NONE: //备用，未来可能会添加“关闭所有方向”
            default:
                break;
        }
    }

    onActionBehaviorChange(e) {
        const context = e.target.parentElement;
        $H([".tab-active", ".tab-pos", ".engine-name",
            ".open-type", ".search-type", ".search-onsite", ".copy-type",
            ".download-type", ".download-directory", ".download-saveas"
        ], "none", context);
        const kind = e.target.parentElement.parentElement.parentElement.className;
        let classList = [];
        switch (e.target.value) {
            case commons.ACT_COPY:
                if (kind !== commons.textAction) {
                    classList.push(".copy-type");
                }
                break;
            case commons.ACT_SEARCH:
                classList = [".tab-active", ".tab-pos", ".engine-name", ".search-onsite"];
                if (kind !== commons.textAction) {
                    classList.push(".search-type");
                }
                break;
            case commons.ACT_OPEN:
                classList = [".tab-active", ".tab-pos"]
                if (kind !== commons.textAction) {
                    classList.push(".open-type");
                }
                else {
                    classList.push(".engine-name");
                }
                break;
            case commons.ACT_QRCODE:
                classList = [".tab-active", ".tab-pos"];
                break;
            case commons.ACT_DL:
                classList = [".download-directory", ".download-saveas"];
                if (kind !== commons.textAction) {
                    classList.push(".download-type");
                }
                break;
            case commons.ACT_FIND:
                break;
            default:
                break;
        }
        $H(classList, "inline-block", context);

    }
    async onchange(e) {

        if (e.target.className.indexOf("direction-control") >= 0) {
            const cfg = await LStorage.get(this.controlKeyName);
            cfg[this.controlKeyName][e.target.parentElement.parentElement.parentElement.className] = e.target.value;
            await LStorage.set(cfg);
            this.onDirectionControlChange(e);
        }
        else if (e.target.className.indexOf("Actions") >= 0) {
            await this.updateEngine();
            this.setting = (await LStorage.get([this.actionsKeyName]))[this.actionsKeyName];
            for (const x of $A(".act-name", this.parent)) {
                this.onActionBehaviorChange({
                    target: x
                });
            }
            const cfg = await LStorage.get(this.controlKeyName);
            for (const x of $A(".direction-control", this.parent)) {
                x.value = cfg[this.controlKeyName][x.parentElement.parentElement.parentElement.className];
                this.onDirectionControlChange({
                    target: x
                });
            }
        }
        else {
            if (e.target.className.indexOf("act-name") >= 0) {
                this.onActionBehaviorChange(e);
            }
            const dirName = e.target.parentElement.getAttribute("value");
            const kind = e.target.parentElement.parentElement.parentElement.className;
            const attribute = e.target.className.replace("-", "_");
            console.info(kind, dirName, attribute, "->", e.target.value);
            const key = this.actionsKeyName;
            LStorage.get(key).then(res => {
                if (e.target.value === "true") {
                    res[key][kind][dirName][attribute] = true
                }
                else if (e.target.value === "false") {
                    res[key][kind][dirName][attribute] = false;
                }
                else if (attribute === "engine_name") {
                    const prefix = getI18nMessage('currentEngine');
                    if (e.target.value.startsWith(prefix)) {
                        res[key][kind][dirName][attribute] = e.target.value.subStr(prefix.length);
                    }
                    else {
                        res[key][kind][dirName][attribute] = e.target.value;
                    }
                    res[key][kind][dirName]["engine_url"] = e.target.options[e.target.selectedIndex].getAttribute("url");
                    const isBrowserSearch = e.target.options[e.target.selectedIndex].getAttribute("is-browser-search") === "true" ? true : false;
                    res[key][kind][dirName]["is_browser_search"] = isBrowserSearch;

                }
                else {
                    res[key][kind][dirName][attribute] = e.target.value;
                }

                $D(res);
                LStorage.set(res);
            });

        }
    }

    async updateEngine() {
        // browser
        let browserEngines = [];
        if (browserMajorVersion >= 63) {
            browserEngines = (await browser.search.get())
        }

        const browserGroup = document.createElement('optgroup');
        browserGroup.label = "Browser";
        for (const obj of browserEngines) {
            const elem = document.createElement("option");
            elem.value = obj.name;
            elem.textContent = obj.name;
            elem.setAttribute("url", "about:about");// test purpose, TODO: remove
            elem.setAttribute("is-browser-search", true);
            browserGroup.appendChild(elem);
        }
        // builtin
        const userEngines = (await LStorage.get("Engines"))["Engines"];
        const userAddingGroup = document.createElement("optgroup");
        userAddingGroup.label = "Your addition";
        for (const obj of userEngines) {
            const elem = document.createElement("option");
            elem.value = obj.name;
            elem.textContent = obj.name;
            elem.setAttribute("url", obj.url);
            elem.setAttribute("is-browser-search", false);
            userAddingGroup.appendChild(elem);
        }

        // normal image search engine
        // const imageEngines = ENGINES.filter(obj => {
        //     return obj.groupName === 'Image Search';
        // });
        // const imageSearchGroup = document.createElement("optgroup");
        // imageSearchGroup.label = "Image Search";
        // for (const key of Object.keys(imageEngines)) {
        //     const elem = document.createElement("option");
        //     elem.value = key;
        //     elem.textContent = key;
        //     elem.setAttribute("url", imageEngines[key]);
        //     elem.setAttribute("is-browser-search", false);
        //     imageSearchGroup.appendChild(elem);
        // }

        // via upload
        // const imageEngines2 = ENGINES.filter(obj => {
        //     return obj.groupName === 'Image Search(via upload)';
        // });
        // const imageSearchGroup2 = document.createElement("optgroup");
        // imageSearchGroup2.label = "Image Search";
        // for (const key of Object.keys(imageEngines2)) {
        //     const elem = document.createElement("option");
        //     elem.value = key;
        //     elem.textContent = key;
        //     elem.setAttribute("url", imageEngines2[key]);
        //     elem.setAttribute("is-browser-search", false);
        //     imageSearchGroup2.appendChild(elem);
        // }


        for (const selectElem of $A(".engine-name", this.parent)) {
            while (selectElem.firstElementChild) {
                selectElem.firstElementChild.remove();
            }
            selectElem.appendChild(browserGroup.cloneNode(true));
            selectElem.appendChild(userAddingGroup.cloneNode(true));
            // selectElem.appendChild(imageSearchGroup.cloneNode(true));
            // selectElem.appendChild(imageSearchGroup2.cloneNode(true));

            if (selectElem.parentElement.parentElement.parentElement.className === commons.imageAction) {
                $H([
                    "optgroup[label='Browser']",
                    "option[value='默认'][is-browser-search='true']"
                ], "none", selectElem);
            }
        }
    }

    get setting() {

    }

    set setting(allSetting) {

        for (const kind of Object.keys(allSetting)) {
            for (const dirName of Object.keys(allSetting[kind])) {
                const context = $E(`.${kind} .direction[value="${dirName}"]`);
                const action = allSetting[kind][dirName];
                $E(".act-name", context).value = action["act_name"];
                $E(".tab-active", context).value = action["tab_active"];
                $E(".search-onsite", context).value = action["search_onsite"];
                $E(".download-saveas", context).value = action["download_saveas"]
                $E(".tab-pos", context).value = action["tab_pos"];
                $E(".open-type", context).value = action["open_type"];
                $E(".copy-type", context).value = action["copy_type"];
                $E(".search-type", context).value = action["search_type"];
                $E(".download-type", context).value = action["download_type"];
                $E(".tab-pos", context).value = action["tab_pos"];
                $E(".download-directory", context).value = action["download_directory"];

                const engineSelector = $E(".engine-name", context);
                engineSelector.value = action["engine_name"];

                let opt = document.createElement("option")
                opt.textContent = getI18nMessage("defaultText");
                opt.value = getI18nMessage("defaultText");
                opt.setAttribute("url", "about:blank");// only for test TODO: remove
                opt.setAttribute("is-browser-search", true);
                engineSelector.insertBefore(opt, engineSelector.firstElementChild);

                opt = document.createElement("option");
                opt.textContent = getI18nMessage("currentEngine", action["engine_name"]);
                opt.value = action["engine_name"];
                opt.setAttribute("url", action["engine_url"]);
                opt.setAttribute("is-browser-search", action["is_browser_search"]);
                engineSelector.insertBefore(opt, engineSelector.firstElementChild);

                engineSelector.title = action["engine_url"];
                engineSelector.selectedIndex = 0;
            }
        }


    }

    get actionsKeyName() {
        return $E("#actions-switch input:checked").value;
    }

    get controlKeyName() {
        if (this.actionsKeyName === "Actions_CtrlKey") {
            return "directionControl_CtrlKey";
        }
        else if (this.actionsKeyName === "Actions_ShiftKey") {
            return "directionControl_ShiftKey";
        }
        else {
            return "directionControl";
        }
    }

}

class EngineItemWrapper {
    constructor(val, callback, saved) {
        this.callback = callback;
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");

        this.removeBtn = document.createElement("a");
        this.removeBtn.className = "remove-button";
        this.removeBtn.href = "#";
        this.removeBtn.textContent = "x";
        eventUtil.attachEventT(this.removeBtn, () => this.onRemoveClick());

        this.nameInput = document.createElement("input");
        this.nameInput.className = "search-name-input";
        this.nameInput.type = "text";
        this.nameInput.title = getI18nMessage("search_name_tooltip");
        this.nameInput.placeholder = getI18nMessage("search_name_tooltip"); // Did not see the need for separate strings
        eventUtil.attachEventT(this.nameInput, this.onchange, "change");

        this.urlInput = this.nameInput.cloneNode();
        this.urlInput.className = "search-url-input";
        this.urlInput.title = getI18nMessage("search_url_tooltip");
        this.urlInput.placeholder = getI18nMessage("search_url_tooltip");
        eventUtil.attachEventT(this.urlInput, this.onchange, "change");

        [this.removeBtn, this.nameInput, this.urlInput].forEach(t => this.elem.appendChild(t));
        this.value = val;
        if (saved) {
            this.elem.classList.add("saved");
        }
    }

    onRemoveClick() {
        this.callback(this);
    }

    onchange() {
        this.elem.classList.remove("saved");
    }
    get name() {
        return this.nameInput.value;
    }
    set name(n) {
        return this.nameInput.value = n;
    }
    get url() {
        return this.urlInput.value;
    }
    set url(s) {
        return this.urlInput.value = s;
    }
    get value() {
        return {
            name: this.name,
            url: this.url
        }
    }
    set value(o) {
        this.name = o.name;
        this.url = o.url;
    }
    appendTo(p) {
        p.appendChild(this.elem);
    }
}
class EngineWrapper {
    constructor() {
        document.querySelectorAll("#builtin-engine>select>option:nth-child(1)").forEach(el => {
            el.selected = true;
        })
        eventUtil.attachEventAll("#builtin-engine>select", (event) => {
            this.newItem({
                name: event.target.selectedOptions[0].textContent,
                url: event.target.value
            }, false)
            event.target.selectedIndex = 0; // Reset to group option for re-select to add this value again
        }, "change");


        this.items = [];

        // this.onAdd = this.onAdd.bind(this);
        this.onItemRemove = this.onItemRemove.bind(this);

        this.buttonsDiv = document.querySelector("#engine-buttons");
        this.itemsDiv = document.querySelector("#engine-items");

        let refreshbtn = this.buttonsDiv.querySelector("#RefreshbtnOnEngines");
        refreshbtn.onclick = () => this.onRefresh();

        let addbtn = this.buttonsDiv.querySelector("#AddbtnOnEngines");
        addbtn.onclick = () => this.onAdd();

        let savebtn = this.buttonsDiv.querySelector("#SavebtnOnEngines");
        savebtn.onclick = () => this.onSaveAll();

        this.appendTo($E(`#tab-search-template`));

        document.addEventListener("tabshow", e => {
            if (e.target.id === "tab-search-template") {
                this.onRefresh();
            }
        });
        if (browser.i18n.getUILanguage().startsWith("zh")) {
            $A("#builtin-engine select")[1].style.display = "inline-block";
        }
    }

    onSaveAll() {
        const engines = [];
        const savedItems = [];
        const unSavedItems = [];
        for (let item of this.items) {
            if (item.url.length > 0 && item.name.length > 0) {
                savedItems.push(item);
                engines.push({
                    name: item.name,
                    url: item.url
                });
            }
            else {
                unSavedItems.push(item);
            }
        }
        if (engines.length > 0) {
            LStorage.set({
                "Engines": engines
            }).then(() => {
                savedItems.forEach(item => {
                    item.elem.classList.add("accept", "saved");
                    setTimeout(() => {
                        item.elem.classList.remove("accept");
                    }, 1200)
                });
                unSavedItems.forEach(item => {
                    item.nameInput.classList.toggle("warning", item.name.length <= 0);
                    item.urlInput.classList.toggle("warning", item.url.length <= 0);
                    item.elem.classList.remove("saved");
                    setTimeout(() => {
                        item.nameInput.classList.remove("warning");
                        item.urlInput.classList.remove("warning");
                    }, 1200)
                });

                setTimeout(() => {
                    $E("#tab-actions").dispatchEvent(new Event("updateengines", {
                        engines
                    }));
                }, 1000);
            });
        }
    }
    onItemRemove(item) {
        this.items = this.items.filter((v) => v !== item);
        this.itemsDiv.removeChild(item.elem);
    }
    async onRefresh() {
        this.refreshItems((await LStorage.get("Engines"))["Engines"]);
    }
    onAdd() {
        this.newItem({
            name: "",
            url: ""
        }, false);
    }
    async refreshItems(list) {
        this.clearItems();
        list.forEach(s => this.newItem(s, true));
    }
    clearItems() {
        this.items.forEach(item => {
            this.itemsDiv.removeChild(item.elem);
        });
        this.items = [];
    }
    newItem(val, saved = false) {
        let item = new EngineItemWrapper(val, this.onItemRemove, saved);
        this.items.push(item);
        item.appendTo(this.itemsDiv);
    }
    collect() {
        let result = [];
        this.items.forEach((item) => {
            if (item.name.length != 0 && item.url.length != 0) {
                result.push(item.value);
            }
        })
        return result;
    }
    appendTo(parent) {
        parent;
        // parent.appendChild(this.itemsDiv)
    }
}

class generalSettingWrapper {
    constructor() {
        if (browserMajorVersion >= 53) {
            $E("#enableSync").removeAttribute("disabled");
        }
        LStorage.get("tipsContent").then(res => {
            const el = $E("#tipsContentSelect");
            const input = $E("#tipsContentInput");
            const content = res["tipsContent"];
            input.addEventListener("change", ({
                target
            }) => {
                let val = target.value.replace(/\\n/g, "\n");
                content[el.value] = val;
                LStorage.set({
                    "tipsContent": content
                });
            });
            el.addEventListener("change", (e) => {
                input.value = content[e.target.value].replace(/\n/g, "\\n");
                input.setAttribute("data-id", e.target.value);
            });
            el.selectedIndex = 1;
            input.value = content[el.value].replace(/\n/g, "\\n");
            // el.dispatchEvent(new Event("change"));
        });

        LStorage.get("specialHosts").then(res => {
            const el = $E("#specialHosts");
            el.value = res["specialHosts"].join(",");
            el.addEventListener("change", () => {
                const content = el.value.split(",");
                LStorage.set({
                    "specialHosts": content
                });
            })
        });

        LStorage.get("allowExts").then(res => {
            const el = $E("#allowExts");
            el.value = res["allowExts"].join(",");
            el.addEventListener("change", () => {
                const content = el.value.split(",");
                LStorage.set({
                    "allowExts": content
                });
            })
        });

        $E("#tab-general-setting").addEventListener("change", evt => {
            if (evt.target.getAttribute("not-config") !== null) return; //特殊处理
            const stored = {};
            stored[evt.target.id] = undefined;
            if (evt.target.type === "checkbox") stored[evt.target.id] = evt.target.checked;
            else if (evt.target.type === "number") stored[evt.target.id] = parseInt(evt.target.value);
            else stored[evt.target.id] = evt.target.value;
            LStorage.set(stored).then(() => {
                $D("修改设置：", stored);
            }).catch((e) => {
                console.error(e);
            });
        });
        this.initSetting();
    }
    async initSetting() {
        for (let elem of $A("#tab-general-setting input[id]")) {
            if (elem.getAttribute("not-config") !== null) continue; //特殊处理
            if (elem.type === "file") return;
            if (elem.type === "checkbox") {
                elem.checked = (await LStorage.get(elem.id))[elem.id];
            }
            else elem.value = (await LStorage.get(elem.id))[elem.id];
        }
    }
}

class ActionsView {
    constructor(parent, actionTypeGetter) {
        this.actionTypeGetter = actionTypeGetter;
        this.parent = parent;


        this.$E(".action-name").addEventListener("change", (e) => {
            this.onActionBehaviorChange(e);
        });


        this.initALL();
    }
    $E(str, context = this.parent) {
        return $E(str, context);
    }

    initALL() {
        //初始化搜索引擎
        const selectProtype = document.createElement("select");
        const optProtype = document.createElement("option");
        let isChineseUI = browser.i18n.getUILanguage().startsWith("zh");
        for (const g of ENGINES) {
            let select = selectProtype.cloneNode();
            let opt = optProtype.cloneNode();
            if (!isChineseUI && g.groupName === "Chinese") {
                continue;
            }
            opt.textContent = g.groupName;
            opt.disabled = 1;

            select.appendChild(opt);
            for (const name of Object.keys(g)) {
                if (name === "groupName") continue;
                opt = optProtype.cloneNode();
                opt.textContent = name;
                opt.value = g[name];
                select.appendChild(opt);
            }
            this.$E(".search-engine-select-group").appendChild(select);
            select.selectedIndex = 0;
        }
        this.$E(".search-engine-select-group").addEventListener("change", e => this.onEngineChange(e))
    }

    onEngineChange(e) {
        const el = e.target;
        this.$E(".search-engine-name").value = el.children[el.selectedIndex].textContent;
        this.$E(".search-engine-url").value = el.children[el.selectedIndex].value;
        if (el.children[0].textContent === "Browser") {
            this.$E(".search-engine-name").setAttribute("is-browser-search", true);
            this.$E(".search-engine-name").disabled = true;
            this.$E('.search-engine-url').style.display = 'none';
        }
        else {
            this.$E(".search-engine-name").setAttribute("is-browser-search", false);
            this.$E(".search-engine-name").disabled = false;
            this.$E('.search-engine-url').style.display = '';
        }
        el.selectedIndex = 0;
    }

    onActionBehaviorChange(e) {

        const hideTR = (...s) => {
            for (const x of s) {
                this.$E(x).parentElement.parentElement.style.display = "none";
            }
        }

        const showTR = (...s) => {
            for (const x of s) {
                this.$E(x).parentElement.parentElement.style.display = "table-row";
            }
        }

        const hideRadios = (...s) => {
            for (const x of s) {
                this.$E(x).disabled = true;
            }
        }

        $A("input[type='radio']:disabled", this.parent).forEach(e => {
            e.removeAttribute("disabled");
        });
        showTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".copy-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
        $H([`.download-directory option[value='8']`], 'none', this.parent);
        switch (e.target.value) {
            case commons.ACT_NONE:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".copy-text", ".download-text", ".download-saveas-yes", ".search-text", ".download-directory", ".search-onsite-yes");
                break;
            case commons.ACT_OPEN:
                hideTR(".copy-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");

                if (this.actionType === commons.linkAction) {
                    hideTR(".search-text", ".search-onsite-yes");
                    hideRadios(".open-text", ".open-image");
                }
                else if (this.actionType === commons.imageAction) {
                    hideTR(".search-text", ".search-onsite-yes");
                    hideRadios(".open-text", ".open-image-link");
                }
                else {
                    hideTR(".open-text");
                }
                break
            case commons.ACT_SEARCH:
                hideTR(".open-text", ".copy-text", ".download-text", ".download-saveas-yes", ".download-directory");
                if (this.actionType === commons.imageAction) {
                    hideTR(".open-text", ".search-onsite-yes");
                    hideRadios(".search-text", ".search-image-link", ".open-image-link");
                }
                else if (this.actionType === commons.textAction) {
                    hideTR(".search-text");
                }
                else if (this.actionType === commons.linkAction) {
                    hideRadios(".search-image");
                }
                break;
            case commons.ACT_DL:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".copy-text", ".search-onsite-yes");
                if (this.actionType === commons.linkAction) {
                    hideRadios(".download-image");
                }
                else if (this.actionType === commons.imageAction) {
                    hideTR(".download-text");
                    $H([`.download-directory option[value='8']`], '', this.parent);
                }
                else if (this.actionType === commons.textAction) {
                    hideTR(".download-type");
                }
                break;
            case commons.ACT_COPY:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
                if (this.actionType === commons.textAction) {
                    hideTR(".copy-text");
                }
                else if (this.actionType === commons.linkAction) {
                    hideRadios(".copy-image");
                }
                else if (this.actionType === commons.imageAction) {
                    hideRadios(".copy-text");
                }
                break

            case commons.ACT_TRANS:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".download-text", ".copy-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
                break;
            case commons.ACT_FIND:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes", ".copy-text");
                break;
            case commons.ACT_QRCODE:
                break;
            case commons.ACT_PANEL:
                hideTR(".copy-text", ".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
                break;
        }

    }
    getRadioValue(name) {
        let radios = $A(name, this.parent)
        for (let i = 0; i < radios.length; i++) {
            if (radios[i].checked) {
                if (radios[i].value === "true" || radios[i].value === "false") {
                    return radios[i].value === "true" ? true : false;
                }
                return radios[i].value;
            }
        }
        if (radios[0].value === "true" || radios[0].value === "false") {
            return radios[0].value === "true" ? true : false;
        }
        return radios[0].value;
    }
    setAsRadioValue(t) {
        this.$E(t).dispatchEvent(new Event("radiochange", {
            bubbles: true
        }));
    }
    get actionType() {
        return this.actionTypeGetter();
    }
    get setting() {

        let temp = {};
        Object.assign(temp, {
            act_name: this.$E(".action-name").value,
            tab_pos: this.$E(".tab-pos").value,
            engine_name: this.$E(".search-engine-name").value,
            engine_url: this.$E(".search-engine-url").value,
            is_browser_search: this.$E(".search-engine-name").getAttribute("is-browser-search") === "true" ? true : false,
            download_directory: this.$E(".download-directory").value,
            tab_active: this.getRadioValue(".tab-active"),
            open_type: this.getRadioValue(".open-type"),
            search_type: this.getRadioValue(".search-type"),
            copy_type: this.getRadioValue(".copy-type"),
            download_type: this.getRadioValue(".download-type"),
            download_saveas: this.getRadioValue(".download-saveas"),
            search_onsite: this.getRadioValue(".search-onsite"),
        });
        return temp;
    }

    set setting(data) {
        if (this.actionType === "imageAction") {
            for (let optionElem of $A('option[value=ACT_FIND],option[value=ACT_TRANS]', this.parent)) {
                optionElem.setAttribute('disabled', '');
            }
            this.$E('.search-engine-select-group').firstElementChild.style.display = 'none';
        }
        else {
            for (let optionElem of $A('option[value=ACT_FIND],option[value=ACT_TRANS]', this.parent)) {
                optionElem.removeAttribute('disabled');
            }
            this.$E('.search-engine-select-group').firstElementChild.style.display = '';
        }

        if (data["tab_active"] === commons.FORE_GROUND) {
            this.setAsRadioValue(".foreground")
        }
        else {
            this.setAsRadioValue(".background")
        }

        if (data["search_onsite"] === commons.SEARCH_ONSITE_YES) {
            this.setAsRadioValue(".search-onsite-yes")
        }
        else {
            this.setAsRadioValue(".search-onsite-no")
        }

        if (data["download_saveas"] === commons.DOWNLOAD_SAVEAS_YES) {
            this.setAsRadioValue(".download-saveas-yes")
        }
        else {
            this.setAsRadioValue(".download-saveas-no")
        }

        for (const name of ["open_type", "copy_type", "download_type", "search_type"]) {
            let value = data[name];
            value = value.toLowerCase().replace(/_/g, "-");
            this.setAsRadioValue("." + value);
        }

        this.$E(".action-name").value = data["act_name"];
        this.$E(".tab-pos").value = data["tab_pos"];


        this.$E(".search-engine-name").value = data["engine_name"];
        this.$E(".search-engine-url").value = data["engine_url"];
        if (data["is_browser_search"] === true) {
            this.$E(".search-engine-name").disabled = true;
            this.$E(".search-engine-url").style.display = 'none';
        }
        else {
            this.$E(".search-engine-name").disabled = false;
            this.$E(".search-engine-url").style.display = '';
        }
        this.$E(".download-directory").value = data["download_directory"];

        this.$E(".action-name").dispatchEvent(new Event("change"));
    }
}

class NewActionsWrapper {
    constructor() {
        this.parent = $E("#new-actions-container");
        this.category = new ActionsView(this.parent, () => {
            return this.actionType;
        });

        this.parent.addEventListener("change", async () => {
            let res = (await LStorage.get(this.actionsKeyName));
            res[this.actionsKeyName][this.actionType][this.direction] = this.category.setting;
            res[this.controlKeyName] = (await LStorage.get(this.controlKeyName))[this.controlKeyName];
            res[this.controlKeyName][this.actionType] = this.kindOfControl;
            await LStorage.set(res);
            $D(res);
        })

        $E("#type-category").addEventListener("click", async (e) => {
            let sel = $E(".category-item-selected", e.target.parentElement);
            sel.classList.remove("category-item-selected");
            e.target.classList.add("category-item-selected");
            $E(".direction-control").value = (await LStorage.get(this.controlKeyName))[this.controlKeyName][this.actionType];
            $E(".direction-control").dispatchEvent(new Event("change"));
        });

        $E("#direction-category").addEventListener("click", async (e) => {
            if (e.target.classList.contains("category-item-disabled")) {
                $E(".direction-control", this.parent).setAttribute("style", "box-shadow: 0px 0px 4px rgb(255, 0, 0);");
                setTimeout(() => {
                    $E(".direction-control", this.parent).removeAttribute("style")
                }, 1000);
                return;
            }
            let sel = e.target.parentElement.querySelector(".category-item-selected");
            sel && sel.classList.remove("category-item-selected");
            e.target.classList.add("category-item-selected");

            const setting = (await LStorage.get(this.actionsKeyName))[this.actionsKeyName][this.actionType][this.direction];
            this.category.setting = setting;
            $D(setting);
        });
        $E(".direction-control", this.parent).addEventListener("change", async (e) => {
            const cfg = await LStorage.get(this.controlKeyName);
            cfg[this.controlKeyName][this.actionType] = e.target.value;
            await LStorage.set(cfg);
            this.onDirectionControlChange(e)
            $E("#direction-category div:not(.category-item-disabled)", this.parent).click();
        });

        document.addEventListener("tabshow", e => {
            if (e.target.id === "tab-new-actions") {
                $E("#type-category .category-item-selected").click();
            }
        });
    }


    async onDirectionControlChange(e) {
        const show = (re) => {
            for (const elem of $A("#direction-category>div", $E("#new-actions-container"))) {
                elem.classList.remove("category-item-disabled");
                if (!re.test(elem.getAttribute("value"))) {
                    elem.classList.add("category-item-disabled");
                }
            }
        }
        switch (e.target.value) {
            case commons.ALLOW_ALL:
                show(/.*/);
                break;
            case commons.ALLOW_NORMAL:
                show(/^DIR_([UDLR]|OUTER)$/);
                break;
            case commons.ALLOW_H:
                show(/^DIR_([LR]|OUTER)$/);
                break;
            case commons.ALLOW_V:
                show(/^DIR_([UD]|OUTER)$/);
                break;
            case commons.ALLOW_ONE:
                // TODO: 显示为“上”，实际为该动作允许任何方向触发
                show(/^DIR_(U|OUTER)$/);
                break;
            case commons.ALLOW_LOW_L_UP_R:
                show(/^DIR_(UP_R|LOW_L|OUTER)$/);
                break;
            case commons.ALLOW_UP_L_LOW_R:
                show(/^DIR_(UP_L|LOW_R|OUTER)$/);
                break;
            case commons.ALLOW_QUADRANT:
                show(/^DIR_(UP_L|LOW_R|UP_R|LOW_L|OUTER)$/);
                break;
            case commons.ALLOW_NONE: //备用，未来可能会添加“关闭所有方向”
            default:
                break;
        }

    }
    get actionType() {
        return $E("#type-category .category-item-selected").getAttribute("value");
    }
    get direction() {
        return $E("#direction-category .category-item-selected").getAttribute("value");
    }
    get kindOfControl() {
        return $E(".direction-control").value;
    }
    get actionsKeyName() {
        return $E("#type-category .category-item-selected").getAttribute("owner");
    }
    get controlKeyName() {
        return $E("#type-category .category-item-selected").getAttribute("control");
    }
}

class PanelWrapper {
    constructor() {
        this.btns = $E("#panel-buttons");
        this.cmdType = null;
        this.cmdIndex = null;
        this.btns.addEventListener("click", e => {
            if (e.target.nodeName === "BUTTON") {
                this.load(e);
            }
        });

        this.actionTypeGetter = this.actionTypeGetter.bind(this);

        this.category = new ActionsView(this.btns.nextElementSibling, this.actionTypeGetter);
        this.btns.nextElementSibling.addEventListener("change", e => this.onchange(e));
        this.category.parent.style.display = "none";
        this.dontsave = false;
    }
    actionTypeGetter() {
        return this.cmdType.split("_")[1];
    }
    async load(e) {
        this.category.parent.style.display = "none";
        if (e.target.className.indexOf("text") >= 0) {
            this.cmdType = "Panel_textAction";
        }
        else if (e.target.className.indexOf("link") >= 0) {
            this.cmdType = "Panel_linkAction";
        }
        else {
            this.cmdType = "Panel_imageAction";
        }
        this.cmdIndex = e.target.getAttribute("index");
        LStorage.get(this.cmdType).then((r) => {
            this.dontsave = true;
            this.setting = r[this.cmdType][this.cmdIndex];
            this.category.parent.style.display = "block";
            this.dontsave = false;
        });
    }
    onchange() {
        if (!this.dontsave) {
            //先获取再保存
            $D("Save panel setting：");
            $D(this.category.setting);
            LStorage.get(this.cmdType).then(r => {
                r[this.cmdType][this.cmdIndex] = this.setting;
                LStorage.set(r);
            });
        }
    }

    set setting(data) {
        this.category.setting = data;
        this.category.$E(".panel-icon").value = data["icon"];
        this.category.$E(".panel-tips").value = data["panel_tips"];
    }

    get setting() {
        const data = this.category.setting;
        data["icon"] = this.category.$E(".panel-icon").value;
        data["panel_tips"] = this.category.$E(".panel-tips").value;
        return data;
    }
}


class downloadWrapper {
    constructor() {
        const dirCount = 8;
        this.directories = null;
        LStorage.get("downloadDirectories").then(res => {
            this.directories = res["downloadDirectories"];
            const tab = document.querySelector("#tab-download");

            eventUtil.attachEventS("#showDefaultDownloadDirectory", () => {
                browser.downloads.showDefaultFolder();
            })
            eventUtil.attachEventS("#savebtnOnDownloadDirectories", () => {
                document.querySelectorAll(".directory-entry>:nth-child(2)").forEach((el, index) => {
                    this.directories[index] = el.value;
                });
                LStorage.set({
                    "downloadDirectories": this.directories
                });
                // e.target.setAttribute("disabled", "true");
            })
            const node = document.importNode(document.querySelector("#template-for-directory-entry").content, true);
            const entry = node.querySelector(".directory-entry");

            for (let i = 0; i < dirCount; i++) {
                const cloned = entry.cloneNode(true);
                cloned.querySelector("input:nth-child(1)").value = browser.i18n.getMessage("DownloadDirectory", i);
                cloned.querySelector("input:nth-child(2)").value = this.directories[i] || "";
                tab.appendChild(cloned);
            }

            const cloned = entry.cloneNode(true);
            cloned.firstElementChild.value = getI18nMessage("elem_CustomDirectory");
            cloned.lastElementChild.remove();
            const codearea = document.createElement("textarea");
            codearea.id = ""
            codearea.value = this.directories[8];
            cloned.appendChild(codearea);
            tab.appendChild(cloned);
        });
    }
    onChange() {
        $E("#SavebtnOnDownloadDirectories").removeAttribute("disabled");
    }
    onSaveBtnClick() {
        // const index = event.target.getAttribute("index");
        // this.directories[index] = event.target.previousElementSibling.value;
        // config.set("downloadDirectories", this.directories);
    }
}

class styleWrapper {
    constructor() {
        let tab = document.querySelector("#tab-style");

        let styleArea = tab.querySelector("#styleContent");
        LStorage.get("style").then(res => {
            let style = res.style;
            if (style.length === 0) {
                let styleURL = browser.runtime.getURL("/content_scripts/content_script.css");
                fetch(styleURL).then(
                    response => response.text()
                ).then(text => styleArea.value = text);
            }
            else {
                styleArea.value = style;
            }

            eventUtil.attachEventS("#saveStyle", () => {
                LStorage.set({
                    "style": styleArea.value
                }).then(() => {
                    document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveDone');
                    setTimeout(() => {
                        document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveStyle');
                    }, 2000);
                })
            })
        });

        tab.querySelector("#style-selector").addEventListener("change", event => {
            let styleURL = browser.runtime.getURL("/options/custom_style/" + event.target.value);
            fetch(styleURL).then(
                response => response.text()
            ).then(text => styleArea.value = text);
        });
    }
}

class TranslatorWrapper {
    constructor() {
        let tab = document.querySelector("#tab-translator");

        const btn = tab.querySelector("#updateBaiduData");
        btn.addEventListener("click", ({ target }) => {
            fetch(TranslatorService.baidu.host, { credentials: "same-origin" })
                .then(res => res.text()).then(async html => {
                    const [gtk, token] = TranslatorService.baidu.getTokenAndGtk(html);

                    if (gtk !== "" && token !== "") {
                        const obj = await LStorage.get("translator");
                        obj["translator"].baidu_gtk = gtk;
                        obj["translator"].baidu_token = token
                        await LStorage.set(obj);
                        return Promise.resolve();
                    }
                    else {
                        return Promise.resolve("token or gtk is empty");
                    }
                }).then(() => {
                    target.nextElementSibling.textContent = getI18nMessage("elem_UpdateBaiduSuccess");
                }).catch(e => {
                    target.nextElementSibling.textContent = "Update Error.";
                    console.error(e);
                });
        })
    }
}

class ExcludedRulesWrapper {
    constructor() {
        LStorage.get("exclusionRules").then(res => {
            $E("#exclusionRules").value = res["exclusionRules"].join("\n");
        });
        $E("#exclusionRules").addEventListener("change", e => {
            const list = e.target.value.trim().split("\n").filter(val => val.length !== 0)
            $E("#exclusionRules").value = list.join("\n");
            LStorage.set({ exclusionRules: list })
        })
        $E("#patterns-test").addEventListener("click", async () => {
            const url = $E("#patterns-url-input").value;
            const regexps = (await LStorage.get("exclusionRules"))["exclusionRules"]
            let msg = "No Match";
            for (const t of regexps) {
                try {
                    const r = new RegExp(t)
                    if (r.exec(url)) {
                        msg = t;
                        break;
                    }
                } catch (error) {
                    msg = t;
                    msg += "\n" + error
                    break;
                }
            }
            $E("#patterns-test-result").textContent = msg;
        })
    }
}



function initTabs() {


    new ActionsWrapper();
    new NewActionsWrapper();

    new EngineWrapper();
    new generalSettingWrapper();
    new downloadWrapper();
    new styleWrapper();
    new PanelWrapper();
    new TranslatorWrapper();
    new ExcludedRulesWrapper();

    doI18n();

    $E("#tabs nav").addEventListener("click", event => {
        if (event.target.nodeName !== "A") return;
        $E(".nav-active").classList.remove("nav-active");
        event.target.classList.add("nav-active");
    });

    window.addEventListener('hashchange', () => {
        if (!location.hash) return;
        for (const el of $A(".active")) {
            el.classList.remove("active");
        }
        $E(location.hash).classList.add("active");
        $E(location.hash).dispatchEvent(new Event("tabshow"));
    })
    if (location.hash) {
        // 保证 hashchange 触发
        const hash = location.hash
        location.hash = '';
        location.hash = hash;
    }
    else {
        location.hash = '#tab-actions';
    }
}

function initButtons() {
    const fileReader = new FileReader();

    eventUtil.attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    eventUtil.attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");
    fileReader.addEventListener("loadend", async () => {
        try {
            const storage = JSON.parse(fileReader.result);
            await LStorage.clear();
            await LStorage.set(storage);
            location.reload();
        }
        catch (e) {
            const msg = "An error occured, please check backup file";
            console.error(msg, e);
            alert(msg);
        }
    });
    eventUtil.attachEventS("#backup", async () => {
        const storage = await (LStorage.get());
        const blob = new Blob([JSON.stringify(storage, null, 2)]);
        const url = URL.createObjectURL(blob);
        const date = new Date();

        browser.downloads.download({
            url: url,
            filename: `GlitterDrag-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });
        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1000 * 60 * 5);
    });

    eventUtil.attachEventS("#default", async () => {
        await LStorage.clear();
        await LStorage.set(DEFAULT_CONFIG);
        location.reload();
    });
    eventUtil.attachEventS("#sanitize", async () => {
        const all = await (browser.storage.local.get());
        const removed = Object.keys(all).filter((x) => x in DEFAULT_CONFIG === false);

        if (removed.length !== 0) {
            await LStorage.remove(removed);
            $D(removed.toString() + " were removed from storage");
        }
    })
}
var browserMajorVersion = 52;
browser.runtime.getBrowserInfo().then(async info => {
    browserMajorVersion = info.version.split(".")[0];
    $D("Browser Info:", info);
    browserMajorVersion = parseInt(browserMajorVersion);



    if (browserMajorVersion >= 63) {
        const browserEngines = await browser.search.get();
        const browserEnginesObject = {};
        for (const obj of browserEngines) {
            browserEnginesObject[obj.name] = "about:blank";//TODO: remove
        }
        ENGINES.unshift(Object.assign({ groupName: "Browser" }, browserEnginesObject));
    }

    initButtons();
    initTabs();
});