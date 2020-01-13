function compareVersion(a, b) {
    if (a[0] !== b[0]) {
        return a[0] > b[0] ? 1 : -1
    }
    if (a[1] !== b[1]) {
        return a[1] > b[1] ? 1 : -1
    }
    if (a[2] !== b[2]) {
        return a[2] > b[2] ? 1 : -1
    }
    return 0
}

const upgrade = {
    "": function () {

    }
}

//在安装扩展时(含更新)触发，更新缺少的配置选项
browser.runtime.onInstalled.addListener(async (details) => {
    console.info(details);
    // if (details.temporary && details.reason === "update") return
    let currentVersion = [-1, -1, -1]
    let previoutVersion = [-1, -1, -1]
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
        const all = await (browser.storage.local.get())
        let isUpgrade = false
        if (compareVersion(previoutVersion, [2, 0, 0]) < 0) {

        }
    }
    else if (details.reason === browser.runtime.OnInstalledReason.INSTALL) {
        consoleUtil.log("new install")
        await configUtil.save(configUtil.cloneDeep(configUtil.getTemplateConfig()));
        
    }
});