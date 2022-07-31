<svelte:options tag="glitter-drag-configuration" />

<script lang="ts">
	import browser from 'webextension-polyfill'
	import defaultTo from "lodash-es/defaultTo";

	import type { ExtensionStorage } from "../types";

	let config = "";
	const indent = 2

	async function onLoadConfig() {
		let storage = (await browser.storage.local.get(
			"userConfig"
		)) as ExtensionStorage;
		config = JSON.stringify(defaultTo(storage["userConfig"], {}), null, indent);
	}

	async function onSaveConfig() {
		await browser.storage.local.set({
			userConfig: JSON.parse(config),
		});
	}

	async function format() {
		try {
			config = JSON.stringify(JSON.parse(config), null, indent)
		} catch (err) {
			console.error(err)
			alert(err)
		}
	}

	export {};
</script>

<div>
	<p>
		<button on:click={onLoadConfig}>Load</button>
		<button on:click={onSaveConfig}>Save</button>
		<button on:click={format}>Format</button>
	</p>
	<p>
		<textarea cols="50" rows="100" bind:value={config} />
	</p>
</div>
