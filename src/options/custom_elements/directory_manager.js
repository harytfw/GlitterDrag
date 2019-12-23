class DirectoryManager extends HTMLElement {
    constructor() {
        super()


        const template = document.querySelector("#template-directory-manager")
        const content = template.content
        this.appendChild(content.cloneNode(true))

        this.table = this.querySelector("table")

        this.addEventListener("click", (e) => {
            if (e.target instanceof HTMLElement) {
                switch (e.target.dataset.event) {
                    case "add":
                        this.addDirectory("", "")
                        break
                    case "delete":
                        e.target.closest("tr").remove()
                        break
                    default:
                        console.warn("unknown dataset event: " + e.target.dataset.event)
                }
            }
        })
    }

    addDirectory(name, path) {
        const row = document.createElement("tr")
        
        const noCell = row.insertCell()
        noCell.textContent = this.table.tBodies[0].childElementCount

        const nameCell = row.insertCell()
        nameCell.innerHTML = `<input class="input" type="text" placeholder="Text input">`
        nameCell.querySelector("input").value = name

        const pathCell = row.insertCell()
        pathCell.innerHTML = `<input class="input" type="text" placeholder="Text input">`
        pathCell.querySelector("input").value = path

        const operationCell = row.insertCell()
        operationCell.appendChild(document.querySelector("#template-table-cell-delete-buttons").content.cloneNode(true))

        this.table.tBodies[0].appendChild(row)
    }

}


customElements.define("directory-manager", DirectoryManager)