//TODO: 处理拖放区域为 input@type=text
"use strict";
console.info("Glitter Drag: Content script is injected by browser successfully");
let isRunInOptionsContext = browser.runtime.getBackgroundPage !== undefined ? true : false;
let IS_TOP_WINDOW = window.top === window;

const MIME_TYPE = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
    "Files": "Files"
}
Object.freeze(MIME_TYPE);

// https://developer.mozilla.org/en-US/docs/Web/API/Event/eventPhase
const EVENT_PAHSE = {
    NONE: 0,
    CAPTURING_PHASE: 1,
    AT_TARGET: 2,
    BUBBLING_PHASE: 3,
}
Object.freeze(EVENT_PAHSE);

// const ICONS = {
//     "download": browser.runtime.getURL("icon/download.png"),
//     "empty_trash": browser.runtime.getURL("icon/empty_trash_64px.png"),
//     "open_in_browser": browser.runtime.getURL("icon/open_in_browser.png"),
//     "search": browser.runtime.getURL("icon/search.png"),
//     "copy": browser.runtime.getURL("icon/copy.png"),
// }


//remove highlighting when Escape is pressed
document.addEventListener("keypress", (e) => {
    if (e.key === "Escape") {
        browser.runtime.sendMessage({
            cmd: "removeHighlighting"
        });
    }
})


function getAct(type, dir, key) {
    let r = null;
    if (key === commons.KEY_CTRL) {
        r = bgConfig["Actions_CtrlKey"][type][dir];
    }
    else if (key === commons.KEY_SHIFT) {
        r = bgConfig["Actions_ShiftKey"][type][dir];
    }
    else {
        r = bgConfig["Actions"][type][dir];
    }
    return r;
}

let promptString = {
    "%a": {}, // action
    "%g": {}, // background foreground
    "%t": {}, // tabs position
    "%d": {}, // download directory
    "%s": null, // selection
    "%e": null, // engines' name
    "%y": {}, // type of action.
};

function updatePromptString() {
    for (const key of Object.keys(commons)) {
        if (/^ACT_/.test(key)) {
            promptString["%a"][key] = getI18nMessage(key);
        }
        else if (/^(FORE|BACK)_GROUND/.test(key)) {
            promptString["%g"][key] = getI18nMessage(key);
        }
        else if (/^TAB_/.test(key)) {
            promptString["%t"][key] = getI18nMessage(key);
        }
    }
    for (let i = 0; i < 8; i++) {
        promptString["%d"][i.toString()] = browser.i18n.getMessage("DownloadDirectory", i);
    }
    promptString["%y"] = {
        "textAction": getI18nMessage("textType"),
        "imageAction": getI18nMessage("imageType"),
        "linkAction": getI18nMessage("linkType"),
    }
}
updatePromptString();

function translatePrompt(message, property, actionType, selection) {
    return message ? message
        .replace("%a", promptString["%a"][property["act_name"]])
        .replace("%t", promptString["%t"][property["tab_pos"]])
        .replace("%g", promptString["%g"][property["tab_active"] === true ? "FORE_GROUND" : "BACK_GROUND"])
        .replace("%d", promptString["%d"][property["download_directory"]] || "")
        .replace("%e", property["engine_name"])
        .replace("%y", promptString["%y"][actionType])
        .replace("%s", selection) : "Error Message!";
}

function removeExistedElement(selector) {
    try {
        let e = $E(selector);
        if (e !== null) {
            e.remove();
            return true;
        }
        return false;
    }
    catch (e) {
        return false;
    }
}

