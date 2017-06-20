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


const ACT_NONE = "ACT_NONE";//无动作
const ACT_OPEN = "ACT_OPEN"; //打开
const ACT_COPY = "ACT_COPY" //复制
const ACT_SEARCH = "ACT_SEARCH" //搜索
const ACT_TRANS = "ACT_TRANS" //翻译
const ACT_DL = "ACT_DL" //下载
const ACT_QRCODE = "ACT_QRCODE" //二维码
const COPY_LINK = "COPY_LINK"
const COPY_TEXT = "COPY_TEXT"
const COPY_IMAGE = "COPY_IMAGE"
const SEARCH_TEXT = "SEARCH_TEXT"
const SEARCH_LINK = "SEARCH_LINK"
const SEARCH_IMAGE = "SEARCH_IMAGE"
// const KEY_CTRL = 0;//ctrl键
// const KEY_SHIFT = 1;//shift键



const NEW_WINDOW = "NEW_WINDOW";//新窗口打开?
const TAB_CUR = "TAB_CUR";//当前标签页
const TAB_FIRST = "TAB_FIRST";//新建标签页在最左边
const TAB_LAST = "TAB_LAST";//最右边
const TAB_CLEFT = "TAB_CLEFT";//新建的标签页在当前标签页的左边
const TAB_CRIGHT = "TAB_CRIGHT";//右边



const FORE_GROUND = true;//前台打开
const BACK_GROUND = false;//后台打开


const _DEBUG = true;


function $E(s = "") {
    let r = document.querySelector(s);
    if (!r) {
        console.trace("No Result: document.querySelector", s)
    }
    return r;
}


class ActClass {
    //NEW OPT
    constructor(act = ACT_NONE, active = BACK_GROUND, pos = TAB_LAST, en = "", search_type = SEARCH_TEXT, copy_type = COPY_LINK) {
        this.act_name = act;
        this.tab_active = active;
        this.tab_pos = pos;
        this.engine_name = en;
        this.copy_type = copy_type;

        this.search_type = search_type;
    }
    isAct(any) {
        if (act_name === any) {
            return true;
        }
    }
    update(opt = { act: ACT_NONE, active: BACK_GROUND, pos: TAB_LAST, en: "", search_type: SEARCH_TEXT, copy_type: COPY_LINK }) {
        this.act_name = opt.act;
        this.tab_active = opt.active;
        this.tab_pos = opt.pos;
        this.engine_name = opt.en;
        this.copy_type = opt.copy_type;
        this.search_type = search_type;
    }
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
