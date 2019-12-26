class SearchEngineManager extends HTMLElement {
    constructor() {
        super()
        const template = document.querySelector("#template-search-engine-manager")
        const content = template.content
        this.appendChild(content.cloneNode(true))
        this.table = this.querySelector("table")
        this.editor = document.querySelector(".table-row-editor")

        this.addEventListener("click", (e) => {
            let target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "add":
                        this.listenAdditionResult()
                        break
                    case "delete":
                        this.deleteSearchEngine(target.closest("tr"))
                        break
                    case "edit":
                        this.listenEditResult(target.closest("tr"))
                        break
                }

            }
        })

        this.configManager = null
        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.init()
        }, { once: true })
    }

    init() {
        for (const s of this.configManager.get().searchEngines) {
            this.addSearchEngineRow(s.name, s.url, s.icon, s.method)
        }
    }
    listenAdditionResult() {
        this.editor.modalTitle = "Add Search Engine"
        this.editor.searchEngineName = ""
        this.editor.searchEngineURL = ""
        this.editor.searchEngineIcon = ""
        this.editor.searchEngineMethod = ""
        this.editor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                this.addSearchEngine(
                    this.editor.searchEngineName,
                    this.editor.searchEngineURL,
                    this.editor.searchEngineIcon,
                    this.editor.searchEngineMethod)
                this.dispatchEvent(new Event("configupdate", { bubbles: true }))
            } else {
                console.log("cancal addition")
            }
        }, { once: true })
        this.editor.active()
    }

    listenEditResult(row) {
        this.editor.searchEngineName = row.querySelector("[name=name]").value
        this.editor.searchEngineURL = row.querySelector("[name=url]").value
        this.editor.searchEngineIcon = row.querySelector("[name=icon]").value
        this.editor.searchEngineMethod = row.querySelector("[name=method]").value
        this.editor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                this.updateSearchEngine(row, this.editor.searchEngineName, this.editor.searchEngineURL, this.editor.searchEngineIcon, this.editor.searchEngineMethod)
                this.saveSearchEngine(row)
                this.dispatchEvent(new Event("configupdate", { bubbles: true }))
            } else {
                console.log(row, "cancal change")
            }
        }, { once: true })
        this.editor.active()
    }

    addSearchEngineRow(name, url, icon, method) {
        const row = document.querySelector("#template-search-engine-row").content.cloneNode(true)

        row.querySelector(".no").textContent = this.table.tBodies[0].childElementCount

        row.querySelector(".search-engine-icon").src = icon
        row.querySelector(".search-engine-name").textContent = name
        row.querySelector("[name=icon]").value = icon
        row.querySelector("[name=name]").value = name

        row.querySelector(".search-engine-url").textContent = url
        row.querySelector("[name=url").value = url

        row.querySelector("[name=method]").value = method

        this.table.tBodies[0].appendChild(row)
    }

    saveSearchEngine(row) {
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)
        const searchEngine = this.configManager.get().searchEngines[index]
        searchEngine.name = row.querySelector("[name=name]").value
        searchEngine.url = row.querySelector("[name=url]").value
        searchEngine.icon = row.querySelector("[name=icon]").value
        searchEngine.method = row.querySelector("[name=method]").value

        console.log("save search engine")
        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }

    updateSearchEngine(row, name, url, icon, method) {
        row.querySelector("[name=name]").value = name
        row.querySelector(".search-engine-name").textContent = name

        row.querySelector("[name=url").value = url
        row.querySelector(".search-engine-url").textContent = url

        row.querySelector("[name=icon]").value = icon
        row.querySelector(".search-engine-icon").src = icon

        row.querySelector("[name=method]").value = method

        this.saveSearchEngine()
    }

    addSearchEngine(name, url, icon, method) {
        this.configManager.get().searchEngines.push({
            name,
            url,
            icon,
            method
        })
        console.log("add search engine")
        this.addSearchEngineRow(name, url, icon, method)
        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }

    deleteSearchEngine(row) {
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)
        this.configManager.get().searchEngines.splice(index, 1)
        console.log("delete search engine")
        row.remove()

        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }
}

customElements.define("search-engine-manager", SearchEngineManager)

