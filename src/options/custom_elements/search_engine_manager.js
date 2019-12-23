class SearchEngineManager extends HTMLElement {
    constructor() {
        super()
        const template = document.querySelector("#template-search-engine-manager")
        const content = template.content
        this.appendChild(content.cloneNode(true))
        this.table = this.querySelector("table")
        this.rowEditor = this.querySelector(".row-editor")
        this.querySelector("#add-search-engine").addEventListener("click", (e) => {
            this.addSearchEngine("xx", "xxx", "xxxxxx")
        })

        this.addEventListener("click", (e) => {
            if (e.target instanceof HTMLElement) {
                switch (e.target.dataset["event"]) {
                    case "delete":
                        e.target.closest("tr").remove()
                        break
                    case "edit":
                        this.listenEditorResult(e.target.closest("tr"))
                        break
                }
            }
        })
    }

    listenEditorResult(row) {
        this.rowEditor.addEventListener("result", (e) => {
            if (e.detail === "confirm") {
                row.querySelector(".row-url").textContent = this.rowEditor.searchEngineURL
                row.querySelector(".row-name").textContent = this.rowEditor.searchEngineName
                row.querySelector(".row-icon").src = this.rowEditor.searchEngineIcon
            } else {
                console.log(row, "cancal change")
            }
        }, { once: true })
        this.rowEditor.active()
    }

    addSearchEngine(name, url, icon) {
        const row = document.createElement("tr")
        const noCell = row.insertCell()
        noCell.textContent = this.table.tBodies[0].childElementCount

        const nameCell = row.insertCell()
        nameCell.innerHTML = `<div><img class="row-icon" src="${icon}"><span class="row-name">${name}</span></div>`

        const urlCell = row.insertCell()
        urlCell.classList.add("row-url")
        urlCell.textContent = url

        const operationCell = row.insertCell()
        operationCell.appendChild(document.querySelector("#template-table-cell-buttons").content.cloneNode(true))

        this.table.tBodies[0].appendChild(row)
    }

}

customElements.define("search-engine-manager", SearchEngineManager)

