import defaultTo from 'lodash-es/defaultTo'
import browser from 'webextension-polyfill'

const enum States {
	backgroundTabCounter = "backgroundTabCounter"
}


export interface VolatileState {
	backgroundTabCounter: number

	load(): Promise<void>
	save(): Promise<void>
}


class localStorageBackend implements VolatileState {

	static storageKey = "volatileState"
	private loaded = false
	private data = new Map<string, unknown>()

	async load() {
		if (state.loaded) {
			return
		}
		const storageData = await browser.storage.local.get(localStorageBackend.storageKey)
		state.data = new Map(defaultTo<[]>(storageData[localStorageBackend.storageKey], []))
		state.loaded = true
	}

	async save() {
		const obj = {}
		obj[localStorageBackend.storageKey] = this.data
		return browser.storage.local.set(obj)
	}

	get backgroundTabCounter() {
		return Number(defaultTo(this.data.get(States.backgroundTabCounter), 0))
	}

	set backgroundTabCounter(val) {
		this.data.set(States.backgroundTabCounter, val)
	}
}

const state = new localStorageBackend()

export async function defaultVolatileState(): Promise<VolatileState> {
	await state.load()
	return state
}