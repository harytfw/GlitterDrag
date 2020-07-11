class BlockList extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector("#template-blocklist");
        const content = template.content;
        this.appendChild(content.cloneNode(true));


        this.textarea = this.querySelector("textarea");
        this.textarea.addEventListener("change", this.onBlockListChange.bind(this))

        this.configManager = null;
        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target;
            this.textarea.value = this.configManager.get().blockList.join("\n");
            i18nUtil.render(this);
        });

    }

    onBlockListChange() {
        const config = this.configManager.get();
        let lines = this.textarea.value.split("\n");
        lines = lines
            .map(line => line.trim())
            .filter(line => line !== "");
        config.blockList = lines
        this.configManager.emitUpdate(this);
    }
}

customElements.define("custom-blocklist", BlockList);