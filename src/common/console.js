(function (ns) {
    const noop = () => { }
    const log = console.log
    const debug = console.debug
    const info = console.info
    const error = console.error
    const time = console.time
    const timeEnd = console.timeEnd
    const trace = console.trace

    const globalConsole = window.console
    
    ns.disableLog = () => {
        globalConsole.log = noop
    }

    ns.resumeLog = () => {
        globalConsole.log = log
    }

    ns.disableInfo = () => {

    }

    ns.resumeInfo = () => {

    }

    ns.disableTime = () => {

    }

    ns.resumeTime = () => {

    }

    ns.disableTrace = () => {
        console.trace = noop
    }

    ns.resumeTrace = () => {
        console.trace = trace
    }
})(consoleUtil || {})