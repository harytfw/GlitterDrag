//TODO: 处理拖放区域为 input@type=text
console.info("Glitter Drag: Content script is injected by browser successfully");
"use strict";
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

let specialSites = [
    "vk.com"
]
let specialExts = [
    ".html"
]

//remove highlighting when Escape is pressed
document.addEventListener("keypress", (e) => {
    if (e.key === "Escape") {
        browser.runtime.sendMessage({ cmd: "removeHighlighting" });
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
        if (this.box.style.display === "none") this.box.style.display = "initial";
    }
    hide() {
        this.box.style.display = "none";
    }
}

const CMDPANEL_HTML_CONTENT = `
<table id="GDPanel">
    <tr class="GDHead">
        <th colspan=3>
            动作
        </th>
    </tr>
    <tr class="GDLabelRow" id="GDPanel-text">
        <td class="GDPanel-label">文本</td>
        <td class="GDPanel-content" colspan=2>中国最强</td>
    </tr>
    <tr class="GDRow" id="GDRow-text">
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
    </tr>
    <tr class="GDLabelRow" id="GDPanel-link">
        <td class="GDPanel-label">链接</td>
        <td class="GDPanel-content"  colspan=2>https://www.gov.cn</td></tr>
    <tr class="GDRow" id="GDRow-link">
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
    </tr>
    <tr class="GDLabelRow" id="GDPanel-image">
        <td class="GDPanel-label">图片</td>
        <td class="GDPanel-content" colspan=2>https://www.example.com/example.jpg</td>
    </tr>
    <tr class="GDRow" id="GDRow-image">
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
        <td class="GDCell" align="center">
            <div class="GDCell-open"></div>
        </td>
    </tr>
    
</table>`;

class CMDPanel {
    constructor(enterlistener, leaveListener, dropListener) {
        this.el = document.createElement("div");
        this.el.style.display = "none";
        this.el.id = "GDPanel-wrapper";
        this.el.innerHTML = CMDPANEL_HTML_CONTENT;

        let target = this.el.querySelector("#GDRow-text");
        bgConfig.CMDPanel_textAction.forEach((obj, i) => {
            for (const k of Object.keys(obj)) {
                if (target.children[i]) { target.children[i].dataset[k] = obj[k]; }
            }
        });

        target = this.el.querySelector("#GDRow-link");
        bgConfig.CMDPanel_linkAction.forEach((obj, i) => {
            for (const k of Object.keys(obj)) {
                if (target.children[i]) { target.children[i].dataset[k] = obj[k]; }
            }
        });

        target = this.el.querySelector("#GDRow-image");
        bgConfig.CMDPanel_imageAction.forEach((obj, i) => {
            for (const k of Object.keys(obj)) {
                if (target.children[i]) { target.children[i].dataset[k] = obj[k]; }
            }
        });
        this.el.addEventListener("drop", dropListener)
        // this.el.addEventListener("dragover", e => {
        //     e.stopPropagation();
        //     e.preventDefault(); 
        //     console.log("over", e);
        // })
        this.el.addEventListener("dragenter", enterlistener)
        this.el.addEventListener("dragleave", leaveListener);

        // this.el.querySelectorAll("div").forEach(div => {
        //     div.addEventListener("dragenter", e => this.dragenter(e));
        // })
        this.displayFlag = false;
        document.body.appendChild(this.el);

    }


    place(x = 0, y = 0) {
        this.el.style.left = x + "px";
        this.el.style.top = y + "px";
    }
    display() {
        this.el.style.display = "block";
    }
    hide() {
        this.el.style.display = "none";
    }
    dragenter(e) {
        e.target.setAttribute("style", "background-color:red");
    }
}

class DragClass {
    constructor(elem) {

        this.running = false; // happend in browser
        this.accepting = false; // happend between browser and outer
        this.notAccepting = false;

        this.dragged = elem;
        this.handler = this.handler.bind(this);
        ["dragstart", "dragover", "dragenter", "dragend"].forEach(name =>
            this.dragged.addEventListener(name, evt => {
                this.handler(evt)
                return true;
            }, true)
        );
        ["dragover", "drop", "dragend"].forEach(name =>
            this.dragged.addEventListener(name, evt => {
                this.handler(evt);
            }, false)
        );
        this.dragged.addEventListener("dragstart", (e) => {
            e.returnValue = true; // no effect
            return true; // no effect
        }, false);

        // start: properties to post
        this.selection = ""; // any data, such as text, link
        this.textSelection = ""; // text you select.
        this.imageLink = ""; // image file location
        this.modifierKey = commons.KEY_NONE;
        this.actionType = "textAction";
        this.direction = commons.DIR_U;
        // end: properties to post

        this.lastDirection = null;

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

        this.CMDPanel = new CMDPanel(this.dragenter4panel, this.dragleave4panel, this.drop4panel);

        // end: UI componment

        this.timeoutId = 0; // used for clearTimeout

        this.doDropPreventDefault = false; // flag that indicate whether call event.preventDefault or not in drop event.
        this.isDropTouched = true; // flag that indicate whether the event object has been calling event.preventDefault or event.stopPropagation . 
        // if the site register drop event and use event.stopPropagation , this event won't bubble up as default. So assumeing it is true until we can catch.
        this.isInputArea = false;
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
        if (bgConfig.enablePrompt && this.promptBox === null) {
            this.promptBox = new Prompt();
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
        if (this.targetElem.nodeName === "A") {
            this.textSelection = this.targetElem.textContent;
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
        // this.direction = this.getDirection();
        // what should we do if user release ctrl or shift key while dragging?

        if (this.distance >= bgConfig.triggeredDistance) {
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
            return;
        }
        this.distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);
        if (IS_TOP_WINDOW && (this.distance > bgConfig.triggeredDistance || this.direction === commons.DIR_OUTER)) {
            this.direction = this.getDirection();
            if (this.direction === this.lastDirection) {
                // this.lastDirection = this.direction;
                return;
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
                message = message ? message
                    .replace("%a", promptString["%a"][property["act_name"]])
                    .replace("%t", promptString["%t"][property["tab_pos"]])
                    .replace("%g", promptString["%g"][property["tab_active"] === true ? "FORE_GROUND" : "BACK_GROUND"])
                    .replace("%d", promptString["%d"][property["download_directory"]] || "")
                    .replace("%e", property["engine_name"])
                    .replace("%y", promptString["%y"][this.actionType])
                    .replace("%s", this.selection) : "";
                this.promptBox.render(this.direction, message);
            }
            //----

            this.CMDPanel.hide();
            if (property["act_name"] === commons.ACT_PANEL) {
                this.CMDPanel.place(evt.pageX, evt.pageY, this.direction);
                this.CMDPanel.display();
            }
            //----

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
            console.log("Not here!!!");
            return;
        }
        this.selection = this.textSelection = "If you see this message, please report to the author of GlitterDrag"; // temporary
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
        const fileReader = new FileReader();
        let file = dt.files[0];
        fileReader.addEventListener("loadend", () => {
            let bin = new Uint8Array(fileReader.result);
            // console.log(bin, bin.length);
            sended.imageData = bin.toString(); // convert ArrayBuffer to string
            sended.hasImageBinary = true;
            sended.fileInfo.name = file.name;
            sended.fileInfo.type = file.type;
            this.post(sended);
        });
        if (["textAction", "linkAction"].includes(this.actionType)) {
            this.post({ direction: commons.DIR_OUTER });
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
                this.doDropPreventDefault = false;
                return;
            }
            sended.textSelection = file.name; // name of image file
            fileReader.readAsArrayBuffer(file);
        }
    }

    dragenter4panel(e) {

        this.isPanelArea = true; // it is changed in this.handler("enter");
        console.info("enter panel");
    }

    dragleave4panel(e) {
        // console.log(e);
        // this.isPanelArea = false;
    }
    drop4panel(e) {
        // console.info(e.);
        console.info(e.originalTarget.parentElement.dataset);
        const obj = Object.assign({}, e.originalTarget.parentElement.dataset)
        obj.tab_active = obj.tab_active === "true" ? true : false;
        obj.search_onsite = obj.search_onsite === "true" ? true : false;
        this.post({ direction: commons.DIR_P, panel: obj });
        e.preventDefault(); //note!
    }
    isNotAcceptable(evt) {
        // if the acceptable area is Input or Textarea, bypass it.
        if (["INPUT", "TEXTAREA"].includes(evt.target.nodeName)) {
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

                if (evt.dataTransfer && !this.running && this.accepting) {
                    // if (evt.dataTransfer.files[0].type === "text/html") { // A html file is dragged into browser.
                    //     //DO NOTHING
                    // }
                    // else {
                    this.doDropPreventDefault = true;
                    this.accepting = false;
                    this.drop(evt);
                    // }
                }
                else if (this.running) {
                    this.doDropPreventDefault = true;
                }

                if (this.doDropPreventDefault) {
                    evt.preventDefault();
                }
                break;
            case "dragend": // Bubbling
                this.indicatorBox && this.indicatorBox.hide();
                this.promptBox && this.promptBox.stopRender();
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
                    if (this.running && (this.isDropTouched === false || specialSites.includes(location.host))) {
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
let promptString = null;
console.info("Glitter Drag: Prepare addListener");
bgPort.onMessage.addListener((response) => {
    console.info("Glitter Drag: Receive response from background");
    bgConfig = JSON.parse(response.config);
    promptString = response.promptString;
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
})