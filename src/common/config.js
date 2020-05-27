"use strict";
var configUtil = {};

{
    const templateConfig = {
        enableSync: false,

        enableIndicator: false,
        enablePrompt: false,

        enableTimeout: false,
        timeout: 2000,

        actions: [{
            name: "Default",
            shortcut: "",
            limitation: "",
            important: true,
            details: {
                /* text: [{
                    direction: "up",
                    command: "open",
                    commandTarget: "link",

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
                        directory: "",
                    },

                    script: "",

                    prompt: "",

                }], */
                text: [],
                link: [],
                image: [],
            },
        }],

        features: {
            disableFixURL: false,
            preventUiRemove: false,
            extendMiddleButton: false,
            lockScrollbar: false,
            showNotificationAfterCopy: false,
        },

        currentStyle: "",
        /*styles: [{
            name: "",
            style: ""
        }], */
        styles: [],

        translation: {
            provider: "google",
            sourceLanguage: "auto",
            targetLanguage: "auto",
        },
        limitRange: false,

        range: [0, 9999],

        version: "0.0.0",
    };

    const defaultActionDetail = {
        direction: "",
        command: "",
        commandTarget: "",
        icon: "",
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
            directory: "",
        },

        script: "",

        prompt: "",
    };

    const cloneDeep = (obj) => {
        return JSON.parse(JSON.stringify(obj));
    };

    const proxyConfig = (config) => {
        const manipulator = {

            init() {

            },

            actions: {
                add(name, shortcut, limitation) {
                    config.actions.push({
                        name,
                        shortcut,
                        limitation,
                        details: {
                            text: [],
                            link: [],
                            image: [],
                        },
                    });
                },

                update(name, option) {
                    let obj = manipulator.actions.find(name);
                    if (obj) {
                        Object.assign(obj, option);
                    } else {
                        console.trace(`name: "${name}" no found`);
                    }
                },

                find(name) {
                    return config.actions.find(obj => obj.name === name);
                },

                remove(name) {
                    config.actions = config.actions.filter(obj => obj.name !== name);
                },
            },

            details: {

                add(name, actionType, direction) {
                    const action = manipulator.actions.find(name);
                    const cloned = cloneDeep(defaultActionDetail);
                    cloned.direction = direction;
                    action[actionType].push(cloned);
                    return cloned;
                },

                remove(_name, _actionType, _direction) {
                    throw new Error("unimplementation");
                },

                find(name, actionType, direction) {
                    const action = manipulator.actions.find(name);
                    if (!action) {
                        return null;
                    }
                    let ret = action.details[actionType].find(obj => obj.direction === direction);
                    if (!ret) {
                        ret = cloneDeep(defaultActionDetail);
                        ret.direction = direction;
                        action.details[actionType].push(ret);
                    }
                    return ret;
                },

                update(name, actionType, direction, option) {
                    const details = manipulator.details.find(name, actionType, direction);
                    Object.assign(details, option);
                },

            },
            directories: {

                add(name) {
                    config.directories.push({
                        name,
                        type: "",
                        value: "",
                    });
                },

                remove(name) {
                    config.directories = config.directories.filter(d => d.name !== name);
                },

                find(name) {
                    return config.directories.find(d => d.name === name);
                },

                update(name, option) {
                    const dir = this.find(name);
                    Object.assign(dir, cloneDeep(option));
                },
            },

            styles: {
                add(name) {
                    config.styles.push({
                        name,
                        style: "",
                    });
                },

                remove(name) {
                    config.styles === config.styles.filter(s => s.name !== name);
                },

                find(name) {
                    config.styles.find(s => s.name === name);
                },

                update(name, option) {
                    const s = this.find(name);
                    Object.assign(s, cloneDeep(option));
                },
            },
            scripts: {
                add(name) {
                    config.scritps.push({
                        name,
                        script: "",
                    });
                },

                remove(name) {
                    config.scripts = config.scripts.filter(s => s.name !== name);
                },

                find(name) {
                    return config.scripts.find(s => s.name === name);
                },

                update(name, option) {
                    const s = this.find(name);
                    Object.assign(s, cloneDeep(option));
                },
            },

            //TODO
            updateTranslatationParameter(_name, _value) {

            },

            updateFeatures(name, val = false) {
                config.features[name] = val;
            },
        };
        return manipulator;
    };

    const save = async (obj) => {
        console.trace("save to local storage", obj);
        await browser.storage.local.set(obj);
    };

    const load = async () => {
        console.trace("load from local storage");

        return browser.storage.local.get();
    };

    const clear = async () => {
        console.trace("clear local storage");
        await browser.storage.local.clear();
    };

    const compress = () => { };
    const decompress = () => { };
    const loadFromSync = () => { };
    const saveToSync = () => { };
    const getTemplateConfig = () => {
        return templateConfig;
    };

    configUtil.proxyConfig = proxyConfig;
    configUtil.save = save;
    configUtil.load = load;
    configUtil.clear = clear;
    configUtil.compress = compress;
    configUtil.decompress = decompress;
    configUtil.loadFromSync = loadFromSync;
    configUtil.saveToSync = saveToSync;
    configUtil.cloneDeep = cloneDeep;
    configUtil.getTemplateConfig = getTemplateConfig;

}