function injectStyle(opt = {
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
}


class Prompt {
    constructor() {
        removeExistedElement("#GDPrompt");
        this.container = document.createElement("div");
        this.container.id = "GDPrompt";
        this.textContainer = document.createElement("div");
        this.arrow = document.createElement("i")
        this.arrow.id = "GDArrow";
        this.container.appendChild(this.arrow);
        this.container.appendChild(this.textContainer);
        this.hide();
        document.body.appendChild(this.container);
    }
    render(dir, text) {
        //DIR_UP_L
        //[DIR,UP,L]
        //[UP,L]
        //UP-L
        this.arrow.className = `GDArrow-${dir.split("_").slice(1).join("-")}`;
        this.textContainer.textContent = text;
    }
    display() {
        if (this.container.style.display === "none") {
            this.container.style.setProperty("display", "block", "important");
        }
    }
    hide() {
        this.container.style.setProperty("display", "none", "important");
    }
    destory() {
        document.body.removeChild(this.container);
    }
}
class Indicator {
    constructor() {
        removeExistedElement("#GDIndicator");
        this.box = document.createElement("div");
        this.box.id = "GDIndicator";
        this.hide();
        document.body.appendChild(this.box);
    }
    place(x = 0, y = 0, radius = 0) {

        radius = radius / window.devicePixelRatio;
        this.box.style.setProperty("left", (x - radius) + "px", "important");
        this.box.style.setProperty("top", (y - radius) + "px", "important");
        const h = this.box.style.height = (radius * 2) + "px";
        const w = this.box.style.width = (radius * 2) + "px";
        this.box.style.setProperty("border-radius", `${w} ${h}`, "important");
        // if (radius <= 0) {
        //     this.hide();
        //     return;
        // }
    }
    display() {
        if (this.box.style.display === "none") this.box.style.setProperty("display", `initial`, "important");
    }
    hide() {
        this.box.style.setProperty("display", `none`, "important");
    }
    destory() {
        document.body.removeChild(this.box);
    }
}


const ICONS = {
    "ACT_DL": "GD-fa GD-fa-download",
    "ACT_OPEN": "GD-fa GD-fa-external-link",
    "ACT_SEARCH": "GD-fa GD-fa-search",
    "ACT_COPY": "GD-fa GD-fa-clipboard",
    "ACT_FIND": "GD-fa GD-fa-find",
    "BAN": "GD-fa GD-fa-ban",
}


const CMDPANEL_HTML_CONTENT = `
<table id="GDPanel">
    <tr id="GDHeader">
        <th colspan=3>
            动作
        </th>
    </tr>
    <tr class="GDLabel" id="GDLabel-text">
        <td class="GDLabel-content" colspan=3><span>文本：</span><span class="GDPanel-content">中国最强</span></td>
    </tr>
    <tr class="GDRow" id="GDRow-text">
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
    </tr>
    <tr class="GDLabel" id="GDLabel-link">
        <td class="GDLabel-content" colspan=3><span >链接：</span><span class="GDPanel-content"></span></td>
    <tr class="GDRow" id="GDRow-link">
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
    </tr>
    <tr class="GDLabel" id="GDLabel-image">
        <td class="GDLabel-content" colspan=3><span>图片：</span><span class="GDPanel-content"></span></td>
    </tr>
    <tr class="GDRow" id="GDRow-image">
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
        <td class="GDCell" align="center">
        </td>
    </tr>
    <tr class="GDRow" id="GDFooter">
        <td class="GDCell" id="GDCell-ban" colspan=2">
        <i class="${ICONS.BAN}" aria-hidden="true"></i>
        </td>
    </tr>
    
</table>`;


class cmdPanel {
    //TODO:内容长度自动裁剪
    //TODO:样式美观
    //TODO:完善图标自定义功能
    constructor(enterlistener, leaveListener, dropListener, overlistener) {
        removeExistedElement("#GDPanel-wrapper");
        this.el = document.createElement("div");
        this.hide();
        this.el.id = "GDPanel-wrapper";
        this.el.innerHTML = CMDPANEL_HTML_CONTENT;
        this.lastdragovertarget = null;

        this.el.addEventListener("drop", e => dropListener(e, this.lastdragovertarget));
        this.el.addEventListener("dragenter", enterlistener);
        this.el.addEventListener("dragleave", e => {
            leaveListener(e);
        });
        this.el.addEventListener("dragover", e => {
            if (e.target.className.indexOf("GDCell") >= 0 && this.lastdragovertarget != e.target) {
                this.lastdragovertarget && this.lastdragovertarget.classList.remove("GDCell-hover");
                this.lastdragovertarget = e.target;
                this.lastdragovertarget.classList.add("GDCell-hover");
                this.updateHeader(e);
                // overlistener(e);
            }
        });
        this.el.setAttribute("style", "visibility:hidden;z-index:-1");
        document.body.appendChild(this.el);

        // this.posX = this.el.offsetLeft - this.el.offsetWidth;
        // this.posY = this.el.offsetTop - this.el.offsetHeight;
        this.updateTable();
        this.el.style.setProperty("display", "none", "important");

    }

    updateHeader(e) {
        let header = this.el.querySelector("#GDHeader").firstElementChild;
        if (this.lastdragovertarget.id === "GDCell-ban") {
            header.textContent = "取消"; //getI18nMessage("Cancel");
            return;
        }
        const setting = bgConfig[e.target.dataset["key"]][e.target.dataset["index"]];
        header.textContent = translatePrompt("%g-%a", setting);
    }

    updateTable() {
        let row = this.el.querySelector("#GDRow-text");
        bgConfig.cmdPanel_textAction.forEach((obj, i) => {
            this.updateCell(row.children[i], "text", i);
        });

        row = this.el.querySelector("#GDRow-link");
        bgConfig.cmdPanel_linkAction.forEach((obj, i) => {
            this.updateCell(row.children[i], "link", i);
        });

        row = this.el.querySelector("#GDRow-image");
        bgConfig.cmdPanel_imageAction.forEach((obj, i) => {
            this.updateCell(row.children[i], "image", i);
        });
    }

    updateCell(element, kind, index) {
        element.dataset["kind"] = kind;
        const key = element.dataset["key"] = "cmdPanel_" + kind + "Action";
        element.dataset["index"] = index;
        const setting = bgConfig[key][index];
        // switch (setting.act_name) {
        //     case commons.ACT_OPEN:
        //         icon = ICONS.open;
        //         break;
        //     case commons.ACT_SEARCH:
        //         icon = ICONS.search;
        //         break;
        //     case commons.ACT_COPY:
        //         icon = ICONS.copy;
        //         break;
        //     case commons.ACT_DL:
        //         icon = ICONS.download;
        //         break;
        // }
        const i = document.createElement("i");
        // i.setAttribute("aria-hidden", true);
        i.className = ICONS[setting.act_name];
        element.appendChild(i);
    }
    render(actionkind, targetkind, selection, textSelection, imageLink) {
        function trim(str = "", len1 = 6, len2 = 6, maxlen = 12) {
            if (str.length <= maxlen) return str;
            return `${str.substr(0,len1)}...${str.substr(str.length-len2,len2)}`
        }
        $H(["#GDLabel-link", "#GDLabel-image", "#GDRow-link", "#GDRow-image"], "table-row");
        switch (actionkind) {
            case commons.textAction:
                $H(["#GDLabel-link", "#GDLabel-image", "#GDRow-link", "#GDRow-image"]);
                $E("#GDLabel-text .GDPanel-content").textContent = trim(textSelection);
                break;
            case commons.linkAction:
                if (targetkind === commons.TYPE_ELEM_A_IMG) {
                    $E("#GDLabel-image .GDPanel-content").textContent = imageLink;
                }
                else {
                    $H(["#GDLabel-image", "#GDRow-image"]);
                }
                $E("#GDLabel-link .GDPanel-content").textContent = trim(selection);
                $E("#GDLabel-text .GDPanel-content").textContent = trim(textSelection);
                break;
            case commons.imageAction:
                $H(["#GDLabel-text", "#GDRow-text", "#GDLabel-link", "#GDRow-link"]);
                $E("#GDLabel-image .GDPanel-content").textContent = trim(selection);
                break;
            default:
                break;
        }
    }
    place(x = 0, y = 0) {

        this.el.style.setProperty("visibility", `hidden`, "important");
        this.el.style.setProperty("display", `block`, "important");
        //通过上面2行代码正常获取offsetWidth并且不显示在页面上
        this.el.style.left = (x - this.el.firstElementChild.offsetWidth / 2) + "px";
        this.el.style.top = (y - this.el.firstElementChild.offsetHeight / 2) + "px";

        this.el.style.setProperty("display", `none`, "important");
        this.el.style.setProperty("visibility", `visible`, "important");
    }
    display() {
        this.el.style.setProperty("display", `block`, "important");
    }
    hide() {
        this.el.style.setProperty("display", `none`, "important");
    }
    destory() {
        document.body.removeChild(this.el);
    }

}

class DragClass {
    constructor(elem) {

        this.running = false; // happend in browser
        this.accepting = false; // happend between browser and outer
        this.notAccepting = false;

        this.dragged = elem;
        this.handler = this.handler.bind(this);

        this.wrapperFunction = this.wrapperFunction.bind(this);

        ["dragstart", "dragover", "dragenter", "dragend"].forEach(name =>
            this.dragged.addEventListener(name, this.wrapperFunction, true)
        );
        ["dragover", "drop", "dragend"].forEach(name =>
            this.dragged.addEventListener(name, this.wrapperFunction, false)
        );
        this.dragged.addEventListener("dragstart", this.wrapperFunction, false);

        // start: properties to post
        this.selection = ""; // any data, such as text, link
        this.textSelection = ""; // text you select.
        this.imageLink = ""; // image file location
        this.modifierKey = commons.KEY_NONE;
        this.actionType = "textAction";
        this.direction = commons.DIR_U;
        // end: properties to post

        this.lastDirection = null;
        this.lastModifierKey = null;

        // start: variable to identify type of action
        this.targetElem = null;
        this.targetType = commons.TYPE_UNKNOWN;
        // end: variable to identify type of action

        // start: value that can be use in UI process
        this.distance = 0;
        this.startPos = {
            x: 0,
            y: 0
        };
        this.endPos = {
            x: 0,
            y: 0
        };
        this.isPanelArea = false;
        // end: value that can be use in UI process

        // start: UI componment
        this.promptBox = null;
        this.indicatorBox = null;

        this.dragenter4panel = this.dragenter4panel.bind(this);
        this.dragleave4panel = this.dragleave4panel.bind(this);
        this.drop4panel = this.drop4panel.bind(this);
        this.dragover4panel = this.dragover4panel.bind(this)

        this.cmdPanel = null;
        //end: UI componment

        this.timeoutId = -1; // used for clearTimeout

        this.doDropPreventDefault = false; // flag that indicate whether call event.preventDefault or not in drop event.
        this.isDropTouched = true; // flag that indicate whether the event object has been calling event.preventDefault or event.stopPropagation . 
        // if the site register drop event and use event.stopPropagation , this event won't bubble up as default. So assumeing it is true until we can catch.
        this.isInputArea = false;
        this.hideBecauseExceedDistance = false;
    }
    wrapperFunction(evt) {
        this.handler(evt);
        return true;
    }
    post(extraOption = {}) {
        //sendMessage只能传递字符串化后（类似json）的数据
        //不能传递具体对象
        let sended = Object.assign({
            direction: this.direction,
            selection: this.selection,
            textSelection: this.textSelection,
            imageLink: this.imageLink,
            site: location.host,
            actionType: this.actionType,
            sendToOptions: false,
            modifierKey: this.modifierKey,
        }, extraOption);

        // console.info(sended);
        if (isRunInOptionsContext) {
            sended.sendToOptions = true;
            // backgroundPage.executor.DO(sended);
        }
        browser.runtime.sendMessage(sended);
    }
    cancel() {
        clearTimeout(this.timeoutId);
        this.accepting = this.running = false;
        this.notAccepting = true;
        this.promptBox && this.promptBox.hide();
        this.indicatorBox && this.indicatorBox.hide();

    }
    updateModifierKey(evt) {
        if (evt.ctrlKey) {
            this.modifierKey = commons.KEY_CTRL;
        }
        else if (evt.shiftKey) {
            this.modifierKey = commons.KEY_SHIFT;
        }
        else {
            this.modifierKey = commons.KEY_NONE;
        }

    }
    dragstart(evt) {
        if (bgConfig.enableIndicator /*&& this.indicatorBox === null*/ ) {
            this.indicatorBox = new Indicator();
        }

        if (this.indicatorBox !== null) {
            this.indicatorBox.place(evt.pageX, evt.pageY, bgConfig.triggeredDistance);
            this.indicatorBox.display();
        }

        if (bgConfig.enablePrompt /*&& this.promptBox === null*/ ) {
            if (IS_TOP_WINDOW) {
                this.promptBox = new Prompt();
            }
        }

        if (document.body.getAttribute("contenteditable") === null /*&& this.cmdPanel===null*/ ) {
            if (IS_TOP_WINDOW) {
                this.cmdPanel = new cmdPanel(this.dragenter4panel, this.dragleave4panel, this.drop4panel, this.dragover4panel);
            }
        }

        if (bgConfig.enableTimeoutCancel) {
            this.timeoutId = setTimeout(() => this.cancel(), bgConfig.timeoutCancel);
        }


        this.startPos.x = evt.screenX;
        this.startPos.y = evt.screenY;
        this.updateModifierKey(evt);

        this.targetElem = evt.target;

        try {
            //we are not allow to use getData when dragging external file here.
            this.selection = evt.dataTransfer.getData("text/x-moz-url-data").trim();
            this.imageLink = evt.dataTransfer.getData("application/x-moz-file-promise-url");
            this.textSelection = evt.dataTransfer.getData("text/plain").trim();
        }
        catch (e) {
            $D(e);
            return;
        }

        if (this.selection === "") {
            this.selection = this.textSelection;
        }
        if (this.targetElem.nodeName === "A") {
            this.textSelection = this.targetElem.textContent;
        }
        this.targetType = typeUtil.checkDragTargetType(this.selection, this.textSelection, this.imageLink, this.targetElem);

        if (commons.TYPE_TEXT_URL === this.targetType) {
            this.selection = this.textSelection = typeUtil.fixupSchemer(this.selection);
        }

        this.actionType = typeUtil.getActionType(this.targetType);
        if (bgConfig.alwaysImage && this.targetType === commons.TYPE_ELEM_A_IMG) {
            this.selection = this.imageLink;
            this.actionType = commons.imageAction;
        }

        // Need Tests
        // if (this.selection === this.imageLink && this.actionType === commons.linkAction) {
        //     this.actionType = commons.imageAction;
        // }
        // console.info(`GlitterDrag: drag start, ${this.actionType} ${this.targetType}`);
    }
    dragend(evt) {
        clearTimeout(this.timeoutId);
        // this.direction = this.getDirection();
        // what should we do if user release ctrl or shift key while dragging?

        if (this.distance >= bgConfig.triggeredDistance && this.distance <= bgConfig.maxTriggeredDistance) {
            this.direction = this.getDirection();

            if (this.actionType === "imageAction") {
                const result = this.selection.match(commons.fileExtension);
                const [name, ext] = result || ["image.jpg", ".jpg"];
                fetch(this.imageLink).then(res => res.arrayBuffer()).then(buf => {
                    const bin = new Uint8Array(buf);
                    this.post({
                        imageData: bin.toString(),
                        fileInfo: {
                            type: MIME_TYPE[ext],
                            name,
                        },
                        hasImageBinary: true,
                    })
                })
            }
            else {
                this.post();
            }
        }


        this.modifierKey = commons.KEY_NONE;
    }
    dragover(evt) {
        this.updateModifierKey(evt);
        if (this.isPanelArea) {
            // console.log("panel!");
            return;
        }
        this.distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);

        if (this.distance > bgConfig.maxTriggeredDistance) {
            this.hideBecauseExceedDistance = true;
            this.promptBox && this.promptBox.hide();
            // this.indicatorBox && this.indicatorBox.hide();
        }
        else if (IS_TOP_WINDOW && (this.distance > bgConfig.triggeredDistance || this.direction === commons.DIR_OUTER)) {
            this.direction = this.getDirection();

            if (this.hideBecauseExceedDistance) {
                this.hideBecauseExceedDistance = false;
                this.promptBox && this.promptBox.display();
            }

            if (this.modifierKey === this.lastModifierKey && this.direction === this.lastDirection) {
                // this.lastDirection = this.direction;
                return;
            }
            else {
                this.lastModifierKey = this.modifierKey;
            }
            // console.log(`cur dir:${this.direction} , last dir:${this.lastDirection}`);
            this.lastDirection = this.direction;
            let actions = null;
            if (bgConfig.enableCtrlKey && this.modifierKey === commons.KEY_CTRL) {
                actions = bgConfig.Actions_CtrlKey;
            }
            else if (bgConfig.enableShiftKey && this.modifierKey === commons.KEY_SHIFT) {
                actions = bgConfig.Actions_ShiftKey;
            }
            else {
                actions = bgConfig.Actions;
            }

            let property = actions[this.actionType][this.direction]
            if (bgConfig.enablePrompt && this.promptBox !== null) {

                this.promptBox.display();
                let message = bgConfig.tipsContent[property["act_name"]];
                // console.log(promptString["%g"][property["download_directory"]]);
                message = translatePrompt(message, property, this.actionType, this.selection);
                this.promptBox.render(this.direction, message);
            }
            //----

            this.cmdPanel.hide();
            if (property["act_name"] === commons.ACT_PANEL) {
                this.cmdPanel.render(this.actionType, this.targetType, this.selection, this.textSelection, this.imageLink);
                this.cmdPanel.place(evt.pageX, evt.pageY, this.direction);
                this.cmdPanel.display();
                this.promptBox && this.promptBox.hide();
            }
            //----

        }
        else {
            this.promptBox && this.promptBox.hide();
        }
    }
    dragenter(evt) {
        this.selection = this.textSelection = "If you see this message, please report to the author of GlitterDrag"; // temporary
        const dt = evt.dataTransfer;
        // console.log(dt.getData("text/plain"));
        let fakeNode = null;
        if (dt.types.includes("text/plain")) {
            if (dt.types.includes("text/x-moz-url")) {
                this.selection = "https://example.org";
                fakeNode = document.createElement("a");
            }
            else {
                fakeNode = document.createTextNode("");
            }
        }
        else if (dt.types.includes("Files")) {
            fakeNode = document.createElement("img");
        }
        else {
            console.log("Not here!!!");
            return;
        }
        this.targetType = typeUtil.checkDragTargetType(this.selection, this.textSelection, this.imageLink, fakeNode);

        this.actionType = typeUtil.getActionType(this.targetType);
    }
    drop(evt) {
        console.info("Glitter Drag: An external dragging behavior is detected");
        const dt = evt.dataTransfer;
        this.selection = dt.getData("text/plain").trim();
        if (commons.TYPE_TEXT_URL === this.targetType) {
            this.selection = this.textSelection = typeUtil.fixupSchemer(this.selection);
        }
        else if (this.targetType === commons.TYPE_ELEM_A) {
            //书签
            [this.selection, this.textSelection] = dt.getData("text/x-moz-url").split("\n");
            //console.log(this.selection,this.textSelection);
        }
        // console.log(dt.files);
        const sended = {
            selection: null,
            direction: commons.DIR_OUTER,
            textSelection: "",
            hasImageBinary: false,
            fileInfo: {
                type: "",
                name: ""
            }
        };
        if (["textAction", "linkAction"].includes(this.actionType)) {
            this.post({
                direction: commons.DIR_OUTER
            });
        }
        const fileReader = new FileReader();
        let file = dt.files[0];
        fileReader.addEventListener("loadend", () => {
            let bin = new Uint8Array(fileReader.result);
            // console.log(bin, bin.length);
            sended.imageData = bin.toString(); // convert ArrayBuffer to string
            sended.externalFlag = true;
            sended.fileInfo.name = file.name;
            sended.fileInfo.type = file.type;
            this.post(sended);
        });

        let action = null;
        if (bgConfig.enableCtrlKey && this.modifierKey === commons.KEY_CTRL) {
            action = bgConfig.Actions_CtrlKey.imageAction.DIR_OUTER;
        }
        else if (bgConfig.enableShiftKey && this.modifierKey === commons.KEY_SHIFT) {
            action = bgConfig.Actions_ShiftKey.imageAction.DIR_OUTER;
        }
        else {
            action = bgConfig.Actions.imageAction.DIR_OUTER;
        }
        if (action.act_name === commons.ACT_NONE) { // nothing happen
            return;
        }
        else if (action.act_name === commons.ACT_OPEN && action.tab_pos === commons.TAB_CUR) {
            this.doDropPreventDefault = false;
            return;
        }
        sended.textSelection = file.name; // name of image file
        fileReader.readAsArrayBuffer(file);

    }

    dragenter4panel(e) {

        this.isPanelArea = true;
        // console.info("enter panel");
    }
    dragleave4panel(e) {
        // console.log(e);
        // this.isPanelArea = false;
    }
    drop4panel(e, lastdragovertarget) {
        // console.info(e.);
        // console.info(e.originalTarget.parentElement.dataset);
        const obj = Object.assign({}, lastdragovertarget.dataset);
        this.cmdPanel.hide();
        this.post(Object.assign(obj, {
            direction: commons.DIR_P,
            index: parseInt(obj.index)
        }));
        e.preventDefault(); //note!
    }
    dragover4panel(e) {

    }
    isNotAcceptable(evt) {
        // if the acceptable area is Input or Textarea, bypass it.
        if (["INPUT", "TEXTAREA"].includes(evt.target.nodeName)) {
            return true;
        }
        if (evt.target.getAttribute("contenteditable") !== null) {
            return true;
        }
        return false;

    }
    handler(evt) {
        // dragstart target是拖拽的东西
        // dragend   同上
        // dragover  target是拖放的目标区域
        // drop      同上
        // dragenter 同上


        const type = evt.type;
        // if (1) {
        //     // console.log(`type:${type} phase:${evt.eventPhase} prevent:${evt.defaultPrevented} touched:${this.isDropTouched} running:${this.running} accepting:${this.accepting}}`)
        //     console.log(`${type}, ${this.endPos.x}, ${this.endPos.y}, ${isTopWindow}`);
        // }
        if (type === "dragover" || type === "dragstart") {
            // only store screenX in dragover and dragstart.
            this.endPos.x = evt.screenX;
            this.endPos.y = evt.screenY;

        }
        else if (type === "dragend") {
            // https://github.com/harytfw/GlitterDrag/issues/38
            // this.endPos.x /= devicePixelRatio;
            // this.endPos.y /= devicePixelRatio;
        }

        switch (type) {
            case "dragstart":
                this.notAccepting = true;
                this.isInputArea = false;
                this.lastDirection = null;
                // if (this.isNotAcceptable(evt)) {
                //     return;
                // }
                if (evt.target.nodeName === "A" &&
                    (evt.target.href.startsWith("javascript:") || evt.target.href.startsWith("#"))) {
                    return;
                }
                // don't process it if the node has set attribute "draggable" 
                if (evt.target.nodeName === "#text" || (evt.target.getAttribute && evt.target.getAttribute("draggable") === null)) {
                    this.running = true;
                    this.dragstart(evt);
                }
                break;
            case "dragenter":
                this.accepting = false;
                this.isPanelArea = false;
                if (this.isNotAcceptable(evt)) {
                    return;
                }
                if (this.notAccepting) {
                    this.notAccepting = false;
                    return;
                }
                if (evt.dataTransfer && !this.running) {
                    const mimes = Object.values(MIME_TYPE);
                    for (let i = 0; i < mimes.length; i++) {
                        const mime = mimes[i];
                        if (evt.dataTransfer.types.includes(mime)) {
                            evt.preventDefault();
                            this.accepting = true;
                            this.dragenter(evt);
                            break;
                        }
                    }
                }
                else if (this.running) {
                    evt.preventDefault();
                }
                break;
            case "dragover": // Capturing or Bubbling
                if (this.isNotAcceptable(evt)) {
                    this.promptBox && this.promptBox.hide();
                    return;
                }

                this.isDropTouched = true; // assume it was tocuhed.
                if (evt.eventPhase === EVENT_PAHSE.CAPTURING_PHASE) {
                    if (this.running || this.accepting) {
                        this.dragover(evt);
                    }
                    else {
                        this.notAccepting = true;
                    }
                }
                else {
                    if (evt.defaultPrevented) {
                        this.promptBox && this.promptBox.hide();
                    }
                    if (this.running || this.accepting) {
                        evt.preventDefault();
                    }
                }
                break;
            case "drop": // Bubbling
                // drop's target is the area we can put something, so calling this.isNotAcceptable to update this.isInputArea status.
                this.isInputArea = this.isNotAcceptable(evt);
                if (this.isInputArea) {
                    return;
                }
                /*
                 * Without using this addon, browser will open this image with URL like file:///... normally.
                 * WebExtension has ability to match  file:/// and run under file:///... page . However , due to the security restriction, WE can not get this kind of url : file:///
                 * In order to not influence browser default behavior when action  is "open" and position of tab is "current", I  decide not to call event.preventDefault 
                 * Because after calling event.preventDefault , we have no method to cancel it.
                 * For this reason, using doDropPreventDefault to indicate whether use event.preventDefault or not.
                 */
                this.doDropPreventDefault = false;
                this.isDropTouched = false;

                if (evt.defaultPrevented) {
                    this.isDropTouched = true;
                }
                // console.log(evt);
                if (evt.dataTransfer && !this.running && this.accepting) {
                    const file = evt.dataTransfer.files[0];
                    const fileName = file && file.name;
                    const ext = fileName && fileName.match(commons.fileExtension)[1];
                    const containPlainText = "text/plain" in evt.dataTransfer.types;

                    if (bgConfig.maxProcessSize && file && file.size >= (bgConfig.maxProcessSize * 1024 * 1024)) {
                        //DO NOTHING
                    }

                    else if (containPlainText || bgConfig.allowExts.includes(ext)) {
                        this.doDropPreventDefault = true;
                        this.accepting = false;
                        this.drop(evt);
                    }
                }
                else if (this.running) {
                    this.doDropPreventDefault = true;
                }

                if (this.doDropPreventDefault) {
                    evt.preventDefault();
                }
                break;
            case "dragend": // Bubbling
                // this.indicatorBox && this.indicatorBox.hide();
                // this.promptBox && this.promptBox.hide();
                // this.cmdPanel && this.cmdPanel.hide();
                this.indicatorBox && this.indicatorBox.destory();
                this.promptBox && this.promptBox.destory();
                this.cmdPanel && this.cmdPanel.destory();
                this.indicatorBox = this.promptBox = this.cmdPanel = null;
                this.lastDirection = null;
                //dragend's target is things we are dragging, calling this.isNotAcceptable has not effect. However we have updated this.isInputArea in drop event, just use it.
                if (this.isInputArea) {
                    return;
                }
                // else if (this.isNotAcceptable(evt)) {
                //     return
                // }
                if (evt.eventPhase === EVENT_PAHSE.BUBBLING_PHASE) {
                    // when the site is an exclusiveSite, ignore this.isDropTouched
                    if (this.running && (this.isDropTouched === false || (bgConfig.specialSites && bgConfig.specialSites.includes(location.host)))) {
                        this.running = false;
                        this.dragend(evt);
                    }
                }
                break;
            default:
                break;
        }
        // if (["dragover"].includes(type)) {
        //     console.log(`type:${type} phase:${evt.eventPhase} prevent:${evt.defaultPrevented} touched:${this.isDropTouched} running:${this.running} accepting:${this.accepting}}`)
        // }
    }



    getDirection() {
        function BETW(a, b) {
            if (a < 0 || b < 0 || a > 360 || b > 360) alert("范围错误");
            return a < b && a <= scale && scale < b;
        }
        if (this.accepting) return commons.DIR_OUTER;
        let d = {
            one: commons.DIR_U,
            normal: commons.DIR_D, //普通的四个方向
            horizontal: commons.DIR_L, //水平方向,只有左右
            vertical: commons.DIR_D, //竖直方向，只有上下
            upperLeft: commons.DIR_UP_L,
            lowerLeft: commons.DIR_LOW_L,
            quadrant: commons.DIR_LOW_L,
            all: commons.DIR_D //达到了8个方向，绝对够用

        }

        let rad = Math.atan2(this.startPos.y - this.endPos.y, this.endPos.x - this.startPos.x);
        let degree = rad * (180 / Math.PI);
        let unit = 0; //按方向分割后的每一部分角度单元
        let scale = 0; //把得到的角度除以单元得到相应的比例,

        degree = degree >= 0 ? degree : degree + 360; //-180~180转换成0~360

        unit = 360 / 8; //4个方向需要分割成八部分，也就是方向*2
        scale = degree / unit;
        if (BETW(1, 3)) d.normal = commons.DIR_U; //unit*1=45, unit*3=135
        else if (BETW(3, 5)) d.normal = commons.DIR_L;
        else if (BETW(5, 7)) d.normal = commons.DIR_D;
        //角度越过零，放在这里
        else d.normal = commons.DIR_R;

        if (BETW(0, 2)) d.quadrant = commons.DIR_UP_R;
        else if (BETW(2, 4)) d.quadrant = commons.DIR_UP_L;
        else if (BETW(4, 6)) d.quadrant = commons.DIR_LOW_L;
        else d.quadrant = commons.DIR_LOW_R;

        unit = 360 / 4;
        scale = degree / unit;
        if (BETW(1, 3)) d.horizontal = commons.DIR_L;
        else d.horizontal = commons.DIR_R;

        if (BETW(0, 2)) d.vertical = commons.DIR_U;
        else d.vertical = commons.DIR_D;

        if (BETW(0.5, 2.5)) d.upperLeft = commons.DIR_UP_L;
        else d.upperLeft = commons.DIR_LOW_R;

        if (BETW(1.5, 3.5)) d.lowerLeft = commons.DIR_LOW_L;
        else d.lowerLeft = commons.DIR_UP_R;

        unit = 360 / 16;
        scale = degree / unit;
        if (BETW(1, 3)) d.all = commons.DIR_UP_R;
        else if (BETW(3, 5)) d.all = commons.DIR_U;
        else if (BETW(5, 7)) d.all = commons.DIR_UP_L;
        else if (BETW(7, 9)) d.all = commons.DIR_L;
        else if (BETW(9, 11)) d.all = commons.DIR_LOW_L;
        else if (BETW(11, 13)) d.all = commons.DIR_D;
        else if (BETW(13, 15)) d.all = commons.DIR_LOW_R;
        else d.all = commons.DIR_R;
        // return d.normal;
        let controlObject = null;
        if (bgConfig.enableCtrlKey && this.modifierKey === commons.KEY_CTRL) {
            controlObject = bgConfig.directionControl_CtrlKey;
        }
        else if (bgConfig.enableShiftKey && this.modifierKey === commons.KEY_SHIFT) {
            controlObject = bgConfig.directionControl_ShiftKey;
        }
        else {
            controlObject = bgConfig.directionControl;
        }
        switch (controlObject[this.actionType]) {
            case commons.ALLOW_ALL:
                return d.all;
            case commons.ALLOW_NORMAL:
                return d.normal;
            case commons.ALLOW_H:
                return d.horizontal;
            case commons.ALLOW_V:
                return d.vertical;
            case commons.ALLOW_ONE:
                return d.one;
            case commons.ALLOW_LOW_L_UP_R:
                return d.lowerLeft;
            case commons.ALLOW_UP_L_LOW_R:
                return d.upperLeft;
            case commons.ALLOW_QUADRANT:
                return d.quadrant;
            default:
                return d.normal;
        }
    }

}

