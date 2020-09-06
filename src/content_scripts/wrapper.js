class ActionWrapper {

    constructor() {

        this.selection = Object.preventExtensions({
            text: null,
            plainUrl: null,
            imageLink: null,
        });

        this.extraImageInfo = Object.preventExtensions({
            token: null, // the token to retrive data from page
            extension: null, // the format of image
        });
        this.direction = null;
        this.site = null;
        this.actionType = null;
        this.pageTitle = null;

        window["postMsg"] = this.plainPostMsg.bind(this);
    }

    exposeMessageObject(msg) {
        msg = JSON.parse(JSON.stringify(msg))
        msg.command = ""
        logUtil.log("expose message object", msg)
        window["msg"] = msg;
    }

    setDirection(val) {
        this.direction = val;
        return this;
    }

    setSelection(selection) {
        Object.assign(this.selection, selection);
        return this;
    }

    setSite(val) {
        this.site = val;
        return this;
    }

    setActionType(val) {
        this.actionType = val;
        return this;
    }

    setExtraImageInfo(val) {
        Object.assign(this.extraImageInfo, val);
        return this;
    }

    setPageTitle(val) {
        this.pageTitle = val;
        return this;
    }

    plainPostMsg(msg) {
        logUtil.log("plain post msg: ", msg);
        browser.runtime.sendMessage(msg);
    }

    post(actionDetail) {
        if (!actionDetail) {
            logUtil.info("action detail is empty, replace it with no operation");
            actionDetail = {
                command: "",
            };
        }
        const msg = {
            msgCmd: "postAction",
            selection: this.selection,
            extraImageInfo: this.extraImageInfo,
            direction: this.direction,
            site: this.site,
            actionType: this.actionType,
            pageTitle: this.pageTitle,
            ...actionDetail,
        };
        logUtil.log("post", JSON.parse(JSON.stringify(msg)));
        this.exposeMessageObject(msg);
        browser.runtime.sendMessage(msg);

        this.clear()
    }

    clear() {
        this.direction = null;
        this.site = null;
        this.actionType = null;
        this.pageTitle = null;
        this.extraImageInfo.extension = null;
        this.extraImageInfo.token = null;
        this.selection.imageLink = null;
        this.selection.plainUrl = null;
        this.selection.text = null;
    }
}
