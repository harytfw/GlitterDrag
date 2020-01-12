class SettingsContainer extends HTMLElement {
    constructor() {
        super();
        const template = document.querySelector("#template-settings");
        const content = template.content;
        this.appendChild(content.cloneNode(true));
        this.addEventListener("change", (e) => {
            this.onSettingChange(e);
            this.dispatchEvent(new Event("configupdate", { bubbles: true }));
        });

        this.configManager = null;

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target;
            this.init();
            i18nUtil.render(this);
        });

    }

    init() {
        const config = this.configManager.get();

        this.querySelector("[name=enablePrompt]").checked = config.enablePrompt;
        this.querySelector("[name=enableTimeout]").checked = config.enableTimeout;

        this.querySelector("[name=timeout]").value = config.timeout;
        this.querySelector("[name=timeout]").disabled = config.enableTimeout ? "" : "disabled";

        this.querySelector("[name=limitRange]").checked = config.limitRange;

        this.querySelector("[name=enableIndicator]").checked = config.enableIndicator;
        this.querySelector("[name=enableIndicator]").disabled = !config.limitRange;

        this.querySelector("[name=range0]").disabled = !config.limitRange;
        this.querySelector("[name=range0]").value = config.range[0];

        this.querySelector("[name=range1]").disabled = !config.limitRange;
        this.querySelector("[name=range1]").value = config.range[1];

        this.querySelector("[name='features.extendMiddleButton']").checked = config.features.extendMiddleButton;
        this.querySelector("[name='features.disableFixURL']").checked = config.features.disableFixURL;
        this.querySelector("[name='features.lockScrollbar']").checked = config.features.lockScrollbar;

        // this.querySelector("[name='features.appendReferrer']").value = config.features.appendReferrer

    }

    onSettingChange(e) {
        const { target } = e;
        const settingName = target.name;
        if (target instanceof HTMLInputElement) {
            let val;
            switch (target.type.toLowerCase()) {
                case "checkbox":
                    val = target.checked;
                    break;
                case "number":
                    val = parseInt(target.value, 10);
                    break;
                default:
                    val = target.value;
                    break;
            }

            if (settingName === "enableTimeout") {
                this.querySelector("[name=timeout]").disabled = target.checked ? "" : "disabled";
            } else if (settingName === "limitRange") {
                this.querySelector("[name=range0]").disabled = !val;
                this.querySelector("[name=range1]").disabled = !val;
                this.querySelector("[name=enableIndicator]").disabled = !val;
            }

            if (settingName.startsWith("features")) {
                const featuresName = settingName.split(".")[1];
                consoleUtil.log(`update features: ${featuresName}=val`);
                this.configManager.getProxy().updateFeatures(settingName.split(".")[1], val);
            } else if (settingName === "range0" || settingName === "range1") {
                const index = settingName === "range0" ? 0 : 1;
                this.configManager.get().range[index] = val;
                consoleUtil.log(`update range: `, this.configManager.get().range);
            } else {
                consoleUtil.log(`setting change: ${settingName}=${val}`);
                this.configManager.get()[settingName] = val;
            }
        }
    }
}

customElements.define("custom-settings", SettingsContainer);