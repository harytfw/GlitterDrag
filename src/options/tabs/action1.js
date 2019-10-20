// eslint-disable-next-line no-unused-vars
class ActionsWrapper {
    constructor(doc) {
        this.doc = doc;
        this.parent = $E("#tab-actions");

        this.template4Direction = $E("#template-for-single-direction")
        this.template4Type = $E("#template-for-single-action-type")
        this.template4Container = $E("#template-for-actions-container")

        this.fillContent();
        this.parent.addEventListener("tabshow", () => {
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
        // this.parent.addEventListener("updateengines", e => this.onupdate(e));
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
            const cfg = await browserStorage.get(this.controlKeyName);
            cfg[this.controlKeyName][e.target.parentElement.parentElement.parentElement.className] = e.target.value;
            await browserStorage.set(cfg);
            this.onDirectionControlChange(e);
        }
        else if (e.target.className.indexOf("Actions") >= 0) {
            await this.updateEngine();
            this.setting = (await browserStorage.get([this.actionsKeyName]))[this.actionsKeyName];
            for (const x of $A(".act-name", this.parent)) {
                this.onActionBehaviorChange({
                    target: x
                });
            }
            const cfg = await browserStorage.get(this.controlKeyName);
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
            browserStorage.get(key).then(res => {
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
                browserStorage.set(res);
            });
        }
        await this.applyDownloadDirTitle();
        await this.applySearchTitle();
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
            elem.setAttribute("url", "unknown");
            elem.setAttribute("is-browser-search", true);
            browserGroup.appendChild(elem);
        }
        if (browserEngines.length == 0) {
            browserGroup.style.display = "none";
        }
        // builtin
        const userEngines = (await browserStorage.get("Engines"))["Engines"];
        const userAddingGroup = document.createElement("optgroup");
        userAddingGroup.label = "Your addition";
        if (userEngines.length === 0) {
            userAddingGroup.style.display = 'none';
        } else {
            for (const obj of userEngines) {
                const elem = document.createElement("option");
                elem.value = obj.name;
                elem.textContent = obj.name;
                elem.title = obj.url;
                elem.setAttribute("url", obj.url);
                elem.setAttribute("is-browser-search", false);
                userAddingGroup.appendChild(elem);
            }
        }

        // via get
        if (imageSearchGroup1 === null) {
            const imageEngines = searchEngines.get("Image Search");
            imageSearchGroup1 = document.createElement("optgroup");
            imageSearchGroup1.className = 'imageSearchGroup1';
            imageSearchGroup1.label = "Normal";
            for (const engine of imageEngines) {
                const elem = document.createElement("option");
                elem.value = engine.name;
                elem.textContent = engine.name;
                elem.title = engine.name;
                elem.setAttribute("url", engine.url);
                elem.setAttribute("is-browser-search", engine.isBrowserSearch);
                imageSearchGroup1.appendChild(elem);
            }
        }


        // via upload
        if (imageSearchGroup2 === null) {
            const imageEngines2 = searchEngines.get("Image Search(via upload)");
            imageSearchGroup2 = document.createElement("optgroup");
            imageSearchGroup2.className = "imageSearchGroup2";
            imageSearchGroup2.label = "Via upload";
            for (const engine of imageEngines2) {
                const elem = document.createElement("option");
                elem.value = engine.name;
                elem.textContent = engine.name;
                elem.title = engine.name;
                elem.setAttribute("url", engine.url);
                elem.setAttribute("is-browser-search", engine.isBrowserSearch);
                imageSearchGroup2.appendChild(elem);
            }
        }

        for (const selectElem of $A(".engine-name", this.parent)) {
            while (selectElem.firstElementChild) {
                selectElem.firstElementChild.remove();
            }

            if (selectElem.parentElement.parentElement.parentElement.className === commons.imageAction) {
                selectElem.appendChild(imageSearchGroup1.cloneNode(true));
                selectElem.appendChild(imageSearchGroup2.cloneNode(true));
                $H([
                    "optgroup[label='Browser']",
                    "option[value='默认'][is-browser-search='true']"
                ], "none", selectElem);
            }
            else {
                selectElem.appendChild(browserGroup.cloneNode(true));
                selectElem.appendChild(userAddingGroup.cloneNode(true));
            }
        }
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
                if (kind === commons.imageAction) {
                    if (action["search_type"] === commons.SEARCH_IMAGE) {
                        $E(".imageSearchGroup1", context).style.display = "none";
                        $E(".imageSearchGroup2", context).style.display = "";
                    }
                    else if (action["search_type"] === commons.SEARCH_LINK) {
                        $E(".imageSearchGroup1", context).style.display = "";
                        $E(".imageSearchGroup2", context).style.display = "none";
                    }
                }

                $E(".download-type", context).value = action["download_type"];
                $E(".tab-pos", context).value = action["tab_pos"];
                $E(".download-directory", context).value = action["download_directory"];

                const engineSelector = $E(".engine-name", context);
                engineSelector.value = action["engine_name"];

                let opt = document.createElement("option")
                opt.textContent = getI18nMessage("defaultText");
                opt.value = getI18nMessage("defaultText");
                opt.setAttribute("url", "unknown");
                opt.setAttribute("is-browser-search", true);
                engineSelector.insertBefore(opt, engineSelector.firstElementChild);


                opt = document.createElement("option");
                opt.textContent = getI18nMessage("currentEngine", action["engine_name"]);
                opt.value = action["engine_name"];
                opt.title = action["engine_url"];
                opt.setAttribute("url", action["engine_url"]);
                opt.setAttribute("is-browser-search", action["is_browser_search"]);
                engineSelector.insertBefore(opt, engineSelector.firstElementChild);

                engineSelector.title = action["engine_url"];
                engineSelector.selectedIndex = 0;



            }
        }


    }

    async applyDownloadDirTitle() {
        const dirs = (await browserStorage.get("downloadDirectories"))["downloadDirectories"];
        const els = $A(".download-directory", this.parent);
        for (const el of els) {
            el.title = getI18nMessage("option_tooltip_path_prefix", dirs[parseInt(el.value)]);
        }
    }
    async applySearchTitle() {
        for (const el of $A(".engine-name", this.parent)) {
            const opt = el.selectedOptions[0];
            let title = "";
            if (opt.getAttribute("is-browser-search") === "true") title = getI18nMessage("search_name_tooltip");
            else title = el.selectedOptions[0].title;
            el.title = title;
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
