import defaultTo from 'lodash-es/defaultTo'
import browser from 'webextension-polyfill'

const enum States {
	backgroundTabCounter = "backgroundTabCounter"
}

const key = "volatileState"

export class VolatileState {

	private loaded = false
	private data = new Map<string, unknown>()

	static async load() {
		if(!state.loaded) {
			const storageData = await browser.storage.local.get(key)
			state.data = new Map(defaultTo<[]>(storageData[key], []))
			state.loaded = true
		}
		return state
	}

	async save() {
		return browser.storage.local.set({
			key: this.data
		})
	}
	
	get backgroundTabCounter() {
		return Number(defaultTo(this.data.get(States.backgroundTabCounter), 0))
	}

	set backgroundTabCounter(val) {
		this.data.set(States.backgroundTabCounter, val)
	}
}

const state = new VolatileState()