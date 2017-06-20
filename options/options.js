
let OptionTextTable = {
    act: [{ text: "无动作", value: ACT_NONE },
    { text: "直接打开", value: ACT_OPEN },
    { text: "搜索", value: ACT_SEARCH },
    { text: "复制", value: ACT_COPY },
    { text: "下载", value: ACT_DL },
    { text: "翻译", value: ACT_TRANS },
    { text: "二维码", value: ACT_QRCODE },
    ],
    active: [{ text: "前台", value: FORE_GROUND },
    { text: "后台", value: BACK_GROUND },
    ],
    pos: [{ text: "尾", value: TAB_LAST },
    { text: "首", value: TAB_FIRST },
    { text: "前", value: TAB_CLEFT },
    { text: "后", value: TAB_CRIGHT },
    ],
    search: [{ text: "链接", value: SEARCH_LINK }, { text: "文本", value: SEARCH_TEXT }, { text: "图像", value: SEARCH_IMAGE }],
    copy: [{ text: "文本", value: COPY_TEXT }, { text: "链接", value: COPY_LINK }, { text: "图像", value: COPY_IMAGE }]
}
let DirTextTable = {
    DIR_U: { text: "上", value: DIR_U },
    DIR_D: { text: "下", value: DIR_D },
    DIR_L: { text: "左", value: DIR_L },
    DIR_R: { text: "右", value: DIR_R },
}
let typeNameTable = {
    text: { text: "文本" },
    link: { text: "链接" },
    image: { text: "图像" }
}

