class DragClass {
    constructor(elem) {
        this.dragged = elem;
        this.selection = "";
        this.targetElem = null;
        this.direction = DIR_U;

        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 0, y: 0 };

        this.offset = 2;
        this.handler = this.handler.bind(this);
        this.eventRegister();
    }
    post() {
        let t = checkDragTargetType(this.selection, this.targetElem);
        let s = "";
        let x = ""
        if (t === TYPE_TEXT || t === TYPE_TEXT_URL) {
            x = s = this.selection;
        }
        else if(t === TYPE_TEXT_AREA){
            s = this.targetElem.value;
            x = s = s.substring(this.targetElem.selectionStart,this.targetElem.selectionEnd);
        }
        else if (t === TYPE_ELEM_A) {
            s = this.targetElem.href;
            x = this.targetElem.textContent;
        }
        else if (t === TYPE_ELEM_IMG) {
            s = this.targetElem.src;
        }
        else if (t === TYPE_ELEM) {
            s = "";
        }
        this.selection = s;
        //sendMessage只能传递字符串化后（类似json）的数据
        //不能传递具体对象
        browser.runtime.sendMessage({
            direction: this.direction,
            selection: s,
            textSelection: x,
            type: t
        });
    }



    eventRegister() {
        // this.dragged.setAttribute("draggable",true);
        this.dragged.addEventListener("dragstart", this.handler, false);
        this.dragged.addEventListener("dragend", this.handler, false);
        this.dragged.addEventListener("dragover", this.handler, false);
        this.dragged.addEventListener("drop", this.handler, false);

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
            evt.preventDefault();
            // console.log(evt);
        }
    }

    getDirection() {
        const m = Math.sqrt(Math.pow(this.startPos.x - this.endPos.x, 2) + Math.pow(this.startPos.y - this.endPos.y, 2));
        //屏幕的坐标从左上角开始计算
        const sin = (this.startPos.y - this.endPos.y) / m;
        const cos = (this.endPos.x - this.startPos.x) / m;
        //0~180
        if (sin >= 0 && sin <= 1) {
            //小于90度
            if (cos >= 0) {
                //大于等于45度
                if (sin >= sin45) {
                    //45~90
                    return DIR_U;
                }
                //0~45
                return DIR_R;
            }
            //大于90度
            else if (cos < 0) {
                //小于135度
                if (sin >= sin135) {
                    //90~135
                    return DIR_U;
                }
                //135-180
                return DIR_L;
            }
        }
        //180-360
        else if (sin < 0 && sin >= -1) {
            //大于270
            if (cos >= 0) {
                //大于315度
                if (sin >= sin315) {
                    //315~360
                    return DIR_R;
                }
                //270-315   
                return DIR_D;
            }
            //小于270
            else if (cos < 0) {
                //小于225度
                if (sin >= sin225) {
                    //180~225
                    return DIR_L;
                }
                //225~270
                return DIR_D;
            }

        }


    }

}
const MIME_TYPE = {
    ".gif": "image/gif",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".png": "image/png",
    ".bmp": "image/bmp",
    ".txt": "text/plain",
}

function listener(msg) {
    let dontExecute = false;
    let elem = drag.targetElem;
    let input = document.createElement("textarea");
    input.style.width = "0px";
    input.style.height = "0px";
    if (elem instanceof HTMLAnchorElement) {
        if (msg.copy_type === COPY_LINK) input.value = elem.href;
        else if (msg.copy_type === COPY_TEXT) input.value = elem.textContent;
        else if (msg.copy_type === COPY_IMAGE) {
            //如果复制链接里的图像
            drag.targetElem = elem.querySelector("img");
            listener(msg);
            return;
        }
    }
    else if (elem instanceof HTMLImageElement) {
        if (msg.copy_type === COPY_LINK) input.value = elem.src;
        else if (msg.copy_type === COPY_IMAGE) {
            dontExecute = true;
            //获得图像的扩展
            let pathname = new URL(elem.src).pathname;
            let ext = pathname.substring(pathname.lastIndexOf("."), pathname.length);
            let img = new Image();
            img.src = elem.src;
            img.onload = () => {
                //下面尝试得到图像的二进制数据
                let canvas = document.createElement("canvas");
                canvas.height = img.height;
                canvas.width = img.width;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                //得到没有data:image ...头的base64字符串
                let base64 = canvas.toDataURL("image/png", 1).split(",")[1];
                //发送给background，让background发送字符串到powershell脚本
                browser.runtime.sendMessage({
                    imageBase64: base64
                });
                img = null;
                canvas = null;
                base64 = null;
            }
        }
    }
    else {
        input.value = drag.selection;
    }
    if (!dontExecute) {
        elem.parentElement.appendChild(input);
        input.focus()
        input.setSelectionRange(0, input.value.length);
        document.execCommand("copy");
        elem.parentElement.removeChild(input);
    }

}


const drag = new DragClass(document.children[0])
// document.addEventListener("copy", onCopy);
if (window.hasOwnProperty("backgroundPage")) {
    //如果是在options.html内运行，那么使用另外的listener
    //见options.js
}
else {
    browser.runtime.onMessage.addListener(listener);
}