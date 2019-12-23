"use strict"
document.addEventListener("click", () => {
    for (const t of document.querySelectorAll(".dropdown.is-active")) {
        if (t instanceof HTMLElement) {
            if ("lastActive" in t.dataset) {
                delete t.dataset.lastActive
            } else {
                t.classList.remove("is-active")
            }
        }
    }
})

function closeBulmaDropdown(context) {

}

function addBulmaDropdownEvent(context, onTrigger, onClickItem) {

}

function initBulmaDropdown(context) {
    console.info(context, "init bulma dropdown")
    context.addEventListener("click", e => {
        const { target } = e
        let item = null
        if (target instanceof HTMLElement) {
            if (target.closest(".dropdown .dropdown-trigger") instanceof HTMLElement) {
                const dropdown = target.closest(".dropdown")
                dropdown.classList.add("is-active")
                dropdown.dataset.lastActive = true

            } else if ((item = target.closest(".dropdown .dropdown-menu .dropdown-item")) instanceof HTMLElement) {
                const dropdown = target.closest(".dropdown")
                dropdown.classList.remove("is-active")

                const input = dropdown.querySelector("input")
                if (input) {
                    input.value = item.dataset["value"]
                    input.dispatchEvent(new Event("change", { bubbles: true }))
                } else {
                    // console.warn(dropdown,"has not input element")
                }

                const button = dropdown.querySelector(".dropdown-trigger button")
                if (button) {
                    button.textContent = item.textContent
                } else {
                    console.warn(dropdown, "has not input element")
                }

            }
        }
    })
}