import { assert } from 'chai'
import { LocalStorageBackend } from './state'
import range from 'lodash-es/range'

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
				state.backgroundTabIds = [...state.backgroundTabIds, i]
			}
			assert.sameOrderedMembers(Array.from(state.backgroundTabIds), [0, 1, 2, 3, 4, 5, 6, 7, 8, 9])
			await state.save()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabIds.length, 10, "state should be persistent")
			await state.reset()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabIds.length, 0)
			await state.save()
		}
		{
			const state = newState()
			assert.equal(state.backgroundTabIds.length, 0, "default length should be 0")
			state.backgroundTabIds = range(0, 99)
			await state.save()
		}
		{
			const state = newState()
			await state.load()
			assert.equal(state.backgroundTabIds.length, 99)
		}
		{
			const state = newState()
			await state.remove()
		}
	})
})