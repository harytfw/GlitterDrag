"use strict";

import * as logUtil from '../../../utils/log'
export class RangeIndicator {

    static get PATH() {
        return "content_scripts/component/range_indicator";
    }

    static get CSS_Path() {
        return RangeIndicator.PATH + "/range_indicator.css";
    }

    static get HTML_PATH() {
        return RangeIndicator.PATH + "/range_indicator.html";
    }

    constructor() {
        this.container = document.createElement("div");
        this.container.id = 'gd-range-indicator';
        this.container.style.all = 'unset';

        this.radius = 0;

        /**
         * create shadowRoot with mode "closed" to
         *  prevent the page script accessing any infomation of our webextebsion
         */
        const root = this.container.attachShadow({
            mode: "closed",
        });

        this.indicator = null;
        fetch(browser.runtime.getURL(RangeIndicator.HTML_PATH))
            .then(res => res.text())
            .then(html => {
                root.innerHTML = html;
                root.querySelector("link").href = browser.runtime.getURL(RangeIndicator.CSS_Path);
                this.indicator = root.querySelector("#range-indicator");
            });
    }

    get value() {
        return this.radius;
    }

    active(x, y, val) {
        this.radius = val;
        this.indicator.style.left = `${x - val}px`;
        this.indicator.style.top = `${y - val}px`;
        this.indicator.style.height = `${val * 2}px`;
        this.indicator.style.width = `${val * 2}px`;
        this.indicator.style.borderRadius = `${val * 2}px ${val * 2}px`;
        document.body.appendChild(this.container);
    }

    remove() {
        if (globalThis.autoHide) {
            logUtil.log("close range indicator");
            this.container.remove();
        }
    }

}
