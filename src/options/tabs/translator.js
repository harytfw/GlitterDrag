
class TranslatorWrapper {
    constructor() {
        let tab = document.querySelector("#tab-translator");

        const btn = tab.querySelector("#updateBaiduData");
        btn.addEventListener("click", ({ target }) => {
            fetch(TranslatorService.baidu.host, { credentials: "same-origin" })
                .then(res => res.text()).then(async html => {
                    const [gtk, token] = TranslatorService.baidu.getTokenAndGtk(html);

                    if (gtk !== "" && token !== "") {
                        const obj = await browserStorage.get("translator");
                        obj["translator"].baidu_gtk = gtk;
                        obj["translator"].baidu_token = token
                        await browserStorage.set(obj);
                        return Promise.resolve();
                    }
                    else {
                        return Promise.resolve("token or gtk is empty");
                    }
                }).then(() => {
                    target.nextElementSibling.textContent = i18nUtil.getI18n("elem_UpdateBaiduSuccess");
                }).catch(e => {
                    target.nextElementSibling.textContent = "Update Error.";
                    console.error(e);
                });
        })
    }
}
