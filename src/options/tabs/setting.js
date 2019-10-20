
class generalSettingWrapper {
    constructor() {
        if (browserMajorVersion >= 53) {
            $E("#enableSync").removeAttribute("disabled");
        }
        browserStorage.get("tipsContent").then(res => {
            const el = $E("#tipsContentSelect");
            const input = $E("#tipsContentInput");
            const content = res["tipsContent"];
            input.addEventListener("change", ({
                target
            }) => {
                let val = target.value.replace(/\\n/g, "\n");
                content[el.value] = val;
                browserStorage.set({
                    "tipsContent": content
                });
            });
            el.addEventListener("change", (e) => {
                input.value = content[e.target.value].replace(/\n/g, "\\n");
                input.setAttribute("data-id", e.target.value);
            });
            el.selectedIndex = 1;
            input.value = content[el.value].replace(/\n/g, "\\n");
            // el.dispatchEvent(new Event("change"));
        });

        browserStorage.get("specialHosts").then(res => {
            const el = $E("#specialHosts");
            el.value = res["specialHosts"].join(",");
            el.addEventListener("change", () => {
                const content = el.value.split(",");
                browserStorage.set({
                    "specialHosts": content
                });
            })
        });

        browserStorage.get("allowExts").then(res => {
            const el = $E("#allowExts");
            el.value = res["allowExts"].join(",");
            el.addEventListener("change", () => {
                const content = el.value.split(",");
                browserStorage.set({
                    "allowExts": content
                });
            })
        });

        $E("#tab-general-setting").addEventListener("change", evt => {
            if (evt.target.getAttribute("not-config") !== null) return; //特殊处理
            const stored = {};
            stored[evt.target.id] = undefined;
            if (evt.target.type === "checkbox") stored[evt.target.id] = evt.target.checked;
            else if (evt.target.type === "number") stored[evt.target.id] = parseInt(evt.target.value);
            else stored[evt.target.id] = evt.target.value;
            browserStorage.set(stored).then(() => {
                $D("修改设置：", stored);
            }).catch((e) => {
                console.error(e);
            });
        });
        this.initSetting();
    }
    async initSetting() {
        for (let elem of $A("#tab-general-setting input[id]")) {
            if (elem.getAttribute("not-config") !== null) continue; //特殊处理
            if (elem.type === "file") return;
            if (elem.type === "checkbox") {
                elem.checked = (await browserStorage.get(elem.id))[elem.id];
            }
            else elem.value = (await browserStorage.get(elem.id))[elem.id];
        }
    }
}
