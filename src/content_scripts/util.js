
var util = {
    IS_TOP_WINDOW: window.top === window,
    WE_UUID: browser.runtime.getURL('').match(/\/\/([\w-]+)\//i)[1],
    MIME_TYPE: {
        ".gif": "image/gif",
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".bmp": "image/bmp",
        ".txt": "text/plain",
        "Files": "Files"
    },
    EVENT_PAHSE: {
        NONE: 0,
        CAPTURING_PHASE: 1,
        AT_TARGET: 2,
        BUBBLING_PHASE: 3,
    },
    promptString: {
        "%a": {}, // action
        "%g": {}, // background foreground
        "%t": {}, // tabs position
        "%d": {}, // download directory
        "%s": null, // selection
        "%e": null, // engines' name
        "%y": {}, // type of action.
    },
    specialSites: ["vk.com"],


    injectStyle(opt = {
        url: "",
        css: ""
    }) {
        let style;
        if (opt.url && opt.url.length !== 0) {
            style = document.createElement("link");
            style.rel = "stylesheet";
            style.type = "text/css";
            style.href = opt.url;
            document.head.appendChild(style);
        }
        else if (opt.css && opt.css.length !== 0) {
            style = document.createElement("style");
            style.id = "GDStyle-" + Math.round(Math.random() * 100);
            style.type = "text/css";
            style.textContent = opt.css;
            document.head.appendChild(style);
        }
    },
    excludeThisWindow() {
        let ret = false;
        if (util.IS_TOP_WINDOW) {
            ret = false
            return ret;
        }
        const frame = window.frameElement;
        const rect = (frame && frame.getBoundingClientRect()) || null;
        if (frame && frame.tagName.toLowerCase() === 'object') ret = true;
        else if (rect && rect.width <= 50) ret = true;
        else if (rect && rect.height <= 50) ret = true;

        // if (ret === true) console.log(window);
        return ret;
    },
    excludeThisSite(patterns) {
        if (!Array.isArray(patterns)) {
            return false;
        }

        let ret = false;
        for (const r of patterns) {
            try {
                const pattern = new RegExp(r);
                if (pattern.test(location.href)) {
                    ret = true;
                    break;
                }
            } catch (error) {
                console.error(error);
                break;
            }

        }
        return ret;
    },

    translatePrompt(message, property, actionType, selection) {
        return message ? message
            .replace("%a", util.promptString["%a"][property["act_name"]])
            .replace("%t", util.promptString["%t"][property["tab_pos"]])
            .replace("%g", util.promptString["%g"][property["tab_active"] === true ? "FORE_GROUND" : "BACK_GROUND"])
            .replace("%d", util.promptString["%d"][property["download_directory"]] || "")
            .replace("%e", property["engine_name"])
            .replace("%y", util.promptString["%y"][actionType])
            .replace("%s", selection) : "Error Message!";
    }

}

function translatePromptString() {
    for (const key of Object.keys(commons)) {
        if (/^ACT_/.test(key)) {
            util.promptString["%a"][key] = getI18nMessage(key);
        }
        else if (/^(FORE|BACK)_GROUND/.test(key)) {
            util.promptString["%g"][key] = getI18nMessage(key);
        }
        else if (/^TAB_/.test(key)) {
            util.promptString["%t"][key] = getI18nMessage(key);
        }
    }
    for (let i = 0; i < 8; i++) {
        util.promptString["%d"][i.toString()] = browser.i18n.getMessage("DownloadDirectory", i);
    }
    util.promptString["%y"] = {
        "textAction": getI18nMessage("textType"),
        "imageAction": getI18nMessage("imageType"),
        "linkAction": getI18nMessage("linkType"),
    }
}
translatePromptString()