class UIClass {
    constructor(id = "", tag = "div") {
        // if (id === "") throw "id of UIClass is empty";
        this.id = id;
        this.removePreviousOne();
        this.node = document.createElement(tag)
        if (this.id !== "") this.node.id = id;

        this._rect = new DOMRect();
    }


    $E(s = "", context = this.node) {
        return context.querySelector(s);
    }

    $A(s = "", context = this.node) {
        return context.querySelectorAll(s);
    }

    removePreviousOne() {
        if (this.id !== "") {
            const p = this.$E("#" + this.id, document);
            if (p instanceof Node) {
                p.remove();
            }
        }
    }


    mount(parentElement = document.body) {
        parentElement.appendChild(this.node);
    }

    remove() {
        this.node.remove();
    }

    initContent(data) {
        if (typeof data === "string") {
            this.node.innerHTML = data;
        }
        else if (data instanceof Node) {
            this.node.appendChild(data);
        }
        else if (data instanceof UIClass) {
            this.initContext(data.node);
        }
    }

    place(x = 0, y = 0) {
        this.setStyleProperty("left", x + "px");
        this.setStyleProperty("top", y + "px");
    }

    place_fix(x = 0, y = 0) {
        this.getRect(this._rect);
        const rect = this._rect;
        const [width, height] = [window.innerWidth, window.innerHeight];
        if (rect.width + x >= width) {
            x = width - rect.width;
        }
        else {
            x -= rect.width / 2;
        }
        if (rect.height + y >= height) {
            y = height - rect.height;
        }
        else {
            y -= rect.height / 2;
        }
        this.setStyleProperty("left", x + "px");
        this.setStyleProperty("top", y + "px");
    }

    hide() {
        if (this.node.parentElement instanceof Node) this.remove();
        //this.setDisplayProperty("none");
    }

    display() {
        if (this.node.parentElement === null) this.mount();
        //this.setDisplayProperty("block");
    }

    setDisplayProperty(value = "") {
        this.setStyleProperty("display", value);
    }

    setStyleProperty(name = "", value = "") {
        this.node.style.setProperty(name, value, "important");
    }

    setAttribute(name = "", value = "") {
        this.node.setAttribute(name, value);
    }

    addListener(name = "", listener = () => {}, option) {
        this.node.addEventListener(name, listener, option)
    }

    removeListener(name = "", listener = () => {}, option) {
        this.node.removeEventListener(name, listener, option);
    }

    getRect(rect = new DOMRect()) {
        this.setStyleProperty("visibility", "hidden");
        this.setDisplayProperty("block");
        this.mount();
        const _rect = this.node.getBoundingClientRect();
        for (const k of ["x", "y", "height", "width"]) {
            rect[k] = _rect[k];
        }
        this.setStyleProperty("visibility", "");
        this.setDisplayProperty("");
        this.remove();
    }

    get isHiding() {
        return this.node.style.display === "none";
    }
}

class Prompt extends UIClass {
    constructor() {
        super("GDPrompt");
        this.text = new UIClass();
        this.arrow = new UIClass("GDArrow", "i");

        this.arrow.mount(this.node);
        this.text.mount(this.node);
    }

    render(dir = "", t = "") {
        //DIR_UP_L
        //[DIR,UP,L]
        //[UP,L]
        //UP-L
        this.arrow.node.className = `GDArrow-${dir.split("_").slice(1).join("-")}`;
        this.text.node.textContent = t;
    }
    display() {
        if (bgConfig.enablePrompt === true) {
            super.display();
        }
    }
    hide() {
        if (bgConfig.enablePrompt === true) {
            super.hide();
        }
    }
    destory() {
        this.remove();
    }
}


class RemotePrompt {
    constructor() {

    }

    render() {
        window.top.postMessage({
            name: "promptBox",
            func: "render",
            render: [...arguments]
        }, "*")
    }

    display() {
        window.top.postMessage({
            name: "promptBox",
            func: "display",
            display: [...arguments]
        }, "*")
    }

    hide() {
        window.top.postMessage({
            name: "promptBox",
            func: "hide",
            hide: [...arguments]
        }, "*")
    }

    destory() { //gai remove
        window.top.postMessage({
            name: "promptBox",
            func: "destory",
            destory: [...arguments]
        }, "*")
    }
}

