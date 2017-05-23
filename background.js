
var userOption = DEFAULT_OPTION;


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
            typeAction = userOption.linkAction;
        }

        else if (this.type === TYPE_TEXT || this.type === TYPE_ELEM) {
            typeAction = userOption.textAction;
        }

        else if (this.type === TYPE_ELEM_IMG) {
            typeAction = userOption.imageAction;
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
            browser.tabs.getCurrent().then(
                //获取当前tab
                (tabInfo) => {

                    if (this.flags.isset(TAB_CUR)) tabInfo.url = url;
                    else {

                        let m_cl = this.flags.isset(TAB_CLEFT);
                        let m_i = 0;

                        if (tabInfo.index !== 0) {
                            m_i = m_cl ? tabInfo.index - 1 : tabInfo.index + 1;
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
                        index: this.flags.isset(TAB_LEFT) ? 0 : tabs.length,
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


function loadUserOptionFromBrowser(callback) {
    if (browser.storage) {
        let promise = browser.storage.sync.get('option');
        promise.then((d) => {
            let m = JSON.parse(d.option);
            if (m.textAction) {
                for (let act in m) {
                    for (let dir in m[act]) {
                        m[act][dir] = new FlagsClass(m[act][dir].f);
                    }
                }
                userOption = m;
            }
            callback ? callback() : null;
        })
    }
}


function saveUserOption() {
    IS_I_CHANGE = true;
    browser.storage.sync.set({
        option: JSON.stringify(userOption)
    });
}





browser.browserAction.onClicked.addListener(() => {
    browser.runtime.openOptionsPage();
});

browser.runtime.onMessage.addListener((m)=>{
    actions.DO(m);
});

loadUserOptionFromBrowser();
