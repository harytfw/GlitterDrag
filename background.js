
var userOptions = {};
var userSearchEngines = {};
var enableSync = false;


class SimulateTabs {
    constructor() {
        this.tabs = [];
        this.currentIndex = -1;
    }
    createSomeTabs(count) {
        for (let i = 0; i < count; i++) {
            this.tabs.push(i);
        }
    }

    selectTab(index) {
        this.currentIndex = index;
    }

    openNewTab(value, pos) {
        this.tabs.splice(pos, 0, value);
    }

}

class DragActions {

    constructor() {
        this.data = {
            direction: DIR_U,
            selection: "",
            target: document || null
        };
        this.type = TYPE_TEXT;
        this.flags = null;

    }

    DO(x) {
        //console.assert(opt.target instanceof HTMLElement);
        this.data = x;

        this.type = this.data.type;

        if (this.type === TYPE_UNKNOWN) {
            console.error("未知的拖拽目标类型！~");
            return;
        }

        let typeAction = EMPTY_OPTION.noAction;

        if (this.type === TYPE_TEXT_URL || this.type == TYPE_ELEM_A) {
            typeAction = userOptions.linkAction;
        }

        else if (this.type === TYPE_TEXT || this.type === TYPE_ELEM) {
            typeAction = userOptions.textAction;
        }

        else if (this.type === TYPE_ELEM_IMG) {
            typeAction = userOptions.imageAction;
        }
        else {

        }

        this.flags = typeAction[this.data.direction];
        this.execute();

        //清空
        // this.flags = new FlagsClass();
        // this.data = {
        //     direction: DIR_U,
        //     selection: "",
        //     target: document || null
        // };
    }

    execute() {
        console.assert(this.flags instanceof FlagsClass);
        if (this.data.selection.length === 0) {
            return;
        }
        if (this.flags.isset(ACT_OPEN)) {
            this.openURL(this.data.selection);
            // if(this.type === TYPE_TEXT_URL){
            //     this.openURL(this.data.selection);
            // }
            // else if(this.type===TYPE_ELEM_A){
            //     this.openURL(this.data.target.href);
            // }
            // else if(this.type===TYPE_ELEM_IMG){
            //     this.openURL(this.data.target.src);
            // }
        }

        else if (this.flags.isset(ACT_COPY)) {
            alert("复制");
            // this.copyText()
        }

        else if (this.flags.isset(ACT_SEARCH)) {
            if (this.type === TYPE_TEXT) {
                this.searchText(this.data.selection);
            }
            else if (this.type === TYPE_ELEM_IMG) {
                this.searchImage(this.data.selection);
            }
        }

        else if (this.flags.isset(ACT_DL)) {
            this.downloadImage();
        }

        else if (this.flags.isset(ACT_TRANS)) {
            this.translateText();
        }
    }




    openTab(url) {
        let props = {};

        if (this.flags.isset(NEW_WINDOW)) {
            //TODO
        }

        if (this.flags.isset_or(TAB_CUR, TAB_CLEFT, TAB_CRIGHT)) {
            browser.tabs.query({ active: true }).then(
                //获取当前tab
                (tabs) => {
                    let tabInfo = tabs[0];

                    if (this.flags.isset(TAB_CUR)) tabInfo.url = url;
                    else {

                        let m_i = 0;

                        if (tabInfo.index !== 0) {
                            m_i = this.flags.isset(TAB_CLEFT) ? tabInfo.index : tabInfo.index + 1;
                        }
                        browser.tabs.create({
                            active: this.flags.isset(BACK_GROUND) ? false : true,
                            index: m_i,
                            url: url
                        });
                    }
                }
            ).catch(() => { });
        }
        else {
            browser.tabs.query({}).then(
                (tabs) => {
                    browser.tabs.create({
                        active: this.flags.isset(BACK_GROUND) ? false : true,
                        index: this.flags.isset(TAB_FIRST) ? 0 : tabs.length,
                        url: url
                    })
                }
            );
        }

    }

    openURL(url) {
        this.openTab(url)
    }

    searchImage(url) {

    }

    copyText(text) {

    }

    searchText(text) {
        this.openURL("https://www.baidu.com/s?wd=" + text);
    }

    downloadImage(url) {

    }

    translateText(text) {

    }

    onError(error) {
        console.log(`Error: %{error}`)
    }

}


const actions = new DragActions()

function jsonParser(key,value){
    return v;
}



function loadUserOptions(callback) {
    let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    let promise = storageArea.get(['actionOptions', 'enableSync']);
    promise.then((result) => {
        if (!result.hasOwnProperty("enableSync")) {
            userOptions=DEFAULT_OPTIONS;
            enableSync = false;
        }
        else {
            userOptions = result.actionOptions;
            for (let act in userOptions) {
                for (let dir in userOptions[act]) {
                    userOptions[act][dir] = new FlagsClass(userOptions[act][dir].f);
                }
            }
            enableSync = result.enableSync;
        }
        callback?callback():null;
    });
}


function loadUserOptionsFromBackUp(raw_json = "", save_after = true) {
    if (raw_json.length === 0) return;
    let result = JSON.parse(raw_json,jsonParser);
    if (result.hasOwnProperty("enableSync")) {
        userOptions = result.actionOptions;
        for (let act in userOptions) {
            for (let dir in userOptions[act]) {
                userOptions[act][dir] = new FlagsClass(userOptions[act][dir].f);
            }
        }

        enableSync = result.enableSync;
        saveUserOptions();
    }
}

function loadDefaultOptions(){
    userOptions = DEFAULT_OPTIONS;
    saveUserOptions();
}

function saveUserOptions(callback) {

    let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    storageArea.set({
        actionOptions: userOptions,
        enableSync: enableSync,
    });
    callback ? callback() : null;
}


function updateUserOptions(act,dir,value){
    userOptions[act][dir].clear_self_set(parseInt(value));
    saveUserOptions();
}


function convertOptionsToJson(){
    return JSON.stringify({
        actionOptions:userOptions,
        enableSync:enableSync
    },null,2)
}

browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    actions.DO(m);
});

loadUserOptions();