class Indicator extends UIClass {
    constructor() {
        super("GDIndicator");
    }
    place(x = 0, y = 0, radius = 0) {
        radius = radius / window.devicePixelRatio;
        super.place(x - radius, y - radius);
        const value = radius * 2;
        this.setStyleProperty("height", value + "px");
        this.setStyleProperty("width", value + "px");
        this.setStyleProperty("border-radius", `${value}px ${value}px`);
    }
    display() {
        if (bgConfig.enableIndicator === true) {
            super.display();
        }
    }
    hide() {
        if (bgConfig.enableIndicator === true) {
            super.hide();
        }

    }
    destory() {
        this.remove();
    }
}

// class Dict extends UIClass {
//     constructor() {
//         super();
//     }

// }



const ICONS = {
    "ACT_DL": "GD-fa GD-fa-download",
    "ACT_OPEN": "GD-fa GD-fa-external-link",
    "ACT_SEARCH": "GD-fa GD-fa-search",
    "ACT_COPY": "GD-fa GD-fa-clipboard",
    "ACT_FIND": "GD-fa GD-fa-find",
    "BAN": "GD-fa GD-fa-ban",
    "CUSTOM": "GD-fa GD-fa-custom"
}
const PANEL_HTML_CONTENT = `
<table id="GDPanel">
    <tr id="GDHeader">
        <th colspan=3>
            动作
        </th>
    </tr>
    <tr class="GDLabel" id="GDLabel-text">
        <td class="GDLabel-content" colspan=3><span>文本：</span><span class="GDPanel-content">中国最强</span></td>
    </tr>
    <tr class="GDRow" id="GDRow-text">
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
    </tr>
    <tr class="GDLabel" id="GDLabel-link">
        <td class="GDLabel-content" colspan=3><span >链接：</span><span class="GDPanel-content"></span></td>
    <tr class="GDRow" id="GDRow-link">
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
    </tr>
    <tr class="GDLabel" id="GDLabel-image">
        <td class="GDLabel-content" colspan=3><span>图片：</span><span class="GDPanel-content"></span></td>
    </tr>
    <tr class="GDRow" id="GDRow-image">
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
        <td class="GDCell" align="center">
            <i />
        </td>
    </tr>
    <tr class="GDRow" id="GDFooter">
        <td class="GDCell" id="GDCell-ban" colspan=2">
        <i class="${ICONS.BAN}" aria-hidden="true"></i>
        </td>
    </tr>
    
</table>`;
class Panel extends UIClass {
    //TODO:内容长度自动裁剪
    //TODO:样式美观
    //TODO:完善图标自定义功能
    constructor(listener = { dragenter: () => {}, dragleave: () => {}, drop: () => {}, dragover: () => {} }) {
        super("GDPanel", "table");
        this.initContent(PANEL_HTML_CONTENT)
        this.header = this.$E("#GDHeader").firstElementChild;
        this.lastdragovertarget = null;
        this.listener = listener;
        this.addListener("drop", e => this.listener.drop(e, this.lastdragovertarget));
        this.addListener("dragenter", this.listener.dragenter);
        this.addListener("dragleave", this.listener.dragleave);
        this.addListener("dragover", this.ondragover.bind(this));

        this.setStyleProperty("visibility", "hidden");
        this.setStyleProperty("zIndex", "-1");

        this.update();

    }
    ondragover(e) {
        if (e.target.className.indexOf("GDCell") >= 0 && this.lastdragovertarget != e.target) {
            this.lastdragovertarget && this.lastdragovertarget.classList.remove("GDCell-hover");
            this.lastdragovertarget = e.target;
            this.lastdragovertarget.classList.add("GDCell-hover");
            this.updateHeader(e);
        }
    }

    update() {
        const map = {
            "text": ["#GDRow-text", "Panel_textAction"],
            "link": ["#GDRow-link", "Panel_linkAction"],
            "image": ["#GDRow-image", "Panel_imageAction"],
        }
        for (const kind of Object.keys(map)) {
            const [selector, confKey] = map[kind];
            const row = this.$E(selector);
            let index = 0;
            for (const cell of row.children) {
                cell.dataset["kind"] = kind;
                cell.dataset["key"] = confKey;
                cell.dataset["index"] = index;
                const act_name = bgConfig[confKey][index]["act_name"];
                const icon = bgConfig[confKey][index]["icon"];
                if (icon === "") cell.firstElementChild.className = ICONS[act_name];
                else {
                    const el = cell.firstElementChild;
                    el.className = ICONS.CUSTOM;
                    el.style.backgroundImage = `url(${icon})`;
                }
                index++;
            }
        }
    }


