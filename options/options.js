//TODO:减少全局变量
//TODO: 统一i18n-id的使用
//TODO: auto reloading after restore from backup file.
document.title = geti18nMessage("option_page_title");



const TOOLTIP_TEXT_TABLE = {};
//TODO add allow_ tooltip
["act", "active", "pos", "search", "search_type", "copy", "allow"].forEach(
    (name) => {
        TOOLTIP_TEXT_TABLE[name] = geti18nMessage("option_tooltip_" + name);
    }
)


const OPTION_TEXT_VALUE_TABLE = {
    act: [],
    active: [],
    pos: [],
    search: [],
    copy: [],
    allow: []
}
const DIR_TEXT_VALUE_TABLE = {};
for (let item of Object.keys(commons)) {

    const obj = {
        text: geti18nMessage(item),
        value: commons[item]
    };
    if (/^DIR_/.test(item)) {
        DIR_TEXT_VALUE_TABLE[item] = obj;
    }

    else if (/^ACT_/.test(item)) {
        OPTION_TEXT_VALUE_TABLE.act.push(obj)
    }
    else if (["TAB_FIRST", "TAB_LAST", "TAB_CLEFT", "TAB_CRIGHT"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.pos.push(obj);
    }
    else if (["FORE_GROUND", "BACK_GROUND"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.active.push(obj);
    }
    else if (["SEARCH_LINK", "SEARCH_TEXT", "SEARCH_IMAGE"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.search.push(obj);
    }
    else if (["COPY_TEXT", "COPY_LINK", "COPY_IMAGE"].includes(item)) {
        OPTION_TEXT_VALUE_TABLE.copy.push(obj);
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
    hide() {
        this.elem.style.display = "none";
    }
    show() {
        this.elem.style.display = "";
    }
    get value() {
        if (this.elem.value === "false") return false;
        else if (this.elem.value === "true") return true;
        return this.elem.value;
    }
    set value(v) {
        this.elem.value = v;
    }

    disableOpt(...opts) {
        opts.forEach(opt => {
            Array.from(this.elem.children, child => {
                if (opt === child.value) {
                    child.setAttribute("disabled", "disabled");
                }
            })
        })
    }
    disable() {
        this.elem.setAttribute("disabled", "disabled");
    }
    enable() {
        this.elem.removeAttribute("disabled");
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

class ActiveSelect extends _SelectWrapper {
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
        let engines = backgroundPage.config.get("Engines");

        let optList = [{
            text: geti18nMessage("defaultText"),
            value: ""
        }];
        if (engines.length !== 0) {
            optList = Array.from(engines, v => {
                return {
                    text: v.name,
                    value: v.name
                };
            });
        }

        super("engine_name", optList, value, TOOLTIP_TEXT_TABLE.search)
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

class ControlSelect extends _SelectWrapper {
    constructor(value) {
        super("directionControl", OPTION_TEXT_VALUE_TABLE.allow, value, TOOLTIP_TEXT_TABLE.allow);
    }
}


class DirWrapper {
    constructor(labelString, dirValue, conf) {
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
        this.activeSelect = new ActiveSelect(this.act.tab_active);
        this.posSelect = new PositionSelect(this.act.tab_pos);
        this.engineSelect = new EngineSelect(this.act.engine_name);
        this.searchTypeSelect = new SearchTypeSelect(this.act.search_type);
        this.copySelect = new CopySelect(this.act.copy_type);
        this.selectGroup = [this.actSelect, this.activeSelect, this.posSelect, this.engineSelect, this.searchTypeSelect, this.copySelect];
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
        [this.activeSelect, this.posSelect, this.engineSelect, this.copySelect, this.searchTypeSelect].forEach(s => {
            s.hide();
        });
        //NEW SELECT
        switch (this.act.act_name) {
            case commons.ACT_COPY:
                this.copySelect.show();
                break;
            case commons.ACT_SEARCH:
                this.activeSelect.show();
                this.posSelect.show();
                this.engineSelect.show();
                this.searchTypeSelect.show();
                break;
            case commons.ACT_OPEN:

                this.activeSelect.show();
                this.posSelect.show();
                this.engineSelect.show();
                break;
            case commons.ACT_QRCODE:
                this.activeSelect.show();
                this.posSelect.show();
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
    disable() {
        this.selectGroup.forEach(s => s.disable());
        this.elem.classList.add("disabled");
    }
    enable() {
        this.selectGroup.forEach(s => s.enable());
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
        [
            this.actSelect.value,
            this.activeSelect.value,
            this.posSelect.value,
            this.engineSelect.value,
            this.searchTypeSelect.value,
            this.copySelect.value
        ] = [
            conf.act_name,
            conf.tab_active,
            conf.tab_pos,
            conf.engine_name,
            conf.search_type
        ];
    }
    get value() {
        return this.act;
    }
}

class ControlWrapper {
    constructor(value) {
        this.elem = document.createElement("div");
        this.elem.className = "direction";
        this.label = document.createElement("label");
        this.label.textContent = geti18nMessage("directionControl");
        this.controlSelect = new ControlSelect(backgroundPage.config.get("directionControl")[value]);
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
    constructor(labelString, typeInfo) {
        this.elem = document.createElement("div");
        this.typeInfo = typeInfo;
        this.label = document.createElement("h3");
        this.label.textContent = labelString;

        this.elem.appendChild(this.label);
        this.controlWrapper = new ControlWrapper(this.typeInfo);
        this.controlWrapper.appendTo(this.elem);
        this.dirWrappers = [];
        for (let key of Object.keys(DIR_TEXT_VALUE_TABLE)) {
            this.dirWrappers.push(new DirWrapper(
                DIR_TEXT_VALUE_TABLE[key].text, DIR_TEXT_VALUE_TABLE[key].value,
                backgroundPage.config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[key].value)
            ));
        }

        this.dirWrappers.forEach(w =>
            w.appendTo(this.elem)
        );

    }
    disableOpt(...opts) {
        this.dirWrappers.forEach(w => w.disableOpt(...opts))
    }
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
        const keys = Object.keys(DIR_TEXT_VALUE_TABLE);
        this.dirWrappers.forEach((w, index) => {
            w.update(backgroundPage.config.getAct(this.typeInfo, DIR_TEXT_VALUE_TABLE[keys[index]].value));
        })
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
    bindCallBack(callback) {
        const proxyCallback = (event) => {
            //如果发生修改了 “方向控制 ”的值，那么检测一下哪些方向需要启用和停用
            switch (event.target.value) {
                case commons.ALLOW_ALL:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                    });
                    break;
                case commons.ALLOW_NORMAL:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[UDLR]$/.test(w.dirValue) === false) {
                            w.disable();
                        }
                    });
                    break;
                case commons.ALLOW_H:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[LR]$/.test(w.dirValue) === false) {
                            w.disable();
                        }
                    });
                    break;
                case commons.ALLOW_V:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[UD]$/.test(w.dirValue) === false) {
                            w.disable();
                        }
                    });
                    break;
                case commons.ALLOW_ONE:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_U$/.test(w.dirValue) === false) {
                            w.disable();
                        }
                    });
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
    constructor() {
        this.DOSAVE = false; //指示是否需要保存

        this.callback = this.callback.bind(this);
        this.elem = document.createElement("div");
        this.elem.id = "actions";

        this.child_text = new ChildWrapper(geti18nMessage('textType'), "textAction");
        this.child_text.disableOpt(
            commons.ACT_DL, commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.SEARCH_IMAGE, commons.SEARCH_LINK,
            commons.COPY_LINK, commons.COPY_IMAGE
        );

        this.child_image = new ChildWrapper(geti18nMessage('imageType'), "imageAction");

        this.child_image.disableOpt(
            commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.SEARCH_IMAGE, commons.SEARCH_TEXT,
            commons.COPY_TEXT
        );
        if (backgroundPage.supportCopyImage === false) {
            this.child_image.disableOpt(commons.COPY_IMAGE);
        }

        this.child_link = new ChildWrapper(geti18nMessage('linkType'), "linkAction");
        this.child_link.disableOpt(
            commons.ACT_DL, commons.ACT_TRANS, commons.ACT_QRCODE,
            commons.SEARCH_IMAGE
        );

        [this.child_text, this.child_link, this.child_image].forEach(c => {
            c.bindCallBack(this.callback); //这里会调用到下面的callback;
            c.appendTo(this.elem);
        });
        this.DOSAVE = true;
    }
    callback() {
        //当这个类第一初始化时，会调用回调完成第一次赋值，但是我们不想让数据又保存一次，
        //那么使用this.DOSAVE来表明是否需要保存
        //TODO: 新增选项：选项发生修改时自动保存 或 手动保存
        if (this.DOSAVE) this.save();
    }
    collect() {
        return {
            textAction: this.child_text.collect(),
            imageAction: this.child_image.collect(),
            linkAction: this.child_link.collect()
        }
    }
    collect1() {
        return {
            textAction: this.child_text.collectControlSelect(),
            imageAction: this.child_image.collectControlSelect(),
            linkAction: this.child_link.collectControlSelect(),
        }
    }
    save() {
        backgroundPage.config.set("Actions", this.collect());
        backgroundPage.config.set("directionControl", this.collect1());
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


class EngineItemWrapper {
    constructor(val, callback) {
        this.callback = callback;
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");
        this.elem.innerHTML = `
            <input type="text" title="${geti18nMessage("search_name_tooltip")}"></input>
            <input type="text" title="${geti18nMessage('search_url_tooltip')}"></input>
            <a href="#" >&#10003</a>
            <a href="#" >&#10007</a>
        `;
        this.nameInput = this.elem.children[0];
        eventUtil.attachEventT(this.nameInput, this.onchange, "change");
        this.urlInput = this.elem.children[1];
        eventUtil.attachEventT(this.urlInput, this.onchange, "change");

        this.confirm = this.elem.children[2];
        eventUtil.attachEventT(this.confirm, () => this.onConfirmClick());
        this.remove = this.elem.children[3];
        eventUtil.attachEventT(this.remove, () => this.onRemoveClick());

        [this.nameInput, this.urlInput, this.confirm, this.remove].forEach(t => this.elem.appendChild(t));
        this.value = val;
    }
    onConfirmClick() {
        let noEmpty = true;
        [this.nameInput, this.urlInput].every(input => {
            return noEmpty = input.value.length === 0 ? (this.addBorder(input), false) : true;
        });
        if (noEmpty) {
            this.callback();
        }
    }

    onRemoveClick() {
            this.callback(true, this);
        }
        //addWarnBorder
        //addAcceptBorder

    addBorder(input) {
        input.className = "warn";
        setTimeout(() => {
            input.className = "";
        }, 1200);
    }
    onchange() {

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
        this.items = []; //

        // this.onAdd = this.onAdd.bind(this);
        this.onButtonCallback = this.onButtonCallback.bind(this);

        this.buttonsDiv = document.querySelector("#engine-buttons");
        this.itemsDiv = document.querySelector("#engine-items");

        let refresh = this.buttonsDiv.firstElementChild;
        refresh.onclick = () => this.onRefresh();
        // refresh.textContent = browser.i18n.getMessage('RefreshbtnOnEngines');

        let add = this.buttonsDiv.lastElementChild;
        add.onclick = () => this.onAdd();
        // add.textContent = browser.i18n.getMessage('AddbtnOnEngines');
        this.refreshItems(engineList);
    }
    onButtonCallback(isRemove, item) {
        if (isRemove) {
            // console.log(item);
            this.items = this.items.filter((v) => v !== item);
            this.itemsDiv.removeChild(item.elem);
        }
        backgroundPage.config.set("Engines", this.collect());
        backgroundPage.config.save();
    }

    onRefresh() {
        this.refreshItems(backgroundPage.config.get("Engines"));
    }
    onAdd() {
        this.newItem();
    }
    refreshItems(list) {
        this.removeItems();
        list.forEach(s => this.newItem(s));
    }
    removeItems() {
        this.items.forEach(item => {
            this.itemsDiv.removeChild(item.elem);
            item = null;
        });
        this.items = [];
    }

    newItem(val = {
        name: "",
        url: ""
    }) {
        let item = new EngineItemWrapper(val, this.onButtonCallback);
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
        const tab = $E("#content-3");
        ["#enablePrompt", "#enableIndicator", "#enableStyle", "#triggeredDistance"].forEach(id => {
            let e = tab.querySelector(id);
            if (e.type === "checkbox") e.checked = backgroundPage.config.get(e.id);
            else e.value = backgroundPage.config.get(e.id);
            e.removeEventListener("change", this.handleChange);
            e.addEventListener("change", this.handleChange);
        })
    }
    handleChange(evt) {
        if (evt.target.type === "checkbox") backgroundPage.config.set(evt.target.id, evt.target.checked);
        else backgroundPage.config.set(evt.target.id, parseInt(evt.target.value));

        // if (evt.id === "enableStyle") {
        //     tabContainer.activeById(4);
        // }

        backgroundPage.config.save();
    }
}

class styleWrapper {
    constructor() {
        let tab = document.querySelector("#content-4");

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
            backgroundPage.config.set("style", styleArea.value);
        })
    }
}


