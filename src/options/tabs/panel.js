
// eslint-disable-next-line no-unused-vars
class PanelWrapper {
    constructor() {
        this.cmdType = null;
        this.cmdIndex = null;
        this.dontsave = false;

        this.actionTypeGetter = this.actionTypeGetter.bind(this);
        this.category = new ActionsView($E("#panel-actions"), this.actionTypeGetter);
        this.category.parent.style.display = "none";

        $E("#panel-buttons").addEventListener("click", e => {
            if (e.target.nodeName === "BUTTON") {
                this.load(e);
            }
        });

        this.regEvent();
    }
    async regEvent() {

        $E("#panel-actions").addEventListener("change", e => this.onchange(e));

        $E("#getIconFromEngine").addEventListener("click", () => {
            this.refreshIcon();
            this.onchange();
        });
        $E("#iconChooser").addEventListener("change", async ({ target }) => {
            const files = target.files;
            if (!files[0]) return;
            const reader = new FileReader();
            reader.addEventListener("load", () => {
                this.imgSrc = this.iconData = reader.result;
                this.onchange();
            })
            reader.readAsDataURL(files[0]);
        })
        $E("#getIconFromLocal").addEventListener("click", () => {
            $E("#iconChooser").click();
        });
        $E("#getIconFromURL").addEventListener("click", () => {
            let url = prompt();
            if (url && url.length && url.length > 0) {
                try {
                    new URL(url);
                    fetch(url).then(res => res.blob()).then(blob => {
                        const reader = new FileReader();
                        reader.onload = () => {
                            this.imgSrc = this.iconData = reader.result;
                            this.onchange();
                        }
                        reader.readAsDataURL(blob);
                    })
                }
                catch (e) { alert(e) }
            }
        })
        $E(".panel-icon").addEventListener("change", e => {
            this.imgSrc = e.target.value;
        });

        (async () => {
            const f = (target) => {
                browserStorage.set({ "extraCommands": Boolean(target.checked) });
                const els = target.parentElement.querySelectorAll(`[index="3"],[index="4"],[index="5"]`);
                const val = target.checked ? "" : "none";
                for (const el of els) {
                    el.style.display = val;
                }
                this.category.parent.style.display = "none";
            }
            $E("#extraCommands").checked = Boolean((await browserStorage.get("extraCommands"))["extraCommands"]);
            $E("#extraCommands").addEventListener("change", ({ target }) => { f(target) });
            f($E("#extraCommands"))
        })();
    }
    async load(e) {
        // 清空搜索引擎图标内容，因为 reload 之后不能确定当前的引擎是否时跟已有的引擎匹配
        this.category.$E(".search-engine-icon").value = "";


        this.category.parent.style.display = "none";
        if (e.target.className.indexOf("text") >= 0) {
            this.cmdType = "Panel_textAction";
        }
        else if (e.target.className.indexOf("link") >= 0) {
            this.cmdType = "Panel_linkAction";
        }
        else {
            this.cmdType = "Panel_imageAction";
        }
        this.cmdIndex = e.target.getAttribute("index");

        const res = await browserStorage.get(this.cmdType);
        this.dontsave = true;
        this.setting = res[this.cmdType][this.cmdIndex];
        this.applyButtonVisible(res[this.cmdType][this.cmdIndex]);
        this.category.parent.style.display = "block";
        this.dontsave = false;
    }

    async onchange() {
        const setting = this.setting;
        if (!this.dontsave) {
            //先获取再保存
            $D("Save panel setting：");
            $D(setting);
            await browserStorage.get(this.cmdType).then(r => {
                r[this.cmdType][this.cmdIndex] = setting;
                browserStorage.set(r);
            });
        }
        this.applyButtonVisible(setting);
    }

    async applyButtonVisible(data) {
        const node = this.category.$E("#getIconFromEngine")
        if (data["act_name"] === commons.ACT_SEARCH) {
            node.style.display = "";
            if (this.category.$E(".search-engine-icon").value.length) {
                node.classList.remove("disabled")
                node.disabled = false;
            }
            else {
                node.classList.add("disabled")
                node.disabled = true;
            }
        }
        else {
            node.style.display = "none";
        }
    }


    async refreshIcon() {
        this.imgSrc = this.iconData = this.category.$E(".search-engine-icon").value;
    }

    set setting(data) {
        this.category.setting = data;
        this.imgSrc = this.iconData = data["icon"];
        this.category.$E(".panel-tips").value = data["panel_tips"];
    }

    get setting() {
        const data = this.category.setting;
        data["icon"] = this.iconData;
        data["panel_tips"] = this.category.$E(".panel-tips").value;
        return data;
    }

    get isBrowserSearch() {
        return this.category.$E(".search-engine-is-browser-search").value === "true";
    }

    set imgSrc(src) {
        if (src.length === 0) {
            this.category.$E("#imgIcon").style.border = "";
        }
        else {
            this.category.$E("#imgIcon").style.border = "1px dotted #000";
        }
        this.category.$E("#imgIcon").src = src;
    }
    get imgSrc() {
        return this.category.$E("#imgIcon").src;
    }

    set iconData(data) {
        this.category.$E(".panel-icon").value = data;
    }

    get iconData() {
        return this.category.$E(".panel-icon").value
    }
    actionTypeGetter() {
        return this.cmdType.split("_")[1];
    }
}

