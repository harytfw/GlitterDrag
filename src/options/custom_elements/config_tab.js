import * as logUtil from '../../utils/log'
import * as env from '../../utils/env'
import * as i18nUtil from '../../utils/i18n'
import * as configUtil from '../../utils/config'
class ConfigurationTab extends HTMLElement {
    static get fileName() {
        return "foo.json";
    }

    constructor() {
        super();

        const template = document.querySelector("#template-configuration");
        const content = template.content;
        this.appendChild(content.cloneNode(true));

        this.onFileInputChange = (e) => {
            logUtil.log("on file input change");
            const input = e.target;
            if (input.files.length >= 1) {
                logUtil.log("start load file");
                const reader = new FileReader();
                reader.onloadend = () => {
                    logUtil.log("load file end");
                    this.restoreConfigFromJson(reader.result);
                };
                reader.readAsText(input.files[0]);
            }
            else {
                logUtil.log("no files");
            }
        };

        this.fileInput = this.querySelector("input");
        this.fileInput.onchange = this.onFileInputChange;

        this.downloadAnchor = this.querySelector("[download]");

        this.addEventListener("click", async(e) => {
            const target = queryUtil.findEventElem(e.target);
            if (target instanceof HTMLButtonElement) {
                switch (target.dataset.event) {
                    case "reset":
                        await this.configManager.resetConfig();
                        logUtil.log("reload document");
                        location.reload();
                        break;
                    case "backup":
                        this.downloadConfigAsJson(await this.configManager.backupConfig());
                        break;
                    case "restore":
                        this.fileInput.click();
                        break;
                }
            }
        });

        this.configManager = null;

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target;
            i18nUtil.render(this);
        });
    }

    restoreConfigFromJson(json) {
        logUtil.log("restore config from json");
        try {
            const obj = JSON.parse(json);
            this.configManager.restoreConfig(obj);
        }
        catch (e) {
            console.error(e);
        }
    }

    downloadConfigAsJson(obj) {
        logUtil.log("download config as json");
        const json = JSON.stringify(obj);
        const blob = new Blob([json], {
            type: "application/json",
        });
        const url = URL.createObjectURL(blob);
        this.downloadAnchor.href = url;
        setTimeout(() => {
            URL.revokeObjectURL(url);
        }, 10000);
        this.downloadAnchor.click();
    }
}

customElements.define("custom-configuration", ConfigurationTab);
