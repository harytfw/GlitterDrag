class Tab {
    constructor(elem, id,func) {
        this.elem = elem;
        this.id = id;
        this.initFunc = func;
    }
    reloadTab(){
        this.initFunc();
    }
    show() {
        this.elem.classList.add("tab-active");
    }
    hide() {
        this.elem.classList.remove("tab-active");
    }
}
class TabContainer {
    constructor(selector) {
        this.onclick = this.onclick.bind(this);
        this.elem = document.querySelector(selector);
        this.nav = this.elem.querySelector("nav");

        Array.from(this.elem.querySelectorAll("nav a"), (e, i) => {
            e.onclick = this.onclick;
            e.setAttribute("nav-id", i);
        });
        this.tabs = Array.from(this.elem.querySelectorAll(".tab-content"), (v, i) => new Tab(v, i));
    }
    onclick(event) {
        Array.from(this.nav.children, a => a.classList.remove("nav-active"));
        event.target.classList.add("nav-active");
        this.activeById(parseInt(event.target.getAttribute("nav-id")));
    }
    // newTab(tabName,tabSelector){
    //     let a = document.createElement("a");
    //     a.onclick = this.onclick;
    //     a.setAttribute("tab-id",this.tabs.length);
    //     let tab = new Tab(document.querySelector(tabSelector),a.getAttribute("tab-id"));

    // }
    activeById(id) {
        this.tabs.forEach(tab => tab.id === id ? tab.show() : tab.hide());
    }
}
let tabContainer = new  TabContainer("#tabs");
