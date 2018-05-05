//TODO: 处理拖放区域为 input@type=text
"use strict";
console.info("Glitter Drag: Content script is injected by browser successfully");
const isRunInOptionsContext = browser.runtime.getBackgroundPage !== undefined ? true : false;
const IS_TOP_WINDOW = window.top === window;
const FIREFOX_VERSION = navigator.userAgent.match(/Firefox\/(\d\d)\.\d/)[1]; //wrong method

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

const specialSites = ["vk.com"];

//remove highlighting when Escape is pressed
document.addEventListener("keypress", (e) => {
    if (e.key === "Escape") {
        browser.runtime.sendMessage({
            cmd: "removeHighlighting"
        });
    }
})


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

const scrollbarLocker = {
    //https://stackoverflow.com/questions/13631730/how-to-lock-scrollbar-and-leave-it-visible
    x: 0,
    y: 0,
    lock: function() {
        this.x = window.scrollX;
        this.y = window.scrollY;
        window.addEventListener("scroll", this.doLock, false);
    },
    free: function() {
        window.removeEventListener("scroll", this.doLock, false);
    },
    doLock: function() {
        window.scrollTo(this.x,this.y);
    }
    
}
scrollbarLocker.doLock = scrollbarLocker.doLock.bind(scrollbarLocker);

