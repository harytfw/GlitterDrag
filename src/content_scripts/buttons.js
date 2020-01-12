(async function() {
    return ;
    if (window.top !== window.self) {
        return;
    }


    // var qwindow = new QueryWindow();
    var grids = new Grids();
    function A() {
        // dictService.bing.query(document.body, "service");
        grids.active();
    }

    function B() {
        qwindow.active();
        qwindow.query("service");
    }

    function C() {

    }

    const container = document.createElement("div");

    const root = container.attachShadow({
        mode: "open",
    });
    root.innerHTML = (await (await fetch(browser.runtime.getURL("content_scripts/buttons.html"))).text());

    root.querySelector("#bulma").href = browser.runtime.getURL("libs/bulma/bulma.min.css");

    window.addEventListener("DOMContentLoaded", () => {
        document.body.appendChild(container);
        root.querySelector("#btn-a").addEventListener("click", A);
        root.querySelector("#btn-b").addEventListener("click", B);
    }, { once: true });
})();
