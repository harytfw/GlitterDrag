"use strict";

logUtil.logErrorEvent();

const SELECTION_TYPE = {
    unknown: "unknown",
    plainText: "plainText",
    urlText: "urlText",
    plainAnchor: "plainAnchor",
    anchorContainsImg: "anchorContainsImage",
    plainImage: "plainImage",
};

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".txt"];
const IMAGE_MIMES = ["image/png", "image/jpeg"];
const TEXT_EXTENSIONS = [".txt", ".text"];
const TEXT_MIMES = ["text/plain"];
const MIME_TO_EXTENSION = {
    "image/png": ".png",
    "image/jpeg": ".jpeg",
    "text/plain": ".text"
};

const COND_NO = "";
const COND_CTRL = 'ctrl';
const COND_SHIFT = 'shift';
const COND_ALT = 'alt';
const COND_EXT = "ext";
const COND_FRAME = 'frame';

class Controller {

    // static getFileExtension(filename) {
    //     const parts = filename.split(".")
    //     if (parts.length < 2) {
    //         return ""
    //     }
    //     return parts[parts.length]
    // }

    static includesPlainText(dataTransfer) {
        return dataTransfer.types.includes("text/plain");
    }

    static includesFile(dataTransfer) {
        return dataTransfer.types.includes("Files");
    }

    static includesValidFile(dataTransfer) {
        for (const item of dataTransfer.items) {
            if (IMAGE_MIMES.includes(item.type)) {
                return true;
            }
            if (TEXT_MIMES.includes(item.type)) {
                return true;
            }
        }
        return false;
    }

