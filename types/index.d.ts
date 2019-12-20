declare function foo(n: number): number;

interface ActionDetail {

    direction: string,
    command: string,

    preferImage: boolean,

    activeTab: boolean,
    tabPosition: string,
    searchEngine: {
        name: string,
        url: string,
        favIcon: string,
        method: string,
        fromBrowser: boolean,
    },

    download: {
        directoryName: string,
        option: string,
    },

    openOption: string,
    searchOption: string,
    copyOption: string,
    showSaveDialog: boolean,
    searchOnSite: boolean,
    scriptId: string,
    prompt: string,
}

interface DirectoryItem {
    name: string,
    type: string,
    value: string,
}

interface StyleItem {
    name: string,
    value: string,
}

interface ScriptItem {
    name: "",
    value: ""
}

interface ConfigInterface {
    enableSync: boolean,

    enableIndicator: boolean,
    enablePrompt: boolean,

    enableTimeoutCancel: boolean,
    timeout: number,

    minDistance: number,
    maxDistance: number,

    appendImageReferrer: boolean,

    actions: Array<{
        name: string,
        hotkey: string,
        detail: {
            text: ActionDetail[],
            link: ActionDetail[],
            image: ActionDetail[]
        }
    }>,

    directories: DirectoryItem[],

    maxProcessSize: number,
    disableFixURL: boolean,

    version: string,

    features: {
        keepUiDisplay: boolean,
        extendMiddleButton: boolean,
        lockScrollbar: boolean
    },

    currentStyle: string,
    styles: StyleItem[],

    translator: {
        baidu_gtk: string,
        baidu_token: string,
        primary_provider: string,
        recent_sourcelang: string,
        recent_targetlang: string,
    },

    scripts: ScriptItem[]
};

declare const templateConfig: ConfigInterface;


interface DirectionDefine {
    range: [number, number],
    value: string,
}

declare const DIMENSION: {
    
};