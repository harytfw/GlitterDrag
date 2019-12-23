"use strict"

class ActinoConfiguration extends HTMLElement {
    constructor() {
        super()

        const template = document.querySelector("#template-action-config")
        const content = template.content
        this.appendChild(content.cloneNode(true))

        for (const dropdown of this.querySelectorAll(".dropdown")) {
            initBulmaDropdown(dropdown)
        }

        this.editor = this.querySelector("search-engine-editor-modal")

        this.addEventListener("click", (e) => {
            const { target } = e
            if (target instanceof HTMLElement) {
                if (target.dataset.event === "editSearchEngine") {
                    this.editor.active()
                    this.listenEditorResult()
                }
            }
        })

        this.addEventListener("change", (e) => {
            const { target } = e

            if (target instanceof HTMLElement) {
                switch (target.name) {
                    case "originalGroupName":
                        console.log(target, "originalGroupName change")
                        break
                    case "hotkey":
                    case "groupName":
                    case "limitation":
                        this.toggleDisplay()
                        this.saveActionProperty()
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }))
                        break
                    case "actionType":
                    case "direction":
                        this.loadDetail()
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }))
                        break
                    default:
                        console.log(target, "normal change")
                        this.saveDetail()
                        target.dispatchEvent(new Event("configupdate", { bubbles: true }))
                        break
                }

            }
        })

        this.configManager = null

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.initGroupNameDropdown()
            this.initHotkey()
            this.loadDetail()
        }, { once: true })
    }

    get originalGroupName() {
        return this.querySelector("[name=originalGroupName]").value
    }

    get groupName() {
        return this.querySelector("[name=groupName]").value
    }

    get actionType() {
        return this.querySelector("[name=actionType]:checked").value
    }

    get direction() {
        return this.querySelector("[name=direction]:checked").value
    }

    get permitDirection() {
        return this.querySelector("[name=limitation]").value
    }

    toggleDisplay() {
        const normalDirection = this.querySelector(".normal-direction")
        const diagonal = this.querySelector(".diagonal-direction")
        switch (this.permitDirection) {
            case "four":
                normalDirection.classList.remove("is-hidden")
                diagonal.classList.add("is-hidden")
                break
            case "l":
            case "r":
                normalDirection.classList.add("is-hidden")
                diagonal.classList.remove("is-hidden")
                break
            case "all":
            default:
                normalDirection.classList.remove("is-hidden")
                diagonal.classList.remove("is-hidden")
                break
        }

    }

    initGroupNameDropdown() {
        const dropdown = this.querySelector(".dropdown.groupname-dropdown")

        const groupNames = this.configManager.get().actions.map(a => a.name)
        console.log("groupnames", groupNames)
        const items = []

        for (const name of groupNames) {
            items.push(`<a href="#" class="dropdown-item">${name}</a>`)
        }

        dropdown.querySelector(".dropdown-content").innerHTML = items.join("")

        this.querySelector("[name=groupName]").value = this.querySelector("[name=originalGroupName]").value = groupNames[0]
    }

    initHotkey() {
        const hotkey = this.querySelector("[name=hotkey]").value = this.configManager.getProxy().actions.find(this.originalGroupName).hotkey
        this.querySelector(".hotkey-btn").textContent = hotkey === "" ? "no hotkey" : hotkey
    }

    configurateHotkey() {

    }

    listenEditorResult() {
        this.editor.searchEngineName = this.querySelector(`[name='searchEngine.name']`).value
        this.editor.searchEngineURL = this.querySelector(`[name='searchEngine.url']`).value
        this.editor.searchEngineIcon = this.querySelector(`[name='searchEngine.icon']`).value
        this.editor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                console.log("get searchEngineEditor result")
                this.querySelector(`[name='searchEngine.name']`).value = this.editor.searchEngineName
                this.querySelector(`[name='searchEngine.url']`).value = this.editor.searchEngineURL
                this.querySelector(`[name='searchEngine.icon']`).value = this.editor.searchEngineIcon
                this.querySelector(`[name='searchEngine.builtin']`).checked = this.editor.searchEngineBuiltin

                this.saveDetail()
                this.dispatchEvent(new Event("configupdate", { bubbles: true }))
            }
        }, { once: true })
    }

    loadDetail() {
        const detail = this.configManager.getProxy().detail.find(this.groupName, this.actionType, this.direction)

        console.log(detail)
        this.querySelector(`[name=command][value=${detail.command || "open"}]`).checked = true

        this.querySelector(`[name=commandTarget][value=${detail.commandTarget || "link"}`).checked = true
        this.querySelector(`[name=tabPosition][value=${detail.tabPosition || "overrideCurrent"}]`).checked = true
        this.querySelector(`[name=activeTab]`).checked = detail.activeTab

        this.querySelector(`[name='searchEngine.name']`).value = detail.searchEngine.name
        this.querySelector(`[name='searchEngine.url']`).value = detail.searchEngine.url
        this.querySelector(`[name='searchEngine.icon']`).value = detail.searchEngine.icon
        this.querySelector(`[name='download.showSaveAsDialog']`).checked = detail.download.showSaveAsDialog
        this.querySelector(`[name='download.directoryName']`).value = detail.download.directoryName
        this.querySelector(`[name=scriptName]`).value = detail.scriptName
        this.querySelector(`[name=prompt]`).value = detail.prompt
    }

    collectDetail() {
        return {
            command: this.querySelector("[name=command]:checked").value,
            commandTarget: this.querySelector("[name=commandTarget]:checked").value,
            tabPosition: this.querySelector("[name=tabPosition]:checked").value,
            activeTab: this.querySelector("[name=activeTab]").checked,
            searchEngine: {
                name: this.querySelector("[name='searchEngine.name']").value,
                url: this.querySelector("[name='searchEngine.url']").value,
                icon: this.querySelector("[name='searchEngine.icon']").value,
                method: "get",
                searchOnSite: false,
                builtin: this.querySelector("[name='searchEngine.builtin']").checked
            },
            download: {
                showSaveAsDialog: this.querySelector("[name='download.showSaveAsDialog']").checked,
                directoryName: this.querySelector("[name='download.directoryName']").value,
            },
            scriptName: this.querySelector("[name='scriptName']").value,
            prompt: this.querySelector("[name='prompt']").value
        }
    }

    saveActionProperty() {
        console.log("save action property")
        this.configManager.getProxy().actions.update(this.originalGroupName, {
            limitation: this.querySelector("[name=limitation]").value,
            name: this.querySelector("[name=groupName]").value,
            hotkey: this.querySelector("[name=hotkey]").value
        })
        this.querySelector("[name=originalGroupName]").value = this.querySelector("[name=groupName]").value
    }

    saveDetail() {
        this.configManager.getProxy().detail.update(this.groupName, this.actionType, this.direction, this.collectDetail())

    }
}

customElements.define("custom-action-config", ActinoConfiguration)