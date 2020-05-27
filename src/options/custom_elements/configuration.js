class Configuration extends HTMLElement {
    static get fileName() {
        return "foo.json";
    }

    constructor() {
        super();

        const template = document.querySelector("#template-configuration");
        const content = template.content;
        this.appendChild(content.cloneNode(true));

        this.onFileInputChange = (e) => {
            consoleUtil.log("on file input change");
            const input = e.target;
            if (input.files.length >= 1) {
                consoleUtil.log("start load file");
                const reader = new FileReader();
                reader.onloadend = () => {
                    consoleUtil.log("load file end");
                    this.restoreConfigFromJson(reader.result);
                };
                reader.readAsText(input.files[0]);
            } else {
                consoleUtil.log("no files");
            }
        };

        this.fileInput = this.querySelector("input");
        this.fileInput.onchange = this.onFileInputChange;

        this.downloadAnchor = this.querySelector("[download]");

        this.addEventListener("click", async (e) => {
            const target = queryUtil.findEventElem(e.target);
            if (target instanceof HTMLButtonElement) {
                switch (target.dataset.event) {
                    case "reset":
                        await this.configManager.resetConfig();
                        consoleUtil.log("reload document");
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
        consoleUtil.log("restore config from json");
        try {
            const obj = JSON.parse(json);
            this.configManager.restoreConfig(obj);
        } catch (e) {
            console.error(e);
        }
    }

    downloadConfigAsJson(obj) {
        consoleUtil.log("download config as json");
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

customElements.define("custom-configuration", Configuration);