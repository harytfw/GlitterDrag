class SearchEngineEditorModal extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector("#template-search-engine-editor-modal");
        const content = template.content;
        this.appendChild(content.cloneNode(true));

        if (browser.i18n.getUILanguage().startsWith("zh")) {
            this.querySelector("[groupname=Chinese]").classList.remove("is-hidden");
        }

        this.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target);
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "close":
                        this.close();
                        break;
                    case "confirm":
                        this.confirm();
                        break;
                }
            }
        });

        this.addEventListener("provideritemselect", (e) => {
            const { name, url, icon, builtin, method, searchOnSite } = e.detail;
            this.searchEngineURL = builtin ? i18nUtil.getI18n("searchEngineURLNotAvailable") : url;
            this.searchEngineName = name;
            this.searchEngineBuiltin = builtin;
            this.searchEngineMethod = method;
            this.searchEngineIcon = icon;
        });
        this.addEventListener("change", (e) => {
            const { target } = e;
            if (target.name === "searchEngineIcon") {
                this.updatePreview();
            } else if (target.name === "iconInput") {
                this.processIconInput();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && this.isActive) {
                this.close();
            }
        });

        queryUtil.removeElementsByVender(this);
        i18nUtil.render(this);
    }

    _dispatch(resultType) {
        consoleUtil.log(this, `dispatch result event with type:${resultType}`);
        this.dispatchEvent(new CustomEvent("result", {
            detail: resultType,
            bubbles: true,
        }));
    }

    get modalTitle() {
        this.querySelector(".modal-card-title").textContent;
    }

    set modalTitle(value) {
        this.querySelector(".modal-card-title").textContent = value;
    }

    get searchEngineName() {
        return this.querySelector("[name=searchEngineName]").value;
    }

    set searchEngineName(value) {
        return this.querySelector("[name=searchEngineName]").value = value;
    }

    get searchEngineURL() {
        if (!this.searchEngineBuiltin) {
            return this.querySelector("[name=searchEngineURL]").value;
        }
        return "__protected__";
    }

    set searchEngineURL(value) {
        return this.querySelector("[name=searchEngineURL]").value = value;
    }

    get searchEngineIcon() {
        return this.querySelector("[name=searchEngineIcon]").value;
    }

    set searchEngineIcon(value) {
        this.querySelector("[name=searchEngineIcon]").value = value;
        this.updatePreview();
        return value;
    }

    get searchEngineBuiltin() {
        return this.querySelector("[name=searchEngineBuiltin]").checked;
    }

    set searchEngineBuiltin(value) {
        const urlInput = this.querySelector("[name=searchEngineURL]");
        urlInput.disabled = value ? "disabled" : "";
        return this.querySelector("[name=searchEngineBuiltin]").checked = value;
    }

    get searchEngineMethod() {
        return this.querySelector("[name=searchEngineMethod]").value;
    }

    set searchEngineMethod(value) {
        return this.querySelector("[name=searchEngineMethod]").value = value;
    }

    get searchEngine() {
        return {
            name: this.searchEngineName,
            url: this.searchEngineURL,
            icon: this.searchEngineIcon,
        };
    }

    get isActive() {
        return this.querySelector(".modal").classList.contains("is-active");
    }

    active(name, url, icon, builtin, method) {
        consoleUtil.log(this, "active");

        this.querySelector(".modal").classList.add("is-active");

        this.searchEngineBuiltin = builtin;

        this.searchEngineName = name;

        if (builtin) {
            this.searchEngineURL = i18nUtil.getI18n("searchEngineURLNotAvailable");
        } else {
            this.searchEngineURL = url;
        }

        this.searchEngineIcon = icon;

        this.querySelector("[name=searchEngineName]").focus();
    }

    close() {
        consoleUtil.log(this, "close");
        this._dispatch("close");
        this.querySelector(".modal").classList.remove("is-active");
    }

    confirm() {
        consoleUtil.log(this, "confirm");
        this._dispatch("confirm");
        this.querySelector(".modal").classList.remove("is-active");
    }

    updatePreview() {
        this.querySelector(".preview").src = this.searchEngineIcon;
    }

    processIconInput() {
        const file = this.querySelector("[name=iconInput]").files[0];
        if (!file) {
            console.error("no file");
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            consoleUtil.log("read file end");
            this.searchEngineIcon = reader.result;
        };
        reader.onerror = (err) => {
            console.error(err);
        };
        consoleUtil.log("start read file");
        reader.readAsDataURL(file);
    }
}

customElements.define("search-engine-editor-modal", SearchEngineEditorModal);