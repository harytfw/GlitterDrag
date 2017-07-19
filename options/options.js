document.title = geti18nMessage("option_page_title");

let OptionTextTable = {
    act: [],
    active: [],
    pos: [],
    search: [],
    copy: [],
    allow: []
}

let tooltipTable = {};
//TODO add allow_ tooltip
["act", "active", "pos", "search", "search_type", "copy", "allow"].forEach(
    (name) => {
        tooltipTable[name] = geti18nMessage("option_tooltip_" + name);
    }
)


let DirTextTable = {};
for (let item of Object.keys(commons)) {

    const obj = {
        text: geti18nMessage(item),
        value: commons[item]
    };
    if (/^DIR_/.test(item)) {
        DirTextTable[item] = obj;
    }

    else if (/^ACT_/.test(item)) {
        OptionTextTable.act.push(obj)
    }
    else if (["TAB_FIRST", "TAB_LAST", "TAB_CLEFT", "TAB_CRIGHT"].includes(item)) {
        OptionTextTable.pos.push(obj);
    }
    else if (["FORE_GROUND", "BACK_GROUND"].includes(item)) {
        OptionTextTable.active.push(obj);
    }
    else if (["SEARCH_LINK", "SEARCH_TEXT", "SEARCH_IMAGE"].includes(item)) {
        OptionTextTable.search.push(obj);
    }
    else if (["COPY_TEXT", "COPY_LINK", "COPY_IMAGE"].includes(item)) {
        OptionTextTable.copy.push(obj);
    }
    else if (/^ALLOW_/.test(item)) {
        OptionTextTable.allow.push(obj);
    }
    else {
        //unused
        //console.log(obj);
    }
}

class SelectWrapper {
    //              选项      值      提示    回调
    constructor(optList = [], value, tooltip, cb) {
        this.elem = document.createElement("select");
        this.elem.setAttribute("title", tooltip);
        optList.every(opt => {
            let option = document.createElement("option");
            option.setAttribute("value", opt.value); //
            option.textContent = opt.text;
            this.elem.appendChild(option);
            return 1;
        });
        this.onchange = this.onchange.bind(this);
        this.elem.onchange = this.onchange;
        this.callback = cb;
        this.value = value;
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
    onchange() {
        this.callback();
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
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
}
class _SelectWrapper {
    //                         选项      值      提示    
    constructor(name = "", optList = [], value, tooltip) {
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
        //手动调用回调

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
    // onchange() {
    //     this.callback();
    // }
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
            //模仿一下event的结构
            cb({
                target: this.elem
            });
        }
    }
}




class ActionSelect extends _SelectWrapper {
    constructor(value) {
        super("act_name", OptionTextTable.act, value, tooltipTable.act);
    }
}

class ActiveSelect extends _SelectWrapper {
    constructor(value) {
        super("tab_active", OptionTextTable.active, value, tooltipTable.active)
    }
}

class PositionSelect extends _SelectWrapper {
    constructor(value) {
        super("tab_pos", OptionTextTable.pos, value, tooltipTable.pos);
    }
}

class EngineSelect extends _SelectWrapper {
    constructor(value) {
        let engines = backgroundPage.config.get("Engines");

        let optList = [{ text: geti18nMessage("defaultText"), value: "" }];
        if (engines.length !== 0) {
            optList = Array.from(engines, v => {
                return { text: v.name, value: v.name };
            });
        }

        super("engine_name", optList, value, tooltipTable.search)
    }
}

class SearchTypeSelect extends _SelectWrapper {
    constructor(value) {
        super("search_type", OptionTextTable.search, value, tooltipTable.search_type);
    }
}

class CopySelect extends _SelectWrapper {
    constructor(value) {
        super("copy_type", OptionTextTable.copy, value, tooltipTable.copy);
    }
}

class ControlSelect extends _SelectWrapper {
    constructor(value) {
        super("directionControl", OptionTextTable.allow, value, tooltipTable.allow);
    }
}


class DirWrapper {
    constructor(dir, conf) {
        this.onchange = this.onchange.bind(this);

        this.elem = document.createElement("div");
        this.elem.className = "direction";
        this.label = document.createElement("label");
        this.label.textContent = dir.text;
        this.elem.appendChild(this.label);
        this.direction = dir.value;
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
        this.collection = [this.actSelect, this.activeSelect, this.posSelect, this.engineSelect, this.searchTypeSelect, this.copySelect];
        this.collection.forEach(s => {
            s.appendTo(this.elem);
            s.bindCallBack(this.onchange);
        });
        // this.onchange();
    }
    onchange() {
        this.collection.forEach(select => {
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
            case commons.ACT_QRCODE:
                this.activeSelect.show();
                this.posSelect.show();
                break;
            default:
                break;
        }
    }
    disableOpt(...opts) {
        this.collection.forEach(s => {
            s.disableOpt(...opts);
        });
    }
    disable() {
        this.collection.forEach(s => s.disable());
        this.elem.classList.add("disabled");
    }
    enable() {
        this.collection.forEach(s => s.enable());
        this.elem.classList.remove("disabled");
    }
    bindCallBack(callback) {
        this.collection.forEach(c => {
            c.bindCallBack(() => {
                this.onchange();
                callback();
            })
        });
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
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
    bindCallBack(callback) {
        this.controlSelect.bindCallBack(callback)
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
}

class ChildWrapper {
    constructor(typeName, T) {
        this.elem = document.createElement("div");
        this.label = document.createElement("h3");
        this.label.textContent = typeName;




        this.elem.appendChild(this.label);
        this.controlWrapper = new ControlWrapper(T);
        this.controlWrapper.appendTo(this.elem);
        this.dirWrappers = [];
        for (let key of Object.keys(DirTextTable)) {
            this.dirWrappers.push(new DirWrapper(DirTextTable[key], backgroundPage.config.getAct(T, DirTextTable[key].value)));
        }
        // this.WrapperU = new DirWrapper(DirTextTable.DIR_U, conf.DIR_U, cb);
        // this.WrapperD = new DirWrapper(DirTextTable.DIR_D, conf.DIR_D, cb);
        // this.WrapperL = new DirWrapper(DirTextTable.DIR_L, conf.DIR_L, cb);
        // this.WrapperR = new DirWrapper(DirTextTable.DIR_R, conf.DIR_R, cb);
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
            obj[w.direction] = w.value;
        })
        return obj;
    }
    collectControlSelect() {
        return this.controlWrapper.value;
    }
    appendTo(parent) {
        parent.appendChild(this.elem);
    }
    bindCallBack(callback) {
        this.controlWrapper.bindCallBack((event) => {
            //中转一下
            switch (event.target.value) {
                case commons.ALLOW_ALL:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                    });
                    break
                case commons.ALLOW_NORMAL:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[UDLR]$/.test(w.direction) === false) {
                            w.disable();
                        }
                    });
                    break
                case commons.ALLOW_H:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[LR]$/.test(w.direction) === false) {
                            w.disable();
                        }
                    });
                    break;
                case commons.ALLOW_V:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_[UD]$/.test(w.direction) === false) {
                            w.disable();
                        }
                    });
                    break;

                case commons.ALLOW_ONE:
                    this.dirWrappers.forEach(w => {
                        w.enable();
                        if (/^DIR_U$/.test(w.direction) === false) {
                            w.disable();
                        }
                    });
                    break;

                default:
                    break;
            }
            callback()
        });
        this.dirWrappers.forEach(w => {
            w.bindCallBack(callback);
        });
    }

}

