import { ActionConfig, Asset, AssetType, DirectionLabel, OperationMode } from "../config/config";
import type { Position } from "../types";
import type { MenuItem } from "../components/message";


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
    label: DirectionLabel
}

export const directionLabelMapping: Record<OperationMode, RangeMapping[]> = {
    any: [
        { range: [0, 360], label: DirectionLabel.any, }
    ],
    normal: [
        { range: [45, 135], label: DirectionLabel.up, },
        { range: [135, 225], label: DirectionLabel.left, },
        { range: [225, 315], label: DirectionLabel.down, },
        { range: [315, 360], label: DirectionLabel.right, },
        { range: [0, 45], label: DirectionLabel.right, }
    ],
    upDown: [
        { range: [0, 180], label: DirectionLabel.up, },
        { range: [180, 360], label: DirectionLabel.down, },
    ],
    leftRight: [
        { range: [90, 270], label: DirectionLabel.left, },
        { range: [270, 360], label: DirectionLabel.right, },
        { range: [0, 90], label: DirectionLabel.right, }
    ],
    upperLeftLowerRight: [
        { range: [45, 225], label: DirectionLabel.upperLeft, },
        { range: [225, 360], label: DirectionLabel.lowerRight, },
        { range: [0, 45], label: DirectionLabel.upperLeft, },
    ],
    upperRightLowerLeft: [
        { range: [135, 275], label: DirectionLabel.lowerLeft, },
        { range: [275, 360], label: DirectionLabel.upperRight, },
        { range: [0, 135], label: DirectionLabel.upperRight, },
    ],
    diagonal: [
        { range: [0, 90], label: DirectionLabel.upperRight, },
        { range: [90, 180], label: DirectionLabel.upperLeft, },
        { range: [180, 270], label: DirectionLabel.lowerLeft, },
        { range: [270, 360], label: DirectionLabel.lowerRight, },],
    full: [
        { range: [22.5, 22.5 * 3], label: DirectionLabel.upperRight, },
        { range: [22.5 * 3, 22.5 * 5], label: DirectionLabel.up, },
        { range: [22.5 * 5, 22.5 * 7], label: DirectionLabel.upperLeft, },
        { range: [22.5 * 7, 22.5 * 9], label: DirectionLabel.left, },
        { range: [22.5 * 9, 22.5 * 11], label: DirectionLabel.lowerLeft, },
        { range: [22.5 * 11, 22.5 * 13], label: DirectionLabel.down, },
        { range: [22.5 * 13, 22.5 * 15], label: DirectionLabel.lowerRight, },
        { range: [22.5 * 15, 360], label: DirectionLabel.right, },
        { range: [0, 22.5], label: DirectionLabel.right, }
    ],
    chain: [],
    circle: [],
    grid: []
};

directionLabelMapping.chain = directionLabelMapping.full


export function transformMenuItem(actions: readonly ActionConfig[], assets: readonly Asset[]): MenuItem[] {
    return actions.map(c => {
        const asset = assets.find(a => a.id === c.style.menuIconId)
        return {
            id: c.id,
            title: c.title,
            htmlContent: asset && asset.type === AssetType.html ? asset.data : ""
        }
    })
}