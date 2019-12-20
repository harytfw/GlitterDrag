function buildEmptyConfig() {

}

const templateConfig = {
    enableSync: false,

    enableIndicator: false,
    enablePrompt: false,

    enableTimeoutCancel: false,
    timeoutCancel: 2000,

    minDistance: 20,
    maxDistance: 9999,

    appendImageReferrer: false,

    actions: [{
        name: "",
        hotkey: "",
        detail: {
            text: [{
                direction: "",
                command: "",

                preferImage: true,

                activeTab: false,
                tabPosition: "",
                searchEngine: {
                    name: "",
                    url: "",
                    favIcon: "",
                    method: "get",
                    fromBrowser: false,
                },

                download: {
                    directoryName: "",
                    option: ""
                },

                openOption: "",
                searchOption: "",
                copyOption: "",
                showSaveDialog: false,
                searchOnSite: false,
                scriptId: "",
                prompt: "",

            }],
            link: {

            },
            image: {

            }
        }
    }],

    directories: [
        {
            name: "",
            type: "",
            value: "",
        }
    ],

    maxProcessSize: 5, //unit is M; the file that larger than 5M won't be processed.
    disableFixURL: false,

    version: "0.0.0",

    features: {
        keepUiDisplay: false,
        extendMiddleButton: false,
        lockScrollbar: false
    },

    currentStyle: "",
    styles: [
        {
            name: "",
            style: ""
        }
    ],

    translator: {
        baidu_gtk: "",
        baidu_token: "",
        primary_provider: "google",
        recent_sourcelang: "auto",
        recent_targetlang: "auto",
    },

    scripts: [{
        id: "",
        name: "",
        script: ""
    }]
};


var configAPI = {
    
}