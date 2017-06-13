//全局变量
var userActionOptions = {};
var userCustomizedSearch = [];
var userSearchTemplate = {};
var enableSync = false;
var allowTopDomains = [];//顶级域名，如cn com org net
var enableAnimation = false;//启用过渡动画

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
        this.searchTemplate = null;
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
            typeAction = userActionOptions.linkAction;
        }

        else if (this.type === TYPE_TEXT || this.type === TYPE_ELEM) {
            typeAction = userActionOptions.textAction;
        }

        else if (this.type === TYPE_ELEM_IMG) {
            typeAction = userActionOptions.imageAction;
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
    getSearchTemplate() {
        let name = "";
        if (this.type === TYPE_TEXT_URL || this.type == TYPE_ELEM_A) name = "linkAction";
        else if (this.type === TYPE_TEXT || this.type === TYPE_ELEM) name = "textAction";
        else if (this.type === TYPE_ELEM_IMG) name = "imageAction";

        if (userCustomizedSearch.hasOwnProperty(name)) {
            if (userCustomizedSearch[name].hasOwnProperty(this.data.direction)) {
                return userCustomizedSearch[name][this.data.direction];
            }
        }
        //默认搜索
        return DEFAULT_SEARCH_TEMPLATE["百度"];
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
            this.searchTemplate = this.getSearchTemplate();
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

    copyText(text) {

    }

    searchText(text) {
        this.openURL(this.searchTemplate.replace("%s", text));
    }

    searchImage(url) {
        this.openURL(this.searchTemplate.replace("%s", text));
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



function initActionOptions(raw_act) {
    for (let act in raw_act) {
        for (let dir in raw_act[act]) {
            raw_act[act][dir] = new FlagsClass(raw_act[act][dir].f);
        }
    }
    return raw_act;
}


function tryAssignValue(result) {
    if (result.hasOwnProperty("enableSync")) {
        enableSync = result.enableSync;
    }

    if (result.hasOwnProperty("userActionOptions")) {
        userActionOptions = initActionOptions(result.userActionOptions);
    }

    if (result.hasOwnProperty("userCustomizedSearch")) {
        userCustomizedSearch = result.userCustomizedSearch;
    }

    if (result.hasOwnProperty("userSearchTemplate")) {
        //https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        //第3个对象的属性会覆盖第2个
        //目标是让用户自定义的搜索覆盖扩展自带的搜索
        Object.assign(userSearchTemplate, result.userSearchTemplate, DEFAULT_SEARCH_TEMPLATE)
    }

}

function collectOptions() {
    return {
        userActionOptions: userActionOptions,
        enableSync: enableSync,
        userCustomizedSearch: userCustomizedSearch,
        userSearchTemplate: userSearchTemplate,
        allowTopDomains: allowTopDomains,
        enableAnimation: enableAnimation
    }
}


function loadUserOptions(callback) {
    let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    let promise = storageArea.get();
    promise.then((result) => {
        tryAssignValue(result);
        callback ? callback() : null;
    });
}


function saveUserOptions(callback) {
    let storageArea = enableSync ? browser.storage.sync : browser.storage.local;
    storageArea.set(collectOptions());
    callback ? callback() : null;
}



function convertOptionsToJson() {
    return JSON.stringify(collectOptions(), null, 2)
}


function loadUserOptionsFromBackUp(raw_json = "", save_after = true) {
    if (raw_json.length === 0) return;
    let result = JSON.parse(raw_json, jsonParser);
    tryAssignValue(result);
}

function loadDefaultOptions() {
    userActionOptions = DEFAULT_OPTIONS;
    saveUserOptions();
}

function updateUserActionOptions(act, dir, value) {
    userActionOptions[act][dir].clear_self_set(parseInt(value));
    saveUserOptions();
}

function updateUserCustomizedSearch(index, name, url, remove = false) {
    if(index===-1){
        userCustomizedSearch.push({name:name,url:url});
    }
    else if(remove){
        userCustomizedSearch.splice(index,1);
    }
    else{
        userCustomizedSearch[index] = {name:name,url:url};
    }
    // if (remove) {
    //     delete userCustomizedSearch[oldName];
    // }
    // else if(oldName!=newName){
    //     delete userCustomizedSearch[oldName];
    //     userCustomizedSearch[newName] = templateURL;
    // }
    // else {
    //     userCustomizedSearch[newName] = templateURL;
    // }
    saveUserOptions();
}


browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m) => {
    actions.DO(m);
});

loadUserOptions();