let tooltipTable = {
    act: "要执行的动作",
    active: "新建标签页的激活状态",
    pos: "标签页的位置",
    search: "调用的搜索引擎，默认调用百度",
    search_type: "需要搜索的东西，文本、链接",
    copy: "指定需要复制的东西，文本、链接或图像.复制图像可能会有很多问题，谨慎使用"
}
class SelectWrapper {
    constructor(optList = [], value, tooltip, cb) {
        this.elem = document.createElement("select");
        this.elem.setAttribute("title", tooltip);
        optList.every(opt => {
            let option = document.createElement("option");
            option.setAttribute("value", opt.value);
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
    onchange(event) {
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
}
class DirWrapper {
    constructor(dir, conf, cb) {
        let _cb = cb;
        cb = () => {
            this.onchange_callback();
            _cb();
        }
        this.elem = document.createElement("div");
        this.elem.className = "direction"
        this.label = document.createElement("label");
        this.label.textContent = dir.text;
        this.elem.appendChild(this.label);
        this.direction = dir.value;
        this.act = {
            act_name: conf.act_name, tab_active: conf.tab_active,
            tab_pos: conf.tab_pos, engine_name: conf.engine_name, copy_type: conf.copy_type,
            search_type: conf.search_type
        };
        this.actSelect = new SelectWrapper(OptionTextTable.act, this.act.act_name, tooltipTable.act, cb);
        this.activeSelect = new SelectWrapper(OptionTextTable.active, this.act.tab_active, tooltipTable.active, cb);
        this.posSelect = new SelectWrapper(OptionTextTable.pos, this.act.tab_pos, tooltipTable.pos, cb);

        let engines = backgroundPage.config.get("Engines");
        let optList = engines.length !== 0 ? Array.from(engines, v => ({ text: v.name, value: v.name })) : [{ text: "默认", value: "" }];
        //NEW SELECT
        this.engineSelect = new SelectWrapper(optList, this.act.engine_name, tooltipTable.search, cb);
        this.searchTypeSelect = new SelectWrapper(OptionTextTable.search, this.act.search_type, tooltipTable.search_type, cb);
        this.copySelect = new SelectWrapper(OptionTextTable.copy, this.act.copy_type, tooltipTable.copy, cb);

        [this.actSelect, this.activeSelect, this.posSelect, this.engineSelect, this.copySelect, this.searchTypeSelect].forEach(s => {
            this.elem.appendChild(s.elem);
        })
        this.onchange_callback();
    }
    onchange_callback() {
        //NEW SELECT
        Object.assign(this.act, {
            act_name: this.actSelect.value,
            tab_active: this.activeSelect.value, tab_pos: this.posSelect.value, engine_name: this.engineSelect.value,
            copy_type: this.copySelect.value, search_type: this.searchTypeSelect.value
        });
        [this.activeSelect, this.posSelect, this.engineSelect, this.copySelect, this.searchTypeSelect].forEach(s => {
            s.hide();
        })
        //NEW SELECT
        switch (this.act.act_name) {
            case ACT_COPY: this.copySelect.show(); break;
            case ACT_SEARCH: this.activeSelect.show();
                this.posSelect.show(); this.engineSelect.show();
                this.searchTypeSelect.show();
                break;
            case ACT_OPEN:
            case ACT_QRCODE:
                this.activeSelect.show(); this.posSelect.show(); break;
            default: break;
        }
    }
    disableOpt(...opts) {
        [this.actSelect, this.activeSelect, this.posSelect, this.engineSelect, this.copySelect, this.searchTypeSelect].forEach(s => {
            s.disableOpt(...opts);
        })
    }
}
class ChildWrapper {
    constructor(typeName, conf, cb) {
        this.elem = document.createElement("div");
        this.typeName = typeName;
        this.label = document.createElement("h3");
        this.label.textContent = typeName;
        this.elem.appendChild(this.label);
        this.WrapperU = new DirWrapper(DirTextTable.DIR_U, conf.DIR_U, cb);
        this.WrapperD = new DirWrapper(DirTextTable.DIR_D, conf.DIR_D, cb);
        this.WrapperL = new DirWrapper(DirTextTable.DIR_L, conf.DIR_L, cb);
        this.WrapperR = new DirWrapper(DirTextTable.DIR_R, conf.DIR_R, cb);
        [this.WrapperU, this.WrapperL, this.WrapperR, this.WrapperD].forEach(w => this.elem.appendChild(w.elem));
    }
    disableOpt(...opts) {
        [this.WrapperD, this.WrapperL, this.WrapperR, this.WrapperU].forEach(w => w.disableOpt(...opts))
    }

    collect() {
        return {
            DIR_U: this.WrapperU.act,
            DIR_D: this.WrapperD.act,
            DIR_L: this.WrapperL.act,
            DIR_R: this.WrapperR.act
        }
    }
}
class Wrapper {
    constructor(conf) {
        this.callback = this.callback.bind(this);
        this.elem = document.createElement("div");
        this.elem.id = "actions";

        this.child_text = new ChildWrapper(typeNameTable.text.text, conf.textAction, this.callback);
        this.child_text.disableOpt(
            ACT_DL, ACT_TRANS, ACT_QRCODE,
            SEARCH_IMAGE, SEARCH_LINK,
            COPY_LINK, COPY_IMAGE
        );

        this.child_image = new ChildWrapper(typeNameTable.image.text, conf.imageAction, this.callback);
        this.child_image.disableOpt(
            ACT_TRANS, ACT_QRCODE,
            SEARCH_IMAGE, SEARCH_TEXT,
            COPY_TEXT,
        )

        this.child_link = new ChildWrapper(typeNameTable.link.text, conf.linkAction, this.callback);
        this.child_link.disableOpt(
            ACT_DL, ACT_TRANS, ACT_QRCODE,
            SEARCH_IMAGE
        );

        [this.child_text, this.child_link, this.child_image].every(c => this.elem.appendChild(c.elem));
    }
    callback() {
        this.save();
    }
    collect() {
        return {
            textAction: this.child_text.collect(),
            imageAction: this.child_image.collect(),
            linkAction: this.child_link.collect()
        }
    }
    save() {
        backgroundPage.config.set("Actions", this.collect());
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
        this.onclick = this.onclick.bind(this);
        this.elem = document.createElement("div");
        this.nameInput = document.createElement("input");
        this.nameInput.type = "text";
        this.nameInput.onchange = this.onchange;
        this.nameInput.title = "搜索引擎的名称";
        this.urlInput = document.createElement("input");
        this.urlInput.type = "text";
        this.urlInput.onchange = this.onchange;
        this.urlInput.title = "调用的链接"
        // this.label1 = document.createElement("label");
        // this.label2 = document.createElement("label");
        // this.remove = document.createElement("a");
        // this.remove.onclick = this.onclick();
        // this.save = document.createElement("a");

        this.confirm = document.createElement("a");
        this.confirm.href = "#";
        this.confirm.innerHTML = "&#10003";
        this.confirm.onclick = this.onclick;
        [this.nameInput, this.urlInput, this.confirm].forEach(t => this.elem.appendChild(t));
        this.value = val;
    }
    onclick() {
        let notempty = true;
        [this.nameInput, this.urlInput].every(input => {
            return notempty = input.value.length === 0 ? (this.addBorder(input), false) : true;
        });
        if (notempty) {
            this.callback();
        }

    }
    addBorder(input) {
        input.style.border = "1px red solid";
        setTimeout(() => {
            input.style.border = "";
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
        this.add_event = this.add_event.bind(this);
        this.onsave_callback = this.onsave_callback.bind(this);
        this.elem = document.createElement("div");
        this.items = [];
        let refresh = document.createElement("button")
        refresh.textContent = "刷新"

        let add = document.createElement("button")
        add.textContent = "添加"
        add.onclick = this.add_event
        this.elem.appendChild(refresh)
        this.elem.appendChild(add)
        engineList.forEach(s => this.newItem(s));
    }
    onsave_callback() {
        backgroundPage.config.set("Engines", this.collect());
        backgroundPage.config.save();
    }
    add_event() {
        this.newItem({ name: "", url: "" });
    }
    newItem(val) {
        let item = new EngineItemWrapper(val, this.onsave_callback);
        this.items.push(item);
        item.appendTo(this.elem);
    }
    collect() {
        return Array.from(this.items, item => item.value);
    }
    appendTo(parent) {
        parent.appendChild(this.elem)
    }
}






var backgroundPage = null;
browser.runtime.getBackgroundPage().then((page) => {
    console.log("Add listenerForOptionsPage")
    //在content_script.js提到的listener
    //主要是为了方便测试与powershell的通信
    browser.runtime.onMessage.addListener(listenerForOptionsPage);

    backgroundPage = page;
    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
        try {
            backgroundPage.loadUserOptionsFromBackUp(fileReader.result);
            initForm(true);
            initSearcheTab(true);
        }
        catch (e) {
            console.error("在恢复用户配置时出现异常！", e);
            alert("在恢复用户配置时出现异常！");
        }
    });
    document.querySelector("#backup").addEventListener("click", (event) => {
        event.target.setAttribute("href", "data:," + escape(JSON.stringify(backgroundPage.config, null, 2)));
        event.target.setAttribute("download", `GlitterDrag-${new Date().getTime()}.json`);
    });
    document.querySelector("#restore").addEventListener("click", () => {
        document.querySelector("#fileInput").click();
    });
    document.querySelector("#default").addEventListener("click", () => {

        backgroundPage.config.loadDefault();
        initForm(true);
        initSearcheTab(true);
    });
    document.querySelector("#fileInput").addEventListener("change", (event) => {
        fileReader.readAsText(event.target.files[0])
    });
    initForm();
}, () => { });
function initForm(force = false) {
    let content1 = document.querySelector("#content-1");
    if (content1.children.length === 0 || force) {
        if (force) {
            let c = content1.firstChild;
            while (c) {
                content1.removeChild(c);
            }
        }
        let wrapper = new Wrapper(backgroundPage.config.get("Actions"));
        wrapper.appendTo(content1);
    }
}



function initSearcheTab(force) {
    let content2 = document.querySelector("#content-2")
    if (content2.children.length === 0 || force) {
        if (force) {
            let c = content1.firstChild;
            while (c) {
                content1.removeChild(c);
            }
        }
        let wrapper = new EngineWrapper(backgroundPage.config.get("Engines"))
        wrapper.appendTo(content2)
    }
}

function listenerForOptionsPage(msg) {

    let logArea = document.querySelector("#logArea");
    function log(message) {
        logArea.value = `${logArea.value}\n${new Date().toTimeString()} --- ${message}`
    }
    if (msg.copy_type === COPY_IMAGE) {
        log("1.向脚本发送测试信息");
        browser.runtime.sendNativeMessage(appName, "test").then((r) => {
            log("2.1.脚本回复：" + r);
        }, (e) => {
            log("2.2.发送测试信息失败:" + e);
        });
    }


    let dontExecute = false;
    let elem = drag.targetElem;
    let input = document.createElement("textarea");
    input.style.width = "0px";
    input.style.height = "0px";
    if (elem instanceof HTMLAnchorElement) {
        if (msg.copy_type === COPY_LINK) input.value = elem.href;
        else if (msg.copy_type === COPY_TEXT) input.value = elem.textContent;
        else if (msg.copy_type === COPY_IMAGE) {
            //如果复制的是链接里的图像
            drag.targetElem = elem.querySelector("img");
            listenerForOptionsPage(msg);
            return;
        }
    }
    else if (elem instanceof HTMLImageElement) {
        if (msg.copy_type === COPY_LINK) input.value = elem.src;
        else if (msg.copy_type === COPY_IMAGE) {
            log("3.检测到复制图像行为");
            dontExecute = true;
            //获得图像的扩展
            let pathname = new URL(elem.src).pathname;
            let ext = pathname.substring(pathname.lastIndexOf("."), pathname.length);
            let img = new Image();
            img.src = elem.src;
            img.onload = () => {
                //下面尝试得到图像的二进制数据
                let canvas = document.createElement("canvas");
                log("4.创建canvas");
                canvas.height = img.height;
                canvas.width = img.width;
                let ctx = canvas.getContext("2d");
                ctx.drawImage(img, 0, 0);
                //得到没有data:image ...头的base64字符串
                let base64 = canvas.toDataURL("image/png", 1).split(",")[1];
                //发送给background，让background发送字符串到powershell脚本
                log("5.向脚本发送图像")
                browser.runtime.sendNativeMessage(appName, base64).then((response) => {
                    log("5.1.发送成功，接收到回复消息:" + response);
                }, (error) => {
                    log("5.2.发送图像失败: " + error);
                })
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
    }
}



