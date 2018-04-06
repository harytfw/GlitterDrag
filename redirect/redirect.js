function info(text) {
    document.querySelector("#info").textContent = text;
}

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
                    // console.log(json);
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
var gURL, url, cmd, engineName, fileName, fileType;
var uploading = document.querySelector("#uploading");
stopAnimation();
async function main() {
    gURL = new URL(location);
    url = gURL.searchParams.get("url");
    cmd = gURL.searchParams.get("cmd");
    fileName = gURL.searchParams.get("fileName");
    fileType = gURL.searchParams.get("fileType");
    engineName = gURL.searchParams.get("engineName");
    if (cmd === "open") {
        location.href = url;
        return;
    }
    else if (cmd === "search") {
        document.querySelector("img").src = url;
        if (url.length) {
            if (url.startsWith("file:///")) {
                // fetch data from local file
                // sometimes it can't work.
                var canvas = document.createElement("canvas");
                var img = document.querySelector("img");
                canvas.height = img.height;
                canvas.width = img.width;
                var context = canvas.getContext("2d");
                context.drawImage(img, 0, 0);
                canvas.toBlob(file => {
                    img.src = (URL.createObjectURL(file));
                    searchImageViaUploadImage(file);
                }, gURL.searchParams.get("type") || "image/jpeg");
            }
            else {
                fetch(url).then(response => {
                    return response.blob();
                }).then(file => {

                    if (url.startsWith("blob")) {
                        window.URL.revokeObjectURL(url);
                    }
                    searchImageViaUploadImage(new File([file], fileName, { type: fileType }));
                })
            }
        }
    }
    else {
        console.log(url);
    }
}
document.querySelector("button").addEventListener("click", () => {
    engineName = document.querySelector("select").value;
    searchImageViaUploadImage(document.querySelector("input").files[0]);
});
document.querySelector("input").addEventListener("change", (e) => {
    document.querySelector("img").src = window.URL.createObjectURL(e.target.files[0]);
})
main();