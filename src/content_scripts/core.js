"use strict";
const CyclerCounter = class {
    constructor(limit = 50) {
        if (limit <= 0) {
            throw new TypeError(`${limit} <= 0`);
        }
        this.n = limit;
        this.limit = limit;
    }

    hit() {
        if (this.n <= 0) {
            this.n = this.limit;
            return true;
        }
        this.n -= 1;
        return false;
    }
    reset() {
        this.n = this.limit;
    }
};

class Core {

    static get KEY_NO() {
        return "";
    }

    static get KEY_CTRL() {
        return 'ctrl';
    }

    static get KEY_SHIFT() {
        return 'shift';
    }

    static get KEY_ALT() {
        return 'alt';
    }

    static get STATE_STOP() {
        return 0;
    }

    static get STATE_NORMAL() {
        return 1;
    }

    static get STATE_DENY() {
        return 2;
    }

    static get STATE_DENY_EXTERNAL() {
        return 3;
    }

    static get STATE_EXTERNAL() {
        return 4;
    }

    static get STATE_TEMPORARY_STOP() {
        return 5;
    }

    static calcAngle(x1, y1, x2, y2) {
        let a = Math.floor(Math.atan2(y2 - y1, x2 - x1) * (180 / Math.PI));
        return a <= 0 ? Math.abs(a) : 360 - a; //convert -180~180 to 0~360
    }

    /**
     *
     * @param {MouseEvent} e
     */
    static _getModifierKeyFromEvent(e) {
        if (e.ctrlKey) {
            return Core.KEY_CTRL;
        } else if (e.shiftKey) {
            return Core.KEY_SHIFT;
        } /*  else if (e.altkey) {
             return Core.KEY_ALT;
        } */
        return Core.KEY_NO;
    }

    constructor(callbacks = {}) {

        this.callbacks = callbacks;

        this.startPos = {
            x: 0,
            y: 0,
        };

        this.endPos = {
            x: 0,
            y: 0,
        };

        this.inner_state = Core.STATE_STOP;
        this.last_state = Core.STATE_STOP;
        this.inner_modifierKey = Core.KEY_NO;
        this.doPreventInDropEvent = false;

        this.counter = new CyclerCounter(20);
        this._stopFlag = false;

        const target = document;
        target.addEventListener("dragstart", e => !this._stopFlag && this._dragstart(e));
        target.addEventListener("dragend", e => !this._stopFlag && this._dragend(e));
        target.addEventListener("drop", e => !this._stopFlag && this._drop(e));
        target.addEventListener("drag", e => !this._stopFlag && this._drag(e));
        target.addEventListener("dragover", e => !this._stopFlag && this._dragover(e));
        target.addEventListener("dragenter", e => !this._stopFlag && this._dragenter(e));
        target.addEventListener("dragleave", e => !this._stopFlag && this._dragleave(e));
    }

    _fixCompatibility() {

    }

    _log(...arg) {
        consoleUtil.log(...arg);
    }

    /**
     * e.target == the element is being dragged
     * @param {DragEvent} e
     */
    _dragstart(e) {
        this._log("_dragstart", e);
        this.startPos.x = this.endPos.x = e.clientX;
        this.startPos.y = this.endPos.y = e.clientY;

        this.inner_modifierKey = Core._getModifierKeyFromEvent(e);
        if (!this.allowDrag(e.target, e.dataTransfer)) {
            this._log("%cdeny accept drag", "color:yello");
            this.inner_state = Core.STATE_DENY;
        } else {
            this._log("%caccept drag", "color:green");
            this.inner_state = Core.STATE_NORMAL;
            this.onStart(e.target, e.dataTransfer, false);
            this.onModifierKeyChange(this.modifierKey, Core.KEY_NO);
        }

    }

