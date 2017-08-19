//TODO: 处理拖放区域为textArea,input@type=text

"use strict";

let isRunInOptionsContext = browser.runtime.getBackgroundPage !== undefined ? true : false;

const MIME_TYPE = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
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

// class CaptureZone {
//     constructor() {
//         this.textarea = document.createElement("textarea");
//         this.textarea.setAttribute("style", `
//             border: none;
//             width: 0px;
//             height: 0px;
//             position: fixed;
//             left: 0px;
//             top: 0px;
//             z-index: 9999;
//             opacity: 0;
//         `);
//         document.body.appendChild(this.textarea);

//     }
//     maximization() {
//         this.textarea.style.width = "100%";
//         this.textarea.style.height = "100%";
//     }
//     minimize() {
//         this.textarea.style.width = "0px";
//         this.textarea.style.height = "0px";
//     }
//     getText() {
//         return this.textarea.value;
//     }
// }

class DragClass {
    constructor(elem) {

        this.running = false;

        this.dragged = elem;
        this.handler = this.handler.bind(this);
        ["dragstart", "dragend", "dragover", "drop"].forEach(name =>
            //这里是capture阶段
            this.dragged.addEventListener(name, evt => this.handler(evt), true)
        );
        //添加在冒泡阶段
        //网页如果自己添加了dragstart事件并使用preventDefault，会阻止浏览器的拖拽功能
        //这里取消preventDefault的作用
        document.addEventListener("dragstart", (event) => {
            // console.log(event);
            event.returnValue = true;
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

        // this.captureZone = new CaptureZone();
        this.isFromOuter = false;

        this.isFirstRender = true;


    }

    post() {
        //sendMessage只能传递字符串化后（类似json）的数据
        //不能传递具体对象
        let sended = {
            direction: this.direction,
            selection: this.selection,
            textSelection: this.textSelection,
            imageLink: this.imageLink,
            site: location.host,
            actionType: this.actionType,
            sendToOptions: false,
            modifierKey: this.modifierKey
        }

        if (isRunInOptionsContext) {
            sended.sendToOptions = true;
            backgroundPage.executor.DO(sended);
        }
        else browser.runtime.sendMessage(sended);
    }
    cancel() {
        clearTimeout(this.timeoutId);
        this.running = false;
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
        this.selection = evt.dataTransfer.getData("text/x-moz-url-data");
        this.imageLink = evt.dataTransfer.getData("application/x-moz-file-promise-url");
        this.textSelection = evt.dataTransfer.getData("text/plain");
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
        this.modifierKey = commons.KEY_NONE;

        if (this.promptBox) { // may be null if viewing an image
            this.promptBox.stopRender();
        }
        this.indicatorBox && this.indicatorBox.hide();
        // this.selection = String.prototype.trim(this.selection);
        if (this.distance >= bgConfig.triggeredDistance) {
            this.post();
        }

    }
    dragover(evt) {
        this.updateModifierKey(evt);
        this.distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);
        if (this.distance > bgConfig.triggeredDistance) {
            this.direction = this.getDirection();
            if (this.promptBox !== null) {
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
                if (this.direction in actions[this.actionType]) {
                    message = geti18nMessage(actions[this.actionType][this.direction]["act_name"]);
                }
                this.promptBox.render(this.direction, message);
            }
        }
        else {
            if (this.promptBox) { // may be null if viewing an image
                this.promptBox.stopRender();
            }
        }
    }
    handler(evt) {
        //dragstart target是拖拽的东西
        //dragend   同上
        //dragover  target是document
        //drop      同上

        //document 无getAttribute
        //

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
                if (evt.target.tagName && evt.target.tagName === "TEXTAREA") {
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
            case "drop":

                //如果是从浏览器外部外浏览器拽文件或其它东西，并且放下东西，那么这个事件会被触发，加一个判断
                //判断脚本有没有处在运行阶段，否则不处理
                //这样就不会和页面本身的拖拽功能重突
                //drop发生在dragend之前
                // console.log(evt.dataTransfer);
                evt.stopPropagation();
                if (this.running) {
                    evt.preventDefault();
                }
                else if (this.isFromOuter) {
                    this.isFromOuter = false;
                    //dataTransfer may be null,see https://bugzilla.mozilla.org/show_bug.cgi?id=1352974
                    if (evt.dataTransfer) {
                        console.log(evt.dataTransfer);
                        evt.preventDefault();
                        this.direction = commons.DIR_OUTER;
                        this.selection = evt.dataTransfer.getData("text/x-moz-url-data");
                        this.imageLink = evt.dataTransfer.getData("application/x-moz-file-promise-url");
                        this.textSelection = evt.dataTransfer.getData("text/plain");
                        if (this.selection === "") {
                            this.selection = this.textSelection;
                        }
                        this.targetType = typeUtil.checkDragTargetType(this.selection, this.textSelection, this.imageLink, this.targetElem);

                        if (commons.TYPE_TEXT_URL === this.targetType) {
                            this.selection = this.textSelection = typeUtil.fixupSchemer(this.selection);
                        }
                        this.post();
                    }
                }
                break;
            case "dragover":
                //如果是从浏览器外部外浏览器拽文件或其它东西，经过页面，那么这个事件会被触发，加一个判断
                evt.stopPropagation();
                if (this.running) {
                    this.dragover(evt);
                    evt.preventDefault();
                }
                else {
                    //可能是从浏览器外部拖进来
                    this.isFromOuter = true;
                }
                break;
        }
    }



    getDirection() {
        function BETW(a, b) {
            if (a < 0 || b < 0 || a > 360 || b > 360) alert("范围错误");
            return a < b && a <= scale && scale < b;
        }

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
    clipboard.write(mydrag.targetElem.parentElement, msg.data);
    // case commons.COPY_IMAGE:
    //     browser.runtime.sendMessage({
    //         imageSrc: elem.src
    //     });
    // getImageBase64(elem.src, (s) => {
    //     browser.runtime.sendMessage({ imageBase64: s });
    // })
}

browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToContentScript") {
        port.onMessage.addListener(CSlistener);
    }
});
let bgPort = browser.runtime.connect({
    name: "getConfig"
});
let bgConfig = null;
let mydrag = null;
bgPort.onMessage.addListener((c) => {
    bgConfig = JSON.parse(c);
    console.log(bgConfig);
    if (["loading", "interactive"].includes(document.readyState)) {
        document.addEventListener("DOMContentLoaded", () => {
            if (mydrag === null) {
                mydrag = new DragClass(document);
            }

        }, {
            once: true
        });
    }
    else {
        mydrag = new DragClass(document);
    }

});