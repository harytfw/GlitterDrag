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
        let name = "";
        switch (d) {
            case commons.DIR_U:
                name = "GDArrow-U";
                break;
            case commons.DIR_L:
                name = "GDArrow-L";
                break;
            case commons.DIR_R:
                name = "GDArrow-R";
                break;
            case commons.DIR_D:
                name = "GDArrow-D";
                break;
        }
        this.arrow.className = name;
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
        let h = this.box.style.height = (radius * 2) + "px";
        let w = this.box.style.width = (radius * 2) + "px";
        this.box.style.borderRadius = w + " " + h;
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
        this.dragged = elem;
        this.handler = this.handler.bind(this);
        ["dragstart", "dragend", "dragover", "drop"].forEach(name =>
            //这里是capture阶段
            this.dragged.addEventListener(name, this.handler, true)
        );
        //添加在冒泡阶段
        //网页自己添加的dragstart事件并使用preventDefault会妨碍扩展运行
        //这里取消preventDefault的作用
        document.addEventListener("dragstart", (event) => {
            // console.log(event);
            event.returnValue = true;
        }, false);


        this.selection = "";
        this.targetElem = null;
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
        this.promptBox = null; //new Prompt();
        this.indicatorBox = null
        this.isFirstRender = true;
        // document.addEventListener("DOMContentLoaded", () => {
        this.promptBox = new Prompt();
        // });
        // this.offset = 2;
    }

    post() {
        let sel = ""; //选中的数据,文本，链接
        let text = ""; //选中的文本，跟上面的可能相同可能不同
        switch (this.targetType) {
            case commons.TYPE_TEXT:
            case commons.TYPE_TEXT_URL:
                text = sel = this.selection;
                break;
            case commons.TYPE_TEXT_AREA:
                sel = this.targetElem.value;
                text = sel = sel.substring(this.targetElem.selectionStart, this.targetElem.selectionEnd);
                break;
            case commons.TYPE_ELEM_A:
                sel = this.targetElem.href;
                text = this.targetElem.textContent;
                break;
            case commons.TYPE_ELEM_IMG:
                sel = this.targetElem.src;
                break;
            case commons.TYPE_ELEM:
                sel = "";
                break;
            default:
                break;
        }
        this.selection = sel;
        //sendMessage只能传递字符串化后（类似json）的数据
        //不能传递具体对象
        let sended = {
            direction: this.direction,
            selection: sel,
            textSelection: text,
            actionType: this.actionType,
            sendToOptions: false
        }
        if (isRunInOptionsContext) {
            sended.sendToOptions = true;
            backgroundPage.executor.DO(sended);
        }
        else browser.runtime.sendMessage(sended);
    }
    dragstart(evt) {
        if (bgConfig.enableIndicator) {
            if (this.indicatorBox === null) this.indicatorBox = new Indicator();
            this.indicatorBox.place(evt.pageX, evt.pageY, bgConfig.triggeredDistance);
            this.indicatorBox.display();
        }
        this.targetElem = evt.target;
        this.selection = document.getSelection().toString();
        // this.selection = evt.dataTransfer.getData("text/plain");
        this.targetType = checkDragTargetType(this.selection, this.targetElem);
        this.actionType = getActionType(this.targetType);
        this.startPos.x = evt.screenX;
        this.startPos.y = evt.screenY;
    }
    dragend(evt) {
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
        this.distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);
        if (this.distance > bgConfig.triggeredDistance) {
            this.direction = this.getDirection();
            if (bgConfig.enablePrompt) {
                this.promptBox.display();
                this.promptBox.render(this.direction, getActionName(
                    bgConfig.Actions[this.actionType][this.direction]["act_name"]
                ));
            }
        }
        else {
            if (this.promptBox) { // may be null if viewing an image
                this.promptBox.stopRender();
            }
        }
        evt.preventDefault();

    }
    handler(evt) {
        //dragstart target是拖拽的东西
        //dragend   同上
        //dragover  target是document
        //drop      同上

        //document 无getAttribute
        //
        if (evt.target.getAttribute && evt.target.getAttribute("draggable") !== null) {
            //如果target设置了draggable属性，那么不处理
            return;
        }
        const type = evt.type;
        this.endPos.x = evt.screenX;
        this.endPos.y = evt.screenY;
        //TODO:把拖拽的数据放在event里传递
        if (type === "dragstart") {
            this.dragstart(evt);
        }
        else if (type === "dragend") {
            this.dragend(evt)
        }
        else if (type === "drop") {
            evt.preventDefault();
        }
        else if (type === "dragover") {
            this.dragover(evt);
        }
    }

    getDirection() {
        function between(ang, ang1, ang2) {
            return ang1 < ang2 && ang >= ang1 && ang < ang2;
        }
        let d = {
            normal: commons.DIR_D, //普通的四个方向
            horizontal: commons.DIR_L, //水平方向,只有左右
            vertical: commons.DIR_D, //竖直方向，只有上下
            all: commons.DIR_D //
        }

        let rad = Math.atan2(this.startPos.y - this.endPos.y, this.endPos.x - this.startPos.x);
        let degree = rad * (180 / Math.PI);
        degree = degree >= 0 ? degree : degree + 360; //-180~180转换成0~360
        if (between(degree, 45, 135)) d.normal = commons.DIR_U;
        else if (between(degree, 135, 225)) d.normal = commons.DIR_L;
        else if (between(degree, 225, 315)) d.normal = commons.DIR_D;
        else d.normal = commons.DIR_R;

        if (between(degree, 90, 270)) d.horizontal = commons.DIR_L;
        else d.horizontal = commons.DIR_R;

        if (between(degree, 0, 180)) d.vertical = commons.DIR_U;
        else d.vertical = commons.DIR_D;
        return d.normal; //暂时
    }

}


