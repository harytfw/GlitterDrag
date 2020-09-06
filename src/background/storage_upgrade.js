
browser.runtime.onInstalled.addListener(async (details) => {

    console.info("current version: ", browser.runtime.getManifest().version)
    console.info("previous version", details.previousVersion)

    if (details.reason === "update") {
        if (details.previousVersion === '1.57.0') {
            browser.tabs.create({
                url: browser.runtime.getURL('/migration/index.html')
            })
            return;
        }
        const all = await (browser.storage.local.get());
        try {
            configUtil.upgrade(all)
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
