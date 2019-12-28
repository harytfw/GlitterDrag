"use strict"

class DistanceIndictor {

    static get PATH() {
        return "/component/distance_indicator"
    }

    static get CSS_Path() {
        return DistanceIndictor.PATH + "/distance_indicator.css"
    }

    static get HTML_PATH() {
        return DistanceIndictor.PATH + "/distance_indicator.html"
    }

    constructor() {
        this.container = document.createElement("div")

        /**
         * create shadowRoot with mode "closed" to
         *  prevent the page script accessing any infomation of our webextebsion
         */
        const root = this.container.attachShadow({
            mode: "closed"
        })
        const style = document.createElement("link")
        style.rel = "stylesheet"
        style.href = browser.runtime.getURL("distance_indicator.css")
        root.appendChild(style)

        fetch(browser.runtime.getURL(DistanceIndictor.HTML_PATH))
            .then((res) => res.text())
            .then(html => {
                root.innerHTML += html
            })
    }

    get value() {

    }

    set value(val) {

    }

    active() {
        document.body.appendChild(this.container)
    }

    remove() {
        this.container.remove()
    }

}