function CSlistener(msg) {
    let needExecute = true;
    let elem = mydrag.targetElem;
    let input = document.createElement("textarea");
    input.style.width = "0px";
    input.style.height = "0px";

    if (elem instanceof HTMLAnchorElement) {
        switch (msg.copy_type) {
            case commons.COPY_LINK:
                input.value = elem.href;
                break;
            case commons.COPY_TEXT:
                input.value = elem.textContent;
                break;
            case commons.COPY_IMAGE:
                mydrag.targetElem = elem.querySelector("img");
                CSlistener(msg); //可能有更好的办法
                return;
                //break;
        }

    }
    else if (elem instanceof HTMLImageElement) {
        if (msg.command === "copy") {
            switch (msg.copy_type) {
                case commons.COPY_LINK:
                    input.value = elem.src;
                    break;
                case commons.COPY_IMAGE:
                    needExecute = false;
                    browser.runtime.sendMessage({ imageSrc: elem.src });
                    // getImageBase64(elem.src, (s) => {
                    //     browser.runtime.sendMessage({ imageBase64: s });
                    // })
                    break;
            }
        }

    }
    else {
        input.value = mydrag.selection;
    }
    if (needExecute) {
        elem.parentElement.appendChild(input);
        input.focus();
        input.setSelectionRange(0, input.value.length);
        document.execCommand("copy");
        elem.parentElement.removeChild(input);
    }
}

browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToContentScript") {
        port.onMessage.addListener(CSlistener);
    }
});
let bgPort = browser.runtime.connect({ name: "getConfig" });
let bgConfig = null;
let mydrag = null;
bgPort.onMessage.addListener((c) => {
    bgConfig = JSON.parse(c);

    document.addEventListener("DOMContentLoaded", () => {
        if (mydrag === null) {
            mydrag = new DragClass(document);
        }

    }, { once: true });

    //如果上面没有执行
    let times = 3; //次数
    let id = setInterval(() => {
        if (mydrag === null) {
            console.log("Init By setInterval !");
            mydrag = new DragClass(document);
            clearInterval(id);
            return;
        }
        times--;
        if (times < 0) clearInterval(id);
    }, 1000);
});
// document.addEventListener("DOMContentLoaded", () => {
//     mydrag = new DragClass(document.children[0]);
// });
// mydrag = new DragClass(document.children[0]);