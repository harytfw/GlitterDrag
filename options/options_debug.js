function log(v, clear = false) {
    var el = document.querySelector("#logArea");
    if (clear) el.value = "";
    el.value = el.value + v;
}

async function showDebugTab() {

    const table = [
        "http://example.org",
        "http://example.org/s?x=1",
        "/example.org/s?x=1",
        "tp://example.org/s?x=1",
        "example.org/s?x=1",
        "http://192.168.1.1",
        "http://192.168.1.1/s?x=1",
        "http://192.168.1.1:80/s?x=1",
        "tp://192.168.1.1:80/s?x=1",
        "192.168.1.1:80",
        "192.168.1.1:80/s?x=1",
        "::1",
        "[::1]",
        "http://[::1]",
        "http://[::1]/s?x=1",
        "tp://[::1]",
        "tp://[::1]:80/",

        "://",
        "asd//",
        ":asdasd//",
        "ftp://x.com",
        "mnb://sxasdc.com",
        "asdopkerwetufbvx",
        "中文",
        "english",
        "english\nchinese",
        "e:n.gl.15i/sh",
    ];
    const t = document.querySelector("#tab-debug table");
    for (const a of table) {
        const tr = document.createElement("tr");
        const _td = document.createElement("td");
        let td = _td.cloneNode();
        td.textContent = a;
        tr.appendChild(td);
        td = _td.cloneNode();
        td.textContent = typeUtil.seemAsURL(a);
        tr.appendChild(td);
        td = _td.cloneNode();
        td.textContent = typeUtil.fixupSchemer(a);
        tr.appendChild(td)
        t.appendChild(tr);
    }
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
    document.querySelector("#tab-debug").addEventListener("dragstart", () => {
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
        console.log(dt);
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