class DragClass {
    constructor(elem) {

        this.running = false; // happend in browser
        this.accepting = false; // happend between browser and outer
        this.notAccepting = false;

        this.dragged = elem;
        this.handler = this.handler.bind(this);

        this.wrapperFunction = this.wrapperFunction.bind(this);

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
        if (IS_TOP_WINDOW) {
            this.promptBox = new Prompt();
            if (document.body.getAttribute("contenteditable") === null) {
                this.panelBox = new Panel({ dragenter: this.dragenter4panel.bind(this), dragleave: this.dragleave4panel.bind(this), drop: this.drop4panel.bind(this), dragover: this.dragover4panel.bind(this) });
            }
            window.addEventListener("message", this.onMessage.bind(this));
        }
        else {
            this.promptBox = new RemotePrompt();
        }

        this.indicatorBox = new Indicator();

        this.dragenter4panel = this.dragenter4panel.bind(this);
        this.dragleave4panel = this.dragleave4panel.bind(this);
        this.drop4panel = this.drop4panel.bind(this);
        this.dragover4panel = this.dragover4panel.bind(this)

        //end: UI componment

        this.timeoutId = -1; // used for clearTimeout

        this.doDropPreventDefault = false; // flag that indicate whether call event.preventDefault or not in drop event.
        this.isDropTouched = true; // flag that indicate whether the event object has been calling event.preventDefault or event.stopPropagation . 
        // if the site register drop event and use event.stopPropagation , this event won't bubble up as default. So assumeing it is true until we can catch.
        this.isInputArea = false;
        this.hideBecauseExceedDistance = false;

        this.registerEvent();
        /*
        setTimeout(() => {
            //延后函数的运行顺序 确保监听函数总是在最后执行
            console.info("GD:re-register event")
            this.unregisterEvent();
            this.registerEvent();
        }, 2333);
        */
    }
    registerEvent() {
        for (const n of ["dragstart", "dragover", "dragenter", "dragend"]) {
            this.dragged.addEventListener(n, this.wrapperFunction, true)
        }
        for (const n of ["dragstart", "dragover", "drop", "dragend"]) {
            this.dragged.addEventListener(n, this.wrapperFunction, false)
        }
    }
    unregisterEvent() {
        for (const n of ["dragstart", "dragover", "dragenter", "drop", "dragend"]) {
            this.dragged.removeEventListener(n, this.wrapperFunction, false);
            this.dragged.removeEventListener(n, this.wrapperFunction, true);
        }
    }
    wrapperFunction(evt) {
        this.handler(evt);
        return true;
    }
    onMessage(event) {

        const name = event.data["name"],
            func = event.data["func"];

        if (name === "promptBox") {
            if (func !== "RequestPrompt" && this.promptBox instanceof Prompt) {
                const f = this[name][func];
                f && f.apply(this[name], event.data[func]);
            }
        }
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
            modifierKey: this.modifierKey,
            fileInfo: null,
            imageData: null,
            bookmarks: null,
        }, extraOption);

        // console.info(sended);

        browser.runtime.sendMessage(sended);
    }

    postForBookmark(bookmarks) {
        browser.runtime.sendMessage({
            direction: null,
            selection: null,
            textSelection: null,
            imageLink: null,
            site: null,
            actionType: null,
            modifierKey: null,
            fileInfo: null,
            imageData: null,
            bookmarks,
        })
    }

    cancel() {
        clearTimeout(this.timeoutId);
        this.accepting = this.running = false;
        this.notAccepting = true;
        this.promptBox.hide();
        this.indicatorBox.hide();

    }
    updateModifierKey(evt) {
        console.assert(evt instanceof Event, "evt is not event");
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

        if(bgConfig.enableLockScrollbar){
            scrollbarLocker.lock();
        }

        this.indicatorBox.place(evt.pageX, evt.pageY, bgConfig.triggeredDistance);
        this.indicatorBox.display();


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

        //workaround #79
        for (const ext of [".jpg", ".jpeg", ".png", "gif"]) { //image viewer window
            if (location.href.endsWith(ext) && document.querySelector("img").src === location.href) {
                this.selection = location.href;
                break;
            }
        }

        //fix #85,part 2
        if (this.targetElem.nodeName === "A" && this.targetElem.href.startsWith("javascript") && this.targetElem.firstElementChild && this.targetElem.firstElementChild.nodeName === "IMG") {
            this.targetElem = this.targetElem.firstElementChild;
            this.imageLink = this.textSelection = this.selection = this.targetElem.src;
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

            if (bgConfig.imageReferrer === true && this.actionType === commons.imageAction) {
                let action = null;
                if (bgConfig.enableCtrlKey && this.modifierKey === commons.KEY_CTRL) {
                    action = bgConfig.Actions_CtrlKey.imageAction[this.direction];
                }
                else if (bgConfig.enableShiftKey && this.modifierKey === commons.KEY_SHIFT) {
                    action = bgConfig.Actions_ShiftKey.imageAction[this.direction];
                }
                else {
                    action = bgConfig.Actions.imageAction[this.direction];
                }

                if (action.act_name === commons.ACT_DL && [commons.DOWNLOAD_IMAGE, commons.DOWNLOAD_LINK].includes(action.download_type)) {

                    let _fetch = null;
                    if (FIREFOX_VERSION >= 58 && content.fetch) {
                        //see https://developer.mozilla.org/en-US/Add-ons/WebExtensions/Content_scripts#XHR_and_Fetch
                        _fetch = content.fetch;
                    }
                    else {
                        _fetch = fetch;
                    }
                    _fetch(this.imageLink, { cache: "force-cache" })
                        .then(a => a.arrayBuffer())
                        .then(arrayBuffer => {
                            const result = this.imageLink.match(commons.fileExtension);
                            const [name, ext] = result || ["image.jpg", ".jpg"];
                            this.post({
                                fileInfo: {
                                    name,
                                    type: MIME_TYPE[ext]
                                },
                                imageData: new Uint8Array(arrayBuffer).toString()
                            });
                        }).catch(() => { //may be CORS, fallback
                            this.post();
                        });
                }
                else {
                    this.post();
                }
            }
            else {
                this.post();
            }
            // if (this.actionType === "imageAction") {
            // this.post()
            // const result = this.selection.match(commons.fileExtension);
            // const [name, ext] = result || ["image.jpg", ".jpg"];
            // fetch(this.imageLink).then(res => res.arrayBuffer()).then(buf => {
            //     const bin = new Uint8Array(buf);
            //     this.post({
            //         imageData: bin.toString(),
            //         fileInfo: {
            //             type: MIME_TYPE[ext],
            //             name,
            //         },
            //     })
            // })
            // }
            // else {
            //     this.post();
            // }
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
            this.promptBox.hide();
        }
        else if ((this.distance > bgConfig.triggeredDistance || this.direction === commons.DIR_OUTER)) {
            this.direction = this.getDirection();

            if (this.hideBecauseExceedDistance) {
                this.hideBecauseExceedDistance = false;
                this.promptBox.display();
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
            if (bgConfig.enablePrompt) {

                this.promptBox.display();
                let message = bgConfig.tipsContent[property["act_name"]];
                if ((property["act_name"] === commons.ACT_OPEN && property["open_type"] === commons.OPEN_TEXT) ||
                    (property["act_name"] === commons.ACT_COPY && property["copy_type"] === commons.COPY_TEXT) ||
                    (property["act_name"] === commons.ACT_SEARCH && property["search_type"] === commons.SEARCH_TEXT) ||
                    (property["act_name"] === commons.ACT_DL && property["download_type"] === commons.DOWNLOAD_TEXT)) {
                    message = translatePrompt(message, property, commons.textAction, this.textSelection);
                }
                else {
                    message = translatePrompt(message, property, this.actionType, this.selection);
                }
                this.promptBox.render(this.direction, message);
            }
            //----

            this.panelBox.hide();
            if (property["act_name"] === commons.ACT_PANEL) {
                this.panelBox.render(this.actionType, this.targetType, this.selection, this.textSelection, this.imageLink);
                this.panelBox.place(evt.clientX, evt.clientY);
                this.panelBox.display();
                this.promptBox.hide();
            }
        }
        else {
            this.promptBox.hide();
        }
    }
    dragenter(evt) { //TODO
        this.selection = this.textSelection = "If you see this message, please report to the author of GlitterDrag"; // temporary
        const dt = evt.dataTransfer;
        // console.log(dt.getData("text/plain"));
        let fakeNode = null;
        if (dt.types.includes("text/x-moz-place")) {
            this.targetType = commons.TYPE_BOOKMARK;
            return;
        }
        else if (dt.types.includes("text/plain")) {
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
        this.textSelection = dt.getData("text/plain").trim();

        if (commons.TYPE_BOOKMARK === this.targetType) {
            const bookmarks = [];
            for (let i = 0; i < dt.mozItemCount; i++) {
                let [url, title] = dt.mozGetDataAt("text/x-moz-url", i).split("\n");
                bookmarks.push({ url, title });
            }
            this.postForBookmark(bookmarks);
            return;
        }
        else if (commons.TYPE_TEXT === this.targetType) {
            this.selection = this.textSelection;
        }
        else if (commons.TYPE_TEXT_URL === this.targetType) {
            this.selection = this.textSelection = typeUtil.fixupSchemer(this.textSelection);
        }
        else if (this.targetType === commons.TYPE_ELEM_A) {
            [this.selection, this.textSelection] = dt.getData("text/x-moz-url").split("\n");
        }
        else { //TODO 没有符合的选项
            return;
        }

        if (["textAction", "linkAction"].includes(this.actionType)) {
            this.post({
                direction: commons.DIR_OUTER
            });
            return;
        }

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

        const fileReader = new FileReader();
        let file = dt.files[0];
        fileReader.addEventListener("loadend", () => {
            this.post({
                selection: null,
                direction: commons.DIR_OUTER,
                textSelection: file.name,
                fileInfo: {
                    type: file.type,
                    name: file.name
                },
                imageData: new Uint8Array(fileReader.result).toString(),
            });
        });
        fileReader.readAsArrayBuffer(file);

    }

    dragenter4panel() {

        this.isPanelArea = true;
        // console.info("enter panel");
    }
    dragleave4panel() {
        // console.log(e);
        // this.isPanelArea = false;
    }
    drop4panel(e, lastdragovertarget) {
        // console.info(e.);
        // console.info(e.originalTarget.parentElement.dataset);
        const obj = Object.assign({}, lastdragovertarget.dataset);
        this.panelBox.hide();
        this.post(Object.assign(obj, {
            direction: commons.DIR_P,
            index: parseInt(obj.index)
        }));
        e.preventDefault(); //note!
    }
    dragover4panel() {

    }
    isNotAcceptable(evt) {
        // if the acceptable area is Input or Textarea, bypass it.
        if (["INPUT", "TEXTAREA", "#text"].includes(evt.target.nodeName)) {
            return true;
        }
        if (evt.target.getAttribute && evt.target.getAttribute("contenteditable") !== null) {
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
        // const VIEW_MODE = true;
        // const BREAK_MODE = true;
        // const SKIP_DRAGOVER = true;
        const type = evt.type;

        // if (VIEW_MODE) {
        //     console.log(evt.dataTransfer.types);
        //     if (!(SKIP_DRAGOVER && type === "dragover")) {
        //         console.log(type, evt.defaultPrevented, evt);

        //     }
        //     if (BREAK_MODE) {
        //         evt.preventDefault();
        //         return;
        //     }
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
                if (evt.target.nodeName === "A" && evt.target.href.startsWith("#")) {
                    return;
                }
                if (evt.target.nodeName === "OBJECT") {
                    return;
                }
                if (evt.target.getAttribute &&
                    (evt.target.getAttribute("contenteditable") !== null ||
                        evt.target.getAttribute("draggble") !== null)) {
                    return;
                }


                //fix #85,part 1
                if (evt.target.nodeName === "A" && evt.target.href.startsWith("javascript:")) {
                    if (evt.target.firstElementChild && evt.target.firstElementChild.nodeName === "IMG") {
                        this.running = true;
                        this.dragstart(evt);
                    }
                    return;
                }

                if (["#text", "A", "IMG"].includes(evt.target.nodeName)) {
                    this.running = true;
                    this.dragstart(evt);
                }
                else if (evt.target.nodeName === "TEXTAREA" ||
                    (evt.target.nodeName === "INPUT" && evt.target.type.toLowerCase() === "text")) {
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
                    evt.preventDefault();
                    this.accepting = true;
                    this.dragenter(evt);
                    break;
                }
                else if (this.running) {
                    evt.preventDefault();
                }
                break;
            case "dragover": // Capturing or Bubbling
                if (this.isNotAcceptable(evt)) {
                    this.promptBox.hide();
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
                        this.promptBox.hide();
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
                //https://github.com/harytfw/GlitterDrag/issues/75
                if (location.host === "mail.google.com" && evt.target.nodeName === "DIV" && evt.target.className.toLowerCase() === "ac9") {
                    this.accepting = false;
                }

                if (evt.dataTransfer && !this.running && this.accepting) {
                    const file = evt.dataTransfer.files[0];
                    const fileName = file && file.name;
                    const ext = fileName && fileName.match(commons.fileExtension)[1];
                    const containPlainText = evt.dataTransfer.types.includes("text/plain");

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
                if(bgConfig.enableLockScrollbar){
                    scrollbarLocker.free();
                }
                this.indicatorBox.hide();
                this.promptBox.hide();
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
                    if (this.running && (this.isDropTouched === false || specialSites.includes(location.host) || (bgConfig.specialSites && bgConfig.specialSites.includes(location.host)))) {
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