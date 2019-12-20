// var enableLog = true
var core = new Core(document)



var enableLog = false


core.onEnd = function (target, dataTransfer) {
    Object.getPrototypeOf(core).onEnd.call(this, ...arguments)
    console.log(dataTransfer)
    console.info('text/plain', dataTransfer.getData("text/plain"))
    console.info('text/uri-list', dataTransfer.getData("text/uri-list"))
    console.info('text/x-moz-url', dataTransfer.getData("text/x-moz-url"))
    console.info('url', dataTransfer.getData("url"))
    console.info('text', dataTransfer.getData("text"))
    console.info('files length', dataTransfer.files.length)
}

document.querySelector("#toggle-drag-filter").addEventListener("change", ({ target }) => {
    console.info("toggle drag filter")
    if (target.checked) {
        core.allowDrag = function (target) {

            if (target.nodeName === "OBJECT") {
                return false;
            }

            if (target.getAttribute &&
                (target.getAttribute("contenteditable") !== null ||
                    target.getAttribute("draggble") !== null)) {
                return false;
            }

            if (target.nodeName === "A" && target.href.startsWith("#")) {
                return false;
            }

            if (["#text", "A", "IMG"].includes(target.nodeName)) {
                return true
            }

            if (target.nodeName === "TEXTAREA"
                || (target.nodeName === "INPUT" && ["text", "number", "url"].includes(target.type.toLowerCase()))) {
                return true
            }

            if (target.nodeName === "A"
                && target.href.startsWith("javascript:")
                && target.firstElementChild
                && target.firstElementChild.nodeName === "IMG") {
                return true
            }

            return false
        }
    } else {
        core.allowDrag = function (target, ) {
            return true
        }
    }
})

document.querySelector("#toggle-drop-filter").addEventListener("change", ({ target }) => {
    console.info("toggle drop filter")
    if (target.checked) {
        core.allowDrop = function (target) {
            return target.getAttribute && target.getAttribute("contenteditable") !== null
        }
    } else {
        core.allowDrop = function () {
            return true
        }
    }
})

document.querySelector("#toggle-prevent-default-filter").addEventListener("change", ({ target }) => {
    if (target.checked) {
        core.callPreventDefaultInDropEvent = function (target) {
            if (["INPUT", "TEXTAREA"].includes(target.nodeName)) {
                return false;
            }
            return true
        }
    } else {
        core.callPreventDefaultInDropEvent = function (target) {
            return true
        }
    }
})

/*
TODO: 将元素拖到浏览器窗口外的时候，事件会在onMove的之后停止出发，
想办法增加定时器，模仿心跳机制，检测这种行为

需要考虑回来的情况
*/