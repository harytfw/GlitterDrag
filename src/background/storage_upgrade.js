function compareVersion(a, b) {
    let len = Math.min(a.length, b.length);
    for (let i = 0; i < len; i++) {
        if (a[i] != b[i]) {
            if (a[i] > b[i]) return 1;
            else if (a[i] < b[i]) return -1;
        }
    }
    return 0
}

const V2 = [2, 0, 0];

//在安装扩展时(含更新)触发，更新缺少的配置选项
browser.runtime.onInstalled.addListener(async (details) => {
    let currentVersion = [0, 0, 0]
    let previoutVersion = [0, 0, 0]
    try {
        currentVersion = browser.runtime.getManifest().version.split(".").map(a => parseInt(a));
        if (details.reason === "update") {
            previoutVersion = details.previousVersion.split(".").map(a => parseInt(a));
        }
    }
    catch (error) {
        console.error(new Error("can not parse version"))
        console.error(error)
        return
    }

    console.info("current version: ", currentVersion)
    console.info("previous version", previoutVersion)

    if (details.reason === "update") {
        if (compareVersion(previoutVersion, V2) < 0) {
            browser.tabs.create({
                url: browser.runtime.getURL('/migration/index.html')
            })
            return;
        }
        const all = await (browser.storage.local.get());

    } else if (details.reason === "install") {
        consoleUtil.log("new install")
        await configUtil.save(configUtil.cloneDeep(configUtil.getTemplateConfig()));
    }
});
