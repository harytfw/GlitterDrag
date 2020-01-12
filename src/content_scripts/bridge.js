"use strict";
var frameBridge = {};
var hostBridge = {};

const UUID = browser.runtime.getURL("");
const isTop = window.top === window.self;
const validateMessage = (key, args) => {
    if (UUID !== key) {
        consoleUtil.error("key not match");
        return false;
    }
    if (!Array.isArray(args)) {
        consoleUtil.error("args must be an array");
        return false;
    }
    return true;
};

{


    if (!isTop) {
        window.addEventListener("message", (e) => {
            if (typeof e.data !== "object") { return; }
            const { key, cmd, args } = e.data;
            if (!validateMessage(key, args)) {
                return;
            }
            consoleUtil.log("handle cmd", cmd);
            switch (cmd) {
                case "injectScript":
                    injectScript(...args);
                    break;
                case "injectStyle":
                    injectStyle(...args);
                    break;
                case "removeStyle":
                    removeStyle(...args);
                    break;
                default:
                    consoleUtil.warn(`can not find command "${cmd}" in frame bridge`);
                    break;
            }
        }, false);
    }

    const WARN = "attempt to call bridge frame api from top window";

    const injectScript = (js) => {
        if (isTop) {
            consoleUtil.warn(WARN);
        }
        const script = document.createElement("script");
        script.type = "application/javascript";
        script.textContent = js;
        document.body.appendChild(script);
        consoleUtil.log("frame bridge", "inject script", script);
    };

    const injectStyle = (id, css) => {
        consoleUtil.log("injectStyle");
        if (isTop) {
            consoleUtil.warn(WARN);
        }
        const style = document.createElement("style");
        style.textContent = css;
        style.id = id;
        document.head.appendChild(style);
        consoleUtil.log("frame bridge", "inject css", style);
    };

    const removeStyle = (id) => {
        if (isTop) {
            consoleUtil.warn(WARN);
        }

        const style = document.querySelector(`#${id}`);
        if (style) {
            consoleUtil.log("frame bridge", "remove style", style);
            style.remove();
        }
    };

    const onCallbackStart = (...args) => {
        if (isTop) {
            consoleUtil.warn(WARN);
        }
        window.top.postMessage({
            key: UUID,
            cmd: "onCallbackStart",
            args: args,
        }, "*");
    };

    const onCallbackMove = (...args) => {
        if (isTop) {
            consoleUtil.warn(WARN);
        }
        window.top.postMessage({
            key: UUID,
            cmd: "onCallbackMove",
            args: args,
        }, "*");
    };

    const onCallbackEnd = (...args) => {
        if (isTop) {
            consoleUtil.warn(WARN);
        }
        window.top.postMessage({
            key: UUID,
            cmd: "onCallbackEnd",
            args: args,
        }, "*");
    };

    frameBridge.injectScript = injectScript;
    frameBridge.injectStyle = injectStyle;
    frameBridge.removeStyle = removeStyle;
    frameBridge.onCallbackStart = onCallbackStart;
    frameBridge.onCallbackMove = onCallbackMove;
    frameBridge.onCallbackEnd = onCallbackEnd;
}

{

    if (isTop) {
        window.addEventListener("message", (e) => {
            if (typeof e.data !== "object") { return; }
            const { key, cmd, args } = e.data;
            if (!validateMessage(key, args)) {
                return;
            }
            consoleUtil.log("handle cmd", cmd);
            switch (cmd) {
                case "onCallbackStart":
                    onCallbackStart(...args);
                    break;
                case "onCallbackMove":
                    onCallbackMove(...args);
                    break;
                case "onCallbackEnd":
                    onCallbackEnd(...args);
                    break;
                default:
                    consoleUtil.warn(`can not find command "${cmd}" in host bridge`);
                    break;
            }
        }, false);
    }

    const injectScript = (frame, js) => {
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "injectScript",
            args: [js],
        }, "*");
    };

    const injectStyle = (frame, id, css) => {
        consoleUtil.log("host injectStyle");
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "injectStyle",
            args: [id, css],
        }, "*");
    };

    const removeStyle = (frame, id) => {
        frame.contentWindow.postMessage({
            key: UUID,
            cmd: "removeStyle",
            args: [id],
        }, "*");
    };

    const ERR = "This method is not overrided";

    let onCallbackStart = () => {
        consoleUtil.trace(ERR);
    };

    let onCallbackMove = () => {
        consoleUtil.trace(ERR);
    };

    let onCallbackEnd = () => {
        consoleUtil.trace(ERR);
    };

    hostBridge.injectScript = injectScript;
    hostBridge.injectStyle = injectStyle;
    hostBridge.removeStyle = removeStyle;
    hostBridge.onCallbackStart = onCallbackStart;
    hostBridge.onCallbackMove = onCallbackMove;
    hostBridge.onCallbackEnd = onCallbackEnd;
}