    updateHeader(e) {

        if (this.lastdragovertarget.id === "GDCell-ban") {
            this.header.textContent = "取消"; //getI18nMessage("Cancel");
            return;
        }
        const setting = bgConfig[e.target.dataset["key"]][e.target.dataset["index"]];
        const tips = setting["panel_tips"];
        if (tips !== "") this.header.textContent = translatePrompt(tips, setting);
        else this.header.textContent = translatePrompt("%g-%a", setting);

    }

    render(actionkind, targetkind, selection, textSelection, imageLink) {
        function trim(str = "", len1 = 6, len2 = 6, maxlen = 12) {
            if (str.length <= maxlen) return str;
            return `${str.substr(0,len1)}...${str.substr(str.length-len2,len2)}`
        }
        $H(["#GDLabel-link", "#GDLabel-image", "#GDRow-link", "#GDRow-image"], "table-row", this.node);
        switch (actionkind) {
            case commons.textAction:
                $H(["#GDLabel-link", "#GDLabel-image", "#GDRow-link", "#GDRow-image"], "none", this.node);
                this.$E("#GDLabel-text .GDPanel-content").textContent = trim(textSelection);
                break;
            case commons.linkAction:
                if (targetkind === commons.TYPE_ELEM_A_IMG) {
                    this.$E("#GDLabel-image .GDPanel-content").textContent = imageLink;
                }
                else {
                    $H(["#GDLabel-image", "#GDRow-image"], "none", this.node);
                }
                this.$E("#GDLabel-link .GDPanel-content").textContent = trim(selection);
                this.$E("#GDLabel-text .GDPanel-content").textContent = trim(textSelection);
                break;
            case commons.imageAction:
                $H(["#GDLabel-text", "#GDRow-text", "#GDLabel-link", "#GDRow-link"], "none", this.node);
                this.$E("#GDLabel-image .GDPanel-content").textContent = trim(selection);
                break;
            default:
                break;
        }
    }
    place(x = 0, y = 0) {
        const rect = new DOMRect();
        this.getRect(rect);

        const [width, height] = [window.innerWidth, window.innerHeight];
        if (rect.width + x >= width) {
            x = width - rect.width;
        }
        else {
            x -= rect.width / 2;
        }
        if (rect.height + y >= height) {
            y = height - rect.height;
        }
        else {
            y -= rect.height / 2;
        }
        super.place(x, y);
    }
}

const TRANSLATOR_HTML = `
  <div id="GDInputBar">
            <!-- <input id="GDTextInput" type=text> --><a id="GDSourceLang" href="javascript:void(0)">源语言</a><span>-></span><a id="GDTargetLang" href="javascript:void(0)">目标语言</a>
  </div>
  <div id=GDResultBox>	
        <div id=GDTransContainer>
        
            <div id=GDPho>
                <!-- <span id=GDENText>英</span>  -->
                <span id=GDENPho></span>
                <!-- <span id=GDAMText>美</span> --> 
                <span id=GDAMPho></span>
            </div>
            <div id=GDSingleWord>
            <!-- 
                <div class=GDTrans>
                <span class=GDPart></span>
                <span class=GDMeaning></span>
                </div>
            -->
            </div>
            <div id=GDLongText>
            </div>
		</div>
  </div>
  <div id="GDLocale">
  </div>
 `
