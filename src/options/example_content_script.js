function main(selection) {
    console.log("custom content script");

    console.log("text: ", selection.text);
    console.log("plainUrl: ", selection.plainUrl);
    console.log("imageLink: ", selection.imageLink);

    console.log("send message to other extension");
    // browser.runtime.sendMessage("id@extension", { data: selection });
}
