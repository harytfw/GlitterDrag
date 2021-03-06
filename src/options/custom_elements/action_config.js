import * as logUtil from '../../utils/log'
import * as env from '../../utils/env'
import * as i18nUtil from '../../utils/i18n'
import * as queryUtil from '../../utils/query'
const GRIDS_MAPPING = {
    "grids_3x3": ".grids-3x3",
    "grids_4x4": ".grids-4x4"
};
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
                        this.listenSearchEngineEditorResult();
                        break;
                    case "loadDefaultScript":
                        this.loadDefaultScript();
                        break;
                    default:
                        break;
                }
            }
        });

        this.addEventListener("change", (e) => {
            const {
                target
            } = e;
            if (target instanceof HTMLElement) {
                switch (target.name) {
                    case "currentGroupName":
                        // loadDetail 依赖 方向限制
                        this.updateLimitationStatus();
                        this.loadDetail();
                        this.updateFieldStatus();
                        break;
                    case "limitation":
                        this.saveActionProperty();
                        this.updateLimitationStatus();
                        this.loadDetail();
                        this.updateFieldStatus();
                        this.configManager.emitUpdate(target)
                        break;
                    case "actionType":
                        this.loadDetail();
                        this.updateFieldStatus();
                        break;
                    case "direction":
                        this.loadDetail();
                        this.updateFieldStatus();
                        break;
                    case "command":
                        this.updateFieldStatus();
                        this.saveDetail();
                        this.configManager.emitUpdate(target)
                        break;
                    case "activeTab":
                    case "tabPosition":
                    case "commandTarget":
                    case "prompt":
                    case "download.directory":
                    case "download.showSaveAsDialog":
                    case "script":
                        this.saveDetail();
                        this.configManager.emitUpdate(target)
                        break;
                    default:
                        logUtil.log("unhandled change", target);
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
            this.updateFieldStatus();
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

        for (const selector of Object.values(GRIDS_MAPPING)) {
            this.querySelector(selector).classList.add("is-hidden");
        }

        if (Object.keys(GRIDS_MAPPING).includes(limitation)) {
            for (const div of this.querySelectorAll(".normal-direction,.diagonal-direction")) {
                div.classList.add("is-hidden");
            }
            this.querySelector(GRIDS_MAPPING[limitation]).classList.remove("is-hidden");
            this.querySelector(GRIDS_MAPPING[limitation]).querySelector("[name=direction]").checked = true;
        }
        else {

            for (const div of this.querySelectorAll(".normal-direction,.diagonal-direction")) {
                div.classList.remove("is-hidden");
            }

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
    }

    updateFieldStatus() {
        const actionType = this.actionType;
        for (const opt of this.querySelectorAll("[data-target-action-type]")) {
            const permitTable = opt.dataset.targetActionType.split(",").map(a => a.trim());
            opt.disabled = !permitTable.includes(actionType);
        }

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
        logUtil.log("listen group modal close");
        this.groupModal.addEventListener("close", () => {
            this.updateGroups();
        }, {
            once: true
        });
        this.groupModal.active();
    }

    listenSearchEngineEditorResult() {
        this.searchEngineEditor.active(
            this.querySelector(`[name='searchEngine.name']`).value,
            this.querySelector(`[name='searchEngine.url']`).value,
            this.querySelector(`[name='searchEngine.icon']`).value,
            this.querySelector(`[name='searchEngine.builtin']`).checked,
            this.querySelector(`[name='searchEngine.method']`).value,
        );

        this.searchEngineEditor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                logUtil.log("get searchEngineEditor result");
                this.querySelector(`[name='searchEngine.name']`).value = this.searchEngineEditor.searchEngineName;
                this.querySelector(`[name='searchEngine.url']`).value = this.searchEngineEditor.searchEngineURL;
                this.updateSearchEngineHelpIcon();

                this.querySelector(`[name='searchEngine.icon']`).value = this.searchEngineEditor.searchEngineIcon;
                this.querySelector(`[name='searchEngine.method']`).value = this.searchEngineEditor.searchEngineMethod;

                this.querySelector(`[name='searchEngine.builtin']`).checked = this.searchEngineEditor.searchEngineBuiltin;

                let previewContent;
                if (this.searchEngineEditor.searchEngineBuiltin) {
                    previewContent = "";
                }
                else {
                    previewContent = this.searchEngineEditor.searchEngineURL;
                }
                this.querySelector(`.searchEngineURLPreview`).textContent = previewContent;

                this.saveDetail();
                this.configManager.emitUpdate(this);
            }
        }, {
            once: true
        });
    }

    updateGroups() {
        logUtil.log("update group dropdown");
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
        const detail = this.configManager.getProxy().details.find(this.currentGroupName, this.actionType, this.direction);

        logUtil.log("try load detail", detail);
        if (!detail) {
            console.error("detail is null");
            return;
        }

        this.querySelector(`[name=command]`).value = detail.command;

        this.querySelector(`[name=commandTarget][value=${detail.commandTarget || "link"}`).checked = true;
        this.querySelector(`[name=tabPosition]`).value = detail.tabPosition;

        this.querySelector(`[name='searchEngine.name']`).value = detail.searchEngine.name;
        this.querySelector(`[name='searchEngine.url']`).value = detail.searchEngine.url;

        this.updateSearchEngineHelpIcon();

        this.querySelector(`[name='searchEngine.icon']`).value = detail.searchEngine.icon;
        this.querySelector(`[name='searchEngine.method']`).value = detail.searchEngine.method;
        this.querySelector(`[name='download.directory']`).value = detail.download.directory;
        this.querySelector(`[name=script]`).value = detail.script;
        this.querySelector(`[name=prompt]`).value = detail.prompt;

        this.querySelector(`[name=activeTab]`).checked = detail.activeTab;
        this.querySelector(`[name='searchEngine.builtin']`).checked = detail.searchEngine.builtin;
        this.querySelector(`[name='download.showSaveAsDialog']`).checked = detail.download.showSaveAsDialog;

        let previewContent;
        if (detail.searchEngine.builtin) {
            previewContent = "";
        }
        else {
            previewContent = detail.searchEngine.url;
        }
        this.querySelector(`.searchEngineURLPreview`).textContent = previewContent;



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
        logUtil.log("save action property");
        this.configManager.getProxy().actions.update(this.currentGroupName, {
            limitation: this.permitedDirections,
        });
    }

    saveDetail() {
        logUtil.log("save detail");
        this.configManager.getProxy().details.update(this.currentGroupName, this.actionType, this.direction, this.collectDetail());
    }

    updateSearchEngineHelpIcon() {
        if (env.isFirefox) {
            return;
        }
        const url = this.querySelector("[name='searchEngine.url']").value;
        const icon = this.querySelector(".search-engine-help-icon");
        const command = this.querySelector("[name=command]").value;
        if (command === "search" && url === "") {
            icon.classList.replace("has-text-grey-light", "has-text-warning");
        }
        else {
            icon.classList.replace("has-text-warning", "has-text-grey-light");
        }
    }

    async loadDefaultScript() {
        const res = await fetch(browser.runtime.getURL("options/example_content_script.js"));
        const script = await res.text();
        const textarea = this.querySelector("[name=script]");
        textarea.value = script;
        textarea.dispatchEvent(new Event("change", {
            bubbles: true
        }));
    }
}

customElements.define("custom-action-config", ActinoConfiguration);
