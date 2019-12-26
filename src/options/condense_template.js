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

    for (const t of document.querySelectorAll("template")) {
        // console.info("strip whitespace of", t)
        const content = t.content
        for (const node of Array.from(content.childNodes)) {
            stripWhitespateTextNode(node)
        }
    }

    console.timeEnd("condense whitespace")
})()