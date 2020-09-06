
function startAnimation() {
    uploading.style.visibility = "visible";
    uploading.style.animationPlayState = "running";
}

function stopAnimation() {
    uploading.style.visibility = "hidden";
    uploading.style.animationPlayState = "paused";
}

function searchImageViaUploadImage(file = new File()) {
    if (file.length <= 0) return;
    else if (!(file instanceof Blob)) return;
    const engineName = document.querySelector("select").value;
    const form = new FormData();
    const headers = new Headers();
    let server = "";
    startAnimation();

    switch (engineName) {
        case "baidu":
            {
                server = "http://image.baidu.com/pcdutu/a_upload?fr=html5&target=pcSearchImage&needJson=true";
                form.append("file", file, file.name);
                form.append("pos", "upload");
                form.append("uptype", "upload_pc");
                headers.append("Referer", "http://image.baidu.com/");
                headers.append("Host", "image.baidu.com");
                headers.append("Pragma", "no-cache");
                headers.append("Cache-Control", "no-cache");
                headers.append("Origin", "https://www.baidu.com");
                fetch(server, {
                    method: "POST",
                    headers: headers,
                    body: form,
                }).then(async (res) => {
                    return res.json();
                }).then((json) => {
                    stopAnimation();
                    // logUtil.log(json);
                    if (json.url) {
                        location.href = `http://image.baidu.com/n/pc_search?queryImageUrl=${json.url}`;
                    }
                }).catch((error) => {
                    console.error(error);
                })
                break;
            }
        case "google":
            {
                server = "https://www.google.com/searchbyimage/upload";
                form.append("encoded_image", file, file.name);
                fetch(server, {
                    method: "POST",
                    body: form
                }).then(async (res) => {
                    stopAnimation();
                    location.href = res.url;
                }).catch((error) => {
                    console.error(error)
                })
                break;
            }
        case "tineye":
            {
                server = "https://www.tineye.com/search";
                headers.append("Referer", "https://www.tineye.com/search");
                headers.append("Host", "www.tineye.com");
                headers.append("Origin", "https://www.tineye.com/search");
                form.append("image", file);
                fetch(server, {
                    method: "POST",
                    body: form,
                    headers,
                }).then((res) => {
                    stopAnimation();
                    location.href = res.url;
                })
                break;
            }
        case "yandex":
            {
                server = `https://yandex.com/images/search?serpid=bwkvNFtgm5Aegc2WAu7irQ&uinfo=sw-1920-sh-1080-ww-1920-wh-959-pd-1-wp-16x9_1920x1080&rpt=imageview&format=json&request={"blocks":[{"block":"b-page_type_search-by-image__link"}]}`;
                form.append("upfile", file, file.name);
                headers.append("Origin", "https://yandex.com");
                fetch(server, {
                    method: "POST",
                    body: form,
                    headers,
                }).then(res => {
                    return res.json();
                }).then(json => {
                    stopAnimation();
                    const url = "https://yandex.com/images/search?" + json["blocks"][0]["params"]["url"];
                    location.href = url;
                })
            }
    }

}

var uploading = document.querySelector("#uploading");
async function main() {
    stopAnimation();
    const page = await browser.runtime.getBackgroundPage()
    if (page === null) {
        alert("the background page is null, maybe it is a private window")
        return
    }
    const key = new URL(location.href).searchParams.get("key")
    const { executor } = page
    //TODO
    const { data, cmd } = executor.temporaryDataStorage.get(key)
    executor.temporaryDataStorage.delete(key)
    logUtil.log(data, cmd)
}

document.querySelector("button").addEventListener("click", () => {
    searchImageViaUploadImage(document.querySelector("input").files[0]);
});
document.querySelector("input").addEventListener("change", (e) => {
    document.querySelector("img").src = window.URL.createObjectURL(e.target.files[0]);
})

main();