const clipboard = {
    storage: null,
    parent: null,
    write: function(parent, content = "") {
        //why we need parent?
        //assumed that the textarea element  become the last child of document.body
        //if we call focus() method, the window will scroll to the bottom  which brings annoying
        //experience to user. 
        this.parent = parent;
        this.writeClipboard(content);

        //cleanup
        this.storage = null;
        this.parent = null;
    },
    read: function() {},
    writeClipboard: function(content = "") {
        this.storage = document.createElement("textarea");
        this.storage.style.width = "0px";
        this.storage.style.height = "0px";
        this.storage.value = content;
        this.parent.appendChild(this.storage);
        this.storage.focus();
        this.storage.setSelectionRange(0, this.storage.value.length);
        document.execCommand("copy");
        this.parent.removeChild(this.storage);
    }
}

//alternative clipboard
/*
class Clipboard {
    constructor() {
        this.copyListener = this.copyListener.bind(this);
        this.pasterListener = this.pasterListener.bind(this);
        document.addEventListener("copy", this.copyListener);
        this.data = "";
        // document.addEventListener("paste",this.pasterListener);      
    }
    copyListener(event) {
        event.clipboardData.setData("text/plain", this.data);
        event.preventDefault();
    }
    pasterListener() {

    }
    write(data) {
        this.data = data;
        document.execCommand("copy");
    }
    read() {
    }
}
const clipboard = new Clipboard();
*/


