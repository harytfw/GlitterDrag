"use strict";
(function () {

    console.time("condense whitespace")

    function stripWhitespateTextNode(node) {
        if (node instanceof Text) {
            const t = node.textContent.trim()
            if (t.length === 0) {
                node.remove()
            }
        } else {
            for (const child of Array.from(node.childNodes)) {
                stripWhitespateTextNode(child)
            }
        }
    }

    console.groupCollapsed("strip whitespace")
    for (const t of document.querySelectorAll("template")) {
        consoleUtil.log(t)
        const content = t.content
        for (const node of Array.from(content.childNodes)) {
            stripWhitespateTextNode(node)
        }
    }
    console.groupEnd("strip whitespace")

    console.timeEnd("condense whitespace")
})()