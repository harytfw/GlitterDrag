const templateConfig = {
    enableSync: false,

    enableIndicator: false,
    enablePrompt: false,

    enableTimeoutCancel: false,
    timeoutCancel: 2000,

    minDistance: 20,
    maxDistance: 9999,

    actions: [{
        name: "",
        hotkey: "",
        limitation: "",
        detail: {
            /* text: [{
                direction: "up",
                command: "open",
                commandTarget: "link",

                preferImage: false,

                activeTab: true,
                tabPosition: "left",

                
                searchEngine: {
                    name: "",
                    url: "",
                    icon: "",
                    method: "get",
                    searchOnSite: false,
                    builtin: false,
                },

                download: {
                    showSaveAsDialog: false,
                    directoryName: "",
                },

                scriptName: "",

                prompt: "",

            }], */
            text: [],
            link: [],
            image: [],
        }
    }],

    /* directories: [{
        name: "",
        value: "",
    }], */
    directories: [],

    maxProcessSize: 5, //unit is M; the file that larger than 5M won't be processed.

    features: {
        disableFixURL: false,
        appendImageReferrer: false,
        preventUiRemove: false,
        extendMiddleButton: false,
        lockScrollbar: false
    },

    currentStyle: "",
    /*styles: [{
        name: "",
        style: ""
    }], */
    styles: [],

    translationSetting: {
        lastProvider: "google",
        sourcelang: "auto",
        targetlang: "auto",
    },

    /* scripts: [{
        name: "",
        script: ""
    }], */
    scripts: [],

    /* searchEngineTemplate: [{
        name: "",
        url: "",
        icon: "",
        method: "get",
        searchOnSite: false,
    }]*/

    searchEngineTemplates: [],

    version: "0.0.0",
};

const defaultActionDetail = {
    direction: "",
    command: "",
    commandTarget: "",

    preferImage: false,

    activeTab: false,
    tabPosition: "",

    searchEngine: {
        name: "",
        url: "",
        icon: "",
        method: "",
        searchOnSite: false,
        builtin: false,
    },

    download: {
        showSaveAsDialog: false,
        directoryName: "",
    },

    scriptName: "",

    prompt: "",
}

function cloneDeep(obj) {
    return JSON.parse(JSON.stringify(obj))
}

function proxyConfig(config) {
    const manipulator = {

        init() {

        },

        actions: {
            add(name, hotkey, limitation) {
                config.actions.push({
                    name,
                    hotkey,
                    limitation,
                    detail: {
                        text: [],
                        link: [],
                        image: []
                    }
                })
            },

            update(name, option) {
                let obj = manipulator.actions.find(name)
                if (obj) {
                    Object.assign(obj, option)
                } else {
                    console.trace(`name: "${name}" no found`)
                }
            },

            find(name) {
                return config.actions.find(obj => obj.name === name)
            },

            remove(name) {
                config.actions = config.actions.filter(obj => obj.name !== name)
            }
        },

        detail: {

            add(name, actionType, direction) {
                const action = manipulator.actions.find(name)
                const cloned = cloneDeep(defaultActionDetail)
                cloned.direction = direction
                action[actionType].push(cloned)

                return cloned
            },

            remove(name, actionType, direction) {
                throw new Error("unimplementation")
            },

            find(name, actionType, direction) {
                const action = manipulator.actions.find(name)
                let ret = action.detail[actionType].find(obj => obj.direction === direction)
                if (!ret) {
                    ret = cloneDeep(defaultActionDetail)
                    ret.direction = direction
                    action.detail[actionType].push(ret)
                }
                return ret
            },

            update(name, actionType, direction, option) {
                const detail = manipulator.detail.find(name, actionType, direction)
                Object.assign(detail, option)
            },

        },
        directories: {

            add(name) {
                config.directories.push({
                    name,
                    type: "",
                    value: ""
                })
            },

            remove(name) {
                config.directories = config.directories.filter(d => d.name !== name)
            },

            find(name) {
                return config.directories.find(d => d.name === name)
            },

            update(name, option) {
                const dir = this.find(name)
                Object.assign(dir, cloneDeep(option))
            },
        },

        styles: {
            add(name) {
                config.styles.push({
                    name,
                    style: ""
                })
            },

            remove(name) {
                config.styles === config.styles.filter(s => s.name !== name)
            },

            find(name) {
                config.styles.find(s => s.name === name)
            },

            update(name, option) {
                const s = this.find(name)
                Object.assign(s, cloneDeep(option))
            },
        },
        scripts: {
            add(name) {
                config.scritps.push({
                    name,
                    script: ""
                })
            },

            remove(name) {
                config.scripts = config.scripts.filter(s => s.name !== name)
            },

            find(name) {
                return config.scripts.find(s => s.name === name)
            },

            update(name, option) {
                const s = this.find(name)
                Object.assign(s, cloneDeep(option))
            }
        },


        //TODO
        updateTranslatationParameter(name, value) {

        },

        updateFeatures(name, val = false) {
            config.features[name] = val
        },
    }

    return manipulator
}


var configUtil = {
    proxyConfig: proxyConfig,
    async save(obj) {
        console.trace("save to local storage", obj)
        await browser.storage.local.set(obj)
    },
    async load() {
        console.trace("load from local storage")
        return browser.storage.local.get()
    },
    compress() { },
    decompress() { },
    loadFromSync() { },
    saveToSync() { },
    cloneDeep,
    get templateConfig() {
        return templateConfig
    }
}

