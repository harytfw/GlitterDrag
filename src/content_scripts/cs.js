"use strict"

window.onerror = function () {
    console.trace(...arguments)
}

window.onrejectionhandled = function () {
    console.trace(...arguments)
}

window.onunhandledrejection = function () {
    console.trace(...arguments)
}

const SELECTION_TYPE = {
    unknown: "unknown",
    plainText: "plainText",
    urlText: "urlText",
    plainAnchor: "plainAnchor",
    anchorContainsImg: "anchorContainsImage",
    plainImage: "plainImage",
    externalImage: "externalImage",
    externalText: "externalText"
}

const MIME_PLAIN_TEXT = "text/plain"
const MIME_URI_LIST = "text/uri-list"

const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".txt"]
const TEXT_EXTENSIONS = [".txt", ".text"]

let bgConfig = {}

browser.storage.local.get().then(a => {
    Object.assign(bgConfig, a)
})

class Controller {

    // static getFileExtension(filename) {
    //     const parts = filename.split(".")
    //     if (parts.length < 2) {
    //         return ""
    //     }
    //     return parts[parts.length]
    // }

    static includesPlainText(dataTransfer) {
        return dataTransfer.types.includes("text/plain")
    }


    static includesValidFile(dataTransfer) {
        let files = dataTransfer.files
        if (files.length != 1) {
            return false
        }
        let filename = files[0].name
        let ext = this.getFileExtension(filename)

        if (IMAGE_EXTENSIONS.includes(ext)) {
            return true
        }
        return false
    }

    static angleToDirection(angle, mapping) {
        for (const obj of mapping) {
            if (obj.range[0] <= angle && angle < obj.range[1]) {
                return obj.value
            }
        }
        throw new Error("failed to convert angle to direction:")
    }

    static computeDirection(angle, modifierKey, actionType) {
        let c = null;
        // if (bgConfig.enableCtrlKey && modifierKey === commons.KEY_CTRL) {
        //     c = bgConfig.directionControl_CtrlKey;
        // } else if (bgConfig.enableShiftKey && modifierKey === commons.KEY_SHIFT) {
        //     c = bgConfig.directionControl_ShiftKey;
        // } else {
        // c = bgConfig.directionControl;
        // }
        return Controller.angleToDirection(angle, DIMENSION["normal"])
    }

    static judgeActionType(selectionType, ) {
        switch (selectionType) {
            case SELECTION_TYPE.plainText:
                return 'text'
            case SELECTION_TYPE.plainAnchor:
                return 'link'
            case SELECTION_TYPE.plainImage:
                return 'image'
            case SELECTION_TYPE.urlText:
                return 'link'
            case SELECTION_TYPE.anchorContainsImg:
                //TODO: check alwaysImage
                // if (bgConfig.alwaysImage === true) {
                //     return 'imageAction'
                // } else {
                return 'link'
            // }
            default:
                console.trace('unknown selection type')
                return
        }
    }

    static isText(node) {
        return node instanceof Text
    }

    static isTextInput(node) {
        return node instanceof HTMLTextAreaElement
            || (node instanceof HTMLInputElement
                && ["text", "number", "url"].includes(node.type.toLowerCase()))
    }

    static isAnchor(node) {
        return node instanceof HTMLAnchorElement
    }

    static isAnchorContainsImg(node) {
        return node instanceof HTMLAnchorElement && node.firstElementChild instanceof HTMLImageElement
    }

    static isImage(node) {
        return node instanceof HTMLImageElement
    }

    static getUriList(dataTransfer) {
        return dataTransfer.getData("text/uri-list")
    }

    static getFileExtension(urlStr) {
        const match = urlStr.match(/[^/\\&?]+(\.\w{3,4})(?=([?&].*$|$))/)
        let [_, ext] = match
        return ext !== null ? ext : ''
    }

    constructor() {
        this.core = new Core(this)
        this.storage = new BlobStorage()

        this.selection = Object.preventExtensions({
            text: null,
            plainUrl: null,
            imageLink: null,
        })

        this.selectionType = SELECTION_TYPE.unknown

        this.direction = null //TODO: 

        this.ui = Object.freeze({
            indicator: new UIClass(),
            promptBox: new UIClass(),
            panelBox: new UIClass()
        })
    }


    clear() {
        console.log("clear")
        this.selection.text = this.selection.plainUrl = this.selection.imageLink = null
        this.direction = null
        this.selectionType = SELECTION_TYPE.unknown

        this.ui.indicator.remove()
        this.ui.promptBox.remove()
        this.ui.panelBox.remove()
    }

    checkDistanceRange() {
        let d = this.core.distance
        if (bgConfig.minDistance <= d && d < bgConfig.maxDistance) {
            return true
        }
        return false
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

            return true

        } else if (Controller.isAnchor(target)) {

            if (target.href.startsWith("#")) {
                return false;
            }

            const JS_PREFIX = "javascript:"
            if (JS_PREFIX === target.href.substr(0, JS_PREFIX.length).toLowerCase()) {
                return Controller.isImage(target.firstElementChild)
            }

            return true
        } else if (Controller.isImage(target)) {
            return true
        } else if (Controller.isTextInput(target)) {
            return true
        }

