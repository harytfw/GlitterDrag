"use strict";
var logUtil = {};
{
    function getFlag(key, def) {
        if (key in globalThis) {
            return globalThis[key]
        }
        return def
    }

    const F_LOG = true;
    const F_DEBUG = true;
    const F_INFO = false;
    const F_WARN = true;
    const F_ERROR = true;
    const F_TRACE = true;

    logUtil.autoHide = true;

    logUtil.log = (...args) => {
        if (getFlag("F_LOG", F_LOG)) {
            console.log(...args);
        }
    };

    logUtil.debug = (...args) => {
        if (getFlag("F_DEBUG", F_DEBUG)) {
            console.debug(...args);
        }
    };

    logUtil.info = (...args) => {
        if (getFlag("F_INFO", F_INFO)) {
            console.info(...args);
        }
    };

    logUtil.error = (...args) => {
        if (getFlag("F_ERROR", F_ERROR)) {
            console.error(...args);
        }
    };

    logUtil.warn = (...args) => {
        if (getFlag("F_WARN", F_WARN)) {
            console.warn(...args);
        }
    };

    logUtil.trace = (...args) => {
        if (getFlag("F_TRACE", F_TRACE)) {
            console.trace(...args);
        }
    };

    logUtil.logErrorEvent = () => {

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
