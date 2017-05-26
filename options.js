let template_str0 = `
<fieldset>
    <label>动作：</label>
    <select>
        <option class="ACT_NONE" value=${ACT_NONE}>无动作</option>
        <option class="ACT_OPEN" value=${ACT_OPEN}>直接打开</option>
        <option class="ACT_SEARCH" value=${ACT_SEARCH}>搜索</option>
        <option class="ACT_COPY" value=${ACT_COPY} disabled="disabled">复制</option>
        <option class="ACT_TRANS" value=${ACT_TRANS} disabled="disabled" >翻译</option>
        <option class="ACT_DL" value=${ACT_DL} disabled="disabled">下载</option>
        <option class="ACT_QRCODE" value=${ACT_QRCODE} disabled="disabled">二维码</option>
    </select>
    <label>打开标签方式：</label>
    <select>
        <option class="FORE_GROUND" value=${FORE_GROUND}>前台</option>
        <option class="BACK_GROUND" value=${BACK_GROUND}>后台</option>
    </select>
    <label>标签页位置：</label>
    <select>
        
        <option class="TAB_RIGHT" value=${TAB_LAST}>尾</option>
        <option class="TAB_LEFT" value=${TAB_FIRST}>首</option>
        <option class="TAB_CLEFT" value=${TAB_CLEFT}>当前标签页之前</option>
        <option class="TAB_CRIGHT" value=${TAB_CRIGHT}>当前标签页之后</option>
    </select>
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
}, () => { });


function backup() {

}

function restore() {

}

function resetDefault() {

}

function onChange(event) {
    let form = event.target;
    while (form.tagName !== "FORM") {
        form = form.parentElement;
    }
    //                select fieldset      div@class=row input
    let input = event.target.parentElement.parentElement.querySelector("input");
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

    backgroundPage.updateUserOptions(key,input.name,input.value);
}

function initForm() {
    document.getElementById("container").innerHTML = template_str2;
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
            let flags = backgroundPage.userOptions[key][input.name];
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

let fileReader = new FileReader();

fileReader.addEventListener("loadend", () => {
    try {

        backgroundPage.loadUserOptionsFromBackUp(fileReader.result);
        initForm();
    }
    catch(e){
        console.error("在恢复用户配置时出现异常！",e);
        alert("在恢复用户配置时出现异常！");
    }
});

document.addEventListener('DOMContentLoaded', () => {
    backgroundPage.loadUserOptions(() => {
        initForm();
    })
}, false);
document.querySelector("#backup").addEventListener("click", (event) => {
    let blob = new Blob([backgroundPage.convertOptionsToJson()],{type : 'application/json'});
    event.target.setAttribute("href", URL.createObjectURL(blob));
    event.target.setAttribute("download","GlitterDrag"+new Date().getTime()+".json");
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
