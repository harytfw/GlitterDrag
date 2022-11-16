import { ActionConfig, Asset, AssetType, Configuration, Direction, OperationMode } from "../config/config";
import type { Position } from "../types";
import type { MenuItem } from "../components/types";


export function getAngle(a: Position, b: Position) {
    let r = Math.floor(Math.atan2(b.y - a.y, b.x - a.x) * (180 / Math.PI));
    return r <= 0 ? Math.abs(r) : 360 - r; //convert -180~180 to 0~360
}

export function onDocumentLoaded(cb: Function) {
    if (document.readyState == 'loading') {
        document.addEventListener("DOMContentLoaded", () => { cb() }, { once: true })
    } else {
        cb()
    }
}

export type RangeMapping = {
    range: [number, number],
    label: Direction
}

export const directionMapping: Record<OperationMode, RangeMapping[]> = {
    any: [
        { range: [0, 360], label: Direction.any, }
    ],
    normal: [
        { range: [45, 135], label: Direction.up, },
        { range: [135, 225], label: Direction.left, },
        { range: [225, 315], label: Direction.down, },
        { range: [315, 360], label: Direction.right, },
        { range: [0, 45], label: Direction.right, }
    ],
    upDown: [
        { range: [0, 180], label: Direction.up, },
        { range: [180, 360], label: Direction.down, },
    ],
    leftRight: [
        { range: [90, 270], label: Direction.left, },
        { range: [270, 360], label: Direction.right, },
        { range: [0, 90], label: Direction.right, }
    ],
    upperLeftLowerRight: [
        { range: [45, 225], label: Direction.upperLeft, },
        { range: [225, 360], label: Direction.lowerRight, },
        { range: [0, 45], label: Direction.upperLeft, },
    ],
    upperRightLowerLeft: [
        { range: [135, 275], label: Direction.lowerLeft, },
        { range: [275, 360], label: Direction.upperRight, },
        { range: [0, 135], label: Direction.upperRight, },
    ],
    diagonal: [
        { range: [0, 90], label: Direction.upperRight, },
        { range: [90, 180], label: Direction.upperLeft, },
        { range: [180, 270], label: Direction.lowerLeft, },
        { range: [270, 360], label: Direction.lowerRight, },
    ],
    full: [
        { range: [22.5, 22.5 * 3], label: Direction.upperRight, },
        { range: [22.5 * 3, 22.5 * 5], label: Direction.up, },
        { range: [22.5 * 5, 22.5 * 7], label: Direction.upperLeft, },
        { range: [22.5 * 7, 22.5 * 9], label: Direction.left, },
        { range: [22.5 * 9, 22.5 * 11], label: Direction.lowerLeft, },
        { range: [22.5 * 11, 22.5 * 13], label: Direction.down, },
        { range: [22.5 * 13, 22.5 * 15], label: Direction.lowerRight, },
        { range: [22.5 * 15, 360], label: Direction.right, },
        { range: [0, 22.5], label: Direction.right, }
    ],
    chain: [],
    circleMenu: [],
    gridMenu: [],
    contextMenu: [],
    leftRightUpDown: []
};

directionMapping.chain = directionMapping.normal


export function angleToDirection(mode: OperationMode, angle: number): Direction | null {

    let rangeMapping: RangeMapping[]
    if (directionMapping[mode]) {
        rangeMapping = directionMapping[mode]
    }

    if (!rangeMapping) {
        return null
    }

    for (const obj of rangeMapping) {
        if (obj.range[0] <= angle && angle < obj.range[1]) {
            return obj.label;
        }
    }

    return null
}

export function transformMenuItem(actions: readonly ActionConfig[], assets: readonly Asset[]): MenuItem[] {
    return actions.map(c => {
        const asset = assets.find(a => a.id === c.iconAssetId)
        return {
            id: c.id,
            title: c.name,
            html: asset && asset.type === AssetType.html ? asset.data : ""
        }
    })
}


export class TinyLRU<K, V> {

    static SIZE = 3
    private kv: [K, V, number][] = []

    constructor() {

    }

    get(key: K): V | undefined {
        
        for (const tuple of this.kv) {
            if (tuple[0] === key) {
                tuple[2] += 1
                return tuple[1]
            }
        }

        return undefined
    }

    put(key: K, value: V) {
        
        if (this.kv.length > TinyLRU.SIZE) {
            let evicted_index = 0
            let cnt = this.kv[evicted_index][2]
            for (let i = 1; i < this.kv.length; i++) {
                if (this.kv[i][2] < cnt) {
                    evicted_index = i
                    cnt = this.kv[evicted_index][2]
                }
            }
            this.kv = this.kv.splice(evicted_index, 1)
        }

        this.kv.push([key, value, 0])
    }

    clear() {
        this.kv = []
    }

    size(): number {
        return this.kv.length
    }
}