
// eslint-disable-next-line no-unused-vars
class StyleWrapper {
    constructor() {
        let tab = document.querySelector("#tab-style");

        let styleArea = tab.querySelector("#styleContent");
        browserStorage.get("style").then(res => {
            let style = res.style;
            if (style.length === 0) {
                let styleURL = browser.runtime.getURL("/content_scripts/content_script.css");
                fetch(styleURL).then(
                    response => response.text()
                ).then(text => styleArea.value = text);
            }
            else {
                styleArea.value = style;
            }

            eventUtil.attachEventS("#saveStyle", () => {
                browserStorage.set({
                    "style": styleArea.value
                }).then(() => {
                    document.querySelector("#saveStyle").textContent = i18nUtil.getI18n('elem_SaveDone');
                    setTimeout(() => {
                        document.querySelector("#saveStyle").textContent = i18nUtil.getI18n('saveStyle');
                    }, 2000);
                })
            })
        });

        tab.querySelector("#style-selector").addEventListener("change", event => {
            let styleURL = browser.runtime.getURL("/options/custom_style/" + event.target.value);
            fetch(styleURL).then(
                response => response.text()
            ).then(text => styleArea.value = text);
        });
    }
}