export const findEventElem = (target) => {
    if (!(target instanceof HTMLElement)) {
        return null;
    }
    const elem = target.closest("[data-event]");
    if (elem instanceof HTMLElement) {
        return elem;
    }
    return null;
};

export const removeElementsByVender = (context) => {
    const vender = env.browser;
    for (const target of context.querySelectorAll("[data-target-browser]")) {
        const allowed = target.dataset.targetBrowser.split(",");
        logUtil.log(target, "allow browser: " + allowed);
        if (!allowed.includes(vender)) {
            console.info(target, " is removed due to the browser filter rule");
            target.remove();
        }
    }
};

export const fixHorizonOffset = (x, width = 0) => {
    return Math.min(Math.max(0, x), document.documentElement.clientWidth - width);
};

export const fixVerticalOffset = (y, height = 0) => {
    return Math.min(Math.max(0, y), document.documentElement.clientHeight - height);
};
