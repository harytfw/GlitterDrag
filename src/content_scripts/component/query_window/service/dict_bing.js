
class BingDict {

    get name() {
        return "Bing Dictionary";
    }

    constructor() {

    }

    buildQueryURL(keyword) {
        return `https://cn.bing.com/dict/search?q=${keyword}`;
    }
    /**
     * @param {HTMLIFrameElement} iframe
     */
    async tailor(iframe) {
        const res = await fetch(browser.runtime.getURL("/content_scripts/component/query_window/css/tailor_dict_bing.css"));
        const css = await res.text();
        hostBridge.injectStyle(iframe, "tailor", css);
    }
    async query(container, keyword) {
        logUtil("bing dict query", container, keyword);

        let iframe = container.querySelector("#dict");
        if (!(iframe instanceof HTMLIFrameElement)) {
            iframe = document.createElement("iframe");
            iframe.id = "dict";
            iframe.setAttribute("style", "height:100%;width:100%;");
            container.appendChild(iframe);
        }
        const url = this.buildQueryURL(keyword);
        iframe.style.opacity = "0";
        iframe.addEventListener("load", () => {
            logUtil("iframe load");
            this.tailor(iframe);
            hostBridge.injectScript(iframe, "window.scrollTo(0,0)");
            iframe.style.opacity = "1";
        }, { once: true });
        iframe.src = url;
    }

}
