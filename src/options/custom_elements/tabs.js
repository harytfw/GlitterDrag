"use strict";
class CustomTabs extends HTMLElement {
    constructor() {
        super();

        const template = document.querySelector("#template-tabs");
        const content = template.content;
        this.append(content.cloneNode(true));
        this.addEventListener("click", (e) => this.onTitleClick(e));
        document.title = i18nUtil.getI18n("optionPageTitle");
        i18nUtil.render(this);
    }

    /**
     *
     * @param {MouseEvent} e
     */
    onTitleClick(e) {
        const { target } = e;
        if (!(target instanceof HTMLElement)) {
            return;
        }
        if (target.matches(".tabs-title li a")) {
            const li = target.closest("li");
            const targetElement = document.querySelector(li.dataset.target);

            const origin = document.querySelector(".tabs li.is-active");
            const originTargetElement = document.querySelector(origin.dataset.target);

            origin.classList.remove("is-active");
            originTargetElement.classList.add("is-hidden");

            li.classList.add("is-active");
            targetElement.classList.remove("is-hidden");

        }
    }

}

customElements.define("custom-tabs", CustomTabs);