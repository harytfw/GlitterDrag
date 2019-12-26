"use strict";
(function (ns) {
    const CANDIDATE_TAG_NAME = ["A", "SPAN", "I", "P"]
    ns.getI18n = (strName = "", placeholders) => {
        const message = browser.i18n.getMessage(strName, placeholders);
        return message;
    }
    ns.render = (context = document.body) => {
        for (const elem of context.querySelectorAll("[data-i18n]")) {
            if (elem instanceof HTMLElement && CANDIDATE_TAG_NAME.includes(elem.tagName)) {
                const i18nName = elem.dataset["i18n"]
                elem.textContent = this.getI18n(i18nName)
            }
        }
    }
})(i18nUtil || {})
