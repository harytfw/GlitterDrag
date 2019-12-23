
function assign(target, origin) {
    let f = false
    for (const aKey of Object.keys(origin)) {
        if (aKey in target) {
            if (typeof target[aKey] === "object") {
                f = f || assign(target[aKey], origin[aKey]);
            }
        }
        else {
            $D(aKey, "  ", target[aKey], " -> ", origin[aKey]);
            target[aKey] = origin[aKey];
            f = true
            // console.log(aKey, origin[aKey]);
        }
    }
    return f
}


async function upgrade_153(all) {
    console.info("upgrade v1.53.0");
    const engines = (await browser.storage.local.get("Engines"))["Engines"];
    for (const aKey of Object.keys(all)) {
        if (aKey.startsWith("Actions")) {
            for (const bKey of Object.keys(all[aKey])) {
                for (const cKey of Object.keys(all[aKey][bKey])) {
                    if ("engine_url" in all[aKey][bKey][cKey] === false) {
                        let url = i18nUtil.getI18n("default_search_url");
                        let n = all[aKey][bKey][cKey]["engine_name"];
                        for (let obj of engines) {
                            if (obj.name === n) {
                                url = obj.url;
                                break;
                            }
                        }
                        all[aKey][bKey][cKey]["engine_url"] = url;
                    }
                }
            }
        }
    }
}

async function upgrade_155(all) {
    console.info("upgrade v1.55.0");
    for (const aKey of ["cmdPanel_textAction", "cmdPanel_linkAction", "cmdPanel_imageAction"]) {
        if (aKey in all) {
            // eslint-disable-next-line no-unused-vars
            const [a, b] = aKey.split("_");
            all["Panel_" + b] = all[aKey];
            await browser.storage.local.remove(aKey);
            delete all[aKey];
        }
    }
}

async function upgrade_156(all) {
    console.info("upgrade v1.56.0");
    for (const aKey of Object.keys(all)) {
        if (aKey.startsWith("Actions")) {
            for (const bKey of Object.keys(all[aKey])) {
                for (const cKey of Object.keys(all[aKey][bKey])) {
                    if ("is_browser_search" in all[aKey][bKey][cKey] === false) {
                        all[aKey][bKey][cKey]["is_browser_search"] = false;
                    }
                }
            }
        }
        else if (aKey.startsWith("Panel")) {
            for (const action of all[aKey]) {
                if ("is_browser_search" in action === false) {
                    action["is_browser_search"] = false;
                }
            }
        }
    }
}



//在安装扩展时(含更新)触发，更新缺少的配置选项
browser.runtime.onInstalled.addListener(async (details) => {
    console.info(details);

    if (details.reason === browser.runtime.OnInstalledReason.UPDATE) {
        const all = await (browser.storage.local.get());
        let isUpgrade = false
        let midVer = 0;
        try {
            midVer = parseInt(details.previousVersion.split(".")[1])
        }
        catch (error) {
            console.error(error);
            midVer = 0;
        }

        if (midVer < 53) { // < 1.5all
            isUpgrade = true;
            await upgrade_153(all);
        }

        if (midVer < 55) { // < 1.55.0
            isUpgrade = true;
            await upgrade_155(all);
        }

        if (midVer < 56) {// < 1.56.0
            isUpgrade = true;
            await upgrade_156(all);
        }

        if (assign(all, DEFAULT_CONFIG)) {
            isUpgrade = true
        }

        if (isUpgrade) {
            console.info("upgrade complete")
            await browser.storage.local.set(all);
        } else {
            console.info("not need to upgrade")
        }
    }
    else if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
        console.log("new install")
        await configUtil.save(configUtil.cloneDeep(configUtil.templateConfig));
        
    }
});