    static async extractText(dataTransfer) {
        for (const mime of TEXT_MIMES) {
            if (dataTransfer.types.includes(mime)) {
                return dataTransfer.getData(mime);
            }
        }
        let f = null;
        outer: for (const file of dataTransfer.files) {
            for (const mime of TEXT_MIMES) {
                if (file.type === mime) {
                    f = file;
                    break outer;
                }
            }
        }
        if (f != null) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    resolve(reader.result);
                }
                reader.onerror = (ev) => {
                    reject(ev);
                }
                reader.readAsText(f);
            })
        }
        return ""
    }

    static angleToDirection(angle, mapping) {
        for (const obj of mapping) {
            if (obj.range[0] <= angle && angle < obj.range[1]) {
                return obj.value;
            }
        }
        throw new Error("failed to convert angle to direction:");
    }

    static predictActionType(selectionType) {
        switch (selectionType) {
            case SELECTION_TYPE.plainText:
                return "text";
            case SELECTION_TYPE.plainAnchor:
                return "link";
            case SELECTION_TYPE.plainImage:
                return "image";
            case SELECTION_TYPE.urlText:
                return "link";
            case SELECTION_TYPE.anchorContainsImg:
                return "link";
            default:
                console.trace("unknown selection type");
                return "";
        }
    }

    static isText(node) {
        return node instanceof Text;
    }

    static isTextInput(node) {
        return node instanceof HTMLTextAreaElement ||
            (node instanceof HTMLInputElement && ["text", "number", "url"].includes(node.type.toLowerCase()));
    }

    static isAnchor(node) {
        if (node instanceof HTMLElement) {
            return node instanceof HTMLAnchorElement || node.closest("a") instanceof HTMLAnchorElement;
        }
        return false;
    }

    static isAnchorContainsImg(node) {
        return node instanceof HTMLAnchorElement && node.firstElementChild instanceof HTMLImageElement;
    }

    static isImage(node) {
        return node instanceof HTMLImageElement;
    }

    static getUriList(dataTransfer) {
        return dataTransfer.getData("text/uri-list");
    }

    static getFileExtension(urlStr) {
        if (urlStr.startsWith("data:")) {
            const mime = urlStr.substring(urlStr.indexOf(":") + 1, urlStr.indexOf(";"))
            switch (mime) {
                case "image/png":
                    return ".png";
                case "image/jpeg":
                    return ".jpeg";
            }
            return ""
        }
        const match = urlStr.match(/[^/\\&?]+(\.\w{3,4})(?=([?&].*$|$))/);
        if (!match) {
            return "";
        }
        let [_, ext] = match;
        return ext !== null ? ext : "";
    }

    constructor() {

        this.core = new Core(this);
        this.storage = new BlobStorage();
        this.actionWrapper = new ActionWrapper();

        this.config = {};

        this.selection = {
            text: null,
            plainUrl: null,
            imageLink: null,
        };

        this.selectionType = SELECTION_TYPE.unknown;

        this.direction = null;

        this.ui = {
            indicator: new RangeIndicator(),
            prompt: new Prompt(),
            grids: new Grids(),
            // panelBox: new UIClass()
        };

        this.conditionStore = COND_NO;

        browser.storage.onChanged.addListener((_, areaName) => {
            if (areaName === "local") {
                this.refreshPageConfig();
            }
        });

        this.refreshPageConfig();

    }

    async refreshPageConfig() {
        browser.storage.local.get().then(a => {
            this.config = a;
            logUtil.log("refresh page config", a);
            if (this.checkBlockListRules()) {
                logUtil.log("this site is blobkced, stop the core")
                this.core.stop()
                return
            }
            if (this.config.features.extendMiddleButton === true) {
                logUtil.log("enable features: ", "extend middle button");
                features.extendMiddleButton.start();
            }
        });
    }

    checkBlockListRules() {
        for (const strRe of this.config.blockList) {
            try {
                const re = new RegExp(strRe)
                if (location.href.match(re)) {
                    return true;
                }
            }
            catch (ex) {
                console.error(ex)
            }
        }
        return false;
    }

    queryDirection() {
        if (this.ui.grids.isActive) {
            return this.ui.grids.direction;
        }
        for (const action of this.config.actions) {
            if (action.condition === this.conditionStore) {
                return Controller.angleToDirection(this.core.angle, DIMENSION[action.limitation]);
            }
        }
    }

    queryActionGroup() {
        logUtil.log("query action group:", this.conditionStore);
        for (const action of this.config.actions) {
            logUtil.log("quert action group, condition:", action.condition);
            if (action.condition === this.conditionStore) {
                return action;
            }
        }
        logUtil.warn("no action group was found");
        return null;
    }

    queryActionDetail() {
        logUtil.log("quertActionDetail", "selectionType:", this.selectionType, ", condition:", this.conditionStore);
        const actionType = Controller.predictActionType(this.selectionType);
        for (const action of this.config.actions) {
            if (action.condition === this.conditionStore) {
                //TODO
                logUtil.log("action details", action.details, ", expceted direction:", this.direction);
                return action.details[actionType].find(detail => detail.direction === this.direction);
            }
        }

        // 没有按键
        //TODO
        return null;
    }

    clear() {
        logUtil.log("clear");
        this.selection.text = this.selection.plainUrl = this.selection.imageLink = null;
        this.direction = null;
        this.selectionType = SELECTION_TYPE.unknown;
        this.conditionStore = COND_NO
        this.ui.indicator.remove();
        this.ui.prompt.remove();
        this.ui.grids.remove();
        // this.ui.panelBox.remove()
    }

    checkDistanceRange() {
        if (!this.config.limitRange) {
            return true;
        }
        let d = this.core.distance;
        if (this.config.range[0] <= d && d <= this.config.range[1]) {
            return true;
        }
        return false;
    }


    /**
     *
     * @param {Node} target
     * @param {DataTransfer} dataTransfer
     */
    allowDrag(target, dataTransfer) {

        if (target instanceof HTMLObjectElement) {
            return false;
        }

        if (target instanceof Element &&
            (target.getAttribute("contenteditable") !== null ||
                target.getAttribute("draggble") !== null)) {
            return false;
        }
        else if (Controller.isText(target)) {
            return true;
        }

        if (Controller.isAnchor(target)) {

            if (target.href.startsWith("#")) {
                return false;
            }

            const JS_PREFIX = "javascript:";
            if (JS_PREFIX === target.href.substr(0, JS_PREFIX.length).toLowerCase()) {
                return Controller.isImage(target.firstElementChild);
            }

            return true;
        }
        else if (Controller.isImage(target)) {
            return true;
        }
        else if (Controller.isTextInput(target)) {
            return true;
        }

        return false;
    }

    /**
     *
     * @param {Element} target
     */
    allowDrop(target, dataTransfer, isExternal, defaultPrevented) {
        if (this.ui.grids.isActive) {
            if (Controller.isTextInput(target)) {
                return true;
            }
            return this.ui.grids.allowDrop();
        }

        if (!this.ui.grids.isActive && this.config.limitRange) {
            if (!this.checkDistanceRange()) {
                return false;
            }
        }

        if (defaultPrevented === true) {
            return false;
        }

        if (target instanceof Text) {
            return true;
        }

        if (Controller.isTextInput(target)) {
            return true;
        }

        if (target instanceof Element) {
            return target.getAttribute("contenteditable") === null;
        }
        console.warn("not allow drop", target);
        return false;
    }

    /**
     *
     * @param {DataTransfer} dataTransfer
     */
    allowExternal(dataTransfer) {
        if (Controller.includesPlainText(dataTransfer)) {
            return true;
        }
        if (Controller.includesValidFile(dataTransfer)) {
            return true;
        }
        return false;
    }

    callPreventDefaultInDropEvent(target) {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            return false;
        }
        return true;
    }

    onModifierKeyChange(newKey, oldKey, isExternal) {
        if (isExternal) {
            logUtil.log("force set conditionStore = KEY_EXT");
            this.conditionStore = COND_EXT;
            return;
        }
        logUtil.info("newkey:", newKey, "old key:", oldKey)
        switch (newKey) {
            case "ctrl":
                this.conditionStore = COND_CTRL;
                break;
            case "shift":
                this.conditionStore = COND_SHIFT;
                break;
            case "alt":
                this.conditionStore = COND_ALT;
                break;
            case "":
            default:
                this.conditionStore = COND_NO;
                break;
        }
        const actionGroup = this.queryActionGroup();
        logUtil.log("conditionstore", this.conditionStore, actionGroup)
        if (env.isChildFrame || actionGroup.limitation.startsWith("grids")) {
            if (env.isChildFrame) {
                logUtil.log("render grids under child frame");
            }
            else {
                logUtil.log("render grids");
            }
            this.ui.grids.render(
                actionGroup,
                Controller.predictActionType(this.selectionType),
            );
        }
        if (!this.ui.grids.isActive && this.config.enablePrompt && this.checkDistanceRange()) {
            const detail = this.queryActionDetail();
            if (detail.prompt !== "") {
                this.ui.prompt.active();
                this.ui.prompt.render(this.selection, detail);
            }
            else {
                this.ui.prompt.remove();
            }
        }
    }

    /**
     *
     * @param {Node} target
     * @param {DataTransfer} dataTransfer
     */
    onStart(target, dataTransfer) {
        let type = SELECTION_TYPE.unknown;
        logUtil.log("onStart", target);
        if (Controller.isText(target) || Controller.isTextInput(target)) {
            this.selection.text = dataTransfer.getData("text/plain");
            if (!this.config.features.disableFixURL && urlUtil.seemAsURL(this.selection.text)) {
                this.selection.plainUrl = urlUtil.fixSchemer(this.selection.text);
                type = SELECTION_TYPE.urlText;
            }
            else {
                type = SELECTION_TYPE.plainText;
            }
        }
        else if (Controller.isAnchorContainsImg(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list");
            this.selection.text = target.textContent;
            const imgElement = target.querySelector("img");
            if (imgElement instanceof HTMLImageElement) {
                this.selection.imageLink = imgElement.src;
            }
            type = SELECTION_TYPE.anchorContainsImg;
        }
        else if (Controller.isAnchor(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list");
            this.selection.text = target.textContent;
            type = SELECTION_TYPE.plainAnchor;
        }
        else if (Controller.isImage(target)) {
            this.selection.imageLink = target.src;
            type = SELECTION_TYPE.plainImage;
        }
        else {
            type = SELECTION_TYPE.unknown;
        }

        this.selectionType = type;
        const actionGroup = this.queryActionGroup();
        if (actionGroup.limitation.startsWith("grids")) {
            this.ui.grids.active(
                this.core.startPos.x,
                this.core.startPos.y,
                actionGroup,
                Controller.predictActionType(this.selectionType),
            );
        }
        else {
            if (this.config.limitRange && this.config.enableIndicator) {
                logUtil.log("range", this.config.range);
                // TODO: 不使用 pagePos
                // this.ui.indicator.active(this.core.pagePos.x, this.core.pagePos.y, this.config.range[0])
            }
        }
    }

    /**
     *
     */
    onMove(target, dataTransfer) {
        this.direction = this.queryDirection();
        logUtil.log("direction: ", this.direction);
        if (Controller.isTextInput(target)) {
            logUtil.log("target is textinput, remove ui")
            this.ui.prompt.remove();
            this.ui.grids.remove();
            return;
        }
        const actionGroup = this.queryActionGroup();
        if (actionGroup.limitation.startsWith("grids")) {
            this.ui.grids.active(
                this.core.startPos.x,
                this.core.startPos.y,
                actionGroup,
                Controller.predictActionType(this.selectionType),
            );
        }
        if (!this.ui.grids.isActive && this.checkDistanceRange()) {
            if (true === this.config.enablePrompt) {
                const detail = this.queryActionDetail();
                if (detail.prompt !== "") {
                    this.ui.prompt.active();
                    this.ui.prompt.render(this.selection, detail);
                }
                else {
                    this.ui.prompt.remove();
                }
            }
        }
    }

    onEnd(target, dataTransfer) {
        if (dataTransfer === null) {
            // specially handle dragend event
            logUtil.log("dataTransfer is null, nothing can do.");
            this.clear();
            return;
        }
        if (Controller.isTextInput(target)) {
            logUtil.log("text input, do nothing")
            this.clear()
            return;
        }

        if (target.matches("#gd-grids")) {
            console.info("Bingo!!!!!!!!!!!Grids");
        }

        const imageInfo = {
            token: null,
            extension: null,
        };
        this.actionWrapper.setActionType(Controller.predictActionType(this.selectionType));

        switch (this.selectionType) {
            case SELECTION_TYPE.plainImage:
                imageInfo.extension = Controller.getFileExtension(this.selection.imageLink);
                imageInfo.token = this.storage.storeURL(new URL(this.selection.imageLink));
                break;
            case SELECTION_TYPE.anchorContainsImg:
                imageInfo.extension = Controller.getFileExtension(this.selection.imageLink);
                imageInfo.token = this.storage.storeURL(new URL(this.selection.imageLink));
                break;
        }
        /**
         * 1. dataURL
         * 2. UInt8Array
         * 3. normal url
         * 4.
         */
        this.actionWrapper.setSelection(this.selection)
            .setDirection(this.direction)
            .setExtraImageInfo(imageInfo)
            .setSite(location.origin)
            .setPageTitle(document.title)
            .post(this.queryActionDetail());

        this.clear();
    }

    onStartExternal(target, dataTransfer) {
        let type = SELECTION_TYPE.unknown;
        if (Controller.includesPlainText(dataTransfer)) {
            type = SELECTION_TYPE.plainText;
        }
        for (const item of dataTransfer.items) {
            if (TEXT_MIMES.includes(item.type)) {
                type = SELECTION_TYPE.plainText;
            }
            if (IMAGE_MIMES.includes(item.type)) {
                type = SELECTION_TYPE.plainImage;
            }
        }
        this.selectionType = type;
        logUtil.log("onStartExternal,type:", this.selectionType);
    }

    onMoveExternal(target, dataTransfer) {}

    async onEndExternal(target, dataTransfer) {
        if (dataTransfer === null) {
            // specially handle dragend event
            logUtil.log("dataTransfer is null, nothing can do.");
            this.clear();
            return;
        }
        if (Controller.isTextInput(target)) {
            logUtil.log("text input, do nothing")
            this.clear()
            return;
        }
        logUtil.log("onendexternal", dataTransfer, this.selectionType);
        if (Controller.isTextInput(target)) {
            logUtil.log("text input, do nothing")
            this.clear()
            return;
        }
        const imageInfo = {
            token: null,
            extension: null,
        };
        this.direction = DIRECTION.any;
        switch (this.selectionType) {
            case SELECTION_TYPE.plainText:
                this.selection.text = await Controller.extractText(dataTransfer);
                break;
            case SELECTION_TYPE.plainImage:
                imageInfo.extension = MIME_TO_EXTENSION[dataTransfer.files[0].type];
                imageInfo.token = this.storage.storgeFile(dataTransfer.files[0]);
                break;
            default:
                console.error("unhandle selectionType", this.selectionType);
        }
        /**
         * 1. dataURL
         * 2. UInt8Array
         * 3. normal url
         * 4.
         */
        this.actionWrapper.setSelection(this.selection)
            .setActionType(Controller.predictActionType(this.selectionType))
            .setDirection(this.direction)
            .setExtraImageInfo(imageInfo)
            .setSite(location.origin)
            .setPageTitle(document.title)
            .post(this.queryActionDetail());

        this.clear();
    }

    onExternal() {
        this.conditionStore = COND_EXT;
    }

}

var c = new Controller();

browser.runtime.onConnect.addListener(port => {
    logUtil.log(`new connection in ${location.href}`);
    port.onDisconnect.addListener(() => {
        logUtil.log("disconnect");
    });
    port.onMessage.addListener(async(token) => {
        port.postMessage(await c.storage.consume(token));
    });
});
