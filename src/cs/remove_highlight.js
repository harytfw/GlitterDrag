{
    document.addEventListener("keyup", (e) => {
        if (e.key === "Escape") {
            browser.runtime.sendMessage({
                msgCmd: "removeHighLight"
            })
        }
    })
}