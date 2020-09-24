import * as env from './env'
const CANDIDATE_TAG_NAME = ["A", "SPAN", "I", "P", "LABEL", "OPTION", "BUTTON", "PRE"];
export const getI18n = (strName = "", placeholders) => {
    const message = browser.i18n.getMessage(strName, placeholders);
    return message;
};
export const render = (context) => {
    for (const elem of context.querySelectorAll("[data-i18n]")) {
        if (elem instanceof HTMLElement && CANDIDATE_TAG_NAME.includes(elem.tagName)) {
            let i18nName = elem.dataset.i18n;
            if (env.isChromium && typeof elem.dataset.i18nChromium === "string") {
                i18nName = elem.dataset.i18nChromium;
            }
            const value = getI18n(i18nName);
            if (value !== "") {
                elem.textContent = value;
            }
            else {
                // console.warn("miss i18n string", elem);
            }
        }
        else {
            console.warn(elem, " is not support i18n");
        }
    }
}
