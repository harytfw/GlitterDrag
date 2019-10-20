"use strict";
(function (ns) {
    const findEventElem = (target) => {
        if (!(target instanceof HTMLElement)) {
            return null
        }
        const elem = target.closest("[data-event]")
        if (elem instanceof HTMLElement) {
            return elem
        }
        return null
    }

    ns.findEventElem = findEventElem
})(queryUtil || {})

