"use strict";

class ActinoConfiguration extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector("#template-action-config");
        const content = template.content;
        this.appendChild(content.cloneNode(true));

        this.searchEngineEditor = document.querySelector("#action-detail-search-engine-editor");
        this.groupModal = document.querySelector("action-group-modal");

        this.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target);
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "manage":
                        this.listenGroupModalClose();
                        break;
                    case "editSearchEngine":
                        this.searchEngineEditor.active();
                        this.listenSearchEngineEditorResult();
                        break;
                    default: break;
                }
            }
        });

        this.addEventListener("change", (e) => {
            const { target } = e;
            if (target instanceof HTMLElement) {
                switch (target.name) {
                    case "currentGroupName":
                        // loadDetail 依赖 方向限制
                        this.updateLimitationStatus();
                        this.loadDetail();
                        this.updateCommandPermitStatus();
                        break;
                    case "limitation":
                        this.saveActionProperty();
                        this.updateLimitationStatus();
                        this.loadDetail();
                        this.updateCommandPermitStatus();
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }));
                        break;
                    case "actionType":
                    case "direction":
                        this.loadDetail();
                        this.updateCommandPermitStatus();
                        // target.dispatchEvent(new Event("configupdate", { bubbles: true }))
                        break;
                    case "command":
                        this.updateCommandPermitStatus();
                        this.saveDetail();
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }));
                        break;
                    case "activeTab":
                    case "tabPosition":
                    case "commandTarget":
                    case "prompt":
                    case "download.directory":
                    case "download.showSaveAsDialog":
                        this.saveDetail();
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }));
                        break;
                    default:
                        console.log("unhandled change", target);
                        break;
                }
            }
        });

        this.configManager = null;

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target;
            this.updateGroups();
            this.updateLimitationStatus();
            this.loadDetail();
            this.updateCommandPermitStatus();
            queryUtil.removeElementsByVender(this);
            i18nUtil.render(this);
        });
    }

    get currentGroupName() {
        return this.querySelector("[name=currentGroupName]").value;
    }

    get actionType() {
        return this.querySelector("[name=actionType]:checked").value;
    }

    get direction() {
        return this.querySelector("[name=direction]:checked").value;
    }

    get permitedDirections() {
        return this.querySelector("[name=limitation]").value;
    }

    updateLimitationStatus() {
        const limitation = this.permitedDirections;

        for (const input of this.querySelectorAll("[data-permit]")) {
            const permitTable = input.dataset.permit.split(",").map(a => a.trim());
            input.disabled = !permitTable.includes(limitation);
        }

        for (const input of this.querySelectorAll("[name=direction]")) {
            if (!input.disabled) {
                input.checked = true;
                break;
            }
        }
    }

    updateCommandPermitStatus() {
        const command = this.querySelector("[name=command]").value;
        for (const input of this.querySelectorAll("[data-command-permit]")) {
            const permitTable = input.dataset.commandPermit.split(",").map(a => a.trim());
            input.disabled = !permitTable.includes(command);
        }
    }

    applyLoadingAnimation() {
        // const a = this.querySelector(".action-detail")
        // a.style.opacity = .2
        // setTimeout(() => {
        //     if (parseInt(a.style.opacity) === 0) {
        //         a.style.opacity = 1
        //     }
        // }, 300)
    }

    listenGroupModalClose() {
        console.log("listen group modal close");
        this.groupModal.addEventListener("close", () => {
            this.updateGroups();
        }, { once: true });
        this.groupModal.active();
    }

    listenSearchEngineEditorResult() {
        this.searchEngineEditor.searchEngineName = this.querySelector(`[name='searchEngine.name']`).value;
        this.searchEngineEditor.searchEngineURL = this.querySelector(`[name='searchEngine.url']`).value;
        this.searchEngineEditor.searchEngineIcon = this.querySelector(`[name='searchEngine.icon']`).value;
        this.searchEngineEditor.searchEngineMethod = this.querySelector(`[name='searchEngine.method']`).value;

        this.searchEngineEditor.searchEngineBuiltin = this.querySelector(`[name='searchEngine.builtin']`).checked;

        this.searchEngineEditor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                console.log("get searchEngineEditor result");
                this.querySelector(`[name='searchEngine.name']`).value = this.searchEngineEditor.searchEngineName;
                this.querySelector(`[name='searchEngine.url']`).value = this.searchEngineEditor.searchEngineURL;
                this.querySelector(`[name='searchEngine.icon']`).value = this.searchEngineEditor.searchEngineIcon;
                this.querySelector(`[name='searchEngine.method']`).value = this.searchEngineEditor.searchEngineMethod;

                this.querySelector(`[name='searchEngine.builtin']`).checked = this.searchEngineEditor.searchEngineBuiltin;

                this.querySelector(`.searchEngineURLPreview`).textContent = this.searchEngineEditor.searchEngineURL;

                this.saveDetail();
                this.dispatchEvent(new Event("configupdate", { bubbles: true }));
            }
        }, { once: true });
    }

    updateGroups() {
        console.log("update group dropdown");
        const dropdown = this.querySelector("#group-dropdown");
        const actions = this.configManager.get().actions;
        const pairs = actions.map(a => [a.name, a.name]);
        dropdown.overrideWithKeyValuePairs(pairs);
        if (actions.length === 0) {
            console.error("group options is empty");
            return;
        }

        dropdown.updateSelectedOptionByIndex(0);
        this.querySelector("[name=limitation]").value = actions[0].limitation;
    }

    loadDetail() {
        const detail = this.configManager.getProxy().detail.find(this.currentGroupName, this.actionType, this.direction);

        console.log("try load detail", detail);
        if (!detail) {
            console.error("detail is null");
            return;
        }

        this.querySelector(`[name=command]`).value = detail.command;

        this.querySelector(`[name=commandTarget][value=${detail.commandTarget || "link"}`).checked = true;
        this.querySelector(`[name=tabPosition]`).value = detail.tabPosition;

        this.querySelector(`[name='searchEngine.name']`).value = detail.searchEngine.name;
        this.querySelector(`[name='searchEngine.url']`).value = detail.searchEngine.url;
        this.querySelector(`[name='searchEngine.icon']`).value = detail.searchEngine.icon;
        this.querySelector(`[name='searchEngine.method']`).value = detail.searchEngine.method;
        this.querySelector(`[name='download.directory']`).value = detail.download.directory;
        this.querySelector(`[name=script]`).value = detail.script;
        this.querySelector(`[name=prompt]`).value = detail.prompt;

        this.querySelector(`[name=activeTab]`).checked = detail.activeTab;
        this.querySelector(`[name='searchEngine.builtin']`).checked = detail.searchEngine.builtin;
        this.querySelector(`[name='download.showSaveAsDialog']`).checked = detail.download.showSaveAsDialog;

        this.querySelector(`.searchEngineURLPreview`).textContent = detail.searchEngine.url;

    }

    collectDetail() {
        return {
            command: this.querySelector("[name=command]").value,
            commandTarget: this.querySelector("[name=commandTarget]:checked").value,
            tabPosition: this.querySelector("[name=tabPosition]").value,
            activeTab: this.querySelector("[name=activeTab]").checked,
            searchEngine: {
                name: this.querySelector("[name='searchEngine.name']").value,
                url: this.querySelector("[name='searchEngine.url']").value,
                icon: this.querySelector("[name='searchEngine.icon']").value,
                method: "get",
                searchOnSite: false,
                builtin: this.querySelector("[name='searchEngine.builtin']").checked,
            },
            download: {
                showSaveAsDialog: this.querySelector("[name='download.showSaveAsDialog']").checked,
                directory: this.querySelector("[name='download.directory']").value,
            },
            script: this.querySelector("[name='script']").value,
            prompt: this.querySelector("[name='prompt']").value,
        };
    }

    saveActionProperty() {
        console.log("save action property");
        this.configManager.getProxy().actions.update(this.currentGroupName, {
            limitation: this.permitedDirections,
        });
    }

    saveDetail() {
        console.log("save detail");
        this.configManager.getProxy().detail.update(this.currentGroupName, this.actionType, this.direction, this.collectDetail());
    }
}

customElements.define("custom-action-config", ActinoConfiguration);