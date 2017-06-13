const urlPattern = /^(https?:\/\/)?((\w|-)*\.){0,3}((\w|-)+)\.(com|net|org|gov|edu|mil|biz|cc|info|fm|mobi|tv|ag|am|asia|at|au|be|br|bz|ca|cn|co|de|do|ee|es|eu|fr|gd|gl|gs|im|in|it|jp|la|ly|me|mp|ms|mx|nl|pe|ph|ru|se|so|tk|to|tt|tw|us|uk|ws|xxx)(\/(\w|%|&|-|_|\||\?|\.|=|\/|#|~|!|\+|,|\*|@)*)?$/i
//from superdrag   https://addons.mozilla.org/en-US/firefox/addon/super-drag/

const TYPE_UNKNOWN = -1;//未知类型
const TYPE_TEXT = 0; //文本,包含普通文本、链接
const TYPE_TEXT_URL = 1;//链接
const TYPE_ELEM = 2;//元素，主要是没有选中文本，对元素进行了拖拽
const TYPE_ELEM_A = 3;//超链接，a元素
const TYPE_ELEM_IMG = 4;

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

const ACT_NONE = 1 << 0;//无动作
const ACT_OPEN = 1 << 1; //打开
const ACT_COPY = 1 << 2; //复制
const ACT_SEARCH = 1 << 3; //搜索
const ACT_TRANS = 1 << 4; //翻译
const ACT_DL = 1 << 5; //下载
const ACT_QRCODE = 1 << 6; //二维码

// 7~9

const KEY_CTRL = 1 << 10;//ctrl键
const KEY_SHIFT = 1 << 12;//shift键

// 13~14

const FORE_GROUND = 1 << 15;//前台打开
const BACK_GROUND = 1 << 16;//后台打开

// 17

const NEW_WINDOW = 1 << 18;//新窗口打开?


const TAB_CUR = 1 << 19;//当前标签页
const TAB_FIRST = 1 << 20;//新建标签页在最左边
const TAB_LAST = 1 << 21;//最右边
const TAB_CLEFT = 1 << 22;//新建的标签页在当前标签页的左边
const TAB_CRIGHT = 1 << 23;//右边

// 24~31
const FLAG_STRING_TABLE = {
    "ACT_NONE": ACT_NONE, "ACT_OPEN": ACT_OPEN, "ACT_COPY": ACT_COPY,
    "ACT_SEARCH": ACT_SEARCH, "ACT_TRANS": ACT_TRANS, "ACT_DL": ACT_DL, "ACT_QRCODE": ACT_QRCODE,
    "KEY_CTRL": KEY_CTRL, "KEY_SHIFT": KEY_SHIFT, "FORE_GROUND": FORE_GROUND, "BACK_GROUND": BACK_GROUND,
    "NEW_WINDOW": NEW_WINDOW, "TAB_CUR": TAB_CUR, "TAB_FIRST": TAB_FIRST, "TAB_LAST": TAB_LAST,
    "TAB_CLEFT": TAB_CLEFT, "TAB_CRIGHT": TAB_CRIGHT
}

const _DEBUG = true;


function $E(s=""){
    let r = document.querySelector(s);
    if(!r){
        console.trace("No Result: document.querySelector", s)
    }
    return r;
}

class FlagsClass {
    constructor(...in_flags) {

        this.f = 0;
        if (in_flags.length !== 0) {
            this.set(...in_flags);
        }
        else {
            this.set(ACT_NONE);
        }
        // this.searchTemplateName = "";
        //???????
    }

    toString() {
        let w = [];
        for(let k of Object.keys(FLAG_STRING_TABLE)){
            if(this.isset(FLAG_STRING_TABLE[k])){
                w.push(k);
            }
        }
        return w.join("|");
    }
    //设置标志位

    set(...m) {
        for (let x of m) {
            this.f |= x;
        }
        return this.f;
    }
    //清除
    clear_self_set(val) {
        this.clear(this.f);
        this.set(val);
    }
    clear(...m) {
        for (let x of m) {
            this.f &= ~m;
        }
        return this.f;
    }
    //切换
    toggle(...m) {
        for (let x of m) {
            this.f ^= m;
        }
        return this.f;
    }
    //检测标志位是否被设置
    //如果是多个参数，则判断this.f是否等于传入的标志位
    isset(...m) {

        for (let x of m) {
            //有一个不匹配
            if ((x & this.f) == 0) {
                return false;
            }
        }
        return true;
    }
    isset_or(...m) {
        for (let x of m) {
            //有一个匹配
            if ((x & this.f) != 0) {
                return true;
            }
        }
        return false;
    }

    check_comflic(...m) {
        //TODO
    }
}



function buildSearchSearch(props = { url: "", kw: "" }) {

}

function checkDragTargetType(selection, target) {
    if (selection && selection.length !== 0) {
        if (urlPattern.test(selection)) {
            return TYPE_TEXT_URL;
        }
        return TYPE_TEXT;
    }
    else if (target !== null) {
        if (target instanceof HTMLAnchorElement) {
            return TYPE_ELEM_A;
        }
        else if (target instanceof HTMLImageElement) {
            return TYPE_ELEM_IMG;
        }
        return TYPE_ELEM;
    }
    return TYPE_UNKNOWN;
}


const DEFAULT_OPTIONS = {
    textAction: {
        DIR_U: new FlagsClass(ACT_SEARCH, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, BACK_GROUND),
        DIR_L: new FlagsClass(),
        DIR_R: new FlagsClass()
    },
    linkAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_OPEN, BACK_GROUND),
        DIR_L: new FlagsClass(),
        DIR_R: new FlagsClass()

    },
    imageAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, FORE_GROUND),
        DIR_L: new FlagsClass(),
        DIR_R: new FlagsClass()
    }
}

const EMPTY_OPTION = {
    noAction: {
        DIR_D: new FlagsClass(),
        DIR_L: new FlagsClass(),
    }
}

//搜索引擎的名称应该是唯一的，不过用户定义的模板会覆盖默认模板
const DEFAULT_SEARCH_TEMPLATE = {
    "百度": "http://www.baidu.com/s?wd=%s",
    "Google": "",
    "Bing": ""
}

//仅作为结构参考和说明，不要使用它
const SAMPLE_CUSTOMIZED_SEARCH = {
    //若textAction等动作的键值不存在，调用默认搜索
    textAction: {
        //DIR_D:这个键值就是一个搜索模板
        DIR_D: DEFAULT_SEARCH_TEMPLATE["百度"]
        //若对应方向不存在，调用默认搜索
    },
    linkAction: {
        DIR_D: DEFAULT_SEARCH_TEMPLATE["Bing"]
    },
    imageAction: {
        DIR_D: DEFAULT_SEARCH_TEMPLATE["Bing"]
    }
}
/**
 * 要添加自定义搜索引擎，首先要添加一个搜索模板，然后在具体的选项页修改调用的搜索引擎
 */

