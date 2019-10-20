
window.addEventListener("beforeunload", () => {
    browserStorage.set({
        "version": browser.runtime.getManifest().version
    });
});

document.title = getI18nMessage("option_page_title");

const browserStorage = browser.storage.local;

console.info("UILanguage: " + browser.i18n.getUILanguage());

function doI18n(scope = document) {
    console.group('doI18n');
    console.log('scope', scope);
    for (let elem of scope.querySelectorAll("[data-i18n]")) {
        let prefix = "elem_";
        if ("i18nPrefix" in elem.dataset) {
            prefix = elem.dataset.i18nPrefix;
        }
        let content = "";
        if ("i18nPlaceholders" in elem.dataset) {
            let placeholders = elem.dataset.i18nPlaceholders.split(",");
            content = getI18nMessage(`${prefix}${elem.dataset.i18n}`, placeholders);
        }
        else {
            content = getI18nMessage(`${prefix}${elem.dataset.i18n}`);
        }

        // if (content === elem.dataset.i18n) {
        //     console.warn(elem, "misses i18n message");
        // }

        if ("i18nAttach" in elem.dataset) {
            elem[elem.dataset.i18nAttach] = content;
        }
        else {
            elem.textContent = content;
        }
    }
    console.groupEnd('doI18n');
}

$A("template").forEach(t => {
    //初始化template里面的内容
    doI18n(t.content);
});

//hacking label + input[type='radio']
document.addEventListener("click", e => {
    if (e.target.nodeName === "LABEL" && e.target.getAttribute("for") !== null) {
        const t = $E("." + e.target.getAttribute("for"), e.target.parentElement);
        if (t && t.type === "radio") {
            // t.checked = !t.checked;
            t.dispatchEvent(new Event("radiochange", {
                bubbles: true
            }));
        }
    }
})
//手动处理选择单选按钮
document.addEventListener("radiochange", e => {
    //把同一个父元素的radio当成一组
    let checked = $A("input[type='radio']:checked", e.target.parentElement);
    for (const c of checked) {
        c.checked = false;
    }
    e.target.checked = true;
    //radiochange也是一种change事件，手动触发，传给上级
    e.target.dispatchEvent(new Event("change", {
        bubbles: true
    }));
})

function initTabs() {

    try {
        console.group('initialize tabs');
        console.log('actions wrapper');
        new ActionsWrapper();
        console.log('new actions wrapper');
        new NewActionsWrapper();
        console.log('engine wrapper');
        new EngineWrapper();
        console.log('general setting wrapper');
        new SettingWrapper();
        console.log('download wrapper')
        new DownloadWrapper();
        console.log('style wrapper')
        new StyleWrapper();
        console.log('panel wrapper')
        new PanelWrapper();
        console.log('translator wrapper')
        new TranslatorWrapper();
        console.log('excluded wrapper')
        new ExcludedRulesWrapper();
        console.groupEnd('initialize tabs')
    } catch (e) {
        console.error(e)
    }
    try {
        doI18n();
    } catch (e) {
        console.error(e)
    }

    window.addEventListener('hashchange', () => {
        if (!location.hash) return;
        for (const el of $A(".active")) {
            el.classList.remove("active");
        }
        $E(".nav-active").classList.remove("nav-active");
        $E(`a[href="${location.hash}"]`).classList.add("nav-active");
        $E(location.hash).classList.add("active");
        $E(location.hash).dispatchEvent(new Event("tabshow"));
    })
    if (location.hash) {
        window.dispatchEvent(new Event('hashchange'));
    }
    else {
        location.hash = '#tab-actions';
    }
}

function initButtons() {
    console.group('initialize buttons')
    const fileReader = new FileReader();

    eventUtil.attachEventS("#restore", () => {
        $E("#fileInput").click();
    });
    eventUtil.attachEventS("#fileInput", (event) => {
        fileReader.readAsText(event.target.files[0]);
    }, "change");
    fileReader.addEventListener("loadend", async () => {
        try {
            const storage = JSON.parse(fileReader.result);
            await browserStorage.clear();
            await browserStorage.set(storage);
            location.reload();
        }
        catch (e) {
            const msg = "An error occured, please check backup file";
            console.error(msg, e);
            alert(msg);
        }
    });
    eventUtil.attachEventS("#backup", async () => {
        const storage = await (browserStorage.get());
        const blob = new Blob([JSON.stringify(storage, null, 2)]);
        const url = URL.createObjectURL(blob);
        const date = new Date();

        browser.downloads.download({
            url: url,
            filename: `GlitterDrag-${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}-${date.getHours()}-${date.getMinutes()}.json`,
            conflictAction: 'uniquify',
            saveAs: true
        });
        setTimeout(() => {
            URL.revokeObjectURL(url)
        }, 1000 * 60 * 5);
    });

    eventUtil.attachEventS("#default", async () => {
        await browserStorage.clear();
        await browserStorage.set(DEFAULT_CONFIG);
        location.reload();
    });
    eventUtil.attachEventS("#sanitize", async () => {
        const all = await (browser.storage.local.get());
        const removed = Object.keys(all).filter((x) => x in DEFAULT_CONFIG === false);

        if (removed.length !== 0) {
            await browserStorage.remove(removed);
            $D(removed.toString() + " were removed from storage");
        }
    })
    console.groupEnd('initialize buttons')
}
console.log('start get browserinfo');

async function main() {
    await searchEngines.init();
    initButtons();
    initTabs();
}
main();