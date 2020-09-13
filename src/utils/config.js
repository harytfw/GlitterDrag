export class ActionDetailBuilder {
    constructor() {
        this.detail = {
            direction: "",
            command: "",
            commandTarget: "",

            activeTab: false,
            tabPosition: "",
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
        }
    }
    clone() {
        d = JSON.parse(JSON.stringify(this.detail))
        const builder = new ActionDetailBuilder()
        builder.detail = d;
        return builder
    }
    build() {
        return JSON.parse(JSON.stringify(this.detail));
    }
    setDirection(dir) {
        this.detail.direction = dir;
        return this;
    }
    setCommand(command) {
        this.detail.command = command;
        return this;
    }
    setCommandTarget(target) {
        this.detail.commandTarget = target;
        return this;
    }

    toggleActiveTab(b) {
        this.detail.activeTab = b;
        return this;
    }

    setTabPosition(pos) {
        this.detail.tabPosition = pos;
        return this;
    }

    updateSearchEngine(name, url, icon, searchOnSite, builetin) {
        Object.assign(this.detail.searchEngine, {
            name,
            url,
            icon,
            searchOnSite,
            builtin
        })
        return this;
    }

    updateDownload(directory, showSaveAsDialog) {
        Object.assign(this.download, {
            directory,
            showSaveAsDialog
        });
        return this;
    }

    setScript(script) {
        this.detail.script = script
        return this;
    }

    setPrompt(prompt) {
        this.detail.prompt = prompt;
        return this;
    }
}

class ConfigManipulator {

    static defaultActionDetail() {
        return {
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
        }
    }

    static empty() {
        return new ConfigManipulator({
            enableSync: false,
            enableIndicator: false,
            enablePrompt: false,
            enableTimeout: false,
            timeout: 2000,
            actions: [],
            features: {
                disableFixURL: false,
                preventUiRemove: false,
                extendMiddleButton: false,
                lockScrollbar: false,
                showNotificationAfterCopy: false,
            },
            currentStyle: "",
            styles: [],
            limitRange: false,
            range: [0, 9999],
            blockList: [],
            version: "2.0.0",
        })
    }

    constructor(config) {
        this.config = config

        const self = this;

        this.actions = {
            add(name, condition, limitation) {
                self.config.actions.push({
                    name,
                    condition,
                    limitation,
                    details: {
                        text: [],
                        link: [],
                        image: [],
                    },
                });
            },
            update(name, option) {
                let obj = self.actions.find(name);
                if (obj) {
                    Object.assign(obj, option);
                }
                else {
                    console.trace(`name: "${name}" no found`);
                }
            },

            find(name) {
                return self.config.actions.find(obj => obj.name === name);
            },

            remove(name) {
                self.config.actions = self.config.actions.filter(obj => obj.name !== name);
            },
        };
        this.details = {
            add(name, actionType, direction, option) {
                const action = self.actions.find(name);
                const cloned = JSON.parse(JSON.stringify(ConfigManipulator.defaultActionDetail()));
                cloned.direction = direction;
                Object.assign(cloned, option)
                action.details[actionType].push(cloned);
                return cloned;
            },
            remove(_name, _actionType, _direction) {
                throw new Error("unimplementation");
            },
            find(name, actionType, direction) {
                const action = self.actions.find(name);
                if (!action) {
                    return null;
                }
                let ret = action.details[actionType].find(obj => obj.direction === direction);
                if (!ret) {
                    ret = ConfigManipulator.defaultActionDetail();
                    ret.direction = direction;
                    action.details[actionType].push(ret);
                }
                return ret;
            },

            update(name, actionType, direction, option) {
                const details = self.details.find(name, actionType, direction);
                Object.assign(details, option);
            },

        };

        this.styles = {
            add(name) {
                self.config.styles.push({
                    name,
                    style: "",
                });
            },

            remove(name) {
                self.config.styles === self.config.styles.filter(s => s.name !== name);
            },

            find(name) {
                self.config.styles.find(s => s.name === name);
            },

            update(name, option) {
                const s = this.find(name);
                Object.assign(s, deepClone(option));
            },
        };
        this.blockList = {
            add(rule) {
                self.config.blockList.push(rule);
            },
            remove(rule) {
                self.config.blockList = self.config.filter(s => s != rule);
            },
            setWhole(list) {
                self.config.blockList = list;
            }
        };

    }
    cloneConfig() {
        return JSON.parse(JSON.stringify(this.config));
    }

    updateFeatures(name, val = false) {
        this.config.features[name] = val;
    }

    setTimeoutVal(timeout) {
        this.config.timeout = timeout;
    }
    setRange(min, max) {
        this.config.range = [min, max];
    }
    toggleSync(b) {
        this.config.enableSync = b;
    }
    toggleIndicator(b) {
        this.config.enableIndicator = b;
    }
    togglePrompt(b) {
        this.config.enablePrompt = b;
    }
    toggleTimeout(b) {
        this.config.enableTimeout = b;
    }

    updateConfigVersion() {
        this.config.version = "2.0.0";
    }
}


const m = ConfigManipulator.empty();
m.setTimeoutVal(2000)
m.actions.add("Default", "", "any");
m.details.add("Default", "text", "up",
    new ActionDetailBuilder()
    .setCommand("open")
    .toggleActiveTab(true)
    .setTabPosition("left")
    .build());
m.actions.add("Shift", "shift", "any");
m.actions.add("Ctrl", "shift", "any");
m.setRange(0, 9999);
m.updateConfigVersion();

export const templateConfig = m.cloneConfig()

export const deepClone = (obj) => {
    return JSON.parse(JSON.stringify(obj));
};

export const proxyConfig = (c) => {
    return new ConfigManipulator(c)
};
export const save = async(obj) => {
    console.trace("save to local storage", obj);
    await browser.storage.local.set(obj);
};

export const load = async() => {
    console.trace("load from local storage");
    return browser.storage.local.get();
};

export const clear = async() => {
    console.trace("clear local storage");
    await browser.storage.local.clear();
};

export const getTemplateConfig = () => {
    return deepClone(templateConfig);
};
export const getBareConfig = () => {
    return deepClone(ConfigManipulator.empty().cloneConfig());
}



async function V1_0$V1_1(config) {
    logUtil.info('upgrade 1.0 => 1.1')
    config.version = '1.1'
}

async function V1_1$V1_2(config) {
    logUtil.info('upgrade 1.1 => 1.2')
    config.version = '1.2'
}
export const upgrade = async function(config) {
    if (config.version === '1.0') {
        await V1_0$V1_1(config)
    }
    if (config.version === '1.1') {
        await V1_1$V1_2(config)
    }
    logUtil.info('upgrade done')
}
