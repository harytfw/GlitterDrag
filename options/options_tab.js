// class Tab {
//     constructor(id = 1, tabInfo = {}) {
//         this.id = id;
//         this.tabInfo = tabInfo;
//     }
//     show() {
//         this.elem.classList.add("tab-active");
//     }
//     hide() {
//         this.elem.classList.remove("tab-active");
//     }
//     update() {

//     }
// }
// class TabContainer {
//     constructor(selector,tabsData) {
//         this.tabsData = tabsData;

//         this.elem = document.querySelector(selector);
//         this.nav = this.elem.querySelector("nav");

//         Array.from(this.elem.querySelectorAll("nav a"), (e, i) => {
//             e.onclick = event => this._onclick(event);
//             e.setAttribute("nav-id", i);
//         });
//         this.tabs = Array.from(tabsData, (data, idx) => new Tab(idx, data));
//     }
//     _onclick(event) {
//         Array.from(this.nav.children, a => a.classList.remove("nav-active"));
//         event.target.classList.add("nav-active");
//         this.activeById(parseInt(event.target.getAttribute("nav-id")));
//     }

//     activeById(id = 1) {
//         this.tabs.forEach(tab => {
//             if (tab.id === id) tab.show(), tab.initFunc()
//             else tab.hide();
//         });
//     }
// }


