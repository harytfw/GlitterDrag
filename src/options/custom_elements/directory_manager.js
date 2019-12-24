class DirectoryManager extends HTMLElement {
    constructor() {
        super()


        const template = document.querySelector("#template-directory-manager")
        const content = template.content
        this.appendChild(content.cloneNode(true))

        this.table = this.querySelector("table")

        this.addEventListener("click", (e) => {
            if (e.target instanceof HTMLElement) {
                const target = e.target.closest("button")
                if (target instanceof HTMLButtonElement) {
                    switch (target.dataset.event) {
                        case "add":
                            this.addDirectory("", "")
                            this.dispatchEvent(new Event("configupdate", { bubbles: true }))
                            break
                        case "delete":
                            this.deleteDirectory(target.closest("tr"))
                            this.dispatchEvent(new Event("configupdate", { bubbles: true }))
                            break
                        default:
                            console.warn("unknown dataset event: " + target.dataset.event)
                    }
                }
            }
        })

        this.addEventListener("change", (e) => {
            if (e.target instanceof HTMLInputElement) {
                this.saveDirectory(e.target.closest("tr"))
                this.dispatchEvent(new Event("configupdate", { bubbles: true }))
            }
        })

        this.configManager = null
        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.init()
        })
    }

    init() {
        for (const directory of this.configManager.get().directories) {
            this.addDirectoryRow(directory.name, directory.path)
        }
    }

    addDirectoryRow(name, path) {
        const row = document.createElement("tr")

        const noCell = row.insertCell()
        noCell.textContent = this.table.tBodies[0].childElementCount

        const nameCell = row.insertCell()
        nameCell.innerHTML = `<input class="input" type="text" name="directory.name" placeholder="Directory Name">`
        nameCell.querySelector("input").value = name

        const pathCell = row.insertCell()
        pathCell.innerHTML = `<input class="input" type="text" name="directory.path" placeholder="Directory Path">`
        pathCell.querySelector("input").value = path

        const operationCell = row.insertCell()
        operationCell.appendChild(document.querySelector("#template-table-cell-delete-buttons").content.cloneNode(true))
        this.table.tBodies[0].appendChild(row)
    }


    saveDirectory(row) {
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)
        const directory = this.configManager.get().directories[index]
        directory.name = row.querySelector("[name='directory.name']").value
        directory.path = row.querySelector("[name='directory.path']").value
        console.log(`update directories[${index}]`, directory)
    }

    addDirectory(name, path) {
        this.configManager.get().directories.push({
            name,
            path,
        })
        console.log("add directory")
        this.addDirectoryRow(name, path)
        this.assginRowNo()
    }


    deleteDirectory(row) {
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)

        this.configManager.get().directories.splice(index, 1)
        row.remove()

        console.log(`delete directories[${index}]`)

        this.assginRowNo()
    }

    assginRowNo() {
        Array.from(this.table.querySelectorAll("tr")).forEach((row, index) => {
            const td = row.querySelector("td")
            if (td) td.textContent = index
        })
    }
}


customElements.define("directory-manager", DirectoryManager)