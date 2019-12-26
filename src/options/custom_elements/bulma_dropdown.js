(function () {
    document.addEventListener("click", () => {
        for (const dropdown of document.querySelectorAll("bulma-dropdown")) {
            dropdown.dispatchEvent(new Event("closedropdown"))
        }
    })
})()


class BulmaDropdown extends HTMLElement {
    static get observedAttributes() {
        return ["value"]
    }

    constructor() {
        super()

        this.selectedOption = null

        this.attachShadow({
            mode: "open"
        })

        for (const style of document.styleSheets) {
            this.shadowRoot.appendChild(style.ownerNode.cloneNode(true))
        }

        this.closeDropdownNextTime = false

        this.addEventListener("closedropdown", () => {
            if (!this.closeDropdownNextTime) {
                this.close()
            }
            this.closeDropdownNextTime = false
        })

        this.shadowRoot.addEventListener("click", (e) => {
            const { target } = e
            let itemElement
            if (target instanceof HTMLAnchorElement && (itemElement = target.closest(".dropdown-item")) instanceof HTMLElement) {
                this.updateSelectedOptionByItem(itemElement)
                this.close()
                this.dispatchEvent(new Event("change"))
                return
            }
            if (target instanceof HTMLElement && target.closest("button") instanceof HTMLButtonElement) {
                this.closeDropdownNextTime = true
                this.toggleActive()
            }
        })


        const template = document.querySelector("#template-bulma-dropdown")
        const content = template.content
        this.shadowRoot.appendChild(content.cloneNode(true))

        this.mutationObserver = new MutationObserver(this.onDataListMutation.bind(this))

        this.watchAndUpdate()

    }

    attributeChangedCallback(attr, value) {
        if (attr === "value") {
            this.value = value
        }
    }

    toggleActive() {
        this.shadowRoot.querySelector(".dropdown").classList.toggle("is-active")
    }

    active() {
        this.shadowRoot.querySelector(".dropdown").classList.add("is-active")
    }

    close() {
        this.closeDropdownNextTime = false
        this.shadowRoot.querySelector(".dropdown").classList.remove("is-active")
    }

    get value() {
        return this.selectedOption ? this.selectedOption.value : null
    }

    set value(val) {
        this.updateSelectedOptionByValue(val)
        this.dispatchEvent(new Event("change", { bubbles: true }))
        return this.selectedOption
    }

    get list() {
        return this.getAttribute("list")
    }

    set list(val) {
        return this.setAttribute("list", val)
    }

    get datalist() {
        const listId = this.getAttribute("list")
        if (typeof listId === "string" && listId !== "") {
            const datalist = document.querySelector(`datalist#${listId}`)
            return datalist
        }
        return null
    }

    overrideWithOptions(options) {
        this.mutationObserver.takeRecords()
        this.mutationObserver.disconnect()

        const datalist = this.datalist

        while (datalist.firstElementChild) {
            datalist.firstElementChild.remove()
        }

        for (const opt of options) {
            datalist.appendChild(opt)
        }

        this.watchAndUpdate()
    }

    overrideWithKeyValuePair(pairs) {
        const options = pairs.map(pair => {
            const opt = document.createElement("option")
            opt.textContent = pair[0]
            opt.value = pair[1]
            return opt
        })
        this.overrideWithOptions(options)
    }

    connectedCallback() {
        this.watchAndUpdate();
    }

    onDataListMutation(mutationsList, observer) {
        // simple and brutal
        console.log(...arguments)
        this.updateDropdownList()
    }

    watchAndUpdate() {
        const dataList = this.datalist
        if (!dataList) {
            return
        }
        if (!(dataList instanceof HTMLDataListElement)) {
            console.warn(dataList, "is not datalist")
            return
        }
        console.log("add mutation observer")
        this.mutationObserver.observe(dataList, {
            childList: true,
            subtree: true,
            attributes: ["value"],
            // characterData: true,
        })
        this.updateDropdownList()
    }

    updateDropdownList() {
        const items = []
        Array.from(this.datalist.children).forEach((option, index) => {
            items.push(`<a class="dropdown-item">${option.innerHTML}</a>`)
        })
        this.shadowRoot.querySelector(".dropdown-content").innerHTML = items.join("")
    }

    updateSelectedOptionByItem(itemElement) {
        const index = Array.from(itemElement.parentElement.children).findIndex(c => c === itemElement)

        this.updateSelectedOptionByIndex(index)
    }

    updateSelectedOptionByValue(value) {
        const dataList = this.datalist

        const index = Array.from(dataList.children).findIndex(c => c.value === value)
        this.updateSelectedOptionByIndex(index)
    }

    updateSelectedOptionByIndex(index) {
        const dataList = this.datalist
        const children = Array.from(dataList.children)
        if (index < 0 || index >= children.length) {
            throw new Error("index out of bound")
        }
        for (const opt of dataList.querySelectorAll("option")) {
            opt.selected = false
        }
        this.selectedOption = children[index]
        this.selectedOption.selected = true
        this.updateButtonTextContent(this.selectedOption.textContent)
    }

    updateButtonTextContent(text) {
        this.shadowRoot.querySelector("button").firstElementChild.textContent = text
    }

}

customElements.define("bulma-dropdown", BulmaDropdown)