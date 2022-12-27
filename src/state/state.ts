import defaultTo from 'lodash-es/defaultTo'
import browser from 'webextension-polyfill'
import { LogLevel } from '../config/config'
import { rootLog } from '../utils/log'

const log = rootLog.subLogger(LogLevel.VVV, "state")

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
	private dirty = false
	async load() {
		if (state.loaded) {
			log.VVV("already loaded")
			return
		}
		state.loaded = true

		const storageData = await browser.storage.local.get(localStorageBackend.storageKey)
		state.data = new Map(defaultTo<[]>(storageData[localStorageBackend.storageKey], []))
		this.dirty = false
		log.VVV("load state done")
	}

	async save(force = false) {
		if (!force && !this.dirty) {
			log.VVV("skip save")
			return
		}
		const obj = {}
		obj[localStorageBackend.storageKey] = Array.from(this.data.entries())
		await browser.storage.local.set(obj)
		this.dirty = false
		log.VVV("save state done")
	}

	async reset() {
		log.VVV("reset state")
		this.data = new Map()
		await this.save(true)
		return
	}

	get backgroundTabCounter() {
		return Number(defaultTo(this.data.get(State.backgroundTabCounter), 0))
	}

	set backgroundTabCounter(val) {
		this.data.set(State.backgroundTabCounter, val)
		this.dirty = true
	}
}

const state = new localStorageBackend()

export async function defaultVolatileState(): Promise<VolatileState> {
	await state.load()
	return state
}