"use strict";
var frameBridge = {};
var hostBridge = {};

const UUID = browser.runtime.getURL("");
{
    const isTop = window.top === window.self;

    if (!isTop) {
        window.addEventListener("message", (e) => {
            if (typeof e.data !== "object") { return; }
            const { key, cmd, args } = e.data;
            if (UUID !== key) {
                console.error("key not match");
                return;
            }
            if (!Array.isArray(args)) {
                console.error("args must be an array");
                return;
            }
            console.log("handle cmd", cmd);
            switch (cmd) {
                case "executeJS":
                    executeJS(...args);
                    break;
                case "injectCSS":
                    injectCSS(...args);
                    break;
                case "removeCSS":
                    removeCSS(...args);
                    break;
                default:
                    console.warn(`can not execute command "${cmd}"`);
                    break;
            }
        }, false);
    }

    const WARN = "bridge frame api is called from top window";

    const executeJS = (js) => {
        if (isTop) {
            console.warn(WARN);
        }
        const script = document.createElement("script");
        script.type = "application/javascript";
        script.textContent = js;
        document.body.appendChild(script);
        console.log("frame bridge", "execute JS", script);
    };

    const injectCSS = (id, css) => {
        console.log("injectCSS");
        if (isTop) {
            console.warn(WARN);
        }
        const style = document.createElement("style");
        style.textContent = css;
        style.id = id;
        document.head.appendChild(style);
        console.log("frame bridge", "inject css", style);
    };

    const removeCSS = (id) => {
        if (isTop) {
            console.warn(WARN);
        }

        const style = document.querySelector(`#${id}`);
        if (style) {
            console.log("frame bridge", "remove style", style);
            style.remove();
        }
    };

    frameBridge.executeJS = executeJS;
    frameBridge.injectCSS = injectCSS;
    frameBridge.removeCSS = removeCSS;
}

{
    const executeJS = (frame, js) => {
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "executeJS",
            args: [js],
        }, "*");
    };

    const injectCSS = (frame, id, css) => {
        console.log("host injectCSS");
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "injectCSS",
            args: [id, css],
        }, "*");
    };

    const removeCSS = (frame, id) => {
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "removeCSS",
            args: [id],
        }, "*");
    };

    hostBridge.executeJS = executeJS;
    hostBridge.injectCSS = injectCSS;
    hostBridge.removeCSS = removeCSS;

}
