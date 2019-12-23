class BulmaDropdown extends HTMLElement {

    static get DropdownChangeEvent() {

    }

    constructor() {
        super()

        this.selectOption = null

        this.attachShadow({
            mode: "open"
        })

        for (const style of document.styleSheets) {
            this.shadowRoot.appendChild(style.ownerNode.cloneNode(true))
        }

        this.shadowRoot.addEventListener("click", (e) => {
            const { target } = e
            if (target instanceof HTMLAnchorElement && target.matches(".dropdown-item")) {
                this.updateSelectedOptionByItem(e.target)
            }
        })

        const template = document.querySelector("#template-bulma-dropdown")
        const content = template.content
        this.appendChild(content.cloneNode(true))


        this.updateDropdownList()

    }

    active() {

    }

    close() {

    }

    get value() {
        this.selectOption ? this.selectOption.value : null
    }

    set value(val) {
        this.updateSelectedOptionByValue(val)
        return this.selectOption
    }

    getDataListElement() {
        const listId = this.getAttribute("list")
        const dataList = this.querySelector(`datalist#${listId}`)
        return dataList
    }

    connectedCallback() {
        console.log('Custom square element added to page.');
        this.updateDropdownList(this);
    }

    updateDropdownList() {
        const dataList = this.getDataListElement()
        if (!(dataList instanceof HTMLDataListElement)) {
            console.warn(dataList, "is not datalist")
            return
        }
        const items = []
        for (const option of dataList.children) {
            items.push(`<a href="#" class="dropdown-item">${option.textContent}</a>`)
        }
        this.querySelector(".dropdown-content").innerHTML = items.join("")
    }

    updateSelectedOptionByItem(itemElement) {
        const dataList = this.getDataListElement()

        const index = itemElement.parentElement.children.findIndex(c => c === itemElement)

        this.selectOption = dataList.children.item(index)
        this.updateButtonTextContent(this.selectOption.textContent)
    }

    updateSelectedOptionByValue(value) {
        const dataList = this.getDataListElement()

        const index = dataList.children.findIndex(c => c.value === value)

        this.selectOption = dataList.children.item(index)
        this.updateButtonTextContent(this.selectOption.textContent)
    }

    updateButtonTextContent(text) {
        this.querySelector("button").textContent = text
    }
}

customElements.define("bulma-dropdown", BulmaDropdown)