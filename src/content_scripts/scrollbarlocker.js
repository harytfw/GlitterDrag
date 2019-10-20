

const scrollbarLocker = {
    //https://stackoverflow.com/questions/13631730/how-to-lock-scrollbar-and-leave-it-visible
    x: 0,
    y: 0,
    lock: function () {
        this.x = window.scrollX;
        this.y = window.scrollY;
        window.addEventListener("scroll", this.doLock, false);
    },
    free: function () {
        window.removeEventListener("scroll", this.doLock, false);
    },
    doLock: function () {
        window.scrollTo(this.x, this.y);
    }

}
scrollbarLocker.doLock = scrollbarLocker.doLock.bind(scrollbarLocker);
