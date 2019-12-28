class ActionWrapper {

    constructor() {

        this.selection = Object.preventExtensions({
            text: null,
            plainUrl: null,
            imageLink: null,
        })

        this.extraImageInfo = Object.preventExtensions({
            token: null, // the token to retrive data from page
            extension: null, // the format of image
        })

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

    setExtraImageInfo(val) {
        Object.assign(this.extraImageInfo, val)
        return this
    }

    setPageTitle(val) {
        this.pageTitle = val
        return this
    }

    post(actionDetail) {
        if (!actionDetail) {
            console.warn("action detail is empty, replace it with no operation")
            actionDetail = {
                command: ""
            }
        }
        const msg = {
            msgCmd: "postAction",
        }
        Object.assign(msg, this, actionDetail)
        console.log("post", msg)
        browser.runtime.sendMessage(msg)

        this.direction = null
        this.site = null
        this.actionType = null
        this.pageTitle = null
        this.extraImageInfo.extension = null
        this.extraImageInfo.token = null
        this.selection.imageLink = null
        this.selection.plainUrl = null
        this.selection.text = null
    }
}
