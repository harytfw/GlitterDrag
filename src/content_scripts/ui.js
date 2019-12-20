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
        if (!bgConfig.keepui) {
            this.node.remove();
        }
    }

    initContent(data) {
        if (typeof data === "string") {
            const parser = new DOMParser();
            const doc = parser.parseFromString(data, "text/html");
            while (doc.body.firstElementChild instanceof HTMLElement) {
                this.node.appendChild(doc.body.firstElementChild);
            }
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
        this.setStyleProperty("left", Math.max(0, x) + "px");
        this.setStyleProperty("top", Math.max(0, y) + "px");
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

    addListener(name = "", listener = () => { }, option) {
        this.node.addEventListener(name, listener, option)
    }

    removeListener(name = "", listener = () => { }, option) {
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

class Prompt extends UIClass { // eslint-disable-line no-unused-vars
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


class Indicator extends UIClass { // eslint-disable-line no-unused-vars
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
    mount() {
        if (bgConfig.enableIndicator === true) {
            super.mount();
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
    "ACT_DL": "GD-fa-download",
    "ACT_OPEN": "GD-fa-external-link",
    "ACT_SEARCH": "GD-fa-search",
    "ACT_COPY": "GD-fa-clipboard",
    "ACT_FIND": "GD-fa-find",
    "ACT_NONE": "GD-fa-ban",
    "BAN": "GD-fa-ban",
    "CUSTOM": "GD-fa-custom"
}

const PANEL_HTML = `
        <div id='GDPanelHeader'></div>
        <div id='GDPanelTextLabel'>${getI18nMessage("textType")}</div>
        <div id='GDPanelTextContent'></div>
        <div id='GDPanelGrid1' class='GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelGrid2' class='GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelGrid3' class='GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelGrid1a' class='GDPanelExtra  GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelGrid2a' class='GDPanelExtra GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelGrid3a' class='GDPanelExtra GDPanelGrid GDPanelTextGrid'></div>
        <div id='GDPanelLinkLabel'>${getI18nMessage("linkType")}</div>
        <div id='GDPanelLinkContent'></div>
        <div id='GDPanelGrid4' class='GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelGrid5' class='GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelGrid6' class='GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelGrid4a' class='GDPanelExtra GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelGrid5a' class='GDPanelExtra GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelGrid6a' class='GDPanelExtra GDPanelGrid GDPanelLinkGrid'></div>
        <div id='GDPanelImageLabel'>${getI18nMessage("imageType")}</div>
        <div id='GDPanelImageContent'></div>
        <div id='GDPanelGrid7' class='GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelGrid8' class='GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelGrid9' class='GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelGrid7a' class='GDPanelExtra GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelGrid8a' class='GDPanelExtra GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelGrid9a' class='GDPanelExtra GDPanelGrid GDPanelImageGrid'></div>
        <div id='GDPanelFooter' class='GDPanelGrid GD-fa ${ICONS.BAN}' ></div>
`
class Panel extends UIClass { //eslint-disable-line no-unused-vars
    constructor(listener = { dragenter: () => { }, dragleave: () => { }, drop: () => { }, dragover: () => { } }) {
        super("GDPanel", "div");
        this.displayValue = "grid";
        this.initContent(PANEL_HTML)
        this.header = this.$E("#GDPanelHeader");
        this.lastdragovertarget = null;
        this.listener = listener;
        this.addListener("drop", e => this.listener.drop(e, this.lastdragovertarget));
        this.addListener("dragenter", this.listener.dragenter);
        this.addListener("dragleave", (e) => {
            const target = e.target;
            if (target.id !== "GDPanel") {
                return;
            }
            // this.listener.dragleave(e);
            this.lastdragovertarget && this.lastdragovertarget.classList.remove("GDPanelGridHover");
            this.lastdragovertarget = this.$E("#GDPanelFooter");
            this.lastdragovertarget.classList.add("GDPanelGridHover");
            this.updateHeader(this.lastdragovertarget);
        });
        this.addListener("dragover", this.ondragover.bind(this));



        this.selection = "";
        this.textSelection = "";
        this.imageLink = "";
        this.actionType = null;

        this.updatedFlag = false;


        this.extraCommands = ["#GDPanelGrid1a", "#GDPanelGrid2a", "#GDPanelGrid3a", "#GDPanelGrid4a", "#GDPanelGrid5a", "#GDPanelGrid6a", "#GDPanelGrid7a", "#GDPanelGrid8a", "#GDPanelGrid9a"].map(id => this.$E(id));
    }
    ondragover(e) {
        let target = e.target;
        if (this.lastdragovertarget === target) {
            return;
        }
        if (!e.target.classList.contains("GDPanelGrid")) {
            target = target.parentElement;
        }
        if (target && target.classList.contains("GDPanelGrid")) {
            this.lastdragovertarget && this.lastdragovertarget.classList.remove("GDPanelGridHover");
            this.lastdragovertarget = target;
            this.lastdragovertarget.classList.add("GDPanelGridHover");
            this.updatedFlag && this.updateHeader(target);

        }
    }



    drawingIcon(ctx, iconChar, CSS) {
        function setContextStyle() {
            ctx.textBaseline = 'top';
            ctx.textAlign = 'left'
            ctx.fillStyle = CSS.color;
            ctx.font = `${CSS.getPropertyValue('--font-size')} ${CSS.fontFamily}`;
        }
        //remove the unit
        const val = 48; //the size of canvas;
        const canvas = ctx.canvas;
        //reset width and height
        canvas.width = canvas.height = val;
        //assume canvas is in square shape,then clear the whole canvas
        ctx.clearRect(0, 0, val, val);
        //set the style
        setContextStyle(ctx);
        //measure the actaul width
        const obj = ctx.measureText(iconChar);
        if (obj.width > val) {
            //assign the actual width
            canvas.width = obj.width;
            canvas.height = canvas.width;
        }
        setContextStyle(ctx);

        //drawtext
        ctx.fillText(iconChar, 1, 1);
    }

    update() {
        const that = this;

        // eslint-disable-next-line no-unused-vars
        function _getIcon(grid) {
            that.drawingIcon(ctx, getIconCode(grid), CSS);
            return canvas.toDataURL();
        }

        function getIconCode(grid) {
            const CSS = window.getComputedStyle(grid);
            let code = CSS.getPropertyValue('--icon');
            code = code.match(/\s*\\([\w\d]+)\s*/i)[1];
            code = String.fromCharCode(parseInt(code, 16));
            return code;
        }

        const map = {
            "text": [".GDPanelTextGrid", "Panel_textAction"],
            "link": [".GDPanelLinkGrid", "Panel_linkAction"],
            "image": [".GDPanelImageGrid", "Panel_imageAction"],
        }

        const canvas = document.createElement("canvas");
        // canvas.style.width = "52px";
        // canvas.style.height = "52px";
        // document.body.appendChild(canvas);
        const ctx = canvas.getContext('2d');

        for (const kind of Object.keys(map)) {
            const [selector, confKey] = map[kind];
            let index = 0;
            for (let grid of this.$A(selector)) {
                grid.dataset["kind"] = kind;
                grid.dataset["key"] = confKey;
                grid.dataset["index"] = index;
                const act_name = bgConfig[confKey][index]["act_name"];
                let icon = bgConfig[confKey][index]["icon"];

                if (icon === "") {
                    grid.classList.add("GD-fa");
                    grid.classList.add(ICONS[act_name]);
                    // icon = getIcon(grid);
                    const span = document.createElement('span');
                    span.textContent = getIconCode(grid);
                    grid.appendChild(span);
                }
                else {
                    grid.style.backgroundImage = `url(${icon})`;
                }
                index++;
            }
        }
        const grid = this.$E('#GDPanelFooter');
        const span = document.createElement('span');
        span.textContent = getIconCode(grid);
        grid.appendChild(span);
    }


    updateHeader(target) {
        if (target.id === "GDPanelFooter") {
            this.header.textContent = getI18nMessage("panel_Cancel"); //getI18nMessage("Cancel");
            return;
        }
        const setting = bgConfig[target.dataset["key"]][target.dataset["index"]];
        const tips = setting["panel_tips"];
        // eslint-disable-next-line 
        if (typeof tips === typeof "") {
            this.header.textContent = util.translatePrompt(tips, setting, this.actionType, this.selection);
        }
        else this.header.textContent = util.translatePrompt("%g-%a", setting);


    }

    render(actionkind, targetkind, selection, textSelection, imageLink) {
        function trim(str = "", len1 = 6, len2 = 6, maxlen = 12) {
            if (str.length <= maxlen) return str;
            return `${str.substr(0, len1)}...${str.substr(str.length - len2, len2)}`
        }

        this.actionType = actionkind;
        this.selection = selection;
        this.textSelection = textSelection;
        this.imageLink = imageLink;

        this.node.className = "";

        this.displayTextGrids("none", true);
        this.displayLinkGrids("none", true);
        this.displayImageGrids("none", true);

        let suffix = "";
        if (bgConfig.extraCommands) {
            suffix = "-6";
        }

        switch (actionkind) {
            case commons.textAction:
                this.node.classList.add("GDPanelOnlyText" + suffix);
                this.textContent = trim(textSelection);
                this.displayTextGrids("", bgConfig.extraCommands);
                break;
            case commons.linkAction:
                if (bgConfig.alwaysImage) {
                    this.node.classList.add("GDPanelOnlyImage" + suffix);
                    this.imageContent = trim(imageLink);
                    this.displayImageGrids("", bgConfig.extraCommands);
                    this.displayTextGrids("", bgConfig.extraCommands);
                }
                else if (targetkind === commons.TYPE_ELEM_A_IMG) {
                    this.imageContent = trim(imageLink);
                    this.linkContent = trim(selection);
                    if (bgConfig.extraCommands) {
                        this.node.classList.add("GDPanelOnlyImage-6");
                        this.displayImageGrids("", true);
                    }
                    else {
                        this.node.classList.add("GDPanelLinkAndImage");
                        this.displayLinkGrids("", false);
                        this.displayImageGrids("", false);
                    }
                }
                else {

                    this.textContent = trim(textSelection);
                    this.linkContent = trim(selection);
                    if (bgConfig.extraCommands) {
                        this.node.classList.add("GDPanelOnlyLink-6");
                        this.displayLinkGrids("", true);
                    }
                    else {
                        this.node.classList.add("GDPanelTextAndLink");
                        this.displayTextGrids("", false);
                        this.displayLinkGrids("", false);
                    }
                }
                break;
            case commons.imageAction:
                this.node.classList.add("GDPanelOnlyImage" + suffix);
                this.imageContent = trim(imageLink);
                this.displayImageGrids("", bgConfig.extraCommands);
                break;
            default:
                break;
        }
    }

    set textContent(data) {
        this.$E("#GDPanelTextContent").textContent = data
        this.textTitle = data;
    }

    set linkContent(data) {
        this.$E("#GDPanelLinkContent").textContent = data;
    }
    set imageContent(data) {
        this.$E("#GDPanelImageContent").textContent = data;
    }

    displayTextGrids(value = "", isAll = false) {
        $H(["#GDPanelTextLabel", "#GDPanelTextContent"], value, this.node);
        if (!isAll) {
            $H(["#GDPanelGrid1", "#GDPanelGrid2", "#GDPanelGrid3"], value, this.node);
        }
        else {
            $H(["#GDPanelGrid1", "#GDPanelGrid2", "#GDPanelGrid3"], value, this.node);
            $H(["#GDPanelGrid1a", "#GDPanelGrid2a", "#GDPanelGrid3a"], value, this.node);
        }
    }
    displayLinkGrids(value = "", isAll = false) {
        $H(["#GDPanelLinkLabel", "#GDPanelLinkContent"], value, this.node);
        if (!isAll) {
            $H(["#GDPanelGrid4", "#GDPanelGrid5", "#GDPanelGrid6"], value, this.node);
        }
        else {
            $H(["#GDPanelGrid4", "#GDPanelGrid5", "#GDPanelGrid6"], value, this.node);
            $H(["#GDPanelGrid4a", "#GDPanelGrid5a", "#GDPanelGrid6a"], value, this.node);
        }
    }
    displayImageGrids(value = "", isAll = false) {
        $H(["#GDPanelImageLabel", "#GDPanelImageContent"], value, this.node);
        if (!isAll) {
            $H(["#GDPanelGrid7", "#GDPanelGrid8", "#GDPanelGrid9"], value, this.node);
        }
        else {
            $H(["#GDPanelGrid7", "#GDPanelGrid8", "#GDPanelGrid9"], value, this.node);
            $H(["#GDPanelGrid7a", "#GDPanelGrid8a", "#GDPanelGrid9a"], value, this.node);

        }
    }

    place(x = 0, y = 0, direction = "") {
        const rect = new DOMRect();
        this.getRect(rect);

        switch (direction) {
            case commons.DIR_U:
                x -= rect.width / 2;
                y -= rect.height;
                break;
            case commons.DIR_D:
                x -= rect.width / 2;
                break;
            case commons.DIR_UP_L:
                x -= rect.width;
                y -= rect.height / 2;
                x *= 1.05;
                break;
            case commons.DIR_LOW_L:
                x -= rect.width / 2;
                // y *= 0.9;
                break;
            case commons.DIR_L:
                y -= rect.height / 2;
                x -= rect.width;
                break;
            case commons.DIR_UP_R:
                y -= rect.height / 2;
                x *= 0.95;
                break;
            case commons.DIR_LOW_R:
                x -= rect.width / 2;
                // y *= 0.9;
                break;
            case commons.DIR_R:
                y -= rect.height / 2;
                break;
            default:
                break;
        }

        const [width, height] = [window.innerWidth, window.innerHeight];
        if (x < 0) x = 0;
        else if (rect.width + x >= width) {
            x = width - rect.width;
        }
        if (y < 0) y = 0;
        else if (rect.height + y >= height) {
            y = height - rect.height;
        }
        super.place(x, y);
    }
    mount() {
        super.mount();
        if (!this.updatedFlag) {
            this.updatedFlag = true;
            this.update();
        }
    }
}

const TRANSLATOR_HTML = `
  <div id="GDInputBar">
            <!-- <input id="GDTextInput" type=text> --><a id="GDSourceLang" href="javascript:void(0)"></a><span>-></span><a id="GDTargetLang" href="javascript:void(0)"></a>
            <a href="javascript:void(0)" id="GDProviderName" provider=""></a>
  </div>
  <div id=GDResultBox>	
        <div id=GDTransContainer>
        
            <div id=GDPho>
                <!-- <span id=GDENText></span>  -->
                <span id=GDENPho></span>
                <!-- <span id=GDAMText></span> --> 
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
class Translator extends UIClass { //eslint-disable-line no-unused-vars
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

        document.addEventListener("mousedown", ({ button, target }) => {
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
                    if (json.ph_en) {
                        this.ENPho.style.display = "";
                        this.ENPho.textContent = json.ph_en;
                    }
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
    mount() {
        super.mount();
        this.node.focus();
    }
}