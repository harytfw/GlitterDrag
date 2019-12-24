class SettingsContainer extends HTMLElement {
    constructor() {
        super()
        const template = document.querySelector("#template-settings")
        const content = template.content
        this.appendChild(content.cloneNode(true))
        this.addEventListener("change", (e) => {
            this.onSettingChange(e)
            this.dispatchEvent(new Event("configupdate", { bubbles: true }))
        })

        this.configManager = null

        document.addEventListener("configloaded", (e) => {
            this.configManager = e.target
            this.init()
        }, { once: true })

        document.addEventListener("discard", (e) => {

        })
        // i18nUtil.render(this)
    }

    init() {
        const config = this.configManager.get()
        this.querySelector("[name=enableIndicator]").checked = config.enableIndicator

        this.querySelector("[name=enablePrompt]").checked = config.enablePrompt
        this.querySelector("[name=enableTimeout]").checked = config.enableTimeout

        this.querySelector("[name=timeout]").value = config.timeout
        this.querySelector("[name=timeout]").disabled = config.enableTimeout ? "" : "disabled"
        this.querySelector("[name='features.extendMiddleButton']").checked = config.features.extendMiddleButton
        this.querySelector("[name='features.disableFixURL']").checked = config.features.disableFixURL
        this.querySelector("[name='features.lockScrollbar']").checked = config.features.lockScrollbar

        // this.querySelector("[name='features.appendReferrer']").value = config.features.appendReferrer


    }

    onSettingChange(e) {
        const { target } = e
        const settingName = target.name
        if (target instanceof HTMLInputElement) {
            let val
            switch (target.type.toLowerCase()) {
                case "checkbox":
                    val = target.checked
                    break
                case "number":
                    val = parseInt(target.value)
                    break
                default:
                    val = target.value
                    break
            }

            if (settingName === "enableTimeout") {
                this.querySelector("[name=timeout]").disabled = target.checked ? "" : "disabled"
            }

            if (settingName.startsWith("features")) {
                const featuresName = settingName.split(".")[1]
                console.info(`update features: ${featuresName}=val`)
                this.configManager.getProxy().updateFeatures(settingName.split(".")[1], val)
            } else {
                console.info(`setting change: ${settingName}=${val}`)
                this.configManager.get()[settingName] = val
            }
        }
    }
}

customElements.define("custom-settings", SettingsContainer)