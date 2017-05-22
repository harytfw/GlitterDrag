const DIR_U = "DIR_U";
const DIR_D = "DIR_D";
const DIR_L = "DIR_L";
const DIR_R = "DIR_R";

const sin0 = 0;
const sin45 = Math.sqrt(2) / 2;
const sin90 = 1;
const sin135 = sin45;
const sin180 = sin0;
const sin225 = -sin45;
const sin270 = -sin90;
const sin315 = -sin45;
const sin360 = sin0;



class DragClass {

    constructor(doc) {

        this.doc = doc;
        this.selection = "";
        this.targetElem = null;
        this.direction = DIR_U;

        this.startPos = { x: 0, y: 0 };
        this.endPos = { x: 0, y: 0 };

        this.offset = 2;
        this.handler = this.handler.bind(this);
        this.registerEvent();
    }



    post(){
        let port = browser.runtime.connect({name:"Drag-Class"});
        if(port!=null){
            port.postMessage(
                {
                    direction:this.direction,
                    selection:this.selection,
                    target:this.targetElem
                }
                );
        }
        else{
            console.error("错误，没有连接到background");
        }
    }


    registerEvent() {
        document.addEventListener("dragstart", this.handler, false);
        document.addEventListener("dragend", this.handler, false);


    }
    handler(evt) {
        console.log(evt);
        const type = evt.type;

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
            this.post();
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

const drag = new DragClass(document)