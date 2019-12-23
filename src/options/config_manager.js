"use strict"
class ConfigManager extends HTMLElement {
    constructor() {
        super()
        this.stack = []
        this.saveBtn = this.querySelector("#save")

        this.discardBtn = this.querySelector("#discard")

        this.saveBtn.addEventListener("click", () => {
            this.discardBtn.disabled = this.saveBtn.disabled = "disabled"
            this.save()
        })

        this.discardBtn.addEventListener("click", () => {
            this.discardBtn.disabled = this.saveBtn.disabled = "disabled"
            this.discard()
        })

        this.addEventListener("configupdate", () => {
            this.saveBtn.disabled = this.discardBtn.disabled = ""
        })

        window.configManager = this

        this.init()

        this.weakmap = new WeakMap()
    }


    async init() {
        const c = await configUtil.load()
        this.stack.push(c)
        this.stack.push(this.cloneTop())
        this.dispatchEvent(new Event("configloaded", {
            bubbles: true,
        }))
    }

    get() {
        console.log(this, "get")
        this.check()
        return this.stack[this.stack.length - 1]
    }

    getProxy() {
        console.log(this, "get proxy")
        this.check()
        const top = this.stack[this.stack.length - 1]
        if (this.weakmap.has(top)) {
            return this.weakmap.get(top)
        } else {
            const proxy = configUtil.proxyConfig(top)
            this.weakmap.set(top, proxy)
            return proxy
        }

    }

    save() {
        console.info(this, "save")
        configUtil.save(this.stack[this.stack.length - 1])
        this.stack.shift()
        this.stack.push(this.cloneTop())
        this.check()
    }

    discard() {
        console.info(this, "discard")
        this.stack.pop()
        this.stack.push(this.cloneTop())
        this.check()
    }

    cloneTop() {
        const cloned = configUtil.cloneDeep(this.stack[this.stack.length - 1])
        return cloned
    }

    check() {
        if (this.stack.length !== 2) {
            console.trace("unexpected stack length: " + this.stack.length)
        }
    }

}

customElements.define("config-manager", ConfigManager)