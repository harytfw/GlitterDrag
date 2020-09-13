
browser.runtime.onInstalled.addListener(async (details) => {

    logUtil.info("current version: ", browser.runtime.getManifest().version)
    logUtil.info("previous version", details.previousVersion)

    if (details.reason === "update") {
        if (details.previousVersion === '1.57.0') {
            browser.tabs.create({
                url: browser.runtime.getURL('/migration/index.html')
            })
            return;
        }
        const all = await (browser.storage.local.get());
        try {
            await configUtil.upgrade(all)
            await browser.storage.local.set(all)
        }
        catch (ex) {
            logUtil.error(ex)
        }

    } else if (details.reason === "install") {
        logUtil.log("new install")
        await configUtil.save(configUtil.cloneDeep(configUtil.getTemplateConfig()));
    }
});
