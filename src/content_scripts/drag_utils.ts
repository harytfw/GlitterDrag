import { ModifierKey } from "../types"
import { OpSource } from "./op_source"


export function modifierKey(event: MouseEvent): ModifierKey {
	if (event.ctrlKey) return ModifierKey.ctrl
	if (event.shiftKey) return ModifierKey.shift
	if (event.altKey) return ModifierKey.alt
	return ModifierKey.none
}

export function isEditableAndDraggable(elem: HTMLElement): boolean {

	const editableVal = elem.getAttribute("contenteditable")

	if ('false' === editableVal || null === editableVal) {
		return false
	}

	// https://developer.mozilla.org/en-US/docs/Web/HTML/Global_attributes/draggable
	const draggableVal = elem.getAttribute("draggable")
	if ('false' === draggableVal) {
		return false
	}

	return true
}

export function canDestinationAcceptDropFix(s: OpSource) {

	if (s.isContentEditable) {
		return false
	}

	if (s.targetNodeName == "TEXT") {
		return true
	}

	if (isInputArea(s)) {
		return true
	}

	return true
}

export function isInputArea(s: OpSource): boolean {
	if (s.targetNodeName === "INPUT") {
		return true
	}

	if (s.targetNodeName === "TEXTAREA") {
		return true
	}

	return false
}

export enum EventPhase {
	none = 0,
	capturing = 1,
	at_target = 2,
	bubbling = 3,
}

export function stringifyEventPhase(n: number): string {
	switch (n) {
		case EventPhase.capturing:
			return 'capturing'
		case EventPhase.bubbling:
			return 'bubbling'
		case EventPhase.at_target:
			return 'at_target'
		case EventPhase.none:
			return 'none'
		default:
			return 'unknown'
	}
}

export function objectifyDataTransfer(dt: DataTransfer) {
	const record: Record<string, string> = {}
	for (const type of dt.types) {
		const data = dt.getData(type)
		record[type] = data
	}
	return record
}

export function isInstance<T>(ins: any, c: new () => T): ins is T {
	// https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/Sharing_objects_with_page_scripts#xray_vision_in_firefox
	return ins instanceof c
}

export function buildDataTransferStorage(dt: DataTransfer): Map<string, string> {
	const storage = new Map<string, string>()
	for (const t of dt.types) {
		storage.set(t, dt.getData(t))
	}
	return storage
}
