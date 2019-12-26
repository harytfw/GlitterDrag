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

        this.searchEngineEditor = document.querySelector("#action-detail-search-engine-editor")
        this.groupModal = document.querySelector("action-group-modal")

        this.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "manage":
                        this.groupModal.active()
                        break
                    case "editSearchEngine":
                        this.searchEngineEditor.active()
                        this.listenSearchEngineEditorResult()
                        break
                    default: break
                }
            }
        })

        this.addEventListener("change", (e) => {
            const { target } = e
            if (target instanceof HTMLElement) {
                switch (target.name) {
                    case "currentGroupName":
                        this.updateDisplayGroupName()
                        this.loadDetail()
                        break
                    case "shortcut":
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
                        console.log("unhandled change", target)
                        // this.saveDetail()
                        // target.dispatchEvent(new Event("configupdate", { bubbles: true }))
                        break
                }
            }
        })

        this.configManager = null

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.initGroupNameDropdown()
            this.initShortcut()
            this.loadDetail()
        }, { once: true })
    }

    get currentGroupName() {
        return "Default"
        return this.querySelector("[name=currentGroupName]").value
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
        // const dropdown = this.querySelector(".dropdown.groupname-dropdown")

        // const dropdownContent = dropdown.querySelector(".dropdown-content")

        // while (dropdownContent.firstElementChild instanceof HTMLElement) {
        //     dropdownContent.firstElementChild.remove()
        // }

        // const groupNames = this.configManager.get().actions.map(a => a.name)
        // console.log("groupnames", groupNames)
        // const items = []

        // for (const name of groupNames) {
        //     items.push(`<a class="dropdown-item" data-value="${name}">${name}</a>`)
        // }

        // dropdownContent.innerHTML = items.join("")

        // this.querySelector("[name=currentGroupName]").value = groupNames[0]
        // this.updateDisplayGroupName()

    }

    initShortcut() {
        // const shortcut = this.querySelector("[name=shortcut]").value = this.configManager.getProxy().actions.find(this.currentGroupName).shortcut
        // this.querySelector(".shortcut-btn").textContent = shortcut === "" ? "no shortcut" : shortcut
    }

    listenSearchEngineEditorResult() {
        this.searchEngineEditor.searchEngineName = this.querySelector(`[name='searchEngine.name']`).value
        this.searchEngineEditor.searchEngineURL = this.querySelector(`[name='searchEngine.url']`).value
        this.searchEngineEditor.searchEngineIcon = this.querySelector(`[name='searchEngine.icon']`).value
        this.searchEngineEditor.searchEngineMethod = this.querySelector(`[name='searchEngine.method']`).value

        this.searchEngineEditor.searchEngineBuiltin = this.querySelector(`[name='searchEngine.builtin']`).checked

        this.searchEngineEditor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                console.log("get searchEngineEditor result")
                this.querySelector(`[name='searchEngine.name']`).value = this.searchEngineEditor.searchEngineName
                this.querySelector(`[name='searchEngine.url']`).value = this.searchEngineEditor.searchEngineURL
                this.querySelector(`[name='searchEngine.icon']`).value = this.searchEngineEditor.searchEngineIcon
                this.querySelector(`[name='searchEngine.method']`).value = this.searchEngineEditor.searchEngineMethod

                this.querySelector(`[name='searchEngine.builtin']`).checked = this.searchEngineEditor.searchEngineBuiltin

                this.saveDetail()
                this.dispatchEvent(new Event("configupdate", { bubbles: true }))
            }
        }, { once: true })
    }

    updateDisplayGroupName() {
        this.querySelector(".group-name").textContent = this.currentGroupName
    }

    loadDetail() {
        const detail = this.configManager.getProxy().detail.find(this.currentGroupName, this.actionType, this.direction)

        console.log(detail)
        this.querySelector(`[name=command]`).value = detail.command

        this.querySelector(`[name=commandTarget][value=${detail.commandTarget || "link"}`).checked = true
        this.querySelector(`[name=tabPosition]`).value = detail.tabPosition
        this.querySelector(`[name=activeTab]`).checked = detail.activeTab

        this.querySelector(`[name='searchEngine.name']`).value = detail.searchEngine.name
        this.querySelector(`[name='searchEngine.url']`).value = detail.searchEngine.url
        this.querySelector(`[name='searchEngine.icon']`).value = detail.searchEngine.icon
        this.querySelector(`[name='searchEngine.builtin']`).value = detail.searchEngine.builtin
        this.querySelector(`[name='searchEngine.method']`).value = detail.searchEngine.method
        this.querySelector(`[name='download.showSaveAsDialog']`).checked = detail.download.showSaveAsDialog
        this.querySelector(`[name='download.directoryName']`).value = detail.download.directoryName
        this.querySelector(`[name=scriptName]`).value = detail.scriptName
        this.querySelector(`[name=prompt]`).value = detail.prompt
    }

    collectDetail() {
        return {
            command: this.querySelector("[name=command]:checked").value,
            commandTarget: this.querySelector("[name=commandTarget]:checked").value,
            tabPosition: this.querySelector("[name=tabPosition]:checked").valuee,
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
        this.configManager.getProxy().actions.update(this.currentGroupName, {
            limitation: this.permitDirection,
            name: this.currentGroupName,
        })
    }

    saveDetail() {
        this.configManager.getProxy().detail.update(this.currentGroupName, this.actionType, this.direction, this.collectDetail())
    }
}

customElements.define("custom-action-config", ActinoConfiguration)