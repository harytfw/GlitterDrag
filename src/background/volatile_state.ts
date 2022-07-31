import defaultTo from 'lodash-es/defaultTo'
import browser from 'webextension-polyfill'
import type { KVRecord, Position } from '../types'

const enum State {
	backgroundTabCounter = "backgroundTabCounter",
}

export interface VolatileState {
	backgroundTabCounter: number

	load(): Promise<void>
	save(): Promise<void>
	reset(): Promise<void>
}


class localStorageBackend implements VolatileState {

	static storageKey = "volatileState"
	private loaded = false
	private data = new Map<string, unknown>()

	async load() {
		if (state.loaded) {
			return
		}
		state.loaded = true

		const storageData = await browser.storage.local.get(localStorageBackend.storageKey)
		state.data = new Map(defaultTo<[]>(storageData[localStorageBackend.storageKey], []))
	}

	async save() {
		const obj = {}
		obj[localStorageBackend.storageKey] = Array.from(this.data.entries())
		return browser.storage.local.set(obj)
	}

	async reset() {
		this.data = new Map()
		await this.save()
		return
	}

	get backgroundTabCounter() {
		return Number(defaultTo(this.data.get(State.backgroundTabCounter), 0))
	}

	set backgroundTabCounter(val) {
		this.data.set(State.backgroundTabCounter, val)
	}
}

const state = new localStorageBackend()

export async function defaultVolatileState(): Promise<VolatileState> {
	await state.load()
	return state
}