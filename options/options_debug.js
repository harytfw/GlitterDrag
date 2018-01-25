function log(v, clear = false) {
    var el = document.querySelector("#logArea");
    if (clear) el.value = "";
    el.value = el.value + v;
}

async function showDebugTab() {

    const table = [
        [true, "http://example.org"],
        [true, "http://www.example.org/"],
        [true, "www.example.org/index.html"],
        [true, "http://192.168.1.1:80"],
        [true, "192.168.1.1:80/index.html?w=true"],
        [true, "http://[::1]:80"],
        [true, "[::1]"],
        [false, "http:example.org"],
        [false, "266.255.255.1"],
        [false, ""],
        [true, "::FFFF:129.144.52.38"], // IPv4-mapped IPv6 address, compressed  
        [true, "fe80:0:0:0:204:61ff:254.157.241.86"],
        [true, "fe80::204:61ff:254.157.241.86"],
        [true, "::ffff:12.34.56.78"],
        [false, "::ffff:2.3.4"],
        [false, "::ffff:257.1.2.3"],
        [false, "1.2.3.4:1111:2222:3333:4444::5555"], // Aeron 
        [false, "1.2.3.4:1111:2222:3333::5555"],
        [false, "1.2.3.4:1111:2222::5555"],
        [false, "1.2.3.4:1111::5555"],
        [false, "1.2.3.4::5555"],
        [false, "1.2.3.4::"],
        [true, "2001:0db8::1428:57ab"],
        [true, "2001:db8::1428:57ab"],
        [true, "::ffff:0c22:384e"],
        [true, "2001:0db8:1234:0000:0000:0000:0000:0000"],
        [true, "2001:0db8:1234:ffff:ffff:ffff:ffff:ffff"],
        [true, "2001:db8:a::123"],
        [false, "123"],
        [true, "ldkfj"], //valid domain name 
        [false, "2001::FFD3::57ab"],
        [false, "2001:db8:85a3::8a2e:37023:7334"],
        [false, "2001:db8:85a3::8a2e:370k:7334"],
        [false, "1:2:3:4:5:6:7:8:9"],
        [false, "1::2::3"],
        [false, "1:::3:4:5"],
        [false, "1:2:3::4:5:6:7:8:9"],
        // New from Aeron  
        // Playing with combinations of "0" and "::"
        // NB: these are all sytactically correct, but are bad form
        // because "0" adjacent to "::" should be combined into "::" 
        [true, "::0:0:0:0:0:0:0"],
        [true, "::0:0:0:0:0:0"],
        [true, "::0:0:0:0:0"],
        [true, "::0:0:0:0"],
        [true, "::0:0:0"],
        [true, "::0:0"],
        [true, "::0"],
        [true, "0:0:0:0:0:0:0::"],
        [true, "0:0:0:0:0:0::"],
        [true, "0:0:0:0:0::"],
        [true, "0:0:0:0::"],
        [true, "0:0:0::"],
        [true, "0:0::"],
        [true, "0::"],
        [false, "::."],
        [true, "0:a:b:c:d:e:f::"],
        [true, "::0:a:b:c:d:e:f"],
        [true, "a:b:c:d:e:f:0::"],
        [false, ":10.0.0.1"]
    ];
    const t = document.querySelector("#tab-debug table");
    for (const a of table) {
        const elem = document.createElement("tr");
        elem.innerHTML = `<td>${a[1]}</td><td>${a[0]}</td><td>${typeUtil.seemAsURL(a[1])}</td><td>${typeUtil.seemAsURL(a[1])!=a[0]?"yes":""}</td>`
        t.appendChild(elem);
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
