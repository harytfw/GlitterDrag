import { TypeConstraint } from "../config/config"
import { ModifierKey } from "../types"
import { URLFixer } from "../utils/url"


export interface Guess {
	types: Set<TypeConstraint>
	extra: Set<string>
	textSel: string
	linkSel: string
	imageSel: string
}

function tryGetLink(dataTransferLike: Map<string, string>): string {
	let link = dataTransferLike.get("text/plain") || ""
	if (!link) {
		const data = dataTransferLike.get("text/uri-list") || ""
		if (data) {
			const arr = data.split("\n").map(line => line.trim())
			if (arr.length) {
				link = arr[0]
			}
		}
	}
	return link
}

export function guessDragContent(sourceTarget: EventTarget, dataTransferStorage: Map<string, string>): Guess {

	let actionTypes: Set<TypeConstraint> = new Set()
	let textSel = ''
	let linkSel = ''
	let imageSel = ''
	let labels: Set<string> = new Set()

	if (isInstance(sourceTarget, window.Text)) {
		actionTypes.add(TypeConstraint.text)
		textSel = dataTransferStorage.get("text/plain") || ""

		const url = new URLFixer().fix(textSel)
		if (url) {
			actionTypes.add(TypeConstraint.link)
			linkSel = url.toString()
			labels.add("protocol:" + url.protocol.substring(0, url.protocol.length - 1))
		}

	} else if (isInstance(sourceTarget, window.HTMLAnchorElement)) {
		actionTypes.add(TypeConstraint.link)
		const descentImageElement = sourceTarget.querySelector("img")
		if (descentImageElement) {
			actionTypes.add(TypeConstraint.image)
			textSel = sourceTarget.textContent || ""
			linkSel = tryGetLink(dataTransferStorage)
			imageSel = descentImageElement.src
		} else {
			actionTypes.add(TypeConstraint.link)
			actionTypes.add(TypeConstraint.text)
			textSel = sourceTarget.textContent || ""
			linkSel = tryGetLink(dataTransferStorage)
		}

	} else if (isInstance(sourceTarget, window.HTMLImageElement) || isInstance(sourceTarget, window.HTMLPictureElement)) {
		actionTypes.add(TypeConstraint.image)
		//workaround #79
		if (isInstance(sourceTarget, window.HTMLImageElement)) {
			imageSel = sourceTarget.src
			linkSel = imageSel
		} else if (isInstance(sourceTarget, window.HTMLPictureElement)) {
			throw new Error("TODO: to support Picture Element")
		}
	}

	return {
		types: actionTypes,
		textSel,
		linkSel,
		imageSel,
		extra: new Set()
	}
}


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

export function canDestinationAcceptDrop(target: EventTarget) {

	if (isInstance(target, window.Text)) {
		return true
	}

	if (isInputArea(target)) {
		return true
	}

	if (isInstance(target, window.HTMLElement)) {
		if (target.getAttribute && target.getAttribute("contenteditable") === null) {
			return true
		}
		return false
	}

	return false
}

export function isInputArea(target: EventTarget): boolean {
	if (isInstance(target, window.HTMLInputElement)) {
		return true
	}

	if (isInstance(target, window.HTMLTextAreaElement)) {
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
