class ActionGroupModal extends HTMLElement {
    constructor() {
        super()

        const template = document.querySelector("#template-action-group-modal")
        const content = template.content
        this.appendChild(content.cloneNode(true))

        this.table = this.querySelector("table")

        this.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLElement) {
                switch (target.dataset.event) {
                    case "delete":
                        this.deleteGroup(target.closest("tr"))
                        this.checkInput()
                        break
                    case "add":
                        this.addGroup("", "", false)
                        this.checkInput()
                        break
                    case "close":
                        // this._dispatch("close")
                        this.close()
                        break
                    case "confirm":
                        this._dispatch("confirm")
                        this.saveAllGroup()
                        this.close()
                        break
                    default:
                        break
                }
            }
        })

        this.addEventListener("change", (e) => {
            const { target } = e
            if (target instanceof HTMLInputElement) {
                this.saveGroup(target.closest("tr"))
            }
            this.checkInput()
        })

        this.onShortcutInputFocus = (e) => {
            console.log(e)
            const target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLInputElement && target.dataset.event === "shortcut") {
                this.listenShortcut(target.closest("tr"))
            }
        }

        this.onShortcutInputBlur = (e) => {
            console.log(e)
            const target = queryUtil.findEventElem(e.target)
            if (target instanceof HTMLInputElement && target.dataset.event === "shortcut") {
                target.removeEventListener("keydown", this.onShortcutInputKeydown)
                this.isListenningShortcut = false
                this.saveGroup(target.closest("tr"))
            }
        }

        this.onShortcutInputKeydown = (e) => {
            const input = e.target
            if (this.isListenningShortcut && !e.isComposing && e.key !== "Process") {
                input.value = e.key
            }
            e.preventDefault()
            input.blur()
            this.isListenningShortcut = false
        }

        this.isListenningShortcut = false

        this.configManager = null
        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.init()
        }, { once: true })
    }

    init() {
        const groups = this.configManager.get().actions
        for (const g of groups) {
            this.addGroupRow(g.name, g.shortcut, g.important)
        }
    }


    _dispatch(resultType) {
        console.info(this, `dispatch result event with type:${resultType}`)
        this.dispatchEvent(new CustomEvent("result", {
            detail: resultType,
            bubbles: true
        }))
    }

    listenShortcut(row) {
        if (this.isListenningShortcut) {
            return console.error("already listened shortcut")
        }
        console.log("start listen shortcut")
        const shortcutInput = row.querySelector("[name=shortcut]")
        shortcutInput.addEventListener("keydown", this.onShortcutInputKeydown)

        this.isListenningShortcut = true
    }

    active() {
        console.log("active group modal")
        this.querySelector(".modal").classList.add("is-active")
    }

    close() {
        console.log("close group modal")
        this.querySelector(".modal").classList.remove("is-active")
    }

    addGroup(name, shortcut, important) {
        console.log("add group", "name: ", name, "shortcut: ", shortcut)
        const group = {
            name,
            shortcut,
            important,
        }
        //TODO: 添加其他东西
        this.configManager.get().actions.push(group)

        this.addGroupRow(name, shortcut, false)
        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }

    addGroupRow(name, shortcut, important) {
        console.log("add group row")
        const row = document.querySelector("#template-action-group-row").content.cloneNode(true)

        const nameInput = row.querySelector("[name=name]")
        nameInput.value = name
        nameInput.disabled = important

        const shortcurInput = row.querySelector("[name=shortcut]")
        shortcurInput.disabled = important
        shortcurInput.value = shortcut
        shortcurInput.onfocus = this.onShortcutInputFocus
        shortcurInput.onblur = this.onShortcutInputBlur

        row.querySelector("[data-event=delete]").disabled = important

        this.table.tBodies[0].appendChild(row)

    }

    deleteGroup(row) {
        console.log("delete row")
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)
        this.configManager.get().actions.splice(index, 1)
        row.remove()
        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }

    saveAllGroup() {
        console.log("save all group")
        for (const row of this.table.tBodies[0].querySelectorAll("tr")) {
            this.saveGroup(row)
        }
    }

    saveGroup(row) {
        console.log("save group", row)
        const index = Array.from(row.parentElement.children).findIndex(a => a === row)

        const name = row.querySelector("[name=name]").value
        const shortcut = row.querySelector("[name=shortcut]").value
        const group = this.configManager.get().actions[index]

        group.name = name
        group.shortcut = shortcut
        // group.important = 

        this.dispatchEvent(new Event("configupdate", { bubbles: true }))
    }

    checkInput() {
        let b = true
        for (const input of this.querySelectorAll("input")) {
            const q = input.reportValidity()
            if(!q) {
                input.classList.add("is-danger")
                input.focus()
            } else {
                input.classList.remove("is-danger")
            }
            b = b && q
        }
        this.querySelector("[data-event='close']").disabled = !b
    }
}

customElements.define("action-group-modal", ActionGroupModal)