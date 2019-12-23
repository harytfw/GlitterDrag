class SearchEngineProvider extends HTMLElement {
    constructor() {
        super()

        const template = document.querySelector("#template-search-engine-provider")
        const content = template.content
        this.appendChild(content.cloneNode(true))
        this.addEventListener("click", (e) => {
            const { target } = e
            let item = null
            if (target instanceof HTMLElement) {
                if (target.closest(".dropdown .dropdown-trigger") instanceof HTMLElement) {
                    const dropdown = this.querySelector(".dropdown")
                    dropdown.classList.add("is-active")
                    dropdown.dataset.lastActive = true
                } else if ((item = target.closest(".dropdown .dropdown-menu .dropdown-item")) instanceof HTMLElement) {
                    const dropdown = target.closest(".dropdown")
                    dropdown.classList.remove("is-active")
                    this._dispatch(item.dataset.name, item.dataset.url, item.dataset.icon)
                }
            }
        })
        this.updateDropdownList()
    }

    _dispatch(name, url, icon) {
        console.info(this, "dispatch provideritemselect event")
        this.dispatchEvent(new CustomEvent("provideritemselect", {
            detail: {
                name,
                url,
                icon,
                builtin: this.isBrowserGroup,
                method: "",
                searchOnSite: false,
            },
            bubbles: true
        }))
    }

    get isBrowserGroup() {
        return this.getAttribute("groupname") === "Browser"
    }

    updateDropdownList() {
        const groupName = this.getAttribute("groupname")
        if (this.isBrowserGroup) {
            return this.updateBrowserSearchEngine()
        } 
        if (!(groupName in searchEngines)) {
            console.warn(this, `not found group: "${groupName}"`)
            return
        }
        const items = []
        for (const searchEngine of searchEngines[groupName]) {
            items.push(`<a href="#" class="dropdown-item" data-name="${searchEngine.name}" data-icon="${searchEngine.icon}" data-url="${searchEngine.url}">${searchEngine.name}</a>`)
        }
        this.querySelector(".dropdown-content").innerHTML = items.join("")
    }


    async updateBrowserSearchEngine() {
        const items = []
        for (const se of (await browser.search.get())) {
            items.push(`<a href="#" class="dropdown-item" data-name="${se.name}" data-icon="${se.favIconUrl}" data-url="${se.url}"><img width="16" height="16" class="middle-img" src="${se.favIconUrl}">${se.name}</a>`)
        }
        this.querySelector(".dropdown-content").innerHTML = items.join("")
    }

}

customElements.define("search-engine-provider", SearchEngineProvider)