function CSlistener(msg) {
    let node = mydrag.targetElem && mydrag.targetElem.parentElement ? mydrag.targetElem.parentElement : document.body.firstChild;
    clipboard.write(node, msg.data);
    // case commons.COPY_IMAGE:
    //     browser.runtime.sendMessage({
    //         imageSrc: elem.src
    //     });
    // getImageBase64(elem.src, (s) => {
    //     browser.runtime.sendMessage({ imageBase64: s });
    // })
}

// function onGettingConfig(config) {
//     // TODO: debug;
//     bgConfig = JSON.parse(config);
//     // console.log(bgConfig);
// }

function onConnect(port) {
    if (port.name === "sendToContentScript") {
        port.onMessage.addListener(CSlistener);
    }
}
browser.runtime.onConnect.addListener(onConnect);


let bgConfig = null;
let mydrag = null;
let bgPort = browser.runtime.connect({
    name: "initial"
});

function doInit() {
    if (mydrag === null && document.body && document.body.getAttribute("contenteditable") === null) {
        injectStyle({
            url: browser.runtime.getURL("content_scripts/content_script.css")
        });
        // injectStyle({
        //     url: browser.runtime.getURL("content_scripts/font-awesome.css")
        // })
        if (bgConfig.enableStyle) {
            injectStyle({
                css: bgConfig.style
            });
        }
        try {
            mydrag = new DragClass(document);
        }
        catch (error) {
            console.error("GlitterDrag: Fail to initialize DragCLass");
            console.error(error);
        }
        document.removeEventListener("readystatechange", onReadyStateChange);
        document.removeEventListener("DOMContentLoaded", OnDOMContentLoaded);
    }
}