    /**
     * e.target == the element readies to accept the dragged
     * @param {DragEvent} e
     */
    _dragover(e) {
        this._log("_dragover, state:", this.inner_state, ", defaultPrevented: ", e.defaultPrevented);
        this.endPos.x = e.clientX;
        this.endPos.y = e.clientY;
        if (e.defaultPrevented
            && this.inner_state !== Core.STATE_TEMPORARY_STOP) {

            this.last_state = this.inner_state;
            this.inner_state = Core.STATE_TEMPORARY_STOP;

            if (this.last_state === Core.STATE_NORMAL
                || this.last_state === Core.STATE_EXTERNAL) {
                this.onHandleBySite(e.target,
                    e.dataTransfer,
                    this.last_state === Core.STATE_EXTERNAL);
            }

        } else if (!e.preventDefault
            && this.inner_state === Core.STATE_TEMPORARY_STOP) {
            this.inner_state = this.last_state;
        }

        if (this.state === Core.STATE_NORMAL || this.state === Core.STATE_EXTERNAL) {
            let oldKey = this.inner_modifierKey;
            this.inner_modifierKey = Core._getModifierKeyFromEvent(e);
            if (oldKey !== this.inner_modifierKey) {
                this.onModifierKeyChange(this.inner_modifierKey, oldKey);
            }
            if (this.allowDrop(e.target, e.dataTransfer, this.state === Core.STATE_EXTERNAL, e.defaultPrevented)) {
                this._log("_dragover, call preventDefault()");
                e.preventDefault(); // important
                this.onMove(e.target, e.dataTransfer, this.state === Core.STATE_EXTERNAL);

            }
        }
    }

    /**
     * e.target == the element finishs drag
     * @param {DragEvent} e
     */
    _dragend(e) {
        this._log("dragend");
        this.callbacks.onEnd(null, null, false);
    }

    /**
     * e.target == the element which is drop zone
     * @param {DragEvent} e
     */
    _dragenter(e) {
        if (this.state === Core.STATE_STOP) {
            this._log("new external action", e);
        }

        if (this.state === Core.STATE_STOP) {
            if (this.allowExternal(e.dataTransfer)) {
                this._log("accpet this external action");
                this._log("target: ", e.target, "relatedTarget: ", e.relatedTarget);
                e.preventDefault();

                this.inner_state = Core.STATE_EXTERNAL;
                this.onExternal(e.dataTransfer);
                this.onStart(null, e.dataTransfer, true);
            } else {
                this.inner_state = Core.STATE_DENY_EXTERNAL;
                this._log("deny accept external action");
            }
        }
        e.preventDefault();
    }

    /**
     * e.target == the element which is drop zone
     * @param {DragEvent} e
     */
    _dragleave(e) {
        if (e.target === document) {
            this._log("_dragleave");
        }
        // e.preventDefault()
    }

    /**
     * e.target == the element which is drop zone
     * @param {DragEvent} e
     */
    _drop(e) {
        this._log("_drop");
        let resetFlag = false;
        if (this.inner_state === Core.STATE_NORMAL) {
            this.doPreventInDropEvent = this.callPreventDefaultInDropEvent(e.target, e.dataTransfer, Core.STATE_EXTERNAL === this.state);
            this.onEnd(e.target, e.dataTransfer, false);
            resetFlag = true;
        } else if (this.inner_state === Core.STATE_EXTERNAL) {
            this.doPreventInDropEvent = this.callPreventDefaultInDropEvent(e.target, e.dataTransfer, Core.STATE_EXTERNAL === this.state);
            this.onEnd(null, e.dataTransfer, true);
            resetFlag = true;
        } else if (this.inner_state === Core.STATE_DENY_EXTERNAL) {
            resetFlag = true;
        } else if (this.inner_state === Core.STATE_DENY) {
            resetFlag = true;
        } else if (this.inner_state === Core.STATE_TEMPORARY_STOP) {
            this._log("_drop", "temporary stop");
            //
        } else if (e.preventDefault) {
            this._log("_drop", `preventDefault = ${e.preventDefault}`);
            //
        }

        if (this.doPreventInDropEvent) {
            this._log("_drop", `state: ${this.state}`, "call preventDefault()");
            e.preventDefault();
        }
        if (resetFlag) {
            this.reset();
        }
    }

