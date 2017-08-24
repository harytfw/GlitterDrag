if (localStorage.getItem("_DEBUG") === "true") {
    document.querySelector("#_debug").style.display = "initial";

    document.addEventListener("keypress", (evt) => {
        const char = evt.key.charAt(0);
        if (char >= "1" && char <= "9" && evt.target.tagName !== "INPUT" && evt.target.tagName !== "TEXTAREA") {
            try {
                $E(`a.nav-a:nth-child(${char})`).click();
            }
            catch (error) {
                // console.error(error);
            }
        }
    });
}