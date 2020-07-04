
class Grids {

    static get PATH() {
        return "content_scripts/component/grids";
    }

    constructor() {
        this.container = document.createElement("div");
        this.container.id = "gd-grids";
        this.container.style.all = 'unset';


        this.rectCache = null;

        this.gridsBox = null;
        this.grids_3x3 = null;
        this.grids_3x4 = null;

        this.root = this.container.attachShadow({
            mode: "closed",
        });

        fetch(browser.runtime.getURL(`${Grids.PATH}/grids.html`))
            .then(r => r.text())
            .then(html => {
                this.root.innerHTML = html;
                this.gridsBox = this.root.querySelector("#grids");
                this.root.querySelector("#bulma").href = browser.runtime.getURL("libs/bulma/bulma.min.css");
                this.root.querySelector("#css").href = browser.runtime.getURL(`${Grids.PATH}/grids.css`);
            });
        this.activeCommand = null;
        this.root.addEventListener("dragover", (e) => {
            if (this.activeCommand instanceof HTMLElement) {
                this.activeCommand.classList.remove("active");
                this.activeCommand = null;
            }
            if (e.target instanceof HTMLElement) {
                this.activeCommand = e.target;
                this.activeCommand.classList.add("active");
            }
        });
    }

    allowDrop() {
        return this.activeCommand instanceof HTMLElement && typeof this.activeCommand.dataset.direction === "string";
    }

    get direction() {
        if (this.activeCommand instanceof HTMLElement && typeof this.activeCommand.dataset.direction === "string") {
            return this.activeCommand.dataset.direction;
        }
        return null;
    }

    get isActive() {
        return this.container.parentElement instanceof HTMLElement;
    }

    active(x, y, actionGroup, actionType) {
        if (this.isActive) {
            return;
        }

        this.render(actionGroup, actionType);
        consoleUtil.log("place grids, x:", y, "y:", y, actionGroup, this.rectCache);

        this.gridsBox.style.visibility = "hidden";
        document.body.appendChild(this.container);
        setTimeout(() => {
            this.rectCache = this.gridsBox.getBoundingClientRect();
            this.gridsBox.style.left = `${queryUtil.fixHorizonOffset(x - (this.rectCache.width + 10) / 2, this.rectCache.width + 10)}px`;
            this.gridsBox.style.top = `${queryUtil.fixVerticalOffset(y - (this.rectCache.height + 10) / 2, this.rectCache.height + 10)}px`;
            document.body.appendChild(this.container);
            this.gridsBox.style.visibility = "";
        }, 60);
    }

    render(actionGroup, actionType) {
        consoleUtil.log("render grids", actionGroup, actionType);
        if (actionGroup.limitation === "grids_3x3") {
            this.root.querySelector("#grids-3x3").classList.remove("is-hidden");
            this.root.querySelector("#grids-4x4").classList.add("is-hidden");
            this.render_3x3(actionGroup.details[actionType]);
        } else if (actionGroup.limitation === "grids_4x4") {
            this.root.querySelector("#grids-3x3").classList.add("is-hidden");
            this.root.querySelector("#grids-4x4").classList.remove("is-hidden");
            this.render_4x4(actionGroup.details[actionType]);
        }
    }

    render_3x3(details) {
        const cells = Array.from(this.root.querySelectorAll("#grids-3x3 .column .command"));

        cells.forEach((cell, index) => {
            const d = details.find(a => a.direction === cell.dataset.direction);
            if (d && d.command !== "") {
                cell.innerHTML = d.prompt !== "" ? d.prompt : index;
                cell.style.visibility = "";
            } else {
                cell.textContent = "NOOP";
                cell.style.visibility = "hidden";
            }
        });
    }

    render_4x4(actionGroup) {
        const cells = Array.from(this.root.querySelectorAll("#grids-4x4 .column .command"));

        cells.forEach((cell, index) => {
            const d = details.find(a => a.direction === cell.dataset.direction);
            if (d && d.command !== "") {
                cell.innerHTML = d.prompt !== "" ? d.prompt : index;
                cell.style.visibility = "";
            } else {
                cell.textContent = "NOOP";
                cell.style.visibility = "hidden";
            }
        });
    }

    remove() {
        if (consoleUtil.autoHide) {
            consoleUtil.log("close grids");
            // this.gridsBox.style.visibility = "hidden";
            this.container.remove();
            this.gridsBox.style.left = "0px";
            this.gridsBox.style.top = "0px";

        }
    }

}