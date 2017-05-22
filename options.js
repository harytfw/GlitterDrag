let template_str0 = `
<fieldset>
    <label>动作：</label>
    <select>
        <option class="ACT_NONE" value=${ACT_NONE}>无动作</option
        <option value=${ACT_OPEN}>直接打开</option>
        <option value=${ACT_SEARCH}>搜索</option>
        <option value=${ACT_COPY} disabled="disabled">复制</option>
        <option value=${ACT_TRANS} disabled="disabled" >翻译</option>
        <option value=${ACT_DL} disabled="disabled">下载</option>
        <option value=${ACT_QRCODE} disabled="disabled">二维码</option>
    </select>
    <label>打开标签方式：</label>
    <select>
        <option value=${FORE_GROUND}>前台</option>
        <option value=${BACK_GROUND}>后台</option>
    </select>
    <label>标签页位置：</label>
    <select>
        <option value=${TAB_RIGHT}>最右边</option>
        <option value=${TAB_LEFT}>最左边</option>
        <option value=${TAB_CLEFT}>当前标签页之前</option>
        <option value=${TAB_CRIGHT}>当前标签页之后</option>
    </select>
  </fieldset>
`;

let template_str1 = `
<div class="row">
<label>上：</label>${template_str0}
<label>下：</label>${template_str0}
</div>
<div class="row">
<label>左：</label>${template_str0}
<label>右：</label>${template_str0}
</div>
`;

let template_str2 = `
<form>
    <input type="hidden" value=0 name="text">
    <fieldset>
    <legend>文本</legend>
    ${template_str1}
    </fieldset>
</form>
<form>
    <input type="hidden" value=0 name="link">
    <fieldset>
    <legend>链接</legend>
    ${template_str1}
    </fieldset>
</form>
<form>
    <input type="hidden" value=0 name="image">
    <fieldset>
    <legend>图像</legend>
    ${template_str1}
    </fieldset>
</form>
`;



function setInputValue(selectElem,inputElem){
    inputElem.value |= selectElem.value
}

function onChange(event){
    let form = event.target;
    while(parent.tagName!="FORM"){
        form  = form.parentElement;
    }
    let input = form.firstChild;
    let select_list = form.querySelectorAll("select");
    input.value = select_list[0] | select_list[1]|select_list[2]

}

function initForm(){
    document.getElementById("container").innerHTML = template_str2;
    let list  = document.querySelectorAll("select");
    for(let elem of list){
        elem.addEventListener("change",onChange);
    }
}
document.addEventListener('DOMContentLoaded',()=> {
    initForm()
},false);
