
class ExcludedRulesWrapper {
    constructor() {
        browserStorage.get("exclusionRules").then(res => {
            $E("#exclusionRules").value = res["exclusionRules"].join("\n");
        });
        $E("#exclusionRules").addEventListener("change", e => {
            const list = e.target.value.trim().split("\n").filter(val => val.length !== 0)
            $E("#exclusionRules").value = list.join("\n");
            browserStorage.set({ exclusionRules: list })
        })
        $E("#patterns-test").addEventListener("click", async () => {
            const url = $E("#patterns-url-input").value;
            const regexps = (await browserStorage.get("exclusionRules"))["exclusionRules"]
            let msg = "No Match";
            for (const t of regexps) {
                try {
                    const r = new RegExp(t)
                    if (r.exec(url)) {
                        msg = t;
                        break;
                    }
                } catch (error) {
                    msg = t;
                    msg += "\n" + error
                    break;
                }
            }
            $E("#patterns-test-result").textContent = msg;
        })
    }
}