class Translator extends UIClass {
    constructor() {
        super("GDDict");

        this.initContent(TRANSLATOR_HTML);

        this.localeBox = this.$E("#GDLocale");

        for (const [code, name] of TranslatorService.LANGUAGE_CODE_MAP) {
            let a = document.createElement("a");
            a.href = "javascript:void(0)";
            a.textContent = name;
            a.setAttribute("code", code);
            this.localeBox.appendChild(a);
        }


        this.singleWord = this.$E("#GDSingleWord");
        this.longText = this.$E("#GDLongText");
        // this.input = this.$E("#GDInputBar input");
        //phonetic
        this.ENPho = this.$E("#GDENPho");
        this.AMPho = this.$E("#GDAMPho");


        this.beforeChangeLangCode = this.beforeChangeLangCode.bind(this);
        this.afterChangeLangCode = this.afterChangeLangCode.bind(this);
        this.$E("#GDSourceLang").addEventListener("click", this.beforeChangeLangCode);
        this.$E("#GDTargetLang").addEventListener("click", this.beforeChangeLangCode);
        this.$E("#GDLocale").addEventListener("click", this.afterChangeLangCode);

        this.addListener("keypress", e => {
            console.log(e);
            if (e.key === "Escape") {
                this.hide();
            }
        });

        document.body.addEventListener("mousedown", ({ button, target }) => {
            if (this.isHiding === true) return;
            let parent = target;
            while (parent) {
                if (parent === this.node) break; //点击自己，不隐藏
                else if (parent === document.body && button === 0) { this.hide(); break; }
                parent = parent.parentElement;
            }
        });

        this.sourceLangCode = "auto";
        this.targetLangCode = "auto";
    }


    get primaryProvider() {
        return "baidu";
    }

    beforeChangeLangCode({ target }) {
        this.$E("#GDLocale").style.setProperty("display", "grid", "important");
        this.$E("#GDLocale").dataset["sourceId"] = target.id;
        this.$E("#GDResultBox").style.setProperty("display", "none", "important");
    }

    afterChangeLangCode({ target }) {
        if (target.tagName !== "A") return;
        const code = target.getAttribute("code");
        const id = this.$E("#GDLocale").dataset["sourceId"];
        if (id === "GDSourceLang") {
            this.sourceLangCode = code;
        }
        else {
            this.targetLangCode = code;
        }
        this.$E("#GDLocale").style.setProperty("display", "none", "important");
        this.$E("#GDResultBox").style.setProperty("display", "block", "important");
    }

    get sourceLangCode() {
        return this.$E("#GDSourceLang").getAttribute("code") || "auto";
    }

    set sourceLangCode(code) {
        this.$E("#GDSourceLang").setAttribute("code", code);
        this.$E("#GDSourceLang").textContent = TranslatorService.LANGUAGE_CODE_MAP.get(code);
    }

    get targetLangCode() {
        return this.$E("#GDTargetLang").getAttribute("code") || "auto";
    }

    set targetLangCode(code) {
        this.$E("#GDTargetLang").setAttribute("code", code);
        this.$E("#GDTargetLang").textContent = TranslatorService.LANGUAGE_CODE_MAP.get(code);
    }

    translate(text) {
        this.status = "loading";

        for (const m of this.singleWord.querySelectorAll(".GDParts")) {
            this.singleWord.removeChild(m);
        }
        for (const m of this.singleWord.querySelectorAll(".GDMeaning")) {
            this.singleWord.removeChild(m);
        }

        this.singleWord.style.setProperty("display", "none", "important");
        this.longText.style.display = "none";

        this.longText.innerHTML = "";

        TranslatorService[this.primaryProvider].queryTrans(this.sourceLangCode, this.targetLangCode, text)
            .then(json => {
                //debugger;
                if (json.isLongText === true) {
                    this.longText.textContent = json.trans[0].meaning;
                    this.longText.style.display = "block";
                }
                else {
                    const fragment = document.createDocumentFragment();

                    // const div = document.createElement("div");
                    // div.className = "GDTrans";
                    const p = document.createElement("span");
                    p.className = "GDParts";
                    const m = document.createElement("span");
                    m.className = "GDMeaning";
                    // div.appendChild(p);
                    // div.appendChild(m);

                    for (const t of json.trans) {
                        // const cloned = div.cloneNode(true);
                        const clone_p = p.cloneNode(true);
                        const clone_m = m.cloneNode(true);
                        clone_p.textContent = t.part;
                        clone_m.textContent = t.meaning;
                        fragment.appendChild(clone_p);
                        fragment.appendChild(clone_m);
                    }

                    this.singleWord.appendChild(fragment);
                    this.ENPho.textContent = json.ph_en;
                    this.AMPho.textContent = json.ph_am;
                    this.status = "";
                    this.singleWord.style.setProperty("display", "grid", "important");
                }
                // input.focus();

            })
            .catch(error => {
                this.status = error;
                console.error(error);
            })
    }
    place(x, y) {
        this.place_fix(x, y);
    }
}