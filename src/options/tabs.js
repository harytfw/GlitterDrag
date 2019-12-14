class CustomTabs extends HTMLElement {
    constructor() {
        super()
        const template = document.querySelector('#tempalte-tabs')
        const content = template.content
        this.append(content.clone(true))

    }

    addTitle(name, active) {
        const ul = this.querySelector('ul')
        ul.insertAdjacentHTML('beforeend', `
            <li><a data-target="${name}">${name}</a></li>
        `)
        if (active) {
            const activeElement = this.querySelector('.is-active')
            if (activeElement) {
                activeElement.classList.remove('is-active')
            }
            ul.lastElementChild.classList.add('is-active')
        }
    }

    addTabItem(name, element) {
        const body = this.querySelector('.tabs-body')
        body.insertAdjacentHTML('beforeend', `
            <div class='column' data-tab-name='${name}'></div>
        `)
        const column = body.lastElementChild
        column.appendChild(element)
    }

    removeTabTitle(name) {
        const ul = this.querySelector('ul')
        // ul.
    }

    removeTabItem(name) {

    }

    addTab(name, element, active = true) {
        this.addTitle(name)
        this.addTabItem(name, element)
    }

    removeTab(name) {

    }

    active(name) {

    }
}

customElements.get('custom-tabs', CustomTabs)