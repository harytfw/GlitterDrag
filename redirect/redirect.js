function info(text) {
    document.querySelector("#info").textContent = text;
}

function searchImageViaUploadImage(engineName = "", file = new File()) {
    if (file.length <= 0) return;
    // let array = new Uint8Array(arrayBuffer)
    // let rawBin = array.toString();
    // array = new Uint8Array(rawBin.split(","));
    const form = new FormData();
    const headers = new Headers();
    // const image = new Blob([array], {
    //     type: "image/jpeg"
    // });
    let server = "";
    if (engineName === "baidu") {
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
        }).then(async(res) => {
            return res.json();
        }).then((json) => {
            console.log(json);
            if (json.url) {
                location.href = `http://image.baidu.com/n/pc_search?queryImageUrl=${json.url}`;
            }
        }).catch((error) => {
            console.error(error);
        })
    }
    else if (engineName === "google") {
        server = "https://www.google.com/searchbyimage/upload";
        form.append("encoded_image", file);
        fetch(server, {
            method: "POST",
            body: form
        }).then(async(res) => {
            return res.json();
        }).then((json) => {
            if (json.url) {
                console.log(json);
                // this.openTab(json.url);
            }
        }).catch((error) => {
            console.error(error);
        })
    }
}

async function main() {
    var gURL = new URL(location);
    var url = gURL.searchParams.get("url");
    var cmd = gURL.searchParams.get("cmd");
    if (cmd === "open") {
        location.href = url;
        return;
    }
    else if (cmd === "search") {
        document.querySelector("img").src = url;
        if (url.length !== 0) {
            if (url.startsWith("file:///")) {
                // fetch data from local file
                var canvas = document.createElement("canvas");
                var img = document.querySelector("img");
                canvas.height = img.height;
                canvas.width = img.width;
                var context = canvas.getContext("2d");
                context.drawImage(img, 0, 0);
                canvas.toBlob((file) => {
                    img.src = (URL.createObjectURL(file));
                    searchImageViaUploadImage(decodeURIComponent(gURL.searchParams.get("engineName")), file);
                }, gURL.searchParams.get("type") || "image/jpeg");
            }
            else {
                fetch(url).then(response => {
                    return response.blob();
                }).then(file => {
                    searchImageViaUploadImage(decodeURIComponent(gURL.searchParams.get("engineName")), file);
                })
            }
        }
    }
    else {
        console.log(url);
    }
}
main();
document.querySelector("button").addEventListener("click", () => {
    searchImageViaUploadImage(document.querySelector("select").value, document.querySelector("input").files[0]);
});
document.querySelector("input").addEventListener("change", (e) => {
    document.querySelector("img").src = window.URL.createObjectURL(e.target.files[0]);
})
