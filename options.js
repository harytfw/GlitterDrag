
let OptionTextTable = {
    act: [{ text: "无动作", value: ACT_NONE },
    { text: "直接打开", value: ACT_OPEN },
    { text: "搜索", value: ACT_SEARCH },

    { text: "复制", value: ACT_COPY },
    { text: "翻译", value: ACT_TRANS },
    { text: "下载", value: ACT_DL },
    { text: "二维码", value: ACT_QRCODE },
    ],
    status: [{ text: "前台", value: FORE_GROUND },
    { text: "后台", value: BACK_GROUND },
    ],
    pos: [{ text: "尾", value: TAB_LAST },
    { text: "首", value: TAB_FIRST },
    { text: "前", value: TAB_CLEFT },
    { text: "后", value: TAB_CRIGHT },
    ]
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

class SelectWrapper {
    constructor(optList = [], value, cb) {
        this.elem = document.createElement("select");
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
}
class DirWrapper {
    constructor(dir, conf, cb) {
        let _cb = cb;
        cb = () => {
            this.onchange_callback();
            _cb();
        }
        this.elem = document.createElement("div");
        this.label = document.createElement("label");
        this.label.textContent = dir.text;
        this.elem.appendChild(this.label);
        this.direction = dir.value;
        this.act = { act_name: conf.act_name, tab_active: conf.tab_active, tab_pos: conf.tab_pos, engine_name: conf.engine_name };
        this.actSelect = new SelectWrapper(OptionTextTable.act, this.act.act_name, cb);
        this.activeSelect = new SelectWrapper(OptionTextTable.status, this.act.tab_active, cb);
        this.posSelect = new SelectWrapper(OptionTextTable.pos, this.act.tab_pos, cb);
        this.engineSelect = new SelectWrapper([{ text: "bd", value: "1" }, { text: "gg", value: "2" }], "1", cb);
        this.engineSelect.elem.style.display = "none";
        [this.actSelect, this.activeSelect, this.posSelect, this.engineSelect].forEach(s => {
            this.elem.appendChild(s.elem);
        })
        this.onchange_callback();
    }
    onchange_callback() {
        Object.assign(this.act, {
            act_name: this.actSelect.value,
            tab_active: this.activeSelect.value, tab_pos: this.posSelect.value, engine_name: this.engineSelect.value
        });
        if (this.act.act_name === ACT_SEARCH) {
            this.engineSelect.elem.style.display = "";
        }
        else {
            this.engineSelect.elem.style.display = "none";

        }
    }
}
class ChildWrapper {
    constructor(typeName, conf, cb) {
        this.elem = document.createElement("div");
        this.typeName = typeName;
        this.label = document.createElement("label");
        this.label.textContent = typeName;
        this.elem.appendChild(this.label);
        this.WrapperU = new DirWrapper(DirTextTable.DIR_U, conf.DIR_U, cb);
        this.WrapperD = new DirWrapper(DirTextTable.DIR_D, conf.DIR_D, cb);
        this.WrapperL = new DirWrapper(DirTextTable.DIR_L, conf.DIR_L, cb);
        this.WrapperR = new DirWrapper(DirTextTable.DIR_R, conf.DIR_R, cb);
        [this.WrapperD, this.WrapperL, this.WrapperR, this.WrapperU].forEach(w => this.elem.appendChild(w.elem));
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
        this.child_text = new ChildWrapper(typeNameTable.text.text, conf.textAction, this.callback);
        this.child_image = new ChildWrapper(typeNameTable.image.text, conf.imageAction, this.callback);
        this.child_link = new ChildWrapper(typeNameTable.link.text, conf.linkAction, this.callback);
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

let backgroundPage = null;
browser.runtime.getBackgroundPage().then((page) => {
    backgroundPage = page;
    let fileReader = new FileReader();
    fileReader.addEventListener("loadend", () => {
        try {
            backgroundPage.loadUserOptionsFromBackUp(fileReader.result);
            initForm();
        }
        catch (e) {
            console.error("在恢复用户配置时出现异常！", e);
            alert("在恢复用户配置时出现异常！");
        }
    });
    document.querySelector("#backup").addEventListener("click", (event) => {
        let blob = new Blob([backgroundPage.convertOptionsToJson()], { type: 'application/json' });
        event.target.setAttribute("href", URL.createObjectURL(blob));
        event.target.setAttribute("download", "GlitterDrag" + new Date().getTime() + ".json");
    });
    document.querySelector("#restore").addEventListener("click", () => {
        document.querySelector("#fileInput").click();
    });
    document.querySelector("#default").addEventListener("click", () => {

        backgroundPage.config.loadDefault();
        initForm();
    });
    document.querySelector("#fileInput").addEventListener("change", (event) => {
        fileReader.readAsText(event.target.files[0])
    });
    initForm();
}, () => { });
function initForm() {
    let content1 = document.querySelector("#content-1");
    if (content1.children.length === 0) {
        let wrapper = new Wrapper(backgroundPage.config.Actions);
        wrapper.appendTo(content1);
    }
}

function initSearchTemplateTab(isFirst = true) {
    //CS 
    function updateContainer() {
        for (let removeTarget of container.querySelectorAll("div")) {
            container.removeChild(removeTarget);
        }
        let searchList = backgroundPage.config.userCustomizedSearchs;
        let i = 0;
        for (let item of searchList) {
            let box = generateBox(item.name, item.url, i);
            i++;
            // box.children[0].addEventListener("focus",onInputFocus)
            // box.children[0].addEventListener("blur",onInputBlur)
            // box.children[0].addEventListener("keypress",onKeyPress)
            // box.children[1].addEventListener("focus",onInputFocus)
            // box.children[1].addEventListener("blur",onInputBlur)
            // box.children[1].addEventListener("keypress",onKeyPress)
            container.appendChild(box)
        }
    }

    function generateBox(name = "", url = "", index = -1) {
        let div = document.createElement("div")
        div.innerHTML = `<input type="text" class="input-name input-disabled" index="${index}" title="名称" oldName="${name}" value="${name}"></input>
            <button class="btn-remove">删除</button>
            <input type="text" class="input-url input-disabled" title="链接" value="${url}"></input>
            <button class="btn-save">保存</button>
            `;
        for (let btn of div.querySelectorAll("button")) {
            btn.addEventListener("click", onButtonClick);
        }
        return div;
    }

    function onKeyPress(event) {
        if (event.key === "Enter") {
            event.target.blur();
        }
        else if (event.key === "Escape") {
            event.target.value = event.target.getAttribute("placeholder");
            event.target.blur();
        }
        console.dir(event)
    }

    function onInputFocus(event) {
        event.target.value = event.target.getAttribute("placeholder");
    }

    function onDoubleClick(event) {
        let elem = event.target;
        console.log("dbclcikc")
    }

    function onInputBlur(event) {
        //save data
        event.target.setAttribute("placeholder", event.target.value);
        event.target.value = "";
        // event.target.removeAttribute("value");
    }
    //按钮点击事件都放在这里
    //代码尽量简洁明了，复杂的代码应该放在其它函数里面
    function onButtonClick(event) {
        let T = event.target;
        if (T.id === "btn-add") {
            let box = generateBox("", "");
            container.appendChild(box);
            box.firstChild.focus();
        }
        else if (T.id === "btn-refresh") {
            while (container.firstChild) {
                container.removeChild(container.firstChild);
            }
            updateContainer();
        }
        else if (T.className === "btn-save") {
            let isEmpty = false;
            let inputElems = T.parentElement.querySelectorAll("input");
            for (let input of inputElems) {
                if (input.value.length === 0) {
                    input.style.border = "1px red solid";
                    setTimeout(() => {
                        input.style.border = "";
                    }, 1000);
                    isEmpty = true;
                    break;
                }
            }
            if (!isEmpty) {
                let name = inputElems[0].value;
                let url = inputElems[1].value;
                let index = parseInt(inputElems[0].getAttribute("index"));
                backgroundPage.updateUserCustomizedSearch(index, name, url);
                updateContainer();
            }
        }
        else if (T.className === "btn-remove") {
            if (confirm("确定删除？")) {
                let inputElems = T.parentElement.querySelectorAll("input");
                let name = inputElems[0].value;
                let url = inputElems[1].value;
                let index = parseInt(inputElems[0].getAttribute("index"));
                backgroundPage.updateUserCustomizedSearch(index, name, url, true);
                T.parentElement.parentElement.removeChild(T.parentElement);
                updateContainer();
            }
        }
    }

    let container = $E("#container-search");


    if (isFirst) {
        container.parentElement.querySelector("#btn-add").addEventListener("click", onButtonClick);
        container.parentElement.querySelector("#btn-refresh").addEventListener("click", onButtonClick);
    }
    updateContainer();
}




