import { Feature, type ReadonlyConfiguration } from "../../config/config"
import { MiddleButtonClose } from "./auxclose"
import { MiddleButtonSelector } from "./middle_button_selector"

let managedFlag = false

export async function manageFeatures(config: ReadonlyConfiguration) {
	if (managedFlag) {
		return
	}
	managedFlag = true
	if (config.features.has(Feature.middleButtonSelector)) {
		const f = new MiddleButtonSelector(document.getSelection(), document.documentElement)
		await f.start()
	}
	if (config.features.has(Feature.auxClose)) {
		const f = new MiddleButtonClose(document.documentElement)
		await f.start()
	}
}
