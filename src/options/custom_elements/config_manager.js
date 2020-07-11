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
            this._save();
        });

        this.discardBtn.addEventListener("click", () => {
            this._discard();
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
        this.stack.push(this._cloneTop());
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    get() {
        console.trace(this, "get");
        this._check();
        return this.stack[this.stack.length - 1];
    }

    getProxy() {
        console.trace(this, "get proxy");
        this._check();
        const top = this.stack[this.stack.length - 1];
        if (this.weakmap.has(top)) {
            return this.weakmap.get(top);
        } else {
            const proxy = configUtil.proxyConfig(top);
            this.weakmap.set(top, proxy);
            return proxy;
        }

    }

    emitUpdate(src) {
        src.dispatchEvent(new Event("configupdate", { bubbles: true }));
    }

    async resetConfig() {
        await configUtil.clear();
        await configUtil.save(configUtil.getTemplateConfig());

        this.stack.length = 0;
        this.stack.push(configUtil.cloneDeep(configUtil.getTemplateConfig()));
        this.stack.push(this._cloneTop());
        this._check();
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    async restoreConfig(config) {
        await configUtil.clear(config);
        await configUtil.save(config);
        this.stack.length = 0;
        this.stack.push(configUtil.cloneDeep(config));
        this.stack.push(this._cloneTop());
        this._check();
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    async _save() {
        consoleUtil.log(this, "save");
        await configUtil.save(this.stack[this.stack.length - 1]);
        this.stack.shift();
        this.stack.push(this._cloneTop());
        this._check();

        this.discardBtn.disabled = this.saveBtn.disabled = "disabled";
        this.dispatchEvent(new Event("save", { bubbles: true }));
    }

    _discard() {
        consoleUtil.log(this, "discard");
        this.stack.pop();
        this.stack.push(this._cloneTop());
        this._check();

        this.discardBtn.disabled = this.saveBtn.disabled = "disabled";
        this.dispatchEvent(new Event("discard", { bubbles: true }));
        this.dispatchEvent(new Event("configloaded", { bubbles: true }));
    }

    async _backupConfig() {
        await this._save();
        return this._cloneTop();
    }



    _cloneTop() {
        const cloned = configUtil.cloneDeep(this.stack[this.stack.length - 1]);
        return cloned;
    }

    _check() {
        if (this.stack.length !== 2) {
            console.trace("unexpected stack length: " + this.stack.length);
        }
    }

}

customElements.define("config-manager", ConfigManager);