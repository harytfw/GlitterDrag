"use strict";
(function (ns) {
    const CANDIDATE_TAG_NAME = ["A", "SPAN", "I", "P", "LABEL", "OPTION", "BUTTON", "PRE"]
    ns.getI18n = (strName = "", placeholders) => {
        const message = browser.i18n.getMessage(strName, placeholders);
        return message;
    }
    ns.render = (context) => {
        for (const elem of context.querySelectorAll("[data-i18n]")) {
            if (elem instanceof HTMLElement && CANDIDATE_TAG_NAME.includes(elem.tagName)) {
                const i18nName = elem.dataset["i18n"]
                elem.textContent = ns.getI18n(i18nName)
            } else {
                console.warn("not supported", elem)
            }
        }
    }
})(i18nUtil || {})
