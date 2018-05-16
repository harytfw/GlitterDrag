class BaseUIClass {
    constructor(node = document.body) {
        this.node = node;
        this._rect = new DOMRect();

        this.displayValue = "block";
    }

    $E(s = "", context = this.node) {
        return context.querySelector(s);
    }

    $A(s = "", context = this.node) {
        return context.querySelectorAll(s);
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

    //修复div溢出窗口的情况+设置div的中心为x,y
    place_fix(x = 0, y = 0) { //TODO translatorBox在超出窗口位置后有一半在窗口外
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
        // if (this.node.parentElement instanceof Node) this.remove();
        this.setDisplayProperty("none");
    }

    display() {
        this.setDisplayProperty(this.displayValue);
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

class UIClass extends BaseUIClass {
    constructor(id = "", tag = "div") {
        super(document.createElement(tag));
        this.id = id;
        if (this.id !== "") this.node.id = id;
        this.removePreviousOne();
    }

    removePreviousOne() {
        if (this.id !== "") {
            const p = this.$E("#" + this.id, document);
            if (p instanceof Node) {
                p.remove();
            }
        }
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
            this.header.textContent = getI18nMessage("panel_Cancel"); //getI18nMessage("Cancel");
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
            <a href="javascript:void(0)" id="GDProviderName" provider=""></a>
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
  <div id="GDProvider">
  </div>
 `
class Translator extends UIClass {
    constructor() {
        super("GDDict");

        this.initContent(TRANSLATOR_HTML);

        this.localeBox = new BaseUIClass(this.$E("#GDLocale"));
        this.localeBox.displayValue = "grid";
        this.resultBox = new BaseUIClass(this.$E("#GDResultBox"));
        for (const [code, name] of TranslatorService.LANGUAGE_CODE_MAP) {
            let a = document.createElement("a");
            a.href = "javascript:void(0)";
            a.textContent = name;
            a.setAttribute("code", code);
            this.localeBox.node.appendChild(a);
        }
        this.providerBox = new BaseUIClass(this.$E("#GDProvider"));
        for (const name of TranslatorService.PROVIDER_LIST) {
            let a = document.createElement("a");
            a.href = "javascript:void(0)";
            a.textContent = getI18nMessage("Provider_" + name);
            a.setAttribute("provider", name);
            this.providerBox.node.appendChild(a);
        }

        this.singleWord = new BaseUIClass(this.$E("#GDSingleWord"));
        this.longText = new BaseUIClass(this.$E("#GDLongText"));
        this.phonetic = new BaseUIClass(this.$E("#GDPho"));
        this._provider = this.$E("#GDProviderName");
        //phonetic
        this.ENPho = this.$E("#GDENPho");
        this.AMPho = this.$E("#GDAMPho");

        this.beforeChangeLangCode = this.beforeChangeLangCode.bind(this);
        this.afterChangeLangCode = this.afterChangeLangCode.bind(this);
        this.$E("#GDSourceLang").addEventListener("click", this.beforeChangeLangCode);
        this.$E("#GDTargetLang").addEventListener("click", this.beforeChangeLangCode);
        this.localeBox.addListener("click", this.afterChangeLangCode);

        this._provider.addEventListener("click", () => {
            this.localeBox.hide();
            this.resultBox.hide();
            this.providerBox.setDisplayProperty("grid");
        })
        this.providerBox.addListener("click", ({ target }) => {
            if (target.tagName !== "A") return;
            this.providerBox.setDisplayProperty("none");
            this.provider = target.getAttribute("provider");
            this.saveLangCodeAndProvider();
            this.translate(this._text);
        });

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
        this.targetLangCode = bgConfig.translator.recent_targetlang;
        this.sourceLangCode = bgConfig.translator.recent_sourcelang;
        this.provider = bgConfig.translator.primary_provider;
        this._text = "";
    }



    beforeChangeLangCode({ target }) {
        this.localeBox.display();
        this.localeBox.node.dataset["sourceId"] = target.id;
        this.resultBox.hide();
        this.providerBox.hide();
    }

    async afterChangeLangCode({ target }) {
        if (target.tagName !== "A") return;
        const code = target.getAttribute("code");
        const id = this.localeBox.node.dataset["sourceId"];
        if (id === "GDSourceLang") {
            this.sourceLangCode = code;
        }
        else {
            this.targetLangCode = code;
        }
        this.saveLangCodeAndProvider();
        this.localeBox.hide();
        await this.translate(this._text);
        this.resultBox.display();
    }

    get sourceLangCode() {
        return this.$E("#GDSourceLang").getAttribute("code") || "";
    }

    set sourceLangCode(code) {
        if (code == this.sourceLangCode) {
            return;
        }
        this.$E("#GDSourceLang").setAttribute("code", code);
        this.$E("#GDSourceLang").textContent = TranslatorService.LANGUAGE_CODE_MAP.get(code);
    }

    get targetLangCode() {
        return this.$E("#GDTargetLang").getAttribute("code") || "";
    }

    set targetLangCode(code) {
        if (code == this.targetLangCode) {
            return;
        }
        this.$E("#GDTargetLang").setAttribute("code", code);
        this.$E("#GDTargetLang").textContent = TranslatorService.LANGUAGE_CODE_MAP.get(code);
    }

    set provider(name) {
        if (!TranslatorService.PROVIDER_LIST.includes(name)) {
            name = "google"; //fallback
        }
        this._provider.setAttribute("provider", name);
        this._provider.textContent = getI18nMessage("provider_" + name);
    }

    get provider() {
        return this._provider.getAttribute("provider");
    }

    saveLangCodeAndProvider() {
        browser.storage.local.get("translator").then(data => {
            data["translator"]["recent_targetlang"] = this.targetLangCode;
            data["translator"]["recent_sourcelang"] = this.sourceLangCode;
            data["translator"]["primary_provider"] = this.provider;
            browser.storage.local.set(data);
        });
    }

    translate(text) {
        this._text = text;
        this.status = "loading";

        for (const m of this.singleWord.$A(".GDParts")) {
            this.singleWord.node.removeChild(m);
        }
        for (const m of this.singleWord.$A(".GDMeaning")) {
            this.singleWord.node.removeChild(m);
        }

        this.singleWord.hide();
        this.longText.hide();
        this.phonetic.hide();
        return TranslatorService[this.provider].queryTrans(this.sourceLangCode, this.targetLangCode, text)
            .then(json => {
                //debugger;
                if (json.type === TranslatorService.RESULT_TYPE.SENTENCE) {
                    this.longText.node.textContent = json.trans[0].meaning;
                    this.longText.display();
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

                    this.singleWord.node.appendChild(fragment);
                    if (json.ph_en) { this.ENPho.style.display = "";this.ENPho.textContent = json.ph_en; }
                    else { this.ENPho.style.display = "none"; }
                    this.AMPho.textContent = json.ph_am;
                    this.status = "";
                    this.singleWord.setDisplayProperty("grid");
                    this.phonetic.display();
                }
                this.resultBox.display();
            })
            .catch(error => {
                this.status = "unknown error occured,please check the console";
                console.error(error);
            })
    }
    place(x, y) {
        this.place_fix(x, y);
    }
}