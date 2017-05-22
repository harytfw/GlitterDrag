const urlPattern = /^(https?:\/\/)?((\w|-)*\.){0,3}((\w|-)+)\.(com|net|org|gov|edu|mil|biz|cc|info|fm|mobi|tv|ag|am|asia|at|au|be|br|bz|ca|cn|co|de|do|ee|es|eu|fr|gd|gl|gs|im|in|it|jp|la|ly|me|mp|ms|mx|nl|pe|ph|ru|se|so|tk|to|tt|tw|us|uk|ws|xxx)(\/(\w|%|&|-|_|\||\?|\.|=|\/|#|~|!|\+|,|\*|@)*)?$/i

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

const ACT_NONE = 0;//不做任何事
const ACT_OPEN = 1 << 0; //打开
const ACT_COPY = 1 << 1; //复制
const ACT_SEARCH = 1 << 2; //搜索
const ACT_TRANS = 1 << 3; //翻译
const ACT_DL = 1 << 4; //下载
const ACT_QRCODE = 1 << 5; //二维码

// 6~9

const KEY_CTRL = 1 << 10;//ctrl键
const KEY_SHIFT = 1 << 12;//shift键

// 13~14

const FORE_GROUND = 1 << 15;//前台打开
const BACK_GROUND = 1 << 16;//后台打开

// 17

const NEW_WINDOW = 1 << 18;//新窗口打开?


const TAB_CUR = 1 << 19;//当前标签页
const TAB_LEFT = 1 << 20;//新建标签页在最左边
const TAB_RIGHT = 1 << 21;//最右边
const TAB_CLEFT = 1 << 22;//新建的标签页在当前标签页的左边
const TAB_CRIGHT = 1 << 23;//右边

// 24~31


class FlagsClass {
    constructor(...in_flags) {
        this.f = ACT_NONE;
        this.set(...in_flags);
    }
    bitArray() {

    }
    toString() {

    }
    //设置标志位

    set(...m) {
        for (let x of m) {
            this.f |= x;
        }
        return this.f;
    }
    //清除
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


function checkDragTargetType(selection,target) {
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

function loadUserOptionFromBrowser() {
    //TODO
}

const DEFAULT_OPTION = {
    textAction: {
        DIR_U: new FlagsClass(ACT_SEARCH, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, BACK_GROUND),
    },
    linkAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_OPEN, FORE_GROUND),
    },
    imageAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, FORE_GROUND),
    }
}

const EMPTY_OPTION = {
    noAction: {
        DIR_D: new FlagsClass(),
        DIR_L: new FlagsClass(),
    }
}

// let UserOption = loadUserOptionFromBrowser();

let userOption = {
    textAction: {
        DIR_U: new FlagsClass(ACT_SEARCH, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, BACK_GROUND),
    },
    linkAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_OPEN, BACK_GROUND),
    },
    imageAction: {
        DIR_U: new FlagsClass(ACT_OPEN, FORE_GROUND),
        DIR_D: new FlagsClass(ACT_SEARCH, FORE_GROUND),
    }
}