
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
        const selectPrototype = document.createElement("select");
        const optPrototype = document.createElement("option");
        let isChineseUI = browser.i18n.getUILanguage().startsWith("zh");
        for (const groupName of searchEngines.keys()) {
            let select = selectPrototype.cloneNode();
            if (!isChineseUI && groupName === "Chinese") {
                continue;
            }
            let groupOpt = optPrototype.cloneNode();
            groupOpt.textContent = groupName;
            groupOpt.disabled = 1;

            if (groupName === "Image Search") {
                select.className = "imageSearchGroup1";
            }
            else if (groupName === "Image Search(via upload)") {
                select.className = "imageSearchGroup2";
            }

            select.appendChild(groupOpt);
            for (const engine of searchEngines.get(groupName)) {
                let opt = optPrototype.cloneNode();
                opt.textContent = engine.name;
                opt.value = engine.url ? engine.url : "";
                opt.setAttribute("favIconUrl".toLowerCase(), engine.favIconUrl ? engine.favIconUrl : "");
                select.appendChild(opt);
            }
            this.$E(".search-engine-select-group").appendChild(select);
            select.selectedIndex = 0;
        }
        this.$E(".search-engine-select-group").addEventListener("change", e => this.onEngineChange(e))
    }

    onEngineChange(e) {
        const el = e.target;
        const selectedOpt = el.children[el.selectedIndex]
        this.$E(".search-engine-name").value = selectedOpt.textContent;
        this.$E(".search-engine-url").value = selectedOpt.value;
        this.$E(".search-engine-icon").value = selectedOpt.getAttribute("favIconUrl".toLowerCase());
        if (el.children[0].textContent === "Browser") {
            this.$E(".search-engine-name").disabled = true;
            this.$E('.search-engine-url').style.display = 'none';
            this.$E(".search-engine-is-browser-search").value = true;
        }
        else {
            this.$E(".search-engine-name").disabled = false;
            this.$E('.search-engine-url').style.display = '';
            this.$E(".search-engine-is-browser-search").value = false;
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
                    hideTR(".search-text", ".search-onsite-yes", ".search-engine-select-group", ".search-engine-name");
                    hideRadios(".open-text", ".open-image");
                }
                else if (this.actionType === commons.imageAction) {
                    hideTR(".search-text", ".search-onsite-yes", ".search-engine-select-group", ".search-engine-name");
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
            is_browser_search: this.$E(".search-engine-is-browser-search").value === "true" ? true : false,
            download_directory: this.$E(".download-directory").value,
            tab_active: this.getRadioValue(".tab-active"),
            open_type: this.getRadioValue(".open-type"),
            search_type: this.getRadioValue(".search-type"),
            copy_type: this.getRadioValue(".copy-type"),
            download_type: this.getRadioValue(".download-type"),
            download_saveas: this.getRadioValue(".download-saveas"),
            search_onsite: this.getRadioValue(".search-onsite"),
        });
        this.checkActionChange(temp);
        this.applyDownloadDirTitle();
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
        this.$E(".search-engine-is-browser-search").value = data["is_browser_search"];
        if (data["is_browser_search"] === true) {
            this.$E(".search-engine-name").disabled = true;
            this.$E(".search-engine-url").style.display = 'none';
        }
        else {
            this.$E(".search-engine-name").disabled = false;
            this.$E(".search-engine-url").style.display = '';
        }
        this.checkActionChange(data);

        this.$E(".download-directory").value = data["download_directory"];
        this.applyDownloadDirTitle();

        this.$E(".action-name").dispatchEvent(new Event("change"));
    }


    checkActionChange(data) {
        if (this.actionType === commons.imageAction && data["act_name"] === commons.ACT_SEARCH) {
            if (data["search_type"] === commons.SEARCH_IMAGE) {
                this.$E(".imageSearchGroup1").style.display = "none";
                this.$E(".imageSearchGroup2").style.display = "";
            }
            else if (data["search_type"] === commons.SEARCH_LINK) {
                this.$E(".imageSearchGroup1").style.display = "";
                this.$E(".imageSearchGroup2").style.display = "none";
            }
        }
        else {
            this.$E(".imageSearchGroup1").style.display = "none";
            this.$E(".imageSearchGroup2").style.display = "none";
        }
    }

    async applyDownloadDirTitle() {
        const dirs = (await browserStorage.get("downloadDirectories"))["downloadDirectories"];
        const els = this.parent.querySelectorAll(".download-directory option");
        for (const el of els) {
            el.title = i18nUtil.getI18n("option_tooltip_path_prefix", dirs[parseInt(el.value)]);
        }
        const select = this.$E("select.download-directory");
        select.title = i18nUtil.getI18n("option_tooltip_path_prefix", dirs[parseInt(select.value)]);
    }
}

// eslint-disable-next-line no-unused-vars
class NewActionsWrapper {
    constructor() {
        this.parent = $E("#new-actions-container");
        this.category = new ActionsView(this.parent, () => {
            return this.actionType;
        });

        this.parent.addEventListener("change", async () => {
            let res = (await browserStorage.get(this.actionsKeyName));
            res[this.actionsKeyName][this.actionType][this.direction] = this.category.setting;
            res[this.controlKeyName] = (await browserStorage.get(this.controlKeyName))[this.controlKeyName];
            res[this.controlKeyName][this.actionType] = this.kindOfControl;
            await browserStorage.set(res);
            $D(res);
        })

        $E("#type-category").addEventListener("click", async (e) => {
            let sel = $E(".category-item-selected", e.target.parentElement);
            sel.classList.remove("category-item-selected");
            e.target.classList.add("category-item-selected");
            $E(".direction-control").value = (await browserStorage.get(this.controlKeyName))[this.controlKeyName][this.actionType];
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

            const setting = (await browserStorage.get(this.actionsKeyName))[this.actionsKeyName][this.actionType][this.direction];
            this.category.setting = setting;
            $D(setting);
        });
        $E(".direction-control", this.parent).addEventListener("change", async (e) => {
            const cfg = await browserStorage.get(this.controlKeyName);
            cfg[this.controlKeyName][this.actionType] = e.target.value;
            await browserStorage.set(cfg);
            this.onDirectionControlChange(e)
            $E("#direction-category div:not(.category-item-disabled)", this.parent).click();
        });

        $E("#tab-new-actions").addEventListener("tabshow", e => {
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