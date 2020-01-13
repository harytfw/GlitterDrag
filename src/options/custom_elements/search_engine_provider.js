class SearchEngineProvider extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector("#template-search-engine-provider");
        const content = template.content;
        this.appendChild(content.cloneNode(true));

        this.dropdown = this.querySelector("bulma-dropdown");

        this.dropdown.addEventListener("change", (e) => {
            const option = e.target.selectedOption;
            if (option instanceof HTMLOptionElement) {
                this._dispatch(option.dataset.name, option.dataset.url, option.dataset.icon);
            }
        });

        this.updateDropdownList();
        i18nUtil.render(this);
    }

    _dispatch(name, url, icon) {

        const detail = {
            name,
            url,
            icon,
            builtin: this.isBrowserGroup,
            method: "",
            searchOnSite: false,
        }

        consoleUtil.log(this, "dispatch provideritemselect event", { name: detail.name, url: detail.url });
        this.dispatchEvent(new CustomEvent("provideritemselect", {
            detail,
            bubbles: true,
        }));
    }

    get isBrowserGroup() {
        return this.getAttribute("groupname") === "Browser";
    }

    async updateDropdownList() {
        const groupName = this.getAttribute("groupname");

        const datalist = document.createElement("datalist");
        datalist.id = `provider-${Math.floor(Math.random() * 100000)}`;
        this.appendChild(datalist);
        this.dropdown.list = datalist.id;

        const options = [];

        if (this.isBrowserGroup && env.isFirefox) {
            for (const se of (await browser.search.get())) {
                const option = document.createElement("option");
                option.value = se.name;
                option.dataset.name = se.name;
                option.dataset.icon = se.favIconUrl;
                option.dataset.url = "";
                option.innerHTML = `<img width="16" height="16" class="middle-img" src="${se.favIconUrl}"><span>${se.name}</span>`;
                options.push(option);
            }
        } else {

            if (!(groupName in searchEngines)) {
                console.warn(this, `not found search engine group: "${groupName}"`);
                return;
            }

            for (const searchEngine of searchEngines[groupName]) {
                options.push(this.createOptionElement(searchEngine));
            }
        }
        const dropdown = this.querySelector("bulma-dropdown");
        dropdown.overrideWithOptions(options);
        dropdown.updateButtonTextContent(i18nUtil.getI18n("selectSearchEngine"));
    }

    createOptionElement(searchEngine) {
        const option = document.createElement("option");
        option.value = searchEngine.name;
        option.dataset.name = searchEngine.name;
        option.dataset.icon = searchEngine.icon;
        option.dataset.url = searchEngine.url;
        option.textContent = searchEngine.name;
        return option;
    }
}

customElements.define("search-engine-provider", SearchEngineProvider);