//使用bindCallBack要小心this的指向

//第一次初始化时不要保存
let DONOTTSAVE = true;

class Wrapper {
    constructor() {
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
        DONOTTSAVE = false;
    }
    callback() {
        if (!DONOTTSAVE) this.save();
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
        attachEventT(this.nameInput, this.onchange, "change");
        this.urlInput = this.elem.children[1];
        attachEventT(this.urlInput, this.onchange, "change");

        this.confirm = this.elem.children[2];
        attachEventT(this.confirm, () => this.onConfirmClick());
        this.remove = this.elem.children[3];
        attachEventT(this.remove, () => this.onRemoveClick());

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
        refresh.textContent = browser.i18n.getMessage('RefreshbtnOnEngines');

        let add = this.buttonsDiv.lastElementChild;
        add.onclick = () => this.onAdd();
        add.textContent = browser.i18n.getMessage('AddbtnOnEngines');
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

    newItem(val = { name: "", url: "" }) {
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
        // parent.appendChild(this.itemsDiv)
    }
}



var backgroundPage = null;
browser.runtime.getBackgroundPage().then((page) => {
    backgroundPage = page;

    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
        try {
            backgroundPage.config.restore(fileReader.result);
            backgroundPage.config.save();
            initForm(true);
            initSearcheTab(true);
        }
        catch (e) {
            console.error("Error when restore from backup", e);
            alert("An error occurred!");
        }
    });
    attachEventS("#backup", () => {
        let blob = new Blob([JSON.stringify(backgroundPage.config, null, 2)]);
        let url = URL.createObjectURL(blob);
        browser.downloads.download({
            url: url,
            filename: `GlitterDrag-${new Date().getTime()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });
    });
    attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    attachEventS("#default", () => {
        backgroundPage.config.loadDefault();
        initForm(true);
        initSearcheTab(true);
    });
    attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");
    initForm();

    for (let elem of document.querySelectorAll("[i18n-id]")) {
        elem.textContent = geti18nMessage('elem_' + elem.attributes['i18n-id'].value);
    }

}, () => {});

function initForm(force = false) {
    let content = document.querySelector("#content-1");
    if (content.children.length === 0 || force) {
        if (force) {
            let c = null;
            while ((c = content.firstChild)) {
                content.removeChild(c);
            }
        }
        let wrapper = new Wrapper(backgroundPage.config.get("Actions"));
        wrapper.appendTo(content);
    }
}



function initSearcheTab(force) {
    let content = document.querySelector("#engine-items");
    if (content.children.length === 0 || force) {
        if (force) {
            let c = null;
            while ((c = content.firstChild)) {
                content.removeChild(c);
            }
        }
        let wrapper = new EngineWrapper(backgroundPage.config.get("Engines"))
        // wrapper.appendTo(content)
    }
}

function initGeneral(force) {
    let content = document.querySelector("#content-3")
    if (content.children.length === 0 || force) {
        if (force) {
            let c = null;
            while ((c = content.firstChild)) {
                content.removeChild(c);
            }
        }
        // let wrapper = new EngineWrapper(backgroundPage.config.get("Engines"))
        // wrapper.appendTo(content)
    }

    function handleChange(evt) {
        if (evt.target.type === "checkbox") backgroundPage.config.set(evt.target.id, evt.target.checked);
        else backgroundPage.config.set(evt.target.id, parseInt(evt.target.value));
        backgroundPage.config.save();
    }
    ["#enablePrompt", "#enableIndicator", "#triggeredDistance"].forEach(id => {
        let e = content.querySelector(id);
        if (e.type === "checkbox") e.checked = backgroundPage.config.get(e.id);
        else e.value = backgroundPage.config.get(e.id);
        e.removeEventListener("change", handleChange);
        e.addEventListener("change", handleChange);
    })

}

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