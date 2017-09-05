//TODO: 处理拖放区域为 input@type=text

"use strict";

let isRunInOptionsContext = browser.runtime.getBackgroundPage !== undefined ? true : false;

const MIME_TYPE = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
    "Files": "Files"
}


class Prompt {
    constructor() {
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
    renderDir(d = commons.DIR_U) {
        //DIR_UP_L
        //[DIR,UP,L]
        //[UP,L]
        //UP-L
        const suffix = d.split("_").slice(1).join("-");
        this.arrow.className = `GDArrow-${suffix}`;
    }

    renderText(t) {
        this.textContainer.textContent = t;
    }

    render(dir, text) {
        this.renderDir(dir);
        this.renderText(text);
    }
    stopRender() {
        this.hide();
    }
    display() {
        if (this.container.style.display === "none") this.container.style.display = "block";
    }
    hide() {
        this.container.style.display = "none";
    }
    remove() {
        document.body.removeChild(this.parent);
    }
}
class Indicator {
    constructor() {
        this.box = document.createElement("div");
        this.box.id = "GDIndicator";
        this.hide();
        document.body.appendChild(this.box);
    }
    place(x = 0, y = 0, radius = 0) {
        radius = radius / devicePixelRatio;
        this.box.style.left = (x - radius) + "px";
        this.box.style.top = (y - radius) + "px";
        const h = this.box.style.height = (radius * 2) + "px";
        const w = this.box.style.width = (radius * 2) + "px";
        this.box.style.borderRadius = `${w}  ${h}`;
    }
    display() {
        this.box.style.display = "initial";
    }
    hide() {
        this.box.style.display = "none";
    }
}

class DragClass {
    constructor(elem) {

        this.running = false; // happend in browser
        this.accepting = false; // happend between browser and outer

        this.dragged = elem;
        this.handler = this.handler.bind(this);
        ["dragstart", "dragend", "dragover", "dragenter", "drop"].forEach(name =>
            //这里是capture阶段
            this.dragged.addEventListener(name, evt => this.handler(evt), true)
        );
        //添加在冒泡阶段
        //网页如果自己添加了dragstart事件并使用preventDefault，会阻止浏览器的拖拽功能
        //这里取消preventDefault的作用
        this.dragged.addEventListener("dragstart", (event) => {
            // console.log(event);
            return true;
        }, false);
        this.dragged.addEventListener("drop", (event) => {
            // console.log(event);
            if (this.cancelDropFlag) {
                event.preventDefault();
                return false;
            }
        }, false);

        this.selection = ""; //选中的数据,文本，链接
        this.textSelection = ""; //选中的文本，跟上面的可能相同可能不同
        this.imageLink = ""; //当图像是超链接保存图像文件链接
        this.modifierKey = commons.KEY_NONE;

        this.isTextNode = false;

        this.targetElem = null;
        this.originalTargetElem = null;

        this.targetType = commons.TYPE_UNKNOWN;
        this.actionType = "textAction";
        this.direction = commons.DIR_U;

        this.distance = 0;
        this.startPos = {
            x: 0,
            y: 0
        };
        this.endPos = {
            x: 0,
            y: 0
        };
        this.timeoutId = 0;
        this.promptBox = null;
        this.indicatorBox = null;

        this.isFirstRender = true;

        this.cancelDropFlag = true;
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

        if (isRunInOptionsContext) {
            sended.sendToOptions = true;
            // backgroundPage.executor.DO(sended);
        }
        browser.runtime.sendMessage(sended);
    }
    cancel() {
        clearTimeout(this.timeoutId);
        this.accepting = this.running = false;
        this.promptBox && this.promptBox.stopRender();
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
        if (bgConfig.enableIndicator) {
            if (this.indicatorBox === null) this.indicatorBox = new Indicator();
            this.indicatorBox.place(evt.pageX, evt.pageY, bgConfig.triggeredDistance);
            this.indicatorBox.display();
        }
        if (bgConfig.enablePrompt) {
            if (this.promptBox === null) this.promptBox = new Prompt();
        }
        if (bgConfig.enableTimeoutCancel) {
            this.timeoutId = setTimeout(() => this.cancel(), bgConfig.timeoutCancel);
        }

        this.updateModifierKey(evt);

        this.targetElem = evt.target;
        this.selection = evt.dataTransfer.getData("text/x-moz-url-data").trim();
        this.imageLink = evt.dataTransfer.getData("application/x-moz-file-promise-url");
        this.textSelection = evt.dataTransfer.getData("text/plain").trim();
        if (this.selection === "") {
            this.selection = this.textSelection;
        }
        this.targetType = typeUtil.checkDragTargetType(this.selection, this.textSelection, this.imageLink, this.targetElem);

        if (commons.TYPE_TEXT_URL === this.targetType) {
            this.selection = this.textSelection = typeUtil.fixupSchemer(this.selection);
        }

        this.actionType = typeUtil.getActionType(this.targetType);
        this.startPos.x = evt.screenX;
        this.startPos.y = evt.screenY;
    }
    dragend(evt) {
        clearTimeout(this.timeoutId);

        // what should we do if user release ctrl or shift key while dragging?

        if (this.promptBox) { // may be null if viewing an image
            this.promptBox.stopRender();
        }
        this.indicatorBox && this.indicatorBox.hide();
        // this.selection = String.prototype.trim(this.selection);
        if (this.distance >= bgConfig.triggeredDistance) {
            if (this.actionType === "imageAction") {
                // this regex is from: https://stackoverflow.com/questions/14473180/regex-to-get-a-filename-from-a-url
                // but I make small changes to get extension of file
                const [name, ext] = this.selection.match(/[^/\\&?]+(\.\w{3,4})(?=([?&].*$|$))/);
                this.post({
                    fileInfo: {
                        mime: MIME_TYPE[ext],
                        name,
                    }
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
        this.distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);
        this.direction = this.getDirection();
        if (this.distance > bgConfig.triggeredDistance || this.direction === commons.DIR_OUTER) {
            if (this.promptBox !== null) {
                console.log("prompt");
                this.promptBox.display();
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
                // console.log(JSON.stringify(actions));
                let message = ""
                    // if (this.direction in actions[this.actionType]) {
                message = getI18nMessage(actions[this.actionType][this.direction]["act_name"]);
                // }
                this.promptBox.render(this.direction, message);
            }
        }
        else {
            if (this.promptBox) { // may be null if viewing an image
                this.promptBox.stopRender();
            }
        }
    }
    dragenter(evt) {
        const dt = evt.dataTransfer;
        let fakeNode = null;
        if (dt.types.includes("text/plain")) {
            fakeNode = document.createTextNode("");
        }
        else if (dt.types.includes("Files")) {
            fakeNode = document.createElement("img");
        }
        else {
            console.log("No here!!!");
            return;
        }
        this.selection = this.textSelection = "If you see it, please report to the author of GlitterDrag"; // temporary
        this.targetType = typeUtil.checkDragTargetType(this.selection, this.textSelection, this.imageLink, fakeNode);

        this.actionType = typeUtil.getActionType(this.targetType);
    }
    drop(evt) {

        const dt = evt.dataTransfer;
        this.selection = dt.getData("text/plain").trim();
        if (commons.TYPE_TEXT_URL === this.targetType) {
            this.selection = this.textSelection = typeUtil.fixupSchemer(this.selection);
        }
        // console.log(dt.files);
        const sended = {
            textSelection: "",
            hasImageBinary: false,
            fileInfo: {
                mime: "",
                name: ""
            }
        };
        const fileReader = new FileReader();
        let file = dt.files[0];
        fileReader.addEventListener("loadend", () => {
            let bin = new Uint8Array(fileReader.result);
            // console.log(bin, bin.length);
            sended.selection = bin.toString(); // convert ArrayBuffer to string
            sended.hasImageBinary = true;
            sended.fileInfo.name = file.name;
            sended.fileInfo.mime = file.type;
            this.post(sended);
        });
        if (["textAction", "linkAction"].includes(this.actionType)) {
            this.post();
        }
        else {
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
                this.cancelDropFlag = false; // don't use evt.preventDefault() and the browser will open uri like file:///...
                return;
            }
            sended.textSelection = file.name; // name of image file
            fileReader.readAsArrayBuffer(file);
        }
    }

    handler(evt) {
        //dragstart target是拖拽的东西
        //dragend   同上
        //dragover  target是document
        //drop      同上

        if (["INPUT", "TEXTAREA"].includes(evt.target.tagName)) {
            this.promptBox && this.promptBox.stopRender();
            this.indicatorBox && this.indicatorBox.hide();
            return;
        }
        const type = evt.type;
        this.endPos.x = evt.screenX;
        this.endPos.y = evt.screenY;
        //TODO:把拖拽的数据放在event里传递
        switch (type) {
            case "dragstart":
                if (evt.target.tagName && evt.target.tagName === "A" &&
                    (evt.target.href.startsWith("javascript:") || evt.target.href.startsWith("#"))) {
                    return;
                }
                // 如果target没有设置draggable属性，那么才处理
                this.isTextNode = evt.target.nodeName === "#text";
                if (this.isTextNode || (evt.target.getAttribute && evt.target.getAttribute("draggable") === null)) {
                    this.running = true;
                    // evt.dataTransfer.effectAllowed = "move";
                    this.dragstart(evt);
                }
                break;
            case "dragend":
                if (this.running) {
                    this.running = false;
                    this.dragend(evt);
                }
                // console.log(evt);
                break;
            case "dragenter":
                this.accepting = false;
                if (evt.dataTransfer && !this.running) {
                    for (const mime of Object.values(MIME_TYPE)) {
                        if (evt.dataTransfer.types.includes(mime)) {
                            evt.preventDefault();
                            this.accepting = true;
                            this.dragenter(evt);
                            break;
                        }
                    }
                }
                break;
            case "drop":
                // 如果是从浏览器外部外浏览器拽文件或其它东西，并且放下东西，那么这个事件会被触发，加一个判断
                // 判断脚本有没有处在运行阶段，否则不处理
                // 这样就不会和页面本身的拖拽功能重突
                // drop发生在dragend之前
                this.cancelDropFlag = false;
                if (evt.dataTransfer && !this.running && this.accepting) {
                    this.cancelDropFlag = true;
                    this.accepting = false;
                    this.drop(evt);
                }
                else if (this.running) {
                    this.cancelDropFlag = true;
                }
                break;
            case "dragover":
                // 如果是从浏览器外部外浏览器拽文件或其它东西，经过页面，那么这个事件会被触发，加一个判断
                this.cancelDropFlag = false;
                if (this.running || this.accepting) {
                    evt.preventDefault();
                    this.dragover(evt);
                }
                break;
            default:
                break;
        }
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

function onGettingConfig(config) {
    // TODO: debug;
    bgConfig = JSON.parse(config);
    // console.log(bgConfig);
}

browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToContentScript") {
        port.onMessage.addListener(CSlistener);
    }
    else if (port.name === "updateConfig") {
        port.onMessage.addListener(onGettingConfig);
    }
});
let bgPort = browser.runtime.connect({
    name: "initial"
});
let bgConfig = null;
let mydrag = null;
bgPort.onMessage.addListener((c) => {
    bgConfig = JSON.parse(c);
    // console.log(bgConfig);
    if (mydrag === null) {
        if (["loading", "interactive"].includes(document.readyState)) {
            document.addEventListener("DOMContentLoaded", () => {
                mydrag = new DragClass(document);
            }, {
                once: true
            });
        }
        else {
            mydrag = new DragClass(document);
        }
    }
});
