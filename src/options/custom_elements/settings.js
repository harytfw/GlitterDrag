class SettingsContainer extends HTMLElement {
    constructor() {
        super()
        const template = document.querySelector("#template-settings")
        const content = template.content
        this.appendChild(content.cloneNode(true))
        this.addEventListener("change", (e) => this.onSettingChange(e))

        i18nUtil.render(this)
    }

    onSettingChange(e) {
        const target = e.target
        const settingName = e.target.dataset["setting-name"]
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
            browser.storage.local.set({ settingName: val })
            console.info(`setting change: ${settingName}=${val}`)
        }
    }
}

customElements.define("custom-settings", SettingsContainer)