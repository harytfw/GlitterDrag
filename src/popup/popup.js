var list;
var index;


window.onload = async function ()
{
    const url = (await browser.tabs.query({ active: true, currentWindow: true }))[0].url;


    document.getElementById("addRuleBox").style.display = "block";
    document.getElementById("removeRuleBox").style.display = "none";

    
    document.getElementById("addRule").textContent = browser.i18n.getMessage("popup_AddRule");
    document.getElementById("removeRule").textContent = browser.i18n.getMessage("popup_RemoveRule")

    document.getElementById("openOptionsPage").textContent = browser.i18n.getMessage("popup_openOptionsPage")

    list = (await browser.storage.local.get("exclusionRules"))["exclusionRules"];

    let i = 0;
    for (const item of list) {
        try {
            const regexp = new RegExp(item);
            if (regexp.exec(url)) {
                document.getElementById("addRuleBox").style.display = "none";
                document.getElementById("removeRuleBox").style.display = "block";
                document.getElementById("matchedRule").textContent = item;
                index = i;
                break;
            }

        } catch (error) {
            console.error(error)
        }
        i++;
    }

}

document.getElementById("addRule").addEventListener("click", async () =>
{
    const url = (await browser.tabs.query({ active: true, currentWindow: true }))[0].url;
    let pattern = "^" + url.replace(/\./g, "\\.") + ".*" + "$";
    pattern = (new RegExp(pattern)).toString();
    pattern = pattern.substring(1, pattern.length - 1); //remove forward slash at the begin and end
    list = (await browser.storage.local.get("exclusionRules"))["exclusionRules"];
    list.push(pattern);
    index = list.length - 1;
    await browser.storage.local.set({ exclusionRules: list });

    document.getElementById("addRuleBox").style.display = "none";
    document.getElementById("removeRuleBox").style.display = "block";
    document.getElementById("matchedRule").textContent = pattern.toString();
})

document.getElementById("removeRule").addEventListener("click", async () =>
{
    list.splice(index, 1)
    await browser.storage.local.set({ exclusionRules: list });

    document.getElementById("addRuleBox").style.display = "block";
    document.getElementById("removeRuleBox").style.display = "none";
})

document.getElementById("openOptionsPage").addEventListener("click", async () =>
{
    await browser.runtime.openOptionsPage();
})

