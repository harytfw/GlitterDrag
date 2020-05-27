"use strict";
var consoleUtil = {};
{
    const F_LOG = true;
    const F_DEBUG = true;
    const F_INFO = false;
    const F_WARN = true;
    const F_ERROR = true;
    const F_TRACE = true;
    const F_HIDE = true;

    consoleUtil.autoHide = true;

    consoleUtil.log = (...args) => {
        if (F_LOG) {
            console.log(...args);
        }
    };

    consoleUtil.debug = (...args) => {
        if (F_DEBUG) {
            console.debug(...args);
        }
    };

    consoleUtil.info = (...args) => {
        if (F_INFO) {
            console.info(...args);
        }
    };

    consoleUtil.error = (...args) => {
        if (F_ERROR) {
            console.error(...args);
        }
    };

    consoleUtil.warn = (...args) => {
        if (F_WARN) {
            console.warn(...args);
        }
    };

    consoleUtil.trace = (...args) => {
        if (F_TRACE) {
            console.trace(...args);
        }
    };

    consoleUtil.logErrorEvent = () => {

        window.onerror = (e) => {
            console.trace(e);
        };

        window.onrejectionhandled = (e) => {
            console.trace(e);
        };

        window.onunhandledrejection = (e) => {
            console.trace(e);
        };
    };
}
