import * as logUtil from '../../utils/log'
import * as i18nUtil from '../../utils/i18n'
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
            .filter(line => line !== "")
        for (const line of lines) {
            if (!this.checkRegexp(line)) {
                return
            }
        }
        config.blockList = lines
        this.configManager.emitUpdate(this);
    }

    checkRegexp(pat) {
        try {
            new RegExp(pat)
            return true
        }
        catch (err) {
            logUtil.error(err);
            document.querySelector('custom-notification').open(`\`${pat}\` is not a valid regular expression`)
            return false
        }
    }
}

customElements.define("custom-blocklist", BlockList);
