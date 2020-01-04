"use strict";
var queryUtil = {};
{
    const findEventElem = (target) => {
        if (!(target instanceof HTMLElement)) {
            return null;
        }
        const elem = target.closest("[data-event]");
        if (elem instanceof HTMLElement) {
            return elem;
        }
        return null;
    };

    const removeElementsByVender = (context) => {
        const vender = env.browser;
        for (const target of context.querySelectorAll("[data-target-browser]")) {
            const allowed = target.dataset.targetBrowser.split(",");
            console.log(target, "allow browser: " + allowed);
            if (!allowed.includes(vender)) {
                console.info(target, " is removed due to the browser filter rule");
                target.remove();
            }
        }
    };

    queryUtil.findEventElem = findEventElem;
    queryUtil.removeElementsByVender = removeElementsByVender;
}

