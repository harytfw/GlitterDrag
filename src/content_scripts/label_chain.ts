import { Direction } from "../config/config";
import type { Position } from "../types";



export class ChainItem {
    dir: Direction
    start: Position
    end: Position

    constructor(dir: Direction, start: Position, end: Position) {
        this.dir = dir
        this.start = { x: start.x, y: start.y }
        this.end = { x: end.x, y: end.y }
    }
}

export class DirectionChain {
    private s: ChainItem[] = []

    constructor() {

    }

    toString() {
        return JSON.stringify(this.s)
    }

    overwrite(item: ChainItem) {
        if (this.s.length != 0) {
            this.s = []
        }
        this.s.push(item);
    }

    push(item: ChainItem) {
        this.s.push(item)
    }

    pop(): ChainItem | null {
        if (this.s.length == 0) {
            return null
        }
        return this.s.pop()
    }

    empty(): boolean {
        return this.s.length == 0
    }

    reset() {
        this.s = []
    }

    get directions(): readonly Direction[] {
        return this.s.map(item => item.dir)
    }
}
