"use strict";
var i18nUtil = {};
{
    const CANDIDATE_TAG_NAME = ["A", "SPAN", "I", "P", "LABEL", "OPTION", "BUTTON", "PRE"];
    i18nUtil.getI18n = (strName = "", placeholders) => {
        const message = browser.i18n.getMessage(strName, placeholders);
        return message;
    };
    i18nUtil.render = (context) => {
        for (const elem of context.querySelectorAll("[data-i18n]")) {
            if (elem instanceof HTMLElement && CANDIDATE_TAG_NAME.includes(elem.tagName)) {
                const i18nName = elem.dataset.i18n;
                const value = i18nUtil.getI18n(i18nName);
                if (value !== "") {
                    elem.textContent = value;
                } else {
                    // console.warn("miss i18n string", elem);
                }
            } else {
                console.warn("not supported", elem);
            }
        }
    };
}
