
async function migrateOldConfig(oldConfig) {

    function convertOldDir(dir) {
        switch (dir) {
            case "DIR_U": return "up";
            case "DIR_L": return "left";
            case "DIR_R": return "right";
            case "DIR_D": return "down";
            case "DIR_UP_L": return "upperLeft";
            case "DIR_UP_R": return "upperRight";
            case "DIR_LOW_L": return "lowerLeft";
            case "DIR_LOW_R": return "lowerRight";
            case "DIR_OUTER": return "any";
            default:
                console.trace("unknown direction", dir);
                return "any";
        }
    }

    function convertActionType(actionType) {
        if (actionType.endsWith("TEXT")) return "text";
        if (actionType.endsWith("LINK")) return "link";
        if (actionType.endsWith("IMAGE")) return "image";
        if (actionType.endsWith("IMAGE_LINK")) return "link";
        console.trace(" can not convert action type", actionType);
        return "text";
    }

    function convertActName(oldActionDetail, actionType) {
        switch (oldActionDetail.act_name) {
            case "ACT_OPEN": return actionType === 'text' ? 'search' : "open";
            case "ACT_COPY": return "copy";
            case "ACT_SEARCH": return "search";
            case "ACT_TRANS": return "translate";
            case "ACT_DL": return "download"
            case "ACT_FIND": return "find";
            case "ACT_PANEL": return "";
            default:
                console.trace("unknown action name");
                return "";
        }
    }

    function getCommandTarget(oldActionDetail) {
        switch (oldActionDetail.act_name) {
            case "ACT_OPEN": return convertActionType(oldActionDetail.open_type);
            case "ACT_COPY": return convertActionType(oldActionDetail.copy_type);
            case "ACT_SEARCH": return convertActionType(oldActionDetail.search_type);
            case "ACT_TRANS": return "text";
            case "ACT_DL": return convertActionType(oldActionDetail.download_type);
            case "ACT_FIND": return "text";
            case "ACT_PANEL": return "text";
            default:
                console.trace("unknown act_name", oldActionDetail.act_name)
                return "text";
        }
    }

    function convertTabPosition(oldActionDetail) {
        switch (oldActionDetail.tab_pos) {
            case "TAB_CUR": return "current";
            case "TAB_CLEFT": return "left";
            case "TAB_RRIGHT": return "right";
            case "TAB_FIRST": return "start";
            case "TAB_LAST": return "end";
            case "TAB_NEW_WINDOW": return "newWindow";
            case "TAB_PRIVATE_WINDOW": return "privateWindow";
            default: return "";
        }
    }

    function convertPrompt(oldActionDetail) {
        let content = oldConfig.tipsContent[oldActionDetail.act_name];
        return content ? content : "";
    }

    function convertSearchEngine(oldActionDetail) {
        if (oldActionDetail.is_browser_search) {
            let builtin = builtinSearchEngines.findIndex(a => a.name === oldActionDetail.engine_name) >= 0;
            return {
                name: builtin ? oldActionDetail.engine_name : "",
                url: builtin ? oldActionDetail.engine_url : "",
                builtin: false,
                icon: "",
                searchOnSite: oldActionDetail.search_onsite,
            }
        } else {
            return {
                name: oldActionDetail.engine_name,
                url: oldActionDetail.engine_url,
                builtin: false,
                icon: false,
                searchOnSite: oldActionDetail.search_onsite,
            }
        }
    }

    function convertDownload(oldActionDetail) {
        return {
            showSaveAsDialog: oldActionDetail.download_saveas,
            directory: oldActionDetail.download_directory === 8 ? "" : oldConfig.downloadDirectories[oldActionDetail.download_directory],
        }
    }

    function convertOldAction(oldAction, actionType) {
        let details = []
        for (const dir of Object.keys(oldAction)) {
            details.push({
                direction: convertOldDir(dir),
                command: convertActName(oldAction[dir], actionType),
                commandTarget: getCommandTarget(oldAction[dir]),
                activeTab: Boolean(oldAction[dir].tab_active),
                tabPosition: convertTabPosition(oldAction[dir]),
                searchEngine: convertSearchEngine(oldAction[dir]),
                download: convertDownload(oldAction[dir]),
                prompt: convertPrompt(oldAction[dir]),
                script: "",
            })
        }
        return details
    }

    function convertLimitation(key) {
        switch (key) {
            case "ALLOW_NORMAL": return "four";
            case "ALLOW_QUADRANT": return "diagonal";
            case "ALLOW_H": return "h";
            case "ALLOW_V": return "v";
            case "ALLOW_LOW_L_UP_R": return "rd";
            case "ALLOW_UP_L_LOW_R": return "ld";
            case "ALLOW_ALL": return "all";
            case "ALLOW_ONE": return "any";
            default: return "any";
        }
    }

    const builtinSearchEngines = await browser.search.get()

    let newConfig = configUtil.getBareConfig();

    newConfig.enableIndicator = Boolean(oldConfig.enableIndicator);
    newConfig.enablePrompt = Boolean(oldConfig.enablePrompt);
    newConfig.enableTimeout = Boolean(oldConfig.enableTimeoutCancel);
    newConfig.timeout = Number(oldConfig.timeoutCancel);
    newConfig.range = [oldConfig.triggeredDistance, oldConfig.maxTriggeredDistance];

    newConfig.features.disableFixURL = Boolean(oldConfig.disableFixURL);
    newConfig.features.extendMiddleButton = Boolean(oldConfig.middleButtonSelect);
    newConfig.features.preventUiRemove = false;
    newConfig.actions.push({
        name: "Default",
        condition: "",
        limitation: convertLimitation(oldConfig.directionControl.textAction),
        important: false,
        details: {
            text: convertOldAction(oldConfig.Actions.textAction, 'text'),
            link: convertOldAction(oldConfig.Actions.linkAction, 'link'),
            image: convertOldAction(oldConfig.Actions.imageAction, 'image'),
        }
    });
    newConfig.actions.push({
        name: "Shift Key",
        condition: "",
        limitation: convertLimitation(oldConfig.directionControl_ShiftKey.textAction),
        important: false,
        details: {
            text: convertOldAction(oldConfig.Actions_ShiftKey.textAction, 'text'),
            link: convertOldAction(oldConfig.Actions_ShiftKey.linkAction, 'link'),
            image: convertOldAction(oldConfig.Actions_ShiftKey.imageAction, 'image'),
        }
    });
    newConfig.actions.push({
        name: "Ctrl Key",
        condition: "",
        limitation: convertLimitation(oldConfig.directionControl_CtrlKey.textAction),
        important: false,
        details: {
            text: convertOldAction(oldConfig.Actions_CtrlKey.textAction, 'text'),
            link: convertOldAction(oldConfig.Actions_CtrlKey.linkAction, 'link'),
            image: convertOldAction(oldConfig.Actions_CtrlKey.imageAction, 'image'),
        }
    });
    return newConfig;
}

window.migrateOldConfig = migrateOldConfig;

function main() {

    document.querySelector("#backup").addEventListener("click", () => {

    });

    document.querySelector("#upgrade").addEventListener("click", async () => {
        document.querySelector("#file-input").click();
    });

    document.querySelector("#file-input").addEventListener("change", async (e) => {
        const file = e.target.files[0];
        if (!file) {
            console.log("not file is selected");
            return;
        }
        const fileReader = new FileReader();
        fileReader.onloadend = async () => {
            const oldConfig = JSON.parse(fileReader.result);
            console.log("old config", oldConfig);
            try {
                const newConfig = await migrateOldConfig(oldConfig);
                await browser.storage.local.set(newConfig);
                console.log("new config", newConfig);
                alert("success");
            } catch (ex) {
                console.error(ex);
                alert(ex);
            }
        }
        fileReader.readAsText(file);
    });
}

main();