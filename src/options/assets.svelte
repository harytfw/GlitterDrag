<svelte:options />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";
	import browser from "webextension-polyfill";

	import {
		Asset,
		AssetType,
		LogLevel,
		type PlainAsset,
	} from "../config/config";

	import { localeMessageProxy } from "../locale";
	import { rootLog } from "../utils/log";
	import ConfirmDialog from "./confirm_dialog.svelte";
	import * as store from "./store";
	import { uuidv4 } from "./utils";

	const log = rootLog.subLogger(LogLevel.V, "assets");
	const locale = localeMessageProxy();

	let origin: PlainAsset[] = [];
	let transformed: Asset[] = [];
	store.assets.subscribe((val) => {
		origin = cloneDeep(val);
		transformed = origin.map((s) => new Asset(s));
	});

	let confirmDeleteDialog: ConfirmDialog;

	let editAssetDiglog: HTMLDialogElement;
	const defaultEditAssetModel: {
		id: string;
		type: AssetType;
		data: string;
		name: string;
	} = {
		id: "",
		type: AssetType.html,
		data: "",
		name: "",
	};

	let editAssetModel = cloneDeep(defaultEditAssetModel);

	const showEditDialog = (event: MouseEvent) => {
		const id = (event.target as HTMLButtonElement).dataset["id"]
		const asset = transformed.find(a => a.id === id)
		if (!asset) {
			throw new Error("TODO: ")
		}
		editAssetModel = {
			id: asset.id,
			data: asset.data,
			type: AssetType.html,
			name: asset.name,
		};
		updatePreviewElement(asset.data)
		editAssetDiglog.showModal();
	};

	const showAddDialog = () => {
		editAssetModel = cloneDeep(defaultEditAssetModel);
		editAssetDiglog.showModal();
	};

	const showConfirmDeleteDialog = async (event: MouseEvent) => {
		const id = 			(event.target as HTMLButtonElement).dataset["id"]
		
		const asset = transformed.find(a => a.id === id)
		if (!asset) {
			throw new Error("TODO:")
		}
		
		const ok = await confirmDeleteDialog.confirm(
			browser.i18n.getMessage(
				"confirmDelete",
				asset.name
			)
		);
		if (ok) {
			store.userConfig.update((uc) => {
				uc.assets = uc.assets.filter(a => a.id !== id);
				return uc;
			});
		}
	};

	const onEditAssetSave = () => {
		const form = editAssetDiglog.querySelector("form");
		if (!form.reportValidity()) {
			return;
		}
		let { id, type, data, name } = editAssetModel;

		if (!id) {
			id = uuidv4();
			store.userConfig.update((uc) => {
				uc.assets.unshift({
					id,
					type,
					data,
					name,
				});
				return uc;
			});
			return;
		}

		store.userConfig.update((uc) => {
			const index = uc.assets.findIndex((a) => a.id === id);
			if (index >= 0){ 
				uc.assets[index].id = id;
				uc.assets[index].type = type;
				uc.assets[index].data = data;
				uc.assets[index].name = name;
			}
			return uc;
		});
	};

	let imagePicker: HTMLInputElement;
	const onPickImage = () => {
		const file = imagePicker.files[0];
		if (!file) {
			return;
		}

		const parts = file.name.split(".");
		let isSvg = false;
		if (parts.length > 0) {
			const ext = parts[parts.length - 1];
			if (ext.toLowerCase() === "svg") {
				isSvg = true;
			}
		}

		const reader = new FileReader();
		if (isSvg) {
			reader.addEventListener(
				"loadend",
				() => {
					const data = reader.result as string;
					try {
						const parser = new DOMParser();
						const doc = parser.parseFromString(
							data,
							"image/svg+xml"
						);
						const svg = doc.querySelector("svg");
						if (!svg) {
							const msg = "missing svg element";
							log.E(msg);
							alert(msg);
							return;
						}
						log.V("update height and width of svg style");
						svg.style.height = "100%";
						svg.style.width = "100%";
						editAssetModel.data = svg.outerHTML;
					} catch (e) {
						log.E(e);
						alert(e);
					}
				},
				{ once: true }
			);
			reader.readAsText(file);
			return;
		}

		reader.addEventListener(
			"loadend",
			() => {
				let data = reader.result as string;
				 data = `<img style="width: 100%; height: 100%;" src="${data}">`;
				 editAssetModel.data = data
			},
			{ once: true }
		);
		reader.readAsDataURL(file);
	};

	let previewContainer: HTMLElement;
	let previewElement: Element | null = null;
	const updatePreviewElement = (html: string)=>{
		const parser = new DOMParser();
		const doc = parser.parseFromString(
			html,
			"text/html"
		);
		const element = doc.body.firstElementChild
		if (element) {
			element.remove()
			previewElement = element
		} else {
			previewElement = null
		}
		if (previewContainer) {
			while (previewContainer.firstElementChild) {
				previewContainer.firstElementChild.remove()
			}
			if (previewElement !== null) {
				previewContainer.appendChild(previewElement)
			}
		}
	}


	$: {
		if (editAssetModel.data) {
			updatePreviewElement(editAssetModel.data)
		}
	}
	
</script>

<div style="display: flex;">
	<div>
		<button type="button" on:click={showAddDialog}
			>{locale.add}</button
		>
		<table>
			<thead>
				<tr>
					<th>{locale.name}</th>
					<th>{locale.operation}</th>
				</tr>
			</thead>
			<tbody>
				{#each transformed as asset, i}
					<tr>
						<td>{asset.name}</td>
						<td>
							<button
								type="button"
								data-id={asset.id}
								on:click={showEditDialog}
							>
								{locale.edit}
							</button>
							<button
								type="button"
								data-id={asset.id}
								on:click={showConfirmDeleteDialog}
							>
								{locale.delete}
							</button>
						</td>
					</tr>
				{/each}
			</tbody>
		</table>
	</div>
	<div />
	<dialog bind:this={editAssetDiglog} style="height: 80%; width: 60%;">
		<form method="dialog">
			<p>
				<strong>{locale.edit}</strong>
			</p>
			<p>
				<label for="">{locale.name}</label>
				<input
					type="text"
					required={true}
					bind:value={editAssetModel.name}
				/>
			</p>
			<p>
				<label for="">{locale.pickImage}</label>
				<input
					bind:this={imagePicker}
					type="file"
					on:change={onPickImage}
				/>
			</p>
			<p>Preview</p>
			<div bind:this={previewContainer} style="width: 128px; height: 128px" />
			<p>
				<label for="text">{locale.assetData}</label>
				<textarea
					rows="6"
					required={true}
					bind:value={editAssetModel.data}
				/>
			</p>
			<p>
				<button type="submit" on:click={onEditAssetSave}>{locale.save}</button>
			</p>
		</form>
	</dialog>
	<ConfirmDialog bind:this={confirmDeleteDialog} />
</div>
