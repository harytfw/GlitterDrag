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

        //sendMessage只能传递字符串化后（类似json）的数据
        //不能传递具体对象
        browser.runtime.sendMessage({
            direction: this.direction,
            selection: s,
            textSelection:x,
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

function listener(msg) {
    let input = document.createElement("input");
    input.style.width = "0px";
    input.style.height = "0px";
    drag.targetElem.appendChild(input);
    if (msg.copy_type === COPY_LINK) {
        if (drag.targetElem instanceof HTMLAnchorElement) input.value = drag.targetElem.href;
        else if (drag.targetElem instanceof HTMLImageElement) input.value = drag.targetElem.src;
    }
    else {
        if (drag.targetElem instanceof HTMLAnchorElement) input.value = drag.targetElem.textContent;
        // else if (drag.targetElem instanceof HTMLImageElement) //TODO;
    };
    input.focus();
    input.setSelectionRange(0, input.value.length);
    document.execCommand(msg.command);
    drag.targetElem.removeChild(input);
}

const drag = new DragClass(document.children[0])

browser.runtime.onMessage.addListener(listener);