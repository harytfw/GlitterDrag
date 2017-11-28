var supportCopyImage = false;
var config = new ConfigClass();
var browserMajorVersion = 52;
var DOSAVE = false;
browser.runtime.getBrowserInfo().then(info => {
    browserMajorVersion = info.version.split(".")[0];
    browserMajorVersion = parseInt(browserMajorVersion);
    // browserMajorVersion = 56;
})
document.title = getI18nMessage("option_page_title");



const TOOLTIP_TEXT_TABLE = {};
//TODO add allow_ tooltip
["act", "active", "pos", "search", "search_type", "search_onsite", "copy", "allow", "open_type", "download_type", "download_saveas", "download_directory"].forEach(
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
    search_onsite: [],
    copy: [],
    allow: [],
    download: [],
    download_saveas: []
}
const DIR_TEXT_VALUE_TABLE = {};
for (let item of Object.keys(commons)) {

    //排除
    if (["DIR_P", "urlPattern", "fileExtension", "appName", "PLACE_HOLDER", "NEW_WINDOW", "DEFAULT_SEARCH_ENGINE", "DEFAULT_DOWNLOAD_DIRECTORY", "_DEBUG", ].includes(item)) {
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
    else if (["SEARCH_ONSITE_YES", "SEARCH_ONSITE_NO"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.search_onsite.push(obj);
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
        this.elem.dispatchEvent(new Event("change"));
    }

    updateViaOptList(optList) {
        let oldValue = this.value;
        let oldValueExistFlag = false;
        let option = null;
        while ((option = this.elem.firstChild) !== null) {
            option.remove();
        }
        optList.forEach(opt => {
            if (oldValue === opt.value) {
                oldValueExistFlag = true;
            }
            let option = document.createElement("option");
            option.setAttribute("value", opt.value); //
            option.textContent = opt.text;
            this.elem.appendChild(option);
        });
        if (oldValueExistFlag) {
            this.value = oldValue;
        }
        else {
            this.value = this.elem.firstElementChild.value;
        }
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
        this.elem.addEventListener("change", e => {
            cb(e)
        });
        if (this.isInit) {
            this.isInit = false;
            this.elem.dispatchEvent(new Event("change"));
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
        let engines = config.get("Engines");

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

class SearchOnSiteSelect extends _SelectWrapper {
    constructor(value) {
        super("search_onsite", OPTION_TEXT_VALUE_TABLE.search_onsite, value, TOOLTIP_TEXT_TABLE.search_onsite);
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
        const directories = config.get("downloadDirectories");
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
    constructor(labelString, dirValue, conf, typeInfo) {
        this.onchange = this.onchange.bind(this);
        this.elem = document.createElement("div");
        this.elem.className = "direction";
        this.label = document.createElement("label");
        this.label.textContent = labelString;
        this.elem.appendChild(this.label);

        this.dirValue = dirValue;

        this.act = conf;
        this.typeInfo = typeInfo;
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
        this.searchOnSiteSelect = new SearchOnSiteSelect(this.act.search_onsite);
        this.downloadSelect = new DownloadlSelect(this.act.download_type);
        this.downloadDirectorySelect = new DownloadDirectoriesSelect(this.act.download_directory);
        this.downloadSaveasSelect = new DownloadSaveasSelect(this.act.download_saveas);
        this.copySelect = new CopySelect(this.act.copy_type);
        this.selectGroup = [
            this.actSelect, this.activationSelect,
            this.posSelect, this.engineSelect,
            this.openTypeSelect, this.searchTypeSelect, this.searchOnSiteSelect,
            this.copySelect, this.downloadSelect,
            this.downloadDirectorySelect, this.downloadSaveasSelect,
        ];
        this.selectGroup.forEach(s => {
            s.appendTo(this.elem);
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
            this.openTypeSelect, this.searchTypeSelect, this.searchOnSiteSelect,
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
                this.searchOnSiteSelect.show();
                break;
            case commons.ACT_OPEN:
                this.activationSelect.show();
                this.posSelect.show();
                if (this.typeInfo === "textAction") this.engineSelect.show();
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
            case commons.ACT_FIND:
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
                config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[key].value, modifierKey), this.typeInfo
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
        //     this.dirWrappers.push(new DirWrapper(DIR_TEXT_VALUE_TABLE[key], config.getAct(T, DIR_TEXT_VALUE_TABLE[key].value)));
        // }
        // const keys = Object.keys(DIR_TEXT_VALUE_TABLE);
        // this.dirWrappers.forEach((w, index) => {
        //     w.update(config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[keys[index]].value));
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
            //如果“方向控制”被修改，检测需要启用和停用哪些方向
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
                    // TODO: 显示为“上”，实际为该动作允许任何方向触发
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

DOSAVE = false;
class Wrapper {
    constructor(modifierKey = commons.KEY_NONE) {
        this.init(modifierKey);
    }
    init(modifierKey) {
        DOSAVE = false; //指示是否需要保存

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
        const valuesOfControl = config.get(this.keyNameOfControl);
        this.child_text = new ChildWrapper(getI18nMessage('textType'), "textAction", valuesOfControl.textAction, modifierKey);
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
            commons.PLACE_HOLDER, commons.SEARCH_TEXT, commons.SEARCH_ONSITE_NO,
            commons.COPY_TEXT, commons.DOWNLOAD_TEXT,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_text.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.SEARCH_IMAGE, commons.SEARCH_LINK, commons.SEARCH_IMAGE_LINK,
            commons.COPY_LINK, commons.COPY_IMAGE, commons.COPY_IMAGE_LINK,
            commons.OPEN_IMAGE, commons.OPEN_IMAGE_LINK,
            commons.DOWNLOAD_IMAGE, commons.DOWNLOAD_IMAGE_LINK, commons.DOWNLOAD_LINK
        );
        this.child_text.disableSelect("openTypeSelect", "copySelect", "searchTypeSelect");

        this.child_image = new ChildWrapper(getI18nMessage('imageType'), "imageAction", valuesOfControl.imageAction, modifierKey);
        this.child_image.setDefaultOpt(
            commons.ACT_OPEN, commons.FORE_GROUND,
            commons.TAB_LAST, commons.DEFAULT_SEARCH_ENGINE,
            commons.OPEN_LINK, commons.SEARCH_LINK, commons.SEARCH_ONSITE_NO,
            commons.COPY_LINK, commons.DOWNLOAD_LINK,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_image.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE, commons.ACT_FIND,
            commons.SEARCH_IMAGE_LINK, commons.SEARCH_TEXT,
            commons.OPEN_IMAGE_LINK,
            commons.COPY_TEXT, commons.COPY_IMAGE_LINK,
            commons.DOWNLOAD_TEXT, commons.DOWNLOAD_IMAGE_LINK, commons.DOWNLOAD_IMAGE
        );
        this.child_image.disableSelect("openTypeSelect", "searchOnSiteSelect");


        this.child_link = new ChildWrapper(getI18nMessage('linkType'), "linkAction", valuesOfControl.linkAction, modifierKey);
        this.child_link.setDefaultOpt(
            commons.ACT_OPEN, commons.FORE_GROUND,
            commons.TAB_LAST, commons.DEFAULT_SEARCH_ENGINE,
            commons.OPEN_LINK, commons.SEARCH_LINK, commons.SEARCH_ONSITE_NO,
            commons.COPY_LINK, commons.DOWNLOAD_LINK, commons.COPY_IMAGE_LINK, commons.COPY_IMAGE,
            commons.DEFAULT_DOWNLOAD_DIRECTORY, commons.DOWNLOAD_SAVEAS_YES
        )
        this.child_link.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.OPEN_IMAGE,
            commons.SEARCH_IMAGE,
            commons.DOWNLOAD_IMAGE,
        );

        if (browserMajorVersion < 57) {
            this.child_text.disableOpt(commons.ACT_FIND, );
            this.child_link.disableOpt(commons.ACT_FIND, );
            this.child_image.disableOpt(commons.COPY_IMAGE);
        }

        // if (supportCopyImage === false) {
        //     this.child_image.disableOpt(commons.COPY_IMAGE);
        //     this.child_link.disableOpt(commons.COPY_IMAGE);
        // }

        [this.child_text, this.child_link, this.child_image].forEach(c => {
            c.bindCallBack(this.callback); //这里会调用到下面的callback;
            c.appendTo(this.elem);
        });
        DOSAVE = true;
    }
    callback() {
        //当这个类第一初始化时，会调用回调完成第一次赋值，但是我们不想让数据又保存一次，
        //那么使用this.DOSAVE来表明是否需要保存
        //TODO: 新增选项：选项发生修改时自动保存
        if (DOSAVE) this.save();
    }
    collect() {
        return {
            textAction: this.child_text.collect(),
            imageAction: this.child_image.collect(),
            linkAction: this.child_link.collect()
        }
    }
    collectControlSelect() { // TODO: better name
        return {
            textAction: this.child_text.collectControlSelect(),
            imageAction: this.child_image.collectControlSelect(),
            linkAction: this.child_link.collectControlSelect(),
        }
    }
    save() {
        config.set(this.keyNameOfActions, this.collect());
        config.set(this.keyNameOfControl, this.collectControlSelect());
        // config.save();
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

        this.removeBtn = document.createElement("a");
        this.removeBtn.className = "remove-button";
        this.removeBtn.href = "#";
        this.removeBtn.textContent = "x";
        eventUtil.attachEventT(this.removeBtn, () => this.onRemoveClick());

        this.nameInput = document.createElement("input");
        this.nameInput.className = "search-name-input";
        this.nameInput.type = "text";
        this.nameInput.title = getI18nMessage("search_name_tooltip");
        this.nameInput.placeholder = getI18nMessage("search_name_tooltip"); // Did not see the need for separate strings
        eventUtil.attachEventT(this.nameInput, this.onchange, "change");

        this.urlInput = this.nameInput.cloneNode();
        this.urlInput.className = "search-url-input";
        this.urlInput.title = getI18nMessage("search_url_tooltip");
        this.urlInput.placeholder = getI18nMessage("search_url_tooltip");
        eventUtil.attachEventT(this.urlInput, this.onchange, "change");




        [this.removeBtn, this.nameInput, this.urlInput].forEach(t => this.elem.appendChild(t));
        this.value = val;
        if (saved) {
            this.elem.classList.add("saved");
        }
    }

    onRemoveClick() {
        this.callback(this);
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
        document.querySelectorAll("#builtin-engine>select>option:nth-child(1)").forEach(el => {
            el.selected = true;
        })
        eventUtil.attachEventAll("#builtin-engine>select", (event) => {
            this.newItem({
                name: event.target.selectedOptions[0].textContent,
                url: event.target.value
            }, false)
            event.target.selectedIndex = 0; // Reset to group option for re-select to add this value again
        }, "change");


        this.items = [];

        // this.onAdd = this.onAdd.bind(this);
        this.onItemRemove = this.onItemRemove.bind(this);

        this.buttonsDiv = document.querySelector("#engine-buttons");
        this.itemsDiv = document.querySelector("#engine-items");

        let refreshbtn = this.buttonsDiv.querySelector("#RefreshbtnOnEngines");
        refreshbtn.onclick = () => this.onRefresh();

        let addbtn = this.buttonsDiv.querySelector("#AddbtnOnEngines");
        addbtn.onclick = () => this.onAdd();

        let savebtn = this.buttonsDiv.querySelector("#SavebtnOnEngines");
        savebtn.onclick = () => this.onSaveAll();

        this.refreshItems(engineList);
    }

    onSaveAll() {
        const engines = [];
        const savedItems = [];
        const unSavedItems = [];
        for (let item of this.items) {
            if (item.url.length > 0 && item.name.length > 0) {
                savedItems.push(item);
                engines.push({
                    name: item.name,
                    url: item.url
                });
            }
            else {
                unSavedItems.push(item);
            }
        }
        if (engines.length > 0) {
            config.set("Engines", engines).then(() => {
                savedItems.forEach(item => {
                    item.elem.classList.add("accept", "saved");
                    setTimeout(() => {
                        item.elem.classList.remove("accept");
                    }, 1200)
                });
                unSavedItems.forEach(item => {
                    item.nameInput.classList.toggle("warning", item.name.length <= 0);
                    item.urlInput.classList.toggle("warning", item.url.length <= 0);
                    item.elem.classList.remove("saved");
                    setTimeout(() => {
                        item.nameInput.classList.remove("warning");
                        item.urlInput.classList.remove("warning");
                    }, 1200)
                });
                // dispatch event to a large number of element will slow the optioin page
                setTimeout(() => {
                    DOSAVE = false;
                    document.querySelectorAll(".searchEngines").forEach((el, i, list) => {
                        if (i === list.length - 1) {
                            DOSAVE = true;
                        }
                        el.dispatchEvent(new Event("update"));
                    });
                }, 2500);
            });
        }
    }
    onItemRemove(item) {
        this.items = this.items.filter((v) => v !== item);
        this.itemsDiv.removeChild(item.elem);
    }
    onRefresh() {
        this.refreshItems(config.get("Engines"));
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
        let item = new EngineItemWrapper(val, this.onItemRemove, saved);
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
        if (browserMajorVersion >= 53) {
            $E("#enableSync").removeAttribute("disabled");
        }
        const el = $E("#tipsContentSelect");
        const input = $E("#tipsContentInput");
        const content = config.get("tipsContent");
        OPTION_TEXT_VALUE_TABLE.act.forEach(item => {
            const option = document.createElement("option");
            option.value = item.value;
            option.textContent = item.text;
            el.appendChild(option);
        });
        input.addEventListener("change", ({ target }) => {
            let val = target.value.replace(/\\n/g, "\n");
            content[target.getAttribute("data-id")] = val;
            config.set("tipsContent", content);
        });
        el.addEventListener("change", (e) => {
            input.value = content[e.target.value];
            input.setAttribute("data-id", e.target.value);
        });
        el.selectedIndex = 1;
        el.dispatchEvent(new Event("change"));
    }
}

class ActionsCategory {
    constructor(parent, actionTypeGetter) {
        this.actionTypeGetter = actionTypeGetter;
        this.parent = parent;

        this.parent.addEventListener("click", e => {
            if (e.target.nodeName === "LABEL") {
                const t = this.$E("." + e.target.getAttribute("for"));
                if (t && t.type === "radio") {
                    t.checked = !t.checked;
                }
            }
        })
        this.$E(".action-name").addEventListener("change", (e) => {
            this.onActionBehaviorChange(e);
        });

        this.initALl();
    }
    $E(str, context = this.parent) {
        return $E(str, context);
    }
    async preLoad() {
        // this.storage = (await (browser.storage.local.get(this.actionsKeyName)))[this.actionsKeyName];
        // this.storage4Control = (await (browser.storage.local.get("directionControl")))["directionControl"];
        // this.engines = (await (browser.storage.local.get("Engines")))["Engines"];
        // return Promise.resolve();
    }

    initALl() {
        //初始化搜索引擎
        const selectProtype = document.createElement("select");
        const optProtype = document.createElement("option");
        for (const g of ENGINES) {
            let select = selectProtype.cloneNode();
            let opt = optProtype.cloneNode();
            opt.textContent = g.groupName;
            opt.disabled = 1;
            
            select.appendChild(opt);
            for (const name of Object.keys(g)) {
                if (name === "groupName") continue;
                opt = optProtype.cloneNode();
                opt.textContent = name;
                opt.value = g[name];
                select.appendChild(opt);
            }
            this.$E(".search-engine-select-group").appendChild(select);
            select.selectedIndex = 0;
        }
        this.$E(".search-engine-select-group").addEventListener("change", e => this.onEngineChange(e))
    }

    onEngineChange(e) {
        const el = e.target;
        this.$E(".search-engine-name").value = el.children[el.selectedIndex].textContent;
        this.$E(".search-engine-url").value = el.children[el.selectedIndex].value;

        el.selectedIndex = 0;
    }

    onActionBehaviorChange(e) {

        const hideTR = (...s) => {
            for (const x of s) {
                this.$E(x).parentElement.parentElement.style.display = "none";
            }
        }

        const showTR = (...s) => {
            for (const x of s) {
                this.$E(x).parentElement.parentElement.style.display = "table-row";
            }
        }

        const hideRadios = (...s) => {
            for (const x of s) {
                this.$E(x).disabled = true;
            }
        }

        $A("input[type='radio']:disabled", this.parent).forEach(e => {
            e.removeAttribute("disabled");
        });
        showTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".copy-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
        switch (e.target.value) {
            case commons.ACT_NONE:
                // hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".copy-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
                break;
            case commons.ACT_OPEN:
                hideTR(".copy-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");

                if (this.actionType === "linkAction") {
                    hideTR(".search-text", ".search-onsite-yes");
                    hideRadios(".open-text", ".open-image");
                }
                else if (this.actionType === "imageAction") {
                    hideTR(".search-text", ".search-onsite-yes");
                    hideRadios(".open-text", ".open-image-link");
                }
                else {
                    hideTR(".open-text");
                }
                break
            case commons.ACT_SEARCH:
                hideTR(".open-text", ".copy-text", ".download-text", ".download-saveas-yes", ".download-directory");
                if (this.actionType === "imageAction") {
                    hideTR(".open-text", ".search-onsite-yes");
                    hideRadios(".search-text", ".search-image-link", ".open-image-link");
                }
                else if (this.actionType === "textAction") {
                    hideTR(".search-text");
                }
                break;
            case commons.ACT_DL:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".copy-text", ".search-onsite-yes");
                if (this.actionType === "imageAction") {
                    hideTR(".download-text");
                }
                break;
            case commons.ACT_COPY:
                hideTR(".foreground", ".tab-pos", ".search-engine-select-group", ".search-engine-name", ".open-text", ".search-text", ".download-text", ".download-saveas-yes", ".download-directory", ".search-onsite-yes");
                if (this.actionType === "textAction") {
                    hideTR(".copy-text");
                }
                break
            case commons.ACT_FIND:
                break;
            case commons.ACT_QRCODE:
                break
        }

    }
    get actionType() {
        return this.actionTypeGetter();
    }
    get setting() {
        const getRadioValue = (name) => {
            let radios = $A(name, this.parent)
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].checked) return radios[i].value;
            }
        }
        let temp = {};
        Object.assign(temp, {
            act_name: this.$E(".action-name").value,
            tab_pos: this.$E(".tab-pos").value,
            engine_name: this.$E(".search-engine-name").value,
            engine_url: this.$E(".search-engine-url").value,
            download_directory: this.$E(".download-directory").value,
            tab_active: getRadioValue(".tab-active") === "true" ? true : false,
            open_type: getRadioValue(".open-type"),
            search_type: getRadioValue(".search-type"),
            copy_type: getRadioValue(".copy-type"),
            download_type: getRadioValue(".download-type"),
            download_saveas: getRadioValue(".download-saveas") === "true" ? true : false,
            search_onsite: getRadioValue(".search-onsite") === "true" ? true : false,
        });
        return temp;
    }

    set setting(data) {
        const actSetting = data;
        if (actSetting["tab_active"] === commons.FORE_GROUND) {
            this.$E(".foreground").checked = true;
        }
        else {
            this.$E(".background").checked = true;
        }

        if (actSetting["search_onsite"] === commons.SEARCH_ONSITE_YES) {
            this.$E(".search-onsite-yes").checked = true;
        }
        else {
            this.$E(".search-onsite-no").checked = true;
        }
        if (actSetting["download_saveas"] === commons.DOWNLOAD_SAVEAS_YES) {
            this.$E(".download-saveas-yes").checked = true;
        }
        else {
            this.$E(".download-saveas-no").checked = true;
        }

        this.$E(".action-name").value = actSetting["act_name"];
        this.$E(".tab-pos").value = actSetting["tab_pos"];

        this.$E(".search-engine-name").value = actSetting["engine_name"];
        let searchUrl;
        if ("engine_url" in actSetting && actSetting["engine_url"].length != 0) {
            searchUrl = actSetting["engine_url"];
        }
        else {
            this.$E(".search-engine-name").value = "Google Search";
            searchUrl = "https://www.google.com/search&q=%s";
            // searchUrl = config.getSearchURL(actSetting["engine_name"]);
        }
        this.$E(".search-engine-url").value = searchUrl;

        this.$E(".download-directory").value = actSetting["download_directory"];
        for (const name of [".search-type", ".download-type", ".copy-type", ".open-type"]) {
            let radios = $A(name, this.parent);
            let defaultFlag = true;
            for (let i = 0; i < radios.length; i++) {
                if (radios[i].value === actSetting[name]) {
                    radios[i].checked = true;
                    defaultFlag = false;
                    break;
                }
            }
            if (defaultFlag) radios[0].checked = true;
        }

        this.$E(".action-name").dispatchEvent(new Event("change"));
    }
}

class PanelWrapper {
    constructor() {
        this.btns = $E("#panel-buttons");
        this.cmdType = null;
        this.cmdIndex = null;
        this.btns.addEventListener("click", e => {
            if (e.target.nodeName === "BUTTON") {
                this.load(e);
            }
        });

        this.actionTypeGetter = this.actionTypeGetter.bind(this);

        this.category = new ActionsCategory(this.btns.nextElementSibling, this.actionTypeGetter);
        this.btns.nextElementSibling.addEventListener("change", e => this.onchange(e));
        this.category.parent.style.display = "none";
    }
    actionTypeGetter() {
        return this.cmdType.split("_")[1];
    }
    async load(e) {
        this.category.parent.style.display = "none";
        if (e.target.className.indexOf("text") >= 0) {
            this.cmdType = "CMDPanel_textAction";
        }
        else if (e.target.className.indexOf("link") >= 0) {
            this.cmdType = "CMDPanel_linkAction";
        }
        else {
            this.cmdType = "CMDPanel_imageAction";
        }
        this.cmdIndex = e.target.getAttribute("index");
        config.async_get(this.cmdType).then((r) => {
            this.category.setting = r[this.cmdIndex];
            this.category.parent.style.display = "block";
        })
    }
    onchange(e) {
        //先获取再保存
        config.async_get(this.cmdType).then(r => {
            r[this.cmdIndex] = this.category.setting;
            config.set(this.cmdType, r);
        });
    }
}


class downloadWrapper {
    constructor() {
        const dirCount = 8;

        this.directories = config.get("downloadDirectories");

        const tab = document.querySelector("#tab-download");

        eventUtil.attachEventS("#showDefaultDownloadDirectory", () => {
            browser.downloads.showDefaultFolder();
        })
        eventUtil.attachEventS("#SavebtnOnDownloadDirectories", (e) => {
            document.querySelectorAll(".directory-entry>input:nth-child(2)").forEach((el, index) => {
                this.directories[index] = el.value;
            });
            config.set("downloadDirectories", this.directories);
            // e.target.setAttribute("disabled", "true");
        })
        const node = document.importNode(document.querySelector("#template-for-directory-entry").content, true);
        const entry = node.querySelector(".directory-entry");

        for (let i = 0; i < dirCount; i++) {
            const cloned = entry.cloneNode(true);

            // const a = cloned.querySelector("a");
            // a.setAttribute("index", i);
            // a.addEventListener("click", (event) => this.onConfirmClick(event));

            cloned.querySelector("input:nth-child(1)").value = browser.i18n.getMessage("DownloadDirectory", i);
            cloned.querySelector("input:nth-child(2)").value = this.directories[i] || "";
            // cloned.querySelector("input:nth-child(2)").addEventListener("change", (e) => this.onChange(e));
            tab.appendChild(cloned);
        }

    }
    onChange() {
        $E("#SavebtnOnDownloadDirectories").removeAttribute("disabled");
    }
    onSaveBtnClick(event) {
        // const index = event.target.getAttribute("index");
        // this.directories[index] = event.target.previousElementSibling.value;
        // config.set("downloadDirectories", this.directories);
    }
}

class styleWrapper {
    constructor() {
        let tab = document.querySelector("#tab-style");

        let styleArea = tab.querySelector("#styleContent");
        let style = config.get("style");
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
            config.set("style", styleArea.value); // TODO: promise?
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

        w = new EngineWrapper(config.get("Engines"));
        w.appendTo($E(`#tab-search-template`));
        this._tabs.push(w);


        w = new generalWrapper();
        this._tabs.push(w);

        w = new downloadWrapper();
        this._tabs.push(w);

        w = new styleWrapper();
        this._tabs.push(w);

        w = new PanelWrapper();

        document.querySelectorAll(".nav-a").forEach(a => {
            a.addEventListener("click", this.navOnClick);
        });

        //do with i18n
        for (let elem of document.querySelectorAll("[data-i18n]")) {
            elem.textContent = getI18nMessage(`elem_${elem.dataset['i18n']}`);
        }

        document.querySelectorAll("input[id]").forEach(elem => {
            if ("not-config" in elem.attributes) return;

            if (elem.type === "file") return;

            if (elem.type === "checkbox") elem.checked = config.get(elem.id);
            else elem.value = config.get(elem.id);

            elem.addEventListener("change", (evt) => {
                this.showOrHideNav();
                if (evt.target.type === "checkbox") config.set(evt.target.id, evt.target.checked);
                else if (evt.target.type === "number") config.set(evt.target.id, parseInt(evt.target.value));
                else config.set(evt.target.id, evt.target.value);
                // config.save();
            });
        })
        this.showOrHideNav();

    },

    navOnClick: function(event) {
        $E(".nav-active").classList.remove("nav-active");
        event.target.classList.add("nav-active");
        $E(".tab-active").classList.remove("tab-active");
        $E(`${event.target.getAttribute("toggle-target")}`).classList.add("tab-active");
    },

    showOrHideNav: function() {
        let classList = $E(`a[toggle-target="#tab-actions-ctrlkey"]`).classList;
        if ($E("#enableCtrlKey").checked) {
            classList.remove("hide")
        }
        else {
            classList.add("hide");
        }

        classList = $E(`a[toggle-target="#tab-actions-shiftkey"]`).classList;
        if ($E("#enableShiftKey").checked) {
            classList.remove("hide")
        }
        else {
            classList.add("hide");
        }
    }
}


// var backgroundPage = null;
config.load().then(() => {

    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", async() => {
        try {
            await config.restore(fileReader.result);
            // await config.save();
            location.reload();
        }
        catch (e) {
            const msg = "An error occured, please check backup file";
            console.error(msg, e);
            alert(msg);
        }
    });
    eventUtil.attachEventS("#backup", () => {
        const blob = new Blob([JSON.stringify(config.storage, null, 2)]);
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
    eventUtil.attachEventS("#default", async() => {
        await config.loadDefault();
        location.reload();
    });
    eventUtil.attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");

    tabs.init();


}, () => {});



function messageListener(msg) {
    CSlistener(msg);
}
document.addEventListener("beforeunload", () => {
    config.save().then(() => {
        console.info("succeed to save config ");
    }).catch(() => {
        console.error("fail to save config");
    });
})
browser.runtime.onConnect.addListener(port => {
    if (port.name === "sendToOptions") {
        port.onMessage.addListener(messageListener);
    }
});