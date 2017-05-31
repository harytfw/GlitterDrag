function tabsSwitch(event) {
    for(let elem of document.querySelectorAll(".nav-a")){
        elem.classList.remove("nav-active");
    }
    event.target.classList.add("nav-active");
    let bindAttr = event.target.getAttribute("bind")
    for (let elem of document.querySelectorAll(".tab-active")) {
        elem.classList.remove("tab-active")
    }
    document.querySelector("#"+bindAttr).classList.add("tab-active")


}

function initTabsPage() {
    for (let elem of document.querySelectorAll(".nav-a")) {
        elem.addEventListener("click", tabsSwitch);
        
    }
}