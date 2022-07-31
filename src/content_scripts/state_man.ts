
export enum States {
    initial = 0,
    running = 1 << 1,
    resolved = 1 << 3,
    exceedDistance = 1 << 4,
    interfere = 1 << 9,
    skip = 1 << 10,
}

export class StateMan {
    private cur: States

    constructor() {
        this.cur = States.initial
    }

    reset(...states: States[]) {
        this.cur = States.initial
        this.set(...states)
    }

    set(...states: States[]) {
        for (const s of states) {
            this.cur |= s
        }
    }

    clear(...states: States[]) {
        for (const s of states) {
            this.cur &= ~s
        }
    }

    test(...states: States[]): boolean {
        return this.test_and(...states)
    }

    test_not(...states: States[]): boolean {
        return !this.test_and(...states)
    }

    test_and(...states: States[]): boolean {
        for (const s of states) {
            if ((this.cur & s) === 0) {
                return false
            }
        }
        return true
    }

    test_or(...states: States[]): boolean {
        for (const s of states) {
            if ((this.cur & s) !== 0) {
                return true
            }
        }
        return false
    }

    toString() {
        let s = this.cur

        if (s === States.initial) {
            return 'initial'
        }

        let a = []

        if ((s & States.running) !== 0) {
            a.push('running')
        }
        if ((s & States.interfere) !== 0) {
            a.push('interfere')
        }
        if ((s & States.resolved) !== 0) {
            a.push('resolved')
        }
        if ((s & States.skip) !== 0) {
            a.push('skip')
        }

        if ((s & States.exceedDistance) !== 0) {
            a.push("badDistance")
        }
        return a.join("|")
    }

}
