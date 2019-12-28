"use strict"

class Prompt {

    static get PATH() {
        return "/component/prompt"
    }

    static get CSS_Path() {
        return Prompt.PATH + "/prompt.css"
    }

    static get HTML_PATH() {
        return Prompt.PATH + "/prompt.html"
    }

    constructor() {

        this.container = document.createElement("div")

        /**
         * create shadowRoot with mode "closed" to 
         * prevent the page script accessing any infomation of our webextebsion
         */
        const root = this.container.attachShadow({
            mode: "closed"
        })
        const style = document.createElement("link")
        style.rel = "stylesheet"
        style.href = browser.runtime.getURL(Prompt.CSS_Path)
        root.appendChild(style)

        this.promptDiv = null

        fetch(browser.runtime.getURL(Prompt.HTML_PATH))
            .then((res) => res.text())
            .then(html => {
                root.innerHTML += html
                this.promptDiv = root.querySelector("#prompt")
            })
    }

    render(selection, actionDetail) {
        console.log("render", actionDetail)
        if (typeof actionDetail === "object") {
            return this.promptDiv.innerHTML = this.translate(selection, actionDetail)
        }
    }

    get value() {
        return this.promptDiv.textContent
    }

    active() {
        if (this.container.parentElement === null) {
            console.log(this.container, "active")
            document.body.appendChild(this.container)
        }
    }

    remove() {
        this.container.remove()
    }

    translate(selection, detail) {
        let data
        if (detail.commandTarget === "text") data = selection.text || selection.plainUrl || this.imageLink || ""
        else if (detail.commandTarget === "link") data = selection.plainUrl || selection.imageLink || selection.text || ""
        else data = selection.imageLink || selection.plainUrl || selection.text || ""
        return detail.prompt
            .replace("%s", data);
    }
}
