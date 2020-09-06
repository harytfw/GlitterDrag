

const CHINESE_UNICODE_RANGE = [
    [0x2E80, 0x2EFF], // https://unicode-table.com/en/blocks/cjk-radicals-supplement/
    [0x3400, 0x4DBF], // https://unicode-table.com/en/blocks/cjk-unified-ideographs-extension-a/
    [0x4E00, 0x9FFF], // https://unicode-table.com/en/blocks/cjk-unified-ideographs/
    [0xF900, 0xFAFF], // https://unicode-table.com/en/blocks/cjk-compatibility-ideographs/
    [0x20000, 0x2A6DF], // https://unicode-table.com/en/blocks/cjk-unified-ideographs-extension-b/
];
class QueryWindow {

    static isSingleChineseChar(char = "") {
        if (char.length !== 1) {
            return false;
        }
        const code = char.codePointAt(0);
        for (const range of CHINESE_UNICODE_RANGE) {
            if (code >= range[0] && code <= range[1]) {
                return true;
            }
        }

        return false;
    }

    static isChinese(text) {
        for (const c of text) {
            if (!this.isSingleChineseChar(c)) {
                return false;
            }
        }
        return true;
    }


    static get PATH() {
        return "content_scripts/component/query_window";
    }

    constructor() {

        logUtil.log("init query window", this);

        this.container = document.createElement("div");

        this.root = this.container.attachShadow({
            mode: "closed",
        });
        this.root.addEventListener("click", (e) => {
            const target = queryUtil.findEventElem(e.target);
            if (target instanceof HTMLElement) {
                logUtil.log("data-event:", target.dataset.event);
                switch (target.dataset.event) {
                    case "close":
                        this.remove();
                        break;
                    default:
                        logUtil.log("unhandled", target);
                        break;
                }
            }
        })

        this.box = null;
        fetch(browser.runtime.getURL(`${QueryWindow.PATH}/html/window.html`))
            .then(r => r.text())
            .then(html => {
                this.root.innerHTML = html;
                this.box = this.root.querySelector("#main-box");
                this.root.querySelector("#bulma").href = browser.runtime.getURL("libs/bulma/bulma.min.css");
                this.root.querySelector("#css").href = browser.runtime.getURL(`${QueryWindow.PATH}/css/window.css`);
            });

        this.services = {
            bingDict: new BingDict(),
            chineseDict: new ChineseDict(),
        };

        browser.runtime.onMessage.addListener((msg, sender) => {
            logUtil.log("get message", msg);
            if (msg.msgCmd === "activeQueryWindow") {
                logUtil.log("get activeQueryWindow message, text: ", msg.text);
                this.active();
                this.query(msg.text);
            }
        });
    }

    active() {
        logUtil.log("active queryWindow");
        document.body.appendChild(this.container);
    }

    remove() {
        if (globalThis.autoHide) {
            logUtil.log("close queryWindow");
            this.container.remove();
        }
    }

    query(text) {
        if (QueryWindow.isChinese(text)) {
            this.services.chineseDict.query(this.box, text);
        } else {
            this.services.bingDict.query(this.box, text);
        }
    }
}

var queryWindow = new QueryWindow();
