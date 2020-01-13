"use strict";

consoleUtil.logErrorEvent();

const SELECTION_TYPE = {
    unknown: "unknown",
    plainText: "plainText",
    urlText: "urlText",
    plainAnchor: "plainAnchor",
    anchorContainsImg: "anchorContainsImage",
    plainImage: "plainImage",
    externalImage: "externalImage",
    externalText: "externalText",
};

const MIME_PLAIN_TEXT = "text/plain";
const MIME_URI_LIST = "text/uri-list";

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".txt"];
const TEXT_EXTENSIONS = [".txt", ".text"];

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

    static includesValidFile(dataTransfer) {
        let files = dataTransfer.files;
        if (files.length !== 1) {
            return false;
        }
        let filename = files[0].name;
        let ext = this.getFileExtension(filename);

        if (IMAGE_EXTENSIONS.includes(ext)) {
            return true;
        }
        return false;
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
        return node instanceof HTMLTextAreaElement
            || (node instanceof HTMLInputElement
                && ["text", "number", "url"].includes(node.type.toLowerCase()));
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
        //TODO
        const match = urlStr.match(/[^/\\&?]+(\.\w{3,4})(?=([?&].*$|$))/);
        if (!match) {
            return "";
        }
        let [_, ext] = match;
        return ext !== null ? ext : "";
    }

    get recentShortcut() {
        return this.shortcutStore[this.shortcutStore.length - 1];
    }

    set recentShortcut(val) {
        return this.shortcutStore[this.shortcutStore.length - 1] = val;
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

        this.shortcutStore = [""];

        browser.storage.onChanged.addListener((_, areaName) => {
            if (areaName === "local") {
                this.refreshPageConfig();
            }
        });

        document.addEventListener("keydown", (e) => {
            if (e.isComposing === false) {
                // consoleUtil.log("keydown", e.key);
                this.recentShortcut = e.key;
            }
        });

        document.addEventListener("keyup", () => {
            // consoleUtil.log("keyup", this.recentShortcut);
            this.recentShortcut = "";
        });

        this.refreshPageConfig();

    }

    async refreshPageConfig() {
        consoleUtil.log("refresh page config");
        browser.storage.local.get().then(a => {
            this.config = a;
            if (this.config.features.extendMiddleButton === true) {
                consoleUtil.log("enable features: ", "extend middle button");
                features.extendMiddleButton.start();
            }
        });
    }

    queryDirection() {
        for (const action of this.config.actions) {
            if (action.shortcut === this.recentShortcut) {
                if (action.limitation.startsWith("grids")) {
                    return this.ui.grids.direction;
                } else {
                    return Controller.angleToDirection(this.core.angle, DIMENSION[action.limitation]);
                }
            }
        }
    }

    queryActionGroup() {
        for (const action of this.config.actions) {
            if (action.shortcut === this.recentShortcut) {
                return action;
            }
        }
    }

    queryActionDetail() {

        consoleUtil.log("quertActionDetail", "selectionType:", this.selectionType, ", shortcut:", this.recentShortcut);
        const actionType = Controller.predictActionType(this.selectionType);
        for (const action of this.config.actions) {
            if (action.shortcut === this.recentShortcut) {
                //TODO
                consoleUtil.log("action details", action.details, ", expceted direction:", this.direction);
                return action.details[actionType].find(detail => detail.direction === this.direction);
            }
        }

        // 没有按键
        //TODO
        return null;
    }

    clear() {
        consoleUtil.log("clear");
        this.selection.text = this.selection.plainUrl = this.selection.imageLink = null;
        this.direction = null;
        this.selectionType = SELECTION_TYPE.unknown;
        this.shortcutStore.length = 1;
        this.shortcutStore[0] = "";
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
        } else if (Controller.isText(target)) {
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
        } else if (Controller.isImage(target)) {
            return true;
        } else if (Controller.isTextInput(target)) {
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
        } else if (Controller.includesValidFile(dataTransfer)) {
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

    onModifierKeyChange() {

    }

    /**
     *
     * @param {Node} target
     * @param {DataTransfer} dataTransfer
     * @param {boolean} isExternal
     */
    onStart(target, dataTransfer, isExternal) {
        let type = SELECTION_TYPE.unknown;
        consoleUtil.log("onStart", target);
        if (Controller.isText(target) || Controller.isTextInput(target)) {
            this.selection.text = dataTransfer.getData("text/plain");
            if (!this.config.features.disableFixURL && urlUtil.seemAsURL(this.selection.text)) {
                this.selection.plainUrl = urlUtil.fixSchemer(this.selection.text);
                type = SELECTION_TYPE.urlText;
            } else {
                type = SELECTION_TYPE.plainText;
            }
        } else if (Controller.isAnchorContainsImg(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list");
            this.selection.text = target.textContent;
            const imgElement = target.querySelector("img");
            if (imgElement instanceof HTMLImageElement) {
                this.selection.imageLink = imgElement.src;
            }
            type = SELECTION_TYPE.anchorContainsImg;
        } else if (Controller.isAnchor(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list");
            this.selection.text = target.textContent;
            type = SELECTION_TYPE.plainAnchor;
        } else if (Controller.isImage(target)) {
            this.selection.imageLink = target.src;
            type = SELECTION_TYPE.plainImage;
        } else if (isExternal) {

            const file = dataTransfer.files[0];
            if (file) {
                const ext = Controller.getFileExtension(file.name);
                if (IMAGE_EXTENSIONS.includes(ext)) {
                    type = SELECTION_TYPE.externalImage;
                } else if (TEXT_EXTENSIONS.includes(ext)) {
                    this.selection.text = dataTransfer.getData(MIME_PLAIN_TEXT);
                    type = SELECTION_TYPE.externalText;
                }
            } else if (Controller.includesPlainText(dataTransfer)) {
                type = SELECTION_TYPE.plainText;
            } else {
                type = SELECTION_TYPE.unknown;
            }

        } else {
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
        } else {
            if (this.config.limitRange && this.config.enableIndicator) {
                consoleUtil.log("range", this.config.range);
                // TODO: 不使用 pagePos
                // this.ui.indicator.active(this.core.pagePos.x, this.core.pagePos.y, this.config.range[0])
            }
        }
    }

    /**
     *
     */
    onMove(target, dataTransfer, isExternal) {

        switch (this.core.modifierKey) {
            case Core.CTRL:
                //TODO
                if (this.shortcutStore.length > 1) {
                    this.shortcutStore.length = 1;
                }
                this.shortcutStore.push("Control");
                break;
            case Core.SHIFT:
                if (this.shortcutStore.length > 1) {
                    this.shortcutStore.length = 1;
                }
                this.shortcutStore.push("Shift");
                break;
            default:
                break;
        }
        this.direction = this.queryDirection();
        consoleUtil.log("direction: ", this.direction);
        if (!this.ui.grids.isActive && this.checkDistanceRange()) {
            if (true === this.config.enablePrompt) {
                const detail = this.queryActionDetail();
                if (detail.prompt !== "") {
                    this.ui.prompt.active();
                    this.ui.prompt.render(this.selection, detail);
                } else {
                    this.ui.prompt.remove();
                }
            }
        } else if (Controller.isTextInput(target)) {
            // this.ui.prompt.remove()
            // 隐藏距离指示器
            // 隐藏动作提示框
            // 隐藏面板
        } else {
            // this.ui.prompt.remove()
            // this.ui.panelBox.remove()
        }
    }

    onEnd(target, dataTransfer, isExternal) {
        if (dataTransfer === null) {
            // specially handle dragend event
            consoleUtil.log("dataTransfer is null, nothing can do.");
            this.clear();
            return;
        }

        if (target.matches("#gd-grids")) {
            console.info("Bingo!!!!!!!!!!!Grids");
        }

        // TODO: handle isExternal
        // consoleUtil.log('selection type', dataTransfer.getData(MIME_SELECTION_TYPE))
        consoleUtil.log("text/plain", dataTransfer.getData(MIME_PLAIN_TEXT));
        consoleUtil.log("text/uri-list", dataTransfer.getData(MIME_URI_LIST));

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
            case SELECTION_TYPE.externalImage:
                console.assert(this.selection.text === null, "text should be null");
                console.assert(this.selection.imageLink === null, "imageLink should be null");
                console.assert(this.selection.plainUrl === null, "plainUrl should be null");
                imageInfo.extension = Controller.getFileExtension(dataTransfer.files[0].name);
                imageInfo.token = this.storage.storeFile(dataTransfer.files[0]);
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

    onExternal() {

    }

}

var c = new Controller();

browser.runtime.onConnect.addListener(port => {
    consoleUtil.log(`new connection in ${location.href}`);
    port.onDisconnect.addListener(() => {
        consoleUtil.log("disconnect");
    });
    port.onMessage.addListener(async (token) => {
        port.postMessage(await c.storage.consume(token));
    });
});
