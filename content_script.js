let isRunInOptionsContext = browser.runtime.getBackgroundPage !== undefined ? true : false;
//config
const MIME_TYPE = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
}


let bgPort = null;
if (isRunInOptionsContext) {
    bgPort = browser.runtime.connect({ name: "cs" });
}

class DragClass {
    constructor(elem) {
        this.dragged = elem;
        this.handler = this.handler.bind(this);
        ["dragstart", "dragend", "dragover", "drop"].forEach(name =>
            this.dragged.addEventListener(name, this.handler, false)
        );
        this.selection = "";
        this.targetElem = null;
        this.targetType = TYPE_UNKNOWN;
        this.direction = DIR_U;
        this.triggerDistance = 1;
        this.startPos = {
            x: 0,
            y: 0
        };
        this.endPos = {
            x: 0,
            y: 0
        };
        // this.offset = 2;
    }

    render() {
        //动作1
        //动作2
        //...
        //取消
        //使用canvas还是svg还是原生html

    }

    post() {
        this.targetType = checkDragTargetType(this.selection, this.targetElem);
        let sel = ""; //选中的数据
        let text = ""; //选中的文本
        switch (this.targetType) {
            case TYPE_TEXT:
            case TYPE_TEXT_URL:
                text = sel = this.selection;
                break;
            case TYPE_TEXT_AREA:
                sel = this.targetElem.value;
                text = sel = sel.substring(this.targetElem.selectionStart, this.targetElem.selectionEnd);
                break;
            case TYPE_ELEM_A:
                sel = this.targetElem.href;
                text = this.targetElem.textContent;
                break;
            case TYPE_ELEM_IMG:
                sel = this.targetElem.src;
                break;
            case TYPE_ELEM:
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
            type: this.targetType,
            sendToOptions: false
        }
        if (isRunInOptionsContext) {
            sended.sendToOptions = true;
            backgroundPage.executor.DO(sended);
        }
        else browser.runtime.sendMessage(sended);
    }

    handler(evt) {
        // console.log(evt);
        const type = evt.type;
        //TODO:把拖拽的数据放在event里传递
        if (type === "dragstart") {
            this.selection = "";
            this.startPos.x = evt.screenX;
            this.startPos.y = evt.screenY;
        }
        else if (type === "dragend") {
            this.endPos.x = evt.screenX;
            this.endPos.y = evt.screenY;
            this.selection = document.getSelection().toString();
            this.direction = this.getDirection();
            this.targetElem = evt.target;
            this.post();
        }
        else if (type === "drop") {
            // console.log(evt);
            //不加这行代码会产生副作用，在页面打开链接
            //不知道为什么
            evt.preventDefault();
        }
        else if (type === "dragover") {
            //加上这行代码，拖拽时鼠标指针由禁止（一个圆加斜杠）变成正常的指针
            let distance = Math.hypot(this.startPos.x - evt.screenX, this.startPos.y - evt.screenY);
            if(distance>this.triggerDistance) this.render();
            evt.preventDefault();
            // console.log(evt);
        }
    }

    getDirection() {
        function between(ang, ang1, ang2) {
            return ang1 < ang2 && ang >= ang1 && ang < ang2;
        }
        let d = {
            normal: DIR_D, //普通的四个方向
            horizontal: DIR_L, //水平方向
            vertical: DIR_D //竖直方向
        }


        //屏幕的坐标从左上角开始计算
        let rad = Math.atan2(this.startPos.y - this.endPos.y, this.startPos.x - this.endPos.x);
        let degree = rad * (180 / Math.PI);
        degree = degree >= 0 ? degree : Math.abs(degree) + 180;
        if (between(degree, 45, 135)) d.normal = DIR_U;
        else if (between(degree, 135, 225)) d.normal = DIR_L;
        else if (between(degree, 225, 315)) d.normal = DIR_D;
        else d.normal = DIR_R;

        if (between(degree, 90, 270)) d.horizontal = DIR_L;
        else d.horizontal = DIR_R;

        if (between(degree, 0, 180)) d.vertical = DIR_U;
        else d.horizontal = DIR_D;
        return d.normal;
    }

}

function getImageBase64(src = "", callback) {
    let pathname = new URL(src).pathname;
    let ext = pathname.substring(pathname.lastIndexOf("."), pathname.length);
    let img = new Image();
    img.src = src;
    img.onload = () => {
        //下面尝试得到图像的二进制数据
        let canvas = document.createElement("canvas");
        canvas.height = img.height;
        canvas.width = img.width;
        let ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        //得到没有data:image ...头的base64字符串
        let base64 = canvas.toDataURL("image/png", 1).split(",")[1];
        callback(base64);
        //发送给background，让background发送字符串到powershell脚本
        // browser.runtime.sendMessage({
        //     imageBase64: base64
        // });
        img = null;
        canvas = null;
        base64 = null;
        callback(base64)
    }
}

function listener(msg) {
    // console.log("@from content_script");
    let needExecute = true;
    let elem = mydrag.targetElem;
    let input = document.createElement("textarea");
    input.style.width = "0px";
    input.style.height = "0px";

    if (elem instanceof HTMLAnchorElement) {
        switch (msg.copy_type) {
            case COPY_LINK:
                input.value = elem.href;
                break;
            case COPY_TEXT:
                input.value = elem.textContent;
                break;
            case COPY_IMAGE:
                drag.targetElem = elem.querySelector("img");
                listener(msg);
                break;
        }
        // if (msg.copy_type === COPY_LINK) input.value = elem.href;
        // else if (msg.copy_type === COPY_TEXT) input.value = elem.textContent;
        // else if (msg.copy_type === COPY_IMAGE) {
        //     //如果复制链接里的图像
        //     drag.targetElem = elem.querySelector("img");
        //     listener(msg);
        // }
    }
    else if (elem instanceof HTMLImageElement) {
        switch (msg.copy_type) {
            case COPY_LINK:
                input.value = elem.src;
                break;
            case COPY_IMAGE:
                needExecute = false;
                getImageBase64(elem.src, (s) => {
                    browser.runtime.sendMessage({ imageBase64: s })
                })
                break;
        }
        // if (msg.copy_type === COPY_LINK) input.value = elem.src;
        // else if (msg.copy_type === COPY_IMAGE) {
        //     dontExecute = true;
        //     getImageBase64(elem.src, (s) => {
        //         browser.runtime.sendMessage({ imageBase64: s })
        //     })
        // }
    }
    else {
        input.value = drag.selection;
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
        port.onMessage.addListener(listener);
    }
})

const mydrag = new DragClass(document.children[0]);