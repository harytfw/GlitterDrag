let template_str0 = `
<fieldset>
    <div>

        <select title="执行的动作">
            <option class="ACT_NONE" value=${ACT_NONE}>无动作</option>
            <option class="ACT_OPEN" value=${ACT_OPEN}>直接打开</option>
            <option class="ACT_SEARCH" value=${ACT_SEARCH}>搜索</option>
            <option class="ACT_COPY" value=${ACT_COPY} disabled="disabled">复制</option>
            <option class="ACT_TRANS" value=${ACT_TRANS} disabled="disabled" >翻译</option>
            <option class="ACT_DL" value=${ACT_DL} disabled="disabled">下载</option>
            <option class="ACT_QRCODE" value=${ACT_QRCODE} disabled="disabled">二维码</option>
        </select>
    </div>
    <div>
        <select title="打开的方式">
            <option class="FORE_GROUND" value=${FORE_GROUND}>前台</option>
            <option class="BACK_GROUND" value=${BACK_GROUND}>后台</option>
        </select>
    </div>
    <div>
        <select title="标签页位置">
            <option class="TAB_RIGHT" value=${TAB_LAST}>尾</option>
            <option class="TAB_LEFT" value=${TAB_FIRST}>首</option>
            <option class="TAB_CLEFT" value=${TAB_CLEFT}>前</option>
            <option class="TAB_CRIGHT" value=${TAB_CRIGHT}>后</option>
        </select>
    </div>
  </fieldset>
`;
//<!-- <option class="TAB_CUR" value=${TAB_CUR}>当前标签页</option> -->
let template_str1 = `
<div class="row">
    <input type="hidden" value=0 name=${DIR_U}>
    <label>上：</label>${template_str0}
</div>
<div class="row">
    <input type="hidden" value=0 name=${DIR_D}>
    <label>下：</label>${template_str0}
</div>
<div class="row">
    <input type="hidden" value=0 name=${DIR_L}>
    <label>左：</label>${template_str0}
</div>
<div class="row">
    <input type="hidden" value=0 name=${DIR_R}>
    <label>右：</label>${template_str0}
</div>
`;

let template_str2 = `
<form id="text">

    <fieldset>
    <legend>文本</legend>
    ${template_str1}
    </fieldset>
</form>
<form id="link">
    <fieldset>
    <legend>链接</legend>
    ${template_str1}
    </fieldset>
</form>
<form id="image">
    <fieldset>
    <legend>图像</legend>
    ${template_str1}
    </fieldset>
</form>
`;


let backgroundPage = null;
browser.runtime.getBackgroundPage().then((page) => {
    backgroundPage = page;
    if (backgroundPage.enableAnimation) {

    }
}, () => { });

function backup() {

}

function restore() {

}

function resetDefault() {

}

function initForm() {
    function onChange(event) {
        let form = event.target;
        while (form.tagName !== "FORM") {
            form = form.parentElement;
        }
        let div_row = event.target;
        while (div_row.className !== "row") {
            div_row = div_row.parentElement;
        }
        let input = div_row.querySelector("input");
        let select_list = input.parentElement.querySelectorAll("select");
        input.value = parseInt(select_list[0].value) | parseInt(select_list[1].value) | parseInt(select_list[2].value);

        let key = "linkAction";
        switch (form.id) {
            case "text":
                key = "textAction";
                break;
            case "link":
                key = "linkAction";
                break;
            case "image":
                key = "imageAction";
                break;
        }

        backgroundPage.updateUserActionOptions(key, input.name, input.value);
    }


    document.querySelector("#content-1").innerHTML = template_str2;
    let list = document.querySelectorAll("select");



    for (let elem of list) {
        elem.addEventListener("change", onChange);
    }

    for (let form of document.querySelectorAll("form")) {
        let key = "linkAction";
        switch (form.id) {
            case "text":
                key = "textAction";
                break;
            case "link":
                key = "linkAction";
                break;
            case "image":
                key = "imageAction";
                break;
        }
        for (let row of form.querySelectorAll(".row")) {
            let input = row.querySelector("input");
            let flags = backgroundPage.userActionOptions[key][input.name];
            input.value = flags.f;
            for (let select of row.querySelectorAll("select")) {
                for (let opt of select.querySelectorAll("option")) {
                    if (flags.isset(opt.value)) {
                        opt.selected = "selected";
                        break;
                    }
                }
            }
        }
    }
}

function initSearchTemplateTab() {
    function update() {
        let templateObj = backgroundPage.userSearchTemplate;
        for (let name of Object.keys(templateObj)) {
            let box = generateBox(name, templateObj[name]);
            // box.children[0].addEventListener("focus",onInputFocus)
            // box.children[0].addEventListener("blur",onInputBlur)
            // box.children[0].addEventListener("keypress",onKeyPress)
            // box.children[1].addEventListener("focus",onInputFocus)
            // box.children[1].addEventListener("blur",onInputBlur)
            // box.children[1].addEventListener("keypress",onKeyPress)
            container.appendChild(box)
        }
    }

    function generateBox(name = "", template = "") {
        let div = document.createElement("div")
        div.innerHTML = `<input type="text" class="input-name input-disabled" tooltip="名称" value="${name}"></input>
            <input type="text" class="input-template input-disabled" tooltip="搜索模板" value="${template}"></input>
            `;
        return div;
    }

    function onKeyPress(event) {
        if (event.key === "Enter") {
            event.target.blur();
        }
        else if (event.key === "Escape") {
            event.target.value = event.target.getAttribute("placeholder");
            event.target.blur();
        }
        console.dir(event)
    }

    function onInputFocus(event) {
        event.target.value = event.target.getAttribute("placeholder");
    }

    function onDoubleClick(event) {
        let elem = event.target;
        console.log("dbclcikc")
    }

    function onInputBlur(event) {
        //save data
        event.target.setAttribute("placeholder", event.target.value);
        event.target.value = "";
        // event.target.removeAttribute("value");
    }

    function onButtonClick(event) {
        if (event.target.id = "template-add") {

        }
        else {

        }
        console.log("btn click");
    }

    let container = $E("#container-search");
    for (let removeTarget of container.querySelectorAll("div")) {
        container.removeChild(removeTarget);
    }
    // container.addEventListener("dblclick", onDoubleClick);
    // container.addEventListener("blur", onBlur);
    $E("#template-add").addEventListener("click", onButtonClick);
    $E("#template-save").addEventListener("click", onButtonClick);
    update();
}


let fileReader = new FileReader();

fileReader.addEventListener("loadend", () => {
    try {

        backgroundPage.loadUserOptionsFromBackUp(fileReader.result);
        initForm();
    }
    catch (e) {
        console.error("在恢复用户配置时出现异常！", e);
        alert("在恢复用户配置时出现异常！");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    backgroundPage.loadUserOptions(() => {
        initForm();
    });

}, false);
document.querySelector("#backup").addEventListener("click", (event) => {
    let blob = new Blob([backgroundPage.convertOptionsToJson()], { type: 'application/json' });
    event.target.setAttribute("href", URL.createObjectURL(blob));
    event.target.setAttribute("download", "GlitterDrag" + new Date().getTime() + ".json");
});

document.querySelector("#restore").addEventListener("click", () => {
    document.querySelector("#fileInput").click();
});


document.querySelector("#default").addEventListener("click", () => {

    backgroundPage.loadDefaultOptions();
    initForm();
});

document.querySelector("#fileInput").addEventListener("change", (event) => {
    fileReader.readAsText(event.target.files[0])
});

initTabsPage();


