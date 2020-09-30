import * as queryUtil from '../../utils/query'
class Notification extends HTMLElement {
    constructor() {
        super();
        this.appendChild(queryUtil.importTemplate("#template-notification"));
        this.elem.addEventListener('click', (event) => {
            const target = event.target;
            if (target instanceof HTMLButtonElement) {
                if (target.classList.contains('delete')) {
                    this.close()
                }
            }
        });
        this.timeoutId = -1
    }

    get elem() {
        return this.querySelector(".notification")
    }

    open(text) {
        this.elem.querySelector(".text").textContent = text
        this.elem.classList.remove('is-hidden')
    }

    close() {
        this.elem.classList.add('is-hidden')
    }
}
customElements.define("custom-notification", Notification);