function onReadyStateChange() {
    if (document.readyState === "complete") doInit();
}

function OnDOMContentLoaded() {
    doInit();
}

function onStorageChange(changes) {
    for (const key of Object.keys(changes)) {
        bgConfig[key] = changes[key].newValue;
        // mydrag.cmdPanel.updateTable();
    }
}

browser.storage.onChanged.addListener(onStorageChange);
const condition = true;
if (condition === true) { //a storage bug that reported in #65,so using another way to load configuration.
    browser.storage.local.get().then(config => {
        console.info("GlitterDrag: loaded config from storage");
        bgConfig = config;
        document.addEventListener('readystatechange', onReadyStateChange, false);
        document.addEventListener("DOMContentLoaded", OnDOMContentLoaded);
        doInit();
    });
}
else {
    bgPort.onMessage.addListener(response => {
        console.info("Glitter Drag: Receive response from background");
        bgConfig = response;
        document.addEventListener('readystatechange', onReadyStateChange, false);
        document.addEventListener("DOMContentLoaded", OnDOMContentLoaded);
        doInit();
    });
}

window.addEventListener("beforeunload", () => {
    browser.storage.onChanged.removeListener(onStorageChange);
    browser.runtime.onConnect.removeListener(onConnect);
    bgPort.disconnect();
});



function checkInit() {
    if (!mydrag || !bgConfig) {
        if (confirm("Glitter Drag: Initializing extension faill, please report to the author of Glitter Drag")) {
            location.replace("https://github.com/harytfw/GlitterDrag");
        }
    }
    else {
        console.info("Glitter Drag: Initializing done.");
    }
}
// setTimeout(checkInit, 4800);
