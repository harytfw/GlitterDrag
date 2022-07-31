import { DirectionLabel } from "../config/config";

export class LabelChain {
    private s: DirectionLabel[] = []

    constructor() {

    }

    toString() {
        return JSON.stringify(this.s)
    }

    overwrite(l: DirectionLabel) {
        while (this.s.length !== 0) {
            this.s.pop()
        }
        this.s.push(l);
    }

    push(l: DirectionLabel) {
        if (this.s.length == 0) {
            this.s.push(l)
            return
        }
        if (this.s[this.s.length - 1] != l) {
            this.s.push(l)
            return
        }
    }

    reset() {
        this.s = []
    }

    get labels(): readonly string[] {
        return this.s
    }
}
