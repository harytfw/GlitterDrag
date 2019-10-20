
// eslint-disable-next-line no-unused-vars
class DownloadWrapper {
    constructor() {
        const dirCount = 8;
        this.directories = null;
        browserStorage.get("downloadDirectories").then(res => {
            this.directories = res["downloadDirectories"];
            const tab = document.querySelector("#tab-download");

            eventUtil.attachEventS("#showDefaultDownloadDirectory", () => {
                browser.downloads.showDefaultFolder();
            })
            eventUtil.attachEventS("#savebtnOnDownloadDirectories", () => {
                document.querySelectorAll(".directory-entry>:nth-child(2)").forEach((el, index) => {
                    this.directories[index] = el.value;
                });
                browserStorage.set({
                    "downloadDirectories": this.directories
                });
                // e.target.setAttribute("disabled", "true");
            })
            const node = document.importNode(document.querySelector("#template-for-directory-entry").content, true);
            const entry = node.querySelector(".directory-entry");

            for (let i = 0; i < dirCount; i++) {
                const cloned = entry.cloneNode(true);
                cloned.querySelector("input:nth-child(1)").value = browser.i18n.getMessage("DownloadDirectory", i);
                cloned.querySelector("input:nth-child(2)").value = this.directories[i] || "";
                tab.appendChild(cloned);
            }

            const cloned = entry.cloneNode(true);
            cloned.firstElementChild.value = getI18nMessage("elem_CustomDirectory");
            cloned.lastElementChild.remove();
            const codearea = document.createElement("textarea");
            codearea.id = ""
            codearea.value = this.directories[8];
            cloned.appendChild(codearea);
            tab.appendChild(cloned);
        });
    }
    onChange() {
        $E("#SavebtnOnDownloadDirectories").removeAttribute("disabled");
    }
    onSaveBtnClick() {
        // const index = event.target.getAttribute("index");
        // this.directories[index] = event.target.previousElementSibling.value;
        // config.set("downloadDirectories", this.directories);
    }
}
