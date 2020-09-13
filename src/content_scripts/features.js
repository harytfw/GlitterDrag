const extendMiddleButton = new(class {
    constructor() {
        this.MIN_MOVEMENT = 10;
        this.LEFT_BUTTON = 0;
        this.MIDDLE_BUTTON = 1;

        this.STATE_IDLE = 0;
        this.STATE_WORKING = 2;

        this.x1 = 0.0, this.y1 = 0.0;
        this.x2 = 0.0, this.y2 = 0.0;
        this.se = window.getSelection();

        this.state = this.STATE_IDLE;

        this.mouseup = this.mouseup.bind(this);
        this.mousedown = this.mousedown.bind(this);
        this.mousemove = this.mousemove.bind(this);
        this.auxclick = this.auxclick.bind(this);

        this.style = document.createElement("style");
        this.style.textContent = "a { pointer-events:none; }";
    }

    start() {
        document.addEventListener("mouseup", this.mouseup);

        document.addEventListener("mousedown", this.mousedown);

        document.addEventListener("mousemove", this.mousemove);

        document.addEventListener("auxclick", this.auxclick);

    }

    stop() {
        document.removeEventListener("mouseup", this.mouseup);
        document.removeEventListener("mousedown", this.mousedown);
        document.removeEventListener("mousemove", this.mousemove);
        document.removeEventListener("auxclick", this.auxclick);

    }

    getRange(x, y) {
        if (typeof document.caretPositionFromPoint === "function") {
            const {
                offsetNode: node,
                offset: offset
            } = document.caretPositionFromPoint(x, y);
            return {
                node,
                offset,
            };
        }
        else {
            const {
                startContainer: node,
                startOffset: offset
            } = document.caretRangeFromPoint(x, y);
            return {
                node,
                offset,
            };
        }
    }

    mousedown(e) {
        if (e.button !== this.MIDDLE_BUTTON) {
            return;
        }
        e.preventDefault();
        if (this.state === this.STATE_IDLE) {
            this.state = this.STATE_WORKING;
            this.x1 = e.clientX;
            this.y1 = e.clientY;
            const range = this.getRange(e.clientX, e.clientY);
            this.se.setBaseAndExtent(range.node, range.offset, range.node, range.offset);
        }
    }

    mouseup(e) {
        this.state = this.STATE_IDLE;
        if (e.button !== this.MIDDLE_BUTTON) {
            return;
        }
        e.preventDefault();
    }

    mousemove(e) {
        if (this.state === this.STATE_WORKING) {
            const range = this.getRange(e.clientX, e.clientY);
            this.se.extend(range.node, range.offset);
            e.preventDefault();
        }
    }

    auxclick(e) {
        this.state = this.STATE_IDLE;
        if (e.button === this.MIDDLE_BUTTON && this.se.toString() !== "") {
            e.preventDefault();
        }
    }
})();

const scrollbarLocker = {
    //https://stackoverflow.com/questions/13631730/how-to-lock-scrollbar-and-leave-it-visible
    x: 0,
    y: 0,
    lock: () => {
        scrollbarLocker.x = window.scrollX;
        scrollbarLocker.y = window.scrollY;
        window.addEventListener("scroll", scrollbarLocker.doLock, false);
    },
    free: () => {
        window.removeEventListener("scroll", scrollbarLocker.doLock, false);
    },
    doLock: () => {
        window.scrollTo(scrollbarLocker.x, scrollbarLocker.y);
    },
};

// expose global variable
var features = Object.freeze({
    extendMiddleButton,
    scrollbarLocker,
});