    /**
     *
     */
    _drag() {

    }

    get state() {
        return this.inner_state;
    }

    get distance() {
        return Math.hypot(this.startPos.x - this.endPos.x, this.startPos.y - this.endPos.y);
    }

    get angle() {
        return Core.calcAngle(this.startPos.x, this.startPos.y, this.endPos.x, this.endPos.y);
    }

    get modifierKey() {
        return this.inner_modifierKey;
    }

    stop() {
        this._stopFlag = true;
    }

    reset() {
        this._log("reset the world");
        this.inner_state = Core.STATE_STOP;
        this.startPos.x = this.startPos.y = this.endPos.x = this.endPos.y = 0;
        this.doPreventInDropEvent = false;
    }

    allowDrag(target, dataTransfer) {
        return this.callbacks.allowDrag(target, dataTransfer);
    }

    /**
     * determine whether the element can become drop zone
     * @param {HTMLElement} target
     * @param {DataTransfer} dataTransfer
     * @param {boolean} isExternal
     * @param {boolean} defaultPrevented
     * @returns boolean
     */
    allowDrop(target, dataTransfer, isExternal, defaultPrevented) {
        return this.callbacks.allowDrop(target, dataTransfer, isExternal, defaultPrevented);
    }

    /**
     * determine whether the external action should be continuely processed
     * @param {DataTransfer} dataTransfer
     */
    allowExternal(dataTransfer) {
        return this.callbacks.allowExternal(dataTransfer);
    }

    callPreventDefaultInDropEvent(target, dataTransfer, isExternal) {
        return this.callbacks.callPreventDefaultInDropEvent(target, dataTransfer, isExternal);
    }

    /**
     *
     * @param {number} newKey
     * @param {number} oldKey
     */
    onModifierKeyChange(newKey, oldKey) {
        this._log("modifier key changed", `new: ${newKey}`, `old: ${oldKey}`);

        this.callbacks.onModifierKeyChange(newKey, oldKey);
    }

    /**
     *
     * @param {HTMLElement} target
     * @param {DataTransfer} dataTransfer
     * @param {boolean} isExternal
     */
    onStart(target, dataTransfer, isExternal) {
        this._log("onStart", target, `isExternal: ${isExternal}`);
        this._log("onStart", `angle:${this.angle}`, `distance:${this.distance}`, `modifierKey:${this.modifierKey}`);
        this.callbacks.onStart(target, dataTransfer, isExternal);
    }

    /**
     *
     * @param {HTMLElement} target
     * @param {DataTransfer} dataTransfer
     * @param {boolean} isExternal
     */
    onMove(target, dataTransfer, isExternal) {
        // if (this.counter.hit()) {
        this._log("onMove", target, `isExternal: ${isExternal}`);

        this._log("onMove", `angle:${this.angle}`, `distance:${this.distance}`, `modifierKey:${this.modifierKey}`);
        this.callbacks.onMove(target, dataTransfer, isExternal);
        // }
    }

    /**
     *
     * @param {HTMLElement} target
     * @param {DataTransfer} dataTransfer
     * @param {boolean} isExternal
     */
    onEnd(target, dataTransfer, isExternal) {

        this._log("onEnd", target, `isExternal: ${isExternal}`);
        this._log("onEnd", `angle: ${this.angle}`, `distance: ${this.distance}`, `modifierKey: ${this.modifierKey}`);
        this.callbacks.onEnd(target, dataTransfer, isExternal);
    }

    onHandleBySite(target, dataTransfer, isExternal) {

        return false;
    }

    /**
     *
     * @param {DataTransfer} dataTransfer
     */
    onExternal(dataTransfer) {
        this._log("onExternal", dataTransfer);
        this.callbacks.onExternal(dataTransfer);
    }

}
