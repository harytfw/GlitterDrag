class SearchEngineEditorModal extends HTMLElement {
    constructor() {
        super()

        const template = document.querySelector("#template-search-engine-editor-modal")
        const content = template.content
        this.appendChild(content.cloneNode(true))

        this.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "close":
                        this._dispatch("close")
                        this.close()
                        break
                    case "confirm":
                        this._dispatch("confirm")
                        this.close()
                        break
                }
            }
        })

        this.addEventListener("provideritemselect", (e) => {
            const { name, url, icon, builtin, method, searchOnSite } = e.detail
            this.searchEngineURL = builtin ? "protected" : url
            this.searchEngineName = name
            this.searchEngineBuiltin = builtin
            this.searchEngineMethod = method

            if (icon.length !== 0) {
                this.searchEngineIcon = icon
            }
        })
        this.addEventListener("change", (e) => {
            const { target } = e
            if (target.name === "searchEngineIcon") {
                this.updatePreview()
            } else if (target.name === "iconInput") {
                this.processIconInput()
            }
        })
    }

    _dispatch(resultType) {
        console.info(this, `dispatch result event with type:${resultType}`)
        this.dispatchEvent(new CustomEvent("result", {
            detail: resultType,
            bubbles: true
        }))
    }

    get showBuiltin() {
        return this.getAttribute("show-builtin") !== null
    }

    get modalTitle() {
        this.querySelector(".modal-card-title").textContent
    }

    set modalTitle(value) {
        this.querySelector(".modal-card-title").textContent = value
    }

    get searchEngineName() {
        return this.querySelector("[name=searchEngineName]").value
    }

    set searchEngineName(value) {
        return this.querySelector("[name=searchEngineName]").value = value
    }

    get searchEngineURL() {
        return this.querySelector("[name=searchEngineURL]").value
    }

    set searchEngineURL(value) {
        return this.querySelector("[name=searchEngineURL]").value = value
    }

    get searchEngineIcon() {
        return this.querySelector("[name=searchEngineIcon]").value
    }

    set searchEngineIcon(value) {
        this.querySelector("[name=searchEngineIcon]").value = value
        this.updatePreview()
        return value
    }

    get searchEngineBuiltin() {
        return this.querySelector("[name=searchEngineBuiltin]").checked
    }

    set searchEngineBuiltin(value) {
        if (value) {
            this.querySelector("[name=searchEngineURL]").disabled = "disabled"
        } else {
            this.querySelector("[name=searchEngineURL]").disabled = ""
        }
        return this.querySelector("[name=searchEngineBuiltin]").checked = value
    }

    get searchEngineMethod() {
        return this.querySelector("[name=searchEngineMethod]").value
    }

    set searchEngineMethod(value) {
        return this.querySelector("[name=searchEngineMethod]").value = value
    }


    get searchEngine() {
        return {
            name: this.searchEngineName,
            url: this.searchEngineURL,
            icon: this.searchEngineIcon
        }
    }

    active(name, url, icon) {
        console.info(this, "active")

        const column = this.querySelector("[groupname=Browser]").closest(".column")
        
        if (this.showBuiltin) {
            column.classList.remove("is-hidden")
            console.log("show builtin")
        } else {
            column.classList.add("is-hidden")
            console.log("not show builtin")
        }

        this.querySelector(".modal").classList.add("is-active")
        if (typeof name === "string") {
            this.searchEngineName = name
        }

        if (typeof url === "string") {
            this.searchEngineURL = url
        }

        if (typeof icon === "string") {
            this.searchEngineIcon = icon
        }
    }

    close() {
        console.info(this, "close")
        this.querySelector(".modal").classList.remove("is-active")
        this._dispatch("cancel")
    }


    updatePreview() {
        this.querySelector(".preview").src = this.searchEngineIcon
    }

    processIconInput() {
        const file = this.querySelector("[name=iconInput]").files[0]
        if (!file) {
            console.error("no file")
            return
        }
        const reader = new FileReader()
        reader.onloadend = () => {
            console.log("read file end")
            this.searchEngineIcon = reader.result
        }
        console.log("start read file")
        reader.readAsDataURL(file)
    }
}


customElements.define("search-engine-editor-modal", SearchEngineEditorModal)