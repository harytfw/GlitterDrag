<svelte:options />

<script lang="ts">
	import defaultTo from "lodash-es/defaultTo";
	import browser from "webextension-polyfill";
	import { simpleConfig } from "../config/simple_config";
	import { defaultLocaleMessage } from "../localization/helper";
	import { ExtensionStorageKey, type ExtensionStorage } from "../types";
	import Actions from "./actions.svelte";
	import Assets from "./assets.svelte";
	import { Tab } from "./common";
	import Common from "./common.svelte";
	import Nav from "./nav.svelte";
	import Requests from "./requests.svelte";
	import Scripts from "./scripts.svelte";
	import * as store from "./store";

	let config = "";
	const indent = 2;

	async function onLoadConfig() {
		let storage = (await browser.storage.local.get(
			"userConfig"
		)) as ExtensionStorage;
		config = JSON.stringify(
			defaultTo(storage["userConfig"], {}),
			null,
			indent
		);
	}

	async function onLoadDefaultConfig() {
		config = JSON.stringify(simpleConfig, null, indent)
	}

	async function onSaveConfig() {
		store.userConfig.update(() => {
			return JSON.parse(config);
		});
	}

	let filePicker: HTMLInputElement;

	async function onFileChange() {
		let file = filePicker.files[0];
		if (!file) {
			return;
		}
		const reader = new FileReader();
		reader.addEventListener(
			"loadend",
			() => {
				config = reader.result as string;
				filePicker.value = "";
			},
			{
				once: true,
			}
		);
		reader.readAsText(file);
	}

	let fileDownloader: HTMLAnchorElement;
	async function onExportConfig() {
		const now = new Date();
		const blob = new Blob([config]);
		const url = URL.createObjectURL(blob);
		setTimeout(() => {
			URL.revokeObjectURL(url);
		}, 1000 * 60);
		fileDownloader.download = `config-${now.getTime()}.json`;
		fileDownloader.href = url;
		fileDownloader.click();
	}

	async function format() {
		try {
			config = JSON.stringify(JSON.parse(config), null, indent);
		} catch (err) {
			console.error(err);
			alert(err);
		}
	}

	let tab = Tab.actions;
	let loadDefaultConfigDialog: HTMLDialogElement;
	const locale = defaultLocaleMessage;

	async function setup() {
		store.currentTab.subscribe((val) => {
			tab = val;
		});
		const storage: ExtensionStorage = await browser.storage.local.get(
			ExtensionStorageKey.firstTimeUse
		);
		storage.firstTimeUse = defaultTo(
			storage.firstTimeUse as boolean,
			true
		);
		if (storage.firstTimeUse) {
			storage.firstTimeUse = false;
			await browser.storage.local.set(storage);
			loadDefaultConfigDialog.showModal();
		}
	}

	async function onLoadDefaultConfigDialogClose() {
		if (loadDefaultConfigDialog.returnValue === "default") {
			store.userConfig.update(() => {
				return JSON.parse(JSON.stringify(simpleConfig));
			});
		}
	}

	setup();

	export {};
</script>

<main>
	<header>
		<Nav />
	</header>
	{#if tab === Tab.scripts}
		<Scripts />
	{:else if tab === Tab.actions}
		<Actions />
	{:else if tab === Tab.assets}
		<Assets />
	{:else if tab === Tab.requests}
		<Requests />
	{:else if tab === Tab.common}
		<Common />
	{:else if tab === Tab.configEditor}
		<section>
			<input
				type="file"
				style="display: none"
				bind:this={filePicker}
				on:change={onFileChange}
			/>
			<a
				href="javscript:void"
				style="display:none"
				bind:this={fileDownloader}>Downloader</a
			>
			<p>
				<button
					on:click={() => {
						filePicker.click();
						return false;
					}}>Import</button
				>
				<button on:click={onExportConfig}>Export</button>
				<button on:click={onLoadConfig}>Load</button>
				<button on:click={onLoadDefaultConfig}>Load Default Config</button>
				<button on:click={onSaveConfig}>Save</button>
				<button on:click={format}>Format</button>
			</p>
			<p>
				<textarea style="width: 90%;" rows="30" bind:value={config} />
			</p>
		</section>
	{/if}
	<dialog
		bind:this={loadDefaultConfigDialog}
		on:close={onLoadDefaultConfigDialogClose}
	>
		<form method="dialog">
			<p>
				{locale.firstTimeUsePrompt}
			</p>
			<div>
				<button value="default">{locale.confirm}</button>
				<button value="cancel">{locale.cancel}</button>
			</div>
		</form>
	</dialog>
</main>
