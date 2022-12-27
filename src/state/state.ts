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


export class LocalStorageBackend implements VolatileState {

	private readonly storageKey: string
	private data: Map<string, number | string>
	private dirty = false


	constructor(key: string) {
		this.storageKey = key
		this.data = new Map()
	}

	async load() {
		this.innerReset()
		const storageData = await browser.storage.local.get(this.storageKey)
		this.data = new Map(defaultTo<[]>(storageData[this.storageKey], []))
		log.VVV("load state done")
	}

	async save(force = false) {
		if (!force && !this.dirty) {
			log.VVV("skip save, dirty: ", this.dirty, "force: ", force)
			return
		}
		const obj = {}
		obj[this.storageKey] = Array.from(this.data.entries())
		await browser.storage.local.set(obj)
		this.dirty = false
		log.VVV("save state done")
	}

	async reset() {
		log.VVV("reset state")
		this.innerReset()
		await this.save(true)
	}

	async remove() {
		this.innerReset()
		await browser.storage.local.remove(this.storageKey)
	}

	private innerReset() {
		this.data = new Map()
		this.dirty = false
	}

	get backgroundTabCounter() {
		return Number(defaultTo(this.data.get(State.backgroundTabCounter), 0))
	}

	set backgroundTabCounter(val) {
		this.data.set(State.backgroundTabCounter, val)
		this.dirty = true
	}
}

const localState = new LocalStorageBackend("volatileState")

export async function defaultVolatileState(): Promise<VolatileState> {
	await localState.load()
	return localState
}