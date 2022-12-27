import { assert } from 'chai'
import { LocalStorageBackend } from './state'

describe("state", function () {
	it("local storage", async function () {
		function newState() {
			return new LocalStorageBackend("test")
		}
		{
			const state = newState()
			await state.remove()
		}
		{
			const state = newState()
			await state.load()
			for (let i = 0; i < 10; i++) {
				state.backgroundTabCounter += 1
			}
			assert.equal(state.backgroundTabCounter, 10)
			await state.save()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabCounter, 10, "state should be persistent")
			await state.reset()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabCounter, 0)
			await state.save()
		}
		{
			const state = newState()
			assert.equal(state.backgroundTabCounter, 0, "default value should be 0")
			state.backgroundTabCounter = 99
			await state.save()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabCounter, 99)
		}
		{
			const state = newState()
			await state.remove()
		}
	})
})