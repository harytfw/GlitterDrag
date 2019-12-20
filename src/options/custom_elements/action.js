class ActionContainer extends HTMLElement {
    constructor() {
        super()

        const template = document.querySelector("#template-action")
        const content = template.content
        this.appendChild(content.cloneNode(true))

    }
}

customElements.define("custom-action",ActionContainer)