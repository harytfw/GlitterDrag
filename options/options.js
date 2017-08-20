//TODO:减少全局变量
//TODO: 统一data-i18n的使用
//TODO: auto reloading after restore from backup file.
document.title = getI18nMessage("option_page_title");



const TOOLTIP_TEXT_TABLE = {};
//TODO add allow_ tooltip
["act", "active", "pos", "search", "search_type", "copy", "allow", "open_type", "download_type", "download_saveas", "download_directory"].forEach(
    (name) => {
        TOOLTIP_TEXT_TABLE[name] = getI18nMessage("option_tooltip_" + name);
    }
)


const OPTION_TEXT_VALUE_TABLE = {
    act: [],
    active: [],
    pos: [],
    open: [],
    search: [],
    copy: [],
    allow: [],
    download: [],
    download_saveas: []
}
const DIR_TEXT_VALUE_TABLE = {};
for (let item of Object.keys(commons)) {

    //排除
    if (["urlPattern", "appName", "PLACE_HOLDER", "NEW_WINDOW", "DEFAULT_SEARCH_ENGINE", "DEFAULT_DOWNLOAD_DIRECTORY", "_DEBUG", ].includes(item)) {
        continue;
    }
    if (/^TYPE_/.test(item)) {
        continue;
    }
    if (/^KEY_/.test(item)) {
        continue;
    }
    const obj = {
        text: getI18nMessage(item),
        value: commons[item]
    };
    if (/^DIR_/.test(item)) {
        DIR_TEXT_VALUE_TABLE[item] = obj;
    }

    else if (/^ACT_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.act.push(obj)
    }
    else if (/^TAB_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.pos.push(obj);
    }
    else if (["FORE_GROUND", "BACK_GROUND"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.active.push(obj);
    }
    else if (["SEARCH_LINK", "SEARCH_TEXT", "SEARCH_IMAGE", "SEARCH_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.search.push(obj);
    }
    else if (["OPEN_LINK", "OPEN_IMAGE", "OPEN_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.open.push(obj);
    }
    else if (["COPY_TEXT", "COPY_LINK", "COPY_IMAGE", "COPY_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.copy.push(obj);
    }
    else if (["DOWNLOAD_TEXT", "DOWNLOAD_LINK", "DOWNLOAD_IMAGE", "DOWNLOAD_IMAGE_LINK"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.download.push(obj);
    }
    else if (["DOWNLOAD_SAVEAS_YES", "DOWNLOAD_SAVEAS_NO"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.download_saveas.push(obj);
    }
    else if (/^ALLOW_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.allow.push(obj);
    }
    else {
        //unused
        //console.log(obj);
    }
}

// class SelectWrapper {
//     //              选项      值      提示    回调
//     constructor(optList = [], value, tooltip, cb) {
//         this.elem = document.createElement("select");
//         this.elem.setAttribute("title", tooltip);
//         optList.every(opt => {
//             let option = document.createElement("option");
//             option.setAttribute("value", opt.value); //
//             option.textContent = opt.text;
//             this.elem.appendChild(option);
//             return 1;
//         });
//         this.onchange = this.onchange.bind(this);
//         this.elem.onchange = this.onchange;
//         this.callback = cb;
//         this.value = value;
//     }
//     hide() {
//         this.elem.style.display = "none";
//     }
//     show() {
//         this.elem.style.display = "";
//     }
//     get value() {
//         if (this.elem.value === "false") return false;
//         else if (this.elem.value === "true") return true;
//         return this.elem.value;
//     }
//     set value(v) {
//         this.elem.value = v;
//     }
//     onchange() {
//         this.callback();
//     }
//     disableOpt(...opts) {
//         opts.forEach(opt => {
//             Array.from(this.elem.children, child => {
//                 if (opt === child.value) {
//                     child.setAttribute("disabled", "disabled");
//                 }
//             })
//         })
//     }
//     appendTo(parent) {
//         parent.appendChild(this.elem);
//     }
// }
class _SelectWrapper {
    //                         选项      值      提示    
    constructor(name = "", optList = [], value, tooltip = "") {
        this.name = name;
        this.elem = document.createElement("select");
        this.elem.setAttribute("title", tooltip);
        optList.forEach(opt => {
            let option = document.createElement("option");
            option.setAttribute("value", opt.value); //
            option.textContent = opt.text;
            this.elem.appendChild(option);
        });
        // this.onchange = this.onchange.bind(this);
        // this.elem.onchange = this.onchange;
        this.value = value;

        this.isInit = true;
    }

    get value() {
        if (this.elem.value === "false") return false;
        else if (this.elem.value === "true") return true;
        return this.elem.value;
    }
    set value(v) {
        this.elem.value = v;
    }

    updateViaOptList(optList) {
        let oldValue = this.value;
        let option = null;
        while ((option = this.elem.firstChild) !== null) {
            option.remove();
        }
        optList.forEach(opt => {
            let option = document.createElement("option");
            option.setAttribute("value", opt.value); //
            option.textContent = opt.text;
            this.elem.appendChild(option);
        });
        this.value = oldValue;
    }

    //选项显示或隐藏控制的代码
    //the code about control options to show or hide.
    disableOpt(...opts) {
        for (const child of this.elem.children) {
            if (opts.includes(child.value)) {
                child.setAttribute("disabled", "disabled");
                child.style.display = "none";
            }
        }
    }
    setDefaultOpt(opt) {
        if (this.value === "") {
            if (typeof opt === "string" && opt.startsWith("DEFAULT")) {
                this.value = this.elem.firstElementChild.value;
            }
            else {
                this.value = opt;
            }
        }
        //触发change事件
        this.elem.dispatchEvent(new Event("change", {}));
    }
    hide() {
        this.elem.style.display = "none";
    }
    show() {
        if (this.disableFlag) return;
        this.elem.style.display = "";
    }
    disable() {
        this.disableFlag = true;
        this.hide();
    }
    enable() {
        // this.elem.removeAttribute("disabled");
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
    bindCallBack(cb) {
        this.elem.onchange = cb;
        if (this.isInit) {
            this.isInit = false;
            //call the callback function with fake Event object to complete initialization
            cb({
                target: this.elem
            });
        }
    }
}




class ActionSelect extends _SelectWrapper {
    constructor(value) {
        super("act_name", OPTION_TEXT_VALUE_TABLE.act, value, TOOLTIP_TEXT_TABLE.act);
    }
}

class ActivationSelect extends _SelectWrapper {
    constructor(value) {
        super("tab_active", OPTION_TEXT_VALUE_TABLE.active, value, TOOLTIP_TEXT_TABLE.active)
    }
}

class PositionSelect extends _SelectWrapper {
    constructor(value) {
        super("tab_pos", OPTION_TEXT_VALUE_TABLE.pos, value, TOOLTIP_TEXT_TABLE.pos);
    }
}

class EngineSelect extends _SelectWrapper {
    constructor(value) {
        let optList = EngineSelect.createEnginesOptList();

        super("engine_name", optList, value, TOOLTIP_TEXT_TABLE.search);
        this.elem.classList.add("searchEngines");
        this.elem.addEventListener("update", () => this.updateSearchEngines());
    }
    static createEnginesOptList() {
        let engines = backgroundPage.config.get("Engines");

        let optList = [{
            text: getI18nMessage("defaultText"),
            value: "DEFAULT_SEARCH_ENGINE"
        }];
        if (engines.length !== 0) {
            optList = Array.from(engines, v => {
                return {
                    text: v.name,
                    value: v.name
                };
            });
        }
        return optList;
    }
    updateSearchEngines() {
        // console.log("update");
        this.updateViaOptList(EngineSelect.createEnginesOptList());
    }
}


class OpenTypeSelect extends _SelectWrapper {
    constructor(value) {
        super("open_type", OPTION_TEXT_VALUE_TABLE.open, value, TOOLTIP_TEXT_TABLE.open_type);
    }
}

class SearchTypeSelect extends _SelectWrapper {
    constructor(value) {
        super("search_type", OPTION_TEXT_VALUE_TABLE.search, value, TOOLTIP_TEXT_TABLE.search_type);
    }
}

class CopySelect extends _SelectWrapper {
    constructor(value) {
        super("copy_type", OPTION_TEXT_VALUE_TABLE.copy, value, TOOLTIP_TEXT_TABLE.copy);
    }
}

class DownloadlSelect extends _SelectWrapper {
    constructor(value) {
        super("download_type", OPTION_TEXT_VALUE_TABLE.download, value, TOOLTIP_TEXT_TABLE.download_type);
    }
}

class DownloadDirectoriesSelect extends _SelectWrapper {
    constructor(value) {
        const directories = backgroundPage.config.get("downloadDirectories");
        const optList = Array.from(directories, (directory, index) => {
            return {
                text: browser.i18n.getMessage("DownloadDirectory", index),
                value: index
            };
        });

        super("download_directory", optList, value, TOOLTIP_TEXT_TABLE.download_directory)
    }
}

class DownloadSaveasSelect extends _SelectWrapper {
    constructor(value) {
        super("download_saveas", OPTION_TEXT_VALUE_TABLE.download_saveas, value, TOOLTIP_TEXT_TABLE.download_saveas);
    }
}

class ControlSelect extends _SelectWrapper {
    constructor(value) {
        super("directionControl", OPTION_TEXT_VALUE_TABLE.allow, value, TOOLTIP_TEXT_TABLE.allow);
    }
}


class DirWrapper {
    constructor(labelString, dirValue, conf, ) {
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");
        this.elem.className = "direction";
        this.label = document.createElement("label");
        this.label.textContent = labelString;
        this.elem.appendChild(this.label);

        this.dirValue = dirValue;

        this.act = conf;
        // this.act = {
        //     act_name: conf.act_name,
        //     tab_active: conf.tab_active,
        //     tab_pos: conf.tab_pos,
        //     engine_name: conf.engine_name,
        //     copy_type: conf.copy_type,
        //     search_type: conf.search_type
        // };
        this.actSelect = new ActionSelect(this.act.act_name);
        this.activationSelect = new ActivationSelect(this.act.tab_active);
        this.posSelect = new PositionSelect(this.act.tab_pos);
        this.engineSelect = new EngineSelect(this.act.engine_name);
        this.openTypeSelect = new OpenTypeSelect(this.act.open_type);
        this.searchTypeSelect = new SearchTypeSelect(this.act.search_type);
        this.downloadSelect = new DownloadlSelect(this.act.download_type);
        this.downloadDirectorySelect = new DownloadDirectoriesSelect(this.act.download_directory);
        this.downloadSaveasSelect = new DownloadSaveasSelect(this.act.download_saveas);
        this.copySelect = new CopySelect(this.act.copy_type);
        this.selectGroup = [
            this.actSelect, this.activationSelect,
            this.posSelect, this.engineSelect,
            this.openTypeSelect, this.searchTypeSelect,
            this.copySelect, this.downloadSelect,
            this.downloadDirectorySelect, this.downloadSaveasSelect,
        ];
        this.selectGroup.forEach(s => {
            s.appendTo(this.elem);
            s.bindCallBack(this.onchange);
        });
        // this.onchange();
    }
    onchange() {
        this.selectGroup.forEach(select => {
            this.act[select.name] = select.value;
        });

        //选项框显示或隐藏控制的代码
        //the code about control select show or hide.
        [this.activationSelect, this.posSelect,
            this.engineSelect, this.copySelect,
            this.openTypeSelect, this.searchTypeSelect,
            this.downloadSelect, this.downloadDirectorySelect,
            this.downloadSaveasSelect,
        ].forEach(s => {
            s.hide();
        });
        switch (this.act.act_name) {
            case commons.ACT_COPY:
                this.copySelect.show();
                break;
            case commons.ACT_SEARCH:
                this.activationSelect.show();
                this.posSelect.show();
                this.engineSelect.show();
                this.searchTypeSelect.show();
                break;
            case commons.ACT_OPEN:

                this.activationSelect.show();
                this.posSelect.show();
                this.engineSelect.show();
                this.openTypeSelect.show();
                break;
            case commons.ACT_QRCODE:
                this.activationSelect.show();
                this.posSelect.show();
                break;
            case commons.ACT_DL:
                this.downloadSelect.show();
                this.downloadDirectorySelect.show();
                this.downloadSaveasSelect.show();
                break;
            default:
                break;
        }
    }
    disableOpt(...opts) {
        this.selectGroup.forEach(s => {
            s.disableOpt(...opts);
        });
    }
    setDefaultOpt(...opts) {
        this.selectGroup.forEach((s, index) => {
            s.setDefaultOpt(opts[index]);
        });
    }
    disableSelect(...selects) {
        for (const keyName of selects) {
            if (keyName in this) {
                this[keyName].disable();
            }
        }
    }
    disable() {
        // this.selectGroup.forEach(s => s.disable());
        this.elem.classList.add("disabled");
    }
    enable() {
        // this.selectGroup.forEach(s => s.enable());
        this.elem.classList.remove("disabled");
    }
    bindCallBack(callback) {
        this.selectGroup.forEach(c => {
            c.bindCallBack(() => {
                this.onchange();
                callback();
            })
        });
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
    update(conf) {
        this.act = conf;
        // [
        //     this.actSelect.value,
        //     this.activationSelect.value,
        //     this.posSelect.value,
        //     this.engineSelect.value,
        //     this.searchTypeSelect.value,
        //     this.copySelect.value,
        //     this.downloadSelect.value,
        //     this.downloadDirectorySelect.value
        // ] = [
        //     conf.act_name,
        //     conf.tab_active,
        //     conf.tab_pos,
        //     conf.engine_name,
        //     conf.search_type,
        //     conf.copy_type.value,
        //     conf.download_type,
        // ];
    }
    get value() {
        return this.act;
    }
}

class ControlWrapper {
    constructor(initValue) {
        this.elem = document.createElement("div");
        this.elem.className = "direction";
        this.label = document.createElement("label");
        this.label.textContent = getI18nMessage("directionControl");

        this.controlSelect = new ControlSelect(initValue);
        this.elem.appendChild(this.label);
        this.controlSelect.appendTo(this.elem);
    }
    get value() {
        return this.controlSelect.value;
    }
    update(value) {
        this.controlSelect.value = value;
    }
    bindCallBack(callback) {
        this.controlSelect.bindCallBack(callback)
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
}

class ChildWrapper {
    constructor(labelString, typeInfo, valueOfControl, modifierKey) {
        this.elem = document.createElement("div");
        this.typeInfo = typeInfo;
        this.label = document.createElement("h3");
        this.label.textContent = labelString;

        this.elem.appendChild(this.label);
        this.controlWrapper = new ControlWrapper(valueOfControl);
        this.controlWrapper.appendTo(this.elem);
        this.dirWrappers = [];
        for (let key of Object.keys(DIR_TEXT_VALUE_TABLE)) {
            this.dirWrappers.push(new DirWrapper(
                DIR_TEXT_VALUE_TABLE[key].text, DIR_TEXT_VALUE_TABLE[key].value,
                backgroundPage.config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[key].value, modifierKey)
            ));
        }

        this.dirWrappers.forEach(w =>
            w.appendTo(this.elem)
        );

    }
    disableOpt(...opts) {
        this.dirWrappers.forEach(w => w.disableOpt(...opts))
    }
    setDefaultOpt(...opts) {
        this.dirWrappers.forEach(w => w.setDefaultOpt(...opts))
    }
    disableSelect(...selects) {
            this.dirWrappers.forEach(s => s.disableSelect(...selects));
        }
        // disableSpecificSelect(actionName, ...selects) {
        //     this.dirWrappers.forEach(s => s.disableSpecificSelect(actionName, ...selects))
        // }
    collect() {
        let obj = {};
        this.dirWrappers.forEach(w => {
            obj[w.dirValue] = w.value;
        })
        return obj;
    }
    collectControlSelect() {
        return this.controlWrapper.value;
    }
    update() {
        // for (let key of Object.keys(DIR_TEXT_VALUE_TABLE)) {
        //     this.dirWrappers.push(new DirWrapper(DIR_TEXT_VALUE_TABLE[key], backgroundPage.config.getAct(T, DIR_TEXT_VALUE_TABLE[key].value)));
        // }
        // const keys = Object.keys(DIR_TEXT_VALUE_TABLE);
        // this.dirWrappers.forEach((w, index) => {
        //     w.update(backgroundPage.config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[keys[index]].value));
        // })
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
    showDirections(re = /.*/) {
        this.dirWrappers.forEach(w => {
            w.enable();
            if (re.test(w.dirValue) === false) {
                w.disable();
            }
        });
    }
    bindCallBack(callback) {
        const proxyCallback = (event) => {
            //如果发生修改了 “方向控制 ”的值，那么检测一下哪些方向需要启用和停用
            switch (event.target.value) {
                case commons.ALLOW_ALL:
                    this.showDirections(/^.*$/);
                    break;
                case commons.ALLOW_NORMAL:
                    this.showDirections(/^DIR_([UDLR]|OUTER)$/);
                    break;
                case commons.ALLOW_H:
                    this.showDirections(/^DIR_([LR]|OUTER)$/);
                    break;
                case commons.ALLOW_V:
                    this.showDirections(/^DIR_([UD]|OUTER)$/);
                    break;
                case commons.ALLOW_ONE:
                    this.showDirections(/^DIR_(U|OUTER)$/);
                    break;
                case commons.ALLOW_LOW_L_UP_R:
                    this.showDirections(/^DIR_(UP_R|LOW_L|OUTER)/);
                    break;
                case commons.ALLOW_UP_L_LOW_R:
                    this.showDirections(/^DIR_(UP_L|LOW_R|OUTER)/);
                    break;
                case commons.ALLOW_QUADRANT:
                    this.showDirections(/^DIR_(UP_L|LOW_R|UP_R|LOW_L|OUTER)/);
                    break;
                case commons.ALLOW_NONE: //备用，未来可能会添加“关闭所有方向”
                default:
                    break;
            }
            //调用回去。
            callback();
        }

        //controlWrapper的回调需要处理一些额外的事情。
        this.controlWrapper.bindCallBack(proxyCallback);

        //其它的就直接绑定
        this.dirWrappers.forEach(w => {
            w.bindCallBack(callback);
        });
    }

}

//使用bindCallBack要小心this的指向


class Wrapper {
    constructor(modifierKey = commons.KEY_NONE) {
        this.init(modifierKey);
    }
    init(modifierKey) {
        this.DOSAVE = false; //指示是否需要保存

        this.callback = this.callback.bind(this);
        this.elem = document.createElement("div");
        this.elem.id = "actions";

        this.keyNameOfControl = "";
        this.keyNameOfActions = ""
        if (modifierKey === commons.KEY_CTRL) {
            this.keyNameOfControl = "directionControl_CtrlKey";
            this.keyNameOfActions = "Actions_CtrlKey";
        }
        else if (modifierKey === commons.KEY_SHIFT) {
            this.keyNameOfControl = "directionControl_ShiftKey";
            this.keyNameOfActions = "Actions_ShiftKey";
        }
        else {
            this.keyNameOfControl = "directionControl";
            this.keyNameOfActions = "Actions";
        }
        const valuesOfControl = backgroundPage.config.get(this.keyNameOfControl);
<<<<<<< HEAD
        this.child_text = new ChildWrapper(geti18nMessage('textType'), "textAction", valuesOfControl.textAction, modifierKey);
=======
        this.child_text = new ChildWrapper(getI18nMessage('textType'), "textAction", valuesOfControl.textAction);
>>>>>>> 9631d0c726453058856b0eaff12725149ea28788
        //顺序
        /*
        this.selectGroup = [
            this.actSelect, this.activationSelect,
            this.posSelect, this.engineSelect,
            this.openTypeSelect, this.searchTypeSelect,
            this.copySelect, this.downloadSelect,
            this.downloadDirectorySelect, this.downloadSaveasSelect,
        ];
        */
        this.child_text.setDefaultOpt(
            commons.ACT_OPEN, commons.FORE_GROUND,
            commons.TAB_LAST, commons.DEFAULT_SEARCH_ENGINE,
            commons.PLACE_HOLDER, commons.SEARCH_TEXT,
            commons.COPY_TEXT, commons.DOWNLOAD_TEXT,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_text.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW,
            commons.SEARCH_IMAGE, commons.SEARCH_LINK, commons.SEARCH_IMAGE_LINK,
            commons.COPY_LINK, commons.COPY_IMAGE, commons.COPY_IMAGE_LINK,
            commons.OPEN_IMAGE, commons.OPEN_IMAGE_LINK,
            commons.DOWNLOAD_IMAGE, commons.DOWNLOAD_IMAGE_LINK, commons.DOWNLOAD_LINK
        );
        this.child_text.disableSelect("openTypeSelect", "copySelect", "searchTypeSelect");

<<<<<<< HEAD
        this.child_image = new ChildWrapper(geti18nMessage('imageType'), "imageAction", valuesOfControl.imageAction, modifierKey);
=======
        this.child_image = new ChildWrapper(getI18nMessage('imageType'), "imageAction", valuesOfControl.imageAction);
>>>>>>> 9631d0c726453058856b0eaff12725149ea28788
        this.child_image.setDefaultOpt(
            commons.ACT_OPEN, commons.FORE_GROUND,
            commons.TAB_LAST, commons.DEFAULT_SEARCH_ENGINE,
            commons.OPEN_LINK, commons.SEARCH_LINK,
            commons.COPY_LINK, commons.DOWNLOAD_LINK,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_image.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW,
            commons.SEARCH_IMAGE_LINK, commons.SEARCH_TEXT, commons.SEARCH_IMAGE,
            commons.OPEN_IMAGE_LINK,
            commons.COPY_TEXT, commons.COPY_IMAGE_LINK,
            commons.DOWNLOAD_TEXT, commons.DOWNLOAD_IMAGE_LINK, commons.DOWNLOAD_IMAGE
        );
        this.child_image.disableSelect("openTypeSelect");


<<<<<<< HEAD
        this.child_link = new ChildWrapper(geti18nMessage('linkType'), "linkAction", valuesOfControl.linkAction, modifierKey);
=======
        this.child_link = new ChildWrapper(getI18nMessage('linkType'), "linkAction", valuesOfControl.linkAction);
>>>>>>> 9631d0c726453058856b0eaff12725149ea28788
        this.child_link.setDefaultOpt(
            commons.ACT_OPEN, commons.FORE_GROUND,
            commons.TAB_LAST, commons.DEFAULT_SEARCH_ENGINE,
            commons.OPEN_LINK, commons.SEARCH_LINK,
            commons.COPY_LINK, commons.DOWNLOAD_LINK,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_link.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.TAB_NEW_WINDOW, commons.TAB_NEW_PRIVATE_WINDOW,
            commons.OPEN_IMAGE,
            commons.SEARCH_IMAGE,
            commons.DOWNLOAD_IMAGE,
        );


        if (backgroundPage.supportCopyImage === false) {
            this.child_image.disableOpt(commons.COPY_IMAGE);
            this.child_link.disableOpt(commons.COPY_IMAGE);
        }

        [this.child_text, this.child_link, this.child_image].forEach(c => {
            c.bindCallBack(this.callback); //这里会调用到下面的callback;
            c.appendTo(this.elem);
        });
        this.DOSAVE = true;
    }
    callback() {
        //当这个类第一初始化时，会调用回调完成第一次赋值，但是我们不想让数据又保存一次，
        //那么使用this.DOSAVE来表明是否需要保存
        //TODO: 新增选项：选项发生修改时自动保存
        if (this.DOSAVE) this.save();
    }
    collect() {
        return {
            textAction: this.child_text.collect(),
            imageAction: this.child_image.collect(),
            linkAction: this.child_link.collect()
        }
    }
    collect1() { // TODO: better name
        return {
            textAction: this.child_text.collectControlSelect(),
            imageAction: this.child_image.collectControlSelect(),
            linkAction: this.child_link.collectControlSelect(),
        }
    }
    save() {
        backgroundPage.config.set(this.keyNameOfActions, this.collect());
        backgroundPage.config.set(this.keyNameOfControl, this.collect1());
        backgroundPage.config.save();
    }
    update() {
        this.child_text.update();
        this.child_link.update();
        this.child_image.update();
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
}

class ActionsWithCtrlKeyWrapper extends Wrapper {
    constructor() {
        super(commons.KEY_CTRL);
    }
}
class ActionsWithShiftKeyWrapper extends Wrapper {
    constructor() {
        super(commons.KEY_SHIFT);
    }
}
class OuterActionsWrapper {
    constructor() {
        this.textActionSelect = new ActionSelect();
        this.linkActionSelect = new ActionSelect();
        this.imageActionSelect = new ActionSelect();
    }
}

class EngineItemWrapper {
    constructor(val, callback, saved) {
        this.callback = callback;
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");
        this.elem.innerHTML = `
            <a class="remove-button" href="#">&#10007</a>
            <input class="search-name-input" type="text"></input>
            <input class="search-url-input" type="text"></input>
        `; // TODO: Better if create elements by JavaScript DOM?
        this.nameInput = this.elem.querySelector('.search-name-input');
        this.nameInput.title = getI18nMessage("search_name_tooltip");
        this.nameInput.placeholder = getI18nMessage("search_name_tooltip"); // Did not see the need for separate strings
        eventUtil.attachEventT(this.nameInput, this.onchange, "change");

        this.urlInput = this.elem.querySelector('.search-url-input');
        this.urlInput.title = getI18nMessage("search_url_tooltip");
        this.urlInput.placeholder = getI18nMessage("search_url_tooltip");
        eventUtil.attachEventT(this.urlInput, this.onchange, "change");

        this.remove = this.elem.querySelector('.remove-button');
        eventUtil.attachEventT(this.remove, () => this.onRemoveClick());

        [this.remove, this.nameInput, this.urlInput].forEach(t => this.elem.appendChild(t));
        this.value = val;
        if (saved) {
            this.elem.classList.add("saved");
        }
    }

    onRemoveClick() {
        this.callback(true, this);
    }

    onchange() {
        this.elem.classList.remove("saved"); // TODO: better if highlight the changed input only?
    }
    get name() {
        return this.nameInput.value;
    }
    set name(n) {
        return this.nameInput.value = n;
    }
    get url() {
        return this.urlInput.value;
    }
    set url(s) {
            return this.urlInput.value = s;
        }
        // valid() {
        //     return name.length !== 0 && url.length !== 0;
        // }
    get value() {
        return {
            name: this.name,
            url: this.url
        }
    }
    set value(o) {
        this.name = o.name;
        this.url = o.url;
    }
    appendTo(p) {
        p.appendChild(this.elem);
    }
}
class EngineWrapper {
    constructor(engineList) {

        eventUtil.attachEventAll("#builtin-engine>select", (event) => {
            this.newItem({
                name: event.target.selectedOptions[0].textContent,
                url: event.target.value
            }, false)
            event.target.selectedIndex = 0; // Reset to group option for re-select to add this value again
        }, "change");


        this.items = [];

        // this.onAdd = this.onAdd.bind(this);
        this.onButtonCallback = this.onButtonCallback.bind(this);

        this.buttonsDiv = document.querySelector("#engine-buttons");
        this.itemsDiv = document.querySelector("#engine-items");

        let refreshbtn = this.buttonsDiv.querySelector("#RefreshbtnOnEngines");
        refreshbtn.onclick = () => this.onRefresh();
        // refreshbtn.textContent = browser.i18n.getMessage('RefreshbtnOnEngines');

        let addbtn = this.buttonsDiv.querySelector("#AddbtnOnEngines");
        addbtn.onclick = () => this.onAdd();
        // addbtn.textContent = browser.i18n.getMessage('AddbtnOnEngines');

        let savebtn = this.buttonsDiv.querySelector("#SavebtnOnEngines");
        savebtn.onclick = () => this.onButtonCallback();
        // savebtn.textContent = browser.i18n.getMessage('SavebtnOnEngines');

        this.refreshItems(engineList);
    }
    onButtonCallback(isRemove, item) { // TODO: better name
        if (isRemove) {
            // console.log(item);
            this.items = this.items.filter((v) => v !== item);
            this.itemsDiv.removeChild(item.elem);
            // TODO: Leave a text line or allow undo, or highlight the save button
        }
        else { // onSaveAllClick
            let hasError = false;
            for (let input of document.querySelectorAll('#engine-items input')) {
                if (input.value.length > 0) {
                    /*input.classList.add("accept");
                    setTimeout(() => {
                        input.classList.remove("accept");
                    }, 1200);*/ // May be misleading, it actually has not been saved if there is any error.
                }
                else {
                    input.classList.add("warning");
                    setTimeout(() => {
                        input.classList.remove("warning");
                    }, 1200);
                    hasError = true;
                }
            }
            // TODO: checking in each saving
            if (hasError) {
                return;
            }
            for (let item of document.querySelectorAll('#engine-items>div')) {
                item.classList.add("saved");
            } // TODO: Only saves successfully, warnings wrong.
        }

        backgroundPage.config.set("Engines", this.collect());
        backgroundPage.config.save(); // TODO: Promise
        document.querySelectorAll(".searchEngines").forEach(select => {
            select.dispatchEvent(new Event("update"));
        })
    }

    onRefresh() {
        this.refreshItems(backgroundPage.config.get("Engines"));
    }
    onAdd() {
        this.newItem({
            name: "",
            url: ""
        }, false);
    }
    refreshItems(list) {
        this.clearItems();
        list.forEach(s => this.newItem(s, true));
    }
    clearItems() {
        this.items.forEach(item => {
            this.itemsDiv.removeChild(item.elem);
        });
        this.items = [];
    }

    newItem(val, saved = false) {
        let item = new EngineItemWrapper(val, this.onButtonCallback, saved);
        this.items.push(item);
        item.appendTo(this.itemsDiv);
    }
    collect() {
        let result = [];
        this.items.forEach((item) => {
            if (item.name.length != 0 && item.url.length != 0) {
                result.push(item.value);
            }
        })
        return result;
    }
    appendTo(parent) {
        parent;
        // parent.appendChild(this.itemsDiv)
    }
}

class generalWrapper {
    constructor() {

    }
}

class downloadWrapper {
    constructor() {

        this.directories = backgroundPage.config.get("downloadDirectories");

        const tab = document.querySelector("#tab-download");

        eventUtil.attachEventS("#showDefaultDownloadDirectory", () => {
            browser.downloads.showDefaultFolder();
        })

        const node = document.importNode(document.querySelector("#template-for-directory-entry").content, true);
        const entry = node.querySelector(".directory-entry");

        for (let i = 0; i < 8; i++) {
            const cloned = entry.cloneNode(true);

            const a = cloned.querySelector("a");
            a.setAttribute("index", i);
            a.addEventListener("click", (event) => this.onConfirmClick(event));

            cloned.querySelector("input:nth-child(1)").value = browser.i18n.getMessage("DownloadDirectory", i);
            cloned.querySelector("input:nth-child(2)").value = this.directories[i] || "";
            tab.appendChild(cloned);
        }

    }
    onConfirmClick(event) {
        const index = event.target.getAttribute("index");
        this.directories[index] = event.target.previousElementSibling.value;
        backgroundPage.config.set("downloadDirectories", this.directories);
    }
}

class styleWrapper {
    constructor() {
        let tab = document.querySelector("#tab-style");

        let styleArea = tab.querySelector("#styleContent");
        let style = backgroundPage.config.get("style");
        if (style.length === 0) {
            let styleURL = browser.runtime.getURL("./../content_scripts/content_script.css");
            fetch(styleURL).then(
                response => response.text()
            ).then(text => styleArea.value = text);
        }
        else {
            styleArea.value = style;
        }

        eventUtil.attachEventS("#saveStyle", () => {
            backgroundPage.config.set("style", styleArea.value); // TODO: promise?
            document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveDone');
            setTimeout(() => {
                document.querySelector("#saveStyle").textContent = getI18nMessage('elem_SaveStyle');
            }, 2000);
        })
    }
}


const tabs = {
    _tabs: [],
    init: function() {


        let w = new Wrapper();
        w.appendTo($E(`#tab-actions`));
        this._tabs.push(w);

        w = new ActionsWithCtrlKeyWrapper();
        w.appendTo($E(`#tab-actions-ctrlkey`));
        this._tabs.push(w);

        w = new ActionsWithShiftKeyWrapper();
        w.appendTo($E(`#tab-actions-shiftkey`));
        this._tabs.push(w);

        w = new EngineWrapper(backgroundPage.config.get("Engines"));
        w.appendTo($E(`#tab-search-template`));
        this._tabs.push(w);


        w = new generalWrapper();
        this._tabs.push(w);

        w = new downloadWrapper();
        this._tabs.push(w);

        w = new styleWrapper();
        this._tabs.push(w);



        document.addEventListener("keypress", (evt) => {
            const char = evt.key.charAt(0);
            if (char >= "1" && char <= "9" && evt.target.tagName !== "INPUT" && evt.target.tagName !== "TEXTAREA") {
                try {
                    $E(`a.nav-a:nth-child(${char})`).click();
                }
                catch (error) {
                    // console.error(error);
                }
            }
        });

        document.querySelectorAll(".nav-a").forEach(a => {
            a.addEventListener("click", this.navOnClick);
        });

        //do with i18n
        for (let elem of document.querySelectorAll("[data-i18n]")) {
            elem.textContent = getI18nMessage(`elem_${elem.dataset['i18n']}`);
        }

        document.querySelectorAll("input[id]").forEach(elem => {
            if (elem.type === "file") return;

            if (elem.type === "checkbox") elem.checked = backgroundPage.config.get(elem.id);
            else elem.value = backgroundPage.config.get(elem.id);

            elem.addEventListener("change", (evt) => {
                if (evt.target.type === "checkbox") backgroundPage.config.set(evt.target.id, evt.target.checked);
                else if (evt.target.type === "number") backgroundPage.config.set(evt.target.id, parseInt(evt.target.value));
                else backgroundPage.config.set(evt.target.id, evt.target.value);
                backgroundPage.config.save();
            });
        })

    },

    navOnClick: function(event) {
        $E(".nav-active").classList.remove("nav-active");
        event.target.classList.add("nav-active");
        $E(".tab-active").classList.remove("tab-active");
        $E(`${event.target.getAttribute("toggle-target")}`).classList.add("tab-active");
    },
}


var backgroundPage = null;
browser.runtime.getBackgroundPage().then((page) => {
    backgroundPage = page;

    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
        try {
            backgroundPage.config.restore(fileReader.result);
            backgroundPage.config.save();
            location.reload();
        }
        catch (e) {
            console.error("Error when restore from backup", e);
            alert("An error occurred!");
        }
    });
    eventUtil.attachEventS("#backup", () => {
        const blob = new Blob([JSON.stringify(backgroundPage.config, null, 2)]);
        const url = URL.createObjectURL(blob);
        const date = new Date();

        browser.downloads.download({
            url: url,
            filename: `GlitterDrag-${date.getFullYear()}-${date.getMonth()+1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });

        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1000 * 60 * 5);
    });
    eventUtil.attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    eventUtil.attachEventS("#default", () => {
        backgroundPage.config.loadDefault();
        location.reload();
    });
    eventUtil.attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");

    tabs.init();


}, () => {});



function messageListener(msg) {
    function log(message) {
        logArea.value = `${logArea.value}\n${new Date().toTimeString()} --- ${message}`
    }
    let elem = mydrag.targetElem;
    let logArea = document.querySelector("#logArea");
    if (elem instanceof HTMLImageElement && msg.command === "copy" && msg.copy_type === commons.COPY_IMAGE) {
        log("1. Handshake to script");
        browser.runtime.sendNativeMessage(commons.appName, "test").then((r) => {
            log("2.1. The script reply：" + r);
        }, (e) => {
            log("2.2. Test no response:" + e);
        });
        log("3. Copy image behavior is detected.");

        fetch(elem.src)
            .then(response => {
                log("4. Get the blob of image");
                return response.blob();

            })
            .then(blob => {
                let reader = new FileReader();
                reader.readAsDataURL(blob);
                return new Promise(resolve => {
                    reader.onloadend = () => {
                        log("5. Convert blob to base64");
                        resolve(reader.result.split(",")[1]);
                    }
                });
            })
            .then(base64 => {
                log("6. Send image to script");
                return browser.runtime.sendNativeMessage(commons.appName, base64);
            })
            .catch(error => {
                console.log(error)
                log("An error occurred: " + error);
            });
    }
    else {
        CSlistener(msg);
    }
}
browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToOptions") {
        port.onMessage.addListener(messageListener);
    }
});