"use strict";
class ConfigManager extends HTMLElement {
    constructor() {
        super();
        this.stack = [];
        this.saveBtn = this.querySelector("#save");
        this.saveBtn.textContent = i18nUtil.getI18n("saveChanges");

        this.discardBtn = this.querySelector("#discard");
        this.discardBtn.textContent = i18nUtil.getI18n("discardChanges");

        this.saveBtn.addEventListener("click", () => {
            this.save();
        });

        this.discardBtn.addEventListener("click", () => {
            this.discard();
        });

        this.addEventListener("configupdate", () => {
            this.saveBtn.disabled = this.discardBtn.disabled = "";
        });

        window.configManager = this;

        this.init();

        this.weakmap = new WeakMap();

    }

    async init() {
        const c = await configUtil.load();
        this.stack.push(c);
        this.stack.push(this.cloneTop());
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    get() {
        console.trace(this, "get");
        this.check();
        return this.stack[this.stack.length - 1];
    }

    getProxy() {
        console.trace(this, "get proxy");
        this.check();
        const top = this.stack[this.stack.length - 1];
        if (this.weakmap.has(top)) {
            return this.weakmap.get(top);
        } else {
            const proxy = configUtil.proxyConfig(top);
            this.weakmap.set(top, proxy);
            return proxy;
        }

    }

    async save() {
        console.log(this, "save");
        await configUtil.save(this.stack[this.stack.length - 1]);
        this.stack.shift();
        this.stack.push(this.cloneTop());
        this.check();

        this.discardBtn.disabled = this.saveBtn.disabled = "disabled";
        this.dispatchEvent(new Event("save", { bubbles: true }));
    }

    discard() {
        console.log(this, "discard");
        this.stack.pop();
        this.stack.push(this.cloneTop());
        this.check();

        this.discardBtn.disabled = this.saveBtn.disabled = "disabled";
        this.dispatchEvent(new Event("discard", { bubbles: true }));
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    async backupConfig() {
        await this.save();
        return this.cloneTop();
    }

    async resetConfig() {
        await configUtil.clear();
        await configUtil.save(configUtil.getTemplateConfig());

        this.stack.length = 0;
        this.stack.push(configUtil.cloneDeep(configUtil.getTemplateConfig()));
        this.stack.push(this.cloneTop());
        this.check();
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    async restoreConfig(config) {
        await configUtil.clear(config);
        await configUtil.save(config);
        this.stack.length = 0;
        this.stack.push(configUtil.cloneDeep(config));
        this.stack.push(this.cloneTop());
        this.check();
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    cloneTop() {
        const cloned = configUtil.cloneDeep(this.stack[this.stack.length - 1]);
        return cloned;
    }

    check() {
        if (this.stack.length !== 2) {
            console.trace("unexpected stack length: " + this.stack.length);
        }
    }

}

customElements.define("config-manager", ConfigManager);