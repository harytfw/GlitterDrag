const MODIFIERKEY_MAP = new Map([
    [-1, 'Actions'],
    [0, 'Actions_CtrlKey'],
    [1, 'Actions_ShiftKey'],
])

class ActionWrapper {

    constructor() {
        this.action = null

        this.direction = null
        this.selection = Object.preventExtensions({
            text: '',
            plainUrl: '',
            imageLink: '',
        })

        this.site = null
        this.actionType = null
        this.modifierKey = null

        this.fileInfo = Object.preventExtensions({
            token: '',
            name: '', // the file name
            type: '' // the file mime type
        })

        this.extraImageInfo = Object.preventExtensions({
            token: '', // the token to retrive data from page
            extension: '', // the format of image
        })

        this.downloadOption = {}
        this.pageTitle = {}

    }

    setDirection(val) {
        this.direction = val
        return this
    }

    setSelection(selection) {
        Object.assign(this.selection, selection)
        return this
    }

    setSite(val) {
        this.site = val
        return this
    }

    setActionType(val) {
        this.actionType = val
        return this
    }

    setModifierKey(val) {
        this.modifierKey = val
        return this
    }

    setFileInfo(val) {
        Object.assign(this.fileInfo, val)
        return this
    }

    setExtraImageInfo(val) {
        Object.assign(this.extraImageInfo, val)
        return this
    }

    setDownloadOption(val) {
        Object.assign(this.downloadOption, val)
        return this
    }

    setPageTitle(val) {
        this.pageTitle = val
        return this
    }

    complete(config) {
        this.action = config[MODIFIERKEY_MAP.get(this.modifierKey)][this.actionType][this.direction]
        return this
    }

    post() {
        console.log('post', this)
        browser.runtime.sendMessage(this)
    }
}
