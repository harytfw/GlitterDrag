"use strict";
var consoleUtil = {};
{
    const noop = () => {/** noop */};
    const log = console.log;
    const debug = console.debug;
    const info = console.info;
    const error = console.error;
    const time = console.time;
    const timeEnd = console.timeEnd;
    const trace = console.trace;

    const globalConsole = window.console;

    consoleUtil.disableLog = () => {
        globalConsole.log = noop;
    };

    consoleUtil.resumeLog = () => {
        globalConsole.log = log;
    };

    consoleUtil.disableInfo = () => {

    };

    consoleUtil.resumeInfo = () => {

    };

    consoleUtil.disableTime = () => {

    };

    consoleUtil.resumeTime = () => {

    };

    consoleUtil.disableTrace = () => {
        console.trace = noop;
    };

    consoleUtil.resumeTrace = () => {
        console.trace = trace;
    };
}