        return false
    }


    /**
     * 
     * @param {Element} target 
     */
    allowDrop(target, dataTransfer, isExternal, defaultPrevented) {
        if (!this.checkDistanceRange()) {
            return false
        }
        return defaultPrevented === false &&
            (target instanceof Element) && target.getAttribute("contenteditable") === null
    }

    /**
     * 
     * @param {DataTransfer} dataTransfer 
     */
    allowExternal(dataTransfer) {
        if (Controller.includesPlainText(dataTransfer)) {
            return true
        } else if (Controller.includesValidFile(dataTransfer)) {
            return true
        }
        return false
    }

    callPreventDefaultInDropEvent(target) {
        if (target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement) {
            return false;
        }
        return true
    }

    onModifierKeyChange() {
        //TODO: handle ui change
    }

    /**
     * 
     * @param {Node} target 
     * @param {DataTransfer} dataTransfer 
     * @param {boolean} isExternal
     */
    onStart(target, dataTransfer, isExternal) {
        this.clear()
        let type = SELECTION_TYPE.unknown
        if (Controller.isText(target) || Controller.isTextInput(target)) {
            // TODO: handle urlText
            this.selection.text = dataTransfer.getData("text/plain")
            if (urlUtil.seemAsURL(this.selection.text)) {
                this.selection.plainUrl = urlUtil.fixSchemer(this.selection.text)
                type = SELECTION_TYPE.urlText
            } else {
                type = SELECTION_TYPE.plainText
            }
        } else if (Controller.isAnchorContainsImg(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list")
            this.selection.text = target.textContent
            const imgElement = target.querySelector("img")
            if (imgElement instanceof HTMLImageElement) {
                this.selection.imageLink = imgElement.src
            }
            type = SELECTION_TYPE.anchorContainsImg
        } else if (Controller.isAnchor(target)) {
            this.selection.plainUrl = dataTransfer.getData("text/uri-list")
            this.selection.text = target.textContent
            type = SELECTION_TYPE.plainAnchor
        } else if (Controller.isImage(target)) {
            this.selection.imageLink = target.src
            type = SELECTION_TYPE.plainImage
        } else if (isExternal) {

            const file = dataTransfer.files[0]
            if (file) {
                const ext = Controller.getFileExtension(file.name)
                if (IMAGE_EXTENSIONS.includes(ext)) {
                    type = SELECTION_TYPE.externalImage
                } else if (TEXT_EXTENSIONS.includes(ext)) {
                    this.selection.text = dataTransfer.getData(MIME_PLAIN_TEXT)
                    type = SELECTION_TYPE.externalText
                }
            } else if (Controller.includesPlainText(dataTransfer)) {
                type = SELECTION_TYPE.plainText
            } else {
                type = SELECTION_TYPE.unknown
            }

        } else {
            type = SELECTION_TYPE.unknown
        }
        this.selectionType = type
        //  dataTransfer.setData(MIME_SELECTION_TYPE, type)


        if (true === bgConfig.enableIndicator) {
            this.ui.indicator.mount()
        }
    }

    /**
     * 
     */
    onMove(target, dataTransfer, isExternal) {
        if (this.checkDistanceRange()) {
            // let d = Object.keys(DIMENSION).map(key => `${key} = ${DragController.angleToDirection(this.core.angle, DIMENSION[key])}`)
            // console.log(this.core.angle, d)

            this.direction = Controller.computeDirection(
                this.core.angle,
                Controller.judgeActionType(this.selectionType)
            )
            console.log('direction: ', this.direction)

            if (true === bgConfig.enblePrompt) {
                this.ui.promptBox.mount()
            }

        } else if (Controller.isTextInput(target)) {
            this.ui.promptBox.remove()
            // 隐藏距离指示器
            // 隐藏动作提示框
            // 隐藏面板
        } else {
            this.ui.promptBox.remove()
            this.ui.panelBox.remove()
        }
    }

    onEnd(target, dataTransfer, isExternal) {
        // TODO: handle isExternal
        // console.log('selection type', dataTransfer.getData(MIME_SELECTION_TYPE))
        console.log('text/plain', dataTransfer.getData(MIME_PLAIN_TEXT))
        console.log('text/uri-list', dataTransfer.getData(MIME_URI_LIST))
        // console.log('text/image-link', dataTransfer.getData(MIME_IMAGE_LINK))

        const builder = new ActionWrapper()
        const imageInfo = {
            token: null,
            extension: '',
        }
        builder.setActionType(Controller.judgeActionType(this.selectionType))

        switch (this.selectionType) {
            case SELECTION_TYPE.plainImage:
                imageInfo.extension = Controller.getFileExtension(this.selection.imageLink)
                imageInfo.token = this.storage.storeURL(new URL(this.selection.imageLink))
                break
            case SELECTION_TYPE.anchorContainsImg:
                imageInfo.extension = Controller.getFileExtension(this.selection.imageLink)
                imageInfo.token = this.storage.storeURL(new URL(this.selection.imageLink))
                break
            case SELECTION_TYPE.externalImage:
                console.assert(this.selection.text === null, "text should be null")
                console.assert(this.selection.imageLink === null, "imageLink should be null")
                console.assert(this.selection.plainUrl === null, "plainUrl should be null")
                imageInfo.extension = Controller.getFileExtension(dataTransfer.files[0].name)
                imageInfo.token = this.storage.storeFile(dataTransfer.files[0])
                break
        }
        /**
         * 1. dataURL
         * 2. UInt8Array
         * 3. normal url
         * 4. 
         */
        builder.setSelection(this.selection)
            .setDirection(this.direction)
            .setExtraImageInfo(imageInfo)
            .setSite(location.origin)
            .setPageTitle(document.title)
            .setModifierKey(this.core.modifierKey)
            .post(bgConfig)

        this.clear()
    }

    onExternal() {

    }
}

var c = new Controller()

browser.runtime.onConnect.addListener(port => {
    console.log(`new connection in ${location.href}`)
    port.onDisconnect.addListener(() => {
        console.log('disconnect')
    })
    port.onMessage.addListener(async (token) => {
        port.postMessage(await c.storage.consume(token))
    })
})
