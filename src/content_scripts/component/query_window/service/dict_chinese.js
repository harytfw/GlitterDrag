/**
 * http://zidian.aies.cn/?q=%E5%AD%97
 */

class ChineseDict {

    get name() {
        return "新华字典";
    }

    constructor() {

    }

    buildQueryURL(keyword) {
        return `https://www.zdic.net/hans/${keyword}`;
    }

    /**
     * @param {HTMLIFrameElement} iframe
     */

    async query(container, keyword) {
        logUtil.log("chinese dict query", container, keyword);

        let iframe = container.querySelector("#dict");
        if (!(iframe instanceof HTMLIFrameElement)) {
            iframe = document.createElement("iframe");
            iframe.id = "dict";
            iframe.setAttribute("style", "height:100%;width:100%;");
            container.appendChild(iframe);
        }
        const url = this.buildQueryURL(keyword);
        iframe.src = url;
    }

}
