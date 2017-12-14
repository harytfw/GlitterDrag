function log(v, clear = false) {
    var el = document.querySelector("#logArea");
    if (clear) el.value = "";
    el.value = el.value + v;
}

async function showDebugTab() {

    document.querySelector("#_debug").style.display = "initial";
    // document.querySelector("#_debug").click();
    document.querySelector("#reload").addEventListener("click", () => {
        browser.runtime.reload();
    })
    // $E("#debug").addEventListener("change", e => {
    //     LStorage.set({ "debug": e.target.checked });
    //     location.reload();
    // });
    // LStorage.get("debug").then(setting => {
    //     $E("#debug").checked = setting["debug"];
    // });
    document.addEventListener("keypress", (evt) => {
        const char = evt.key.charAt(0);
        if (char >= "1" && char <= "9" && evt.target.nodeName !== "INPUT" && evt.target.nodeName !== "TEXTAREA") {
            try {
                $E(`a.nav-a:nth-child(${char})`).click();
            }
            catch (error) {
                // console.error(error);
            }
        }
    });
    document.querySelector("#tab-debug").addEventListener("dragstart", (e) => {
        // e.stopPropagation();
        // e.preventDefault();
    })

    // document.querySelector("#tab-debug").addEventListener("dragend", (e) => {
    //     e.stopPropagation();
    //     e.preventDefault();
    //     // let dt = e.dataTransfer;
    //     // log(`\nItems:\n`, true)
    //     // for (let type of dt.types) {
    //     //     log(`  Type: ${type} , Data: ${dt.getData(type)}\n`);
    //     // }
    //     // log(`Files:\n`)
    //     // for (let file of dt.files) {
    //     //     log(`  Type:${file.type} , Name: ${file.name} , Size: ${file.size}`);
    //     // }
    // });
    document.querySelector("#drop").addEventListener("drop", (e) => {
        e.stopPropagation();
        e.preventDefault();
        let dt = e.dataTransfer;
        log(`\nItems:\n`, true)
        for (let type of dt.types) {
            log(`  Type: ${type} , Data: ${dt.getData(type)}\n`);
        }
        log(`Files:\n`)
        for (let file of dt.files) {
            log(`  Type:${file.type} , Name: ${file.name} , Size: ${file.size}`);
        }
    })
    document.querySelector("#drop").addEventListener("dragenter", (e) => {
        // e.stopPropagation();
        e.preventDefault();
    })
    document.querySelector("#drop").addEventListener("dragover", (e) => {
        // e.stopPropagation();
        e.preventDefault();
        // log(e.defaultPrevented);
    })
}

if (window.localStorage.getItem("_DEBUG") === "true") showDebugTab();
else browser.storage.local.get("debug").then(setting => {
    if (setting.debug === true) showDebugTab();
})