const tabs = {
    _tabs: [],
    init: function() {


        let w = new Wrapper(backgroundPage.config.get("Actions"));
        w.appendTo($E("#content-1"));
        this._tabs.push(w);

        w = new EngineWrapper(backgroundPage.config.get("Engines"));
        w.appendTo($E("#content-2"));
        this._tabs.push(w);

        w = new generalWrapper();
        this._tabs.push(w);

        w = new styleWrapper();
        this._tabs.push(w);

        document.querySelectorAll(".nav-a").forEach(a => {
            a.addEventListener("click", this.navOnClick);
        });

        //do with i18n
        for (let elem of document.querySelectorAll("[i18n-id]")) {
            elem.textContent = geti18nMessage('elem_' + elem.attributes['i18n-id'].value);
        }
    },

    navOnClick: function(event) {
        $E(".nav-active").classList.remove("nav-active");
        event.target.classList.add("nav-active");
        $E(".tab-active").classList.remove("tab-active");
        $E(`#content-${event.target.getAttribute("nav-id")}`).classList.add("tab-active");
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
            filename: `GlitterDrag-${date.getFullYear()}-${date.getMonth()+1}-${date.getDay()}-${date.getHours()}-${date.getMinutes()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });
    });
    eventUtil.attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    eventUtil.attachEventS("#default", () => {
        backgroundPage.config.loadDefault();
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