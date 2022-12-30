<svelte:options />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";
	import browser from "webextension-polyfill";

	import { Script, type PlainScript } from "../config/config";

	import { localeMessageProxy } from "../locale";
	import ConfirmDialog from "./confirm_dialog.svelte";
	import * as store from "./store";
	import { uuidv4 } from "./utils";

	const locale = localeMessageProxy();

	let origin: PlainScript[] = [];
	let transformed: Script[] = [];
	store.scripts.subscribe((val) => {
		origin = cloneDeep(val);
		transformed = origin.map((s) => new Script(s));
	});

	let addScriptDialog: HTMLDialogElement;
	let confirmDeleteDialog: ConfirmDialog;

	const defaultAddScriptModel: { id: string; name: string; text: string } = {
		id: "",
		text: "",
		name: "",
	};
	let addScriptModel: typeof defaultAddScriptModel = {
		id: "",
		name: "",
		text: "",
	};

	let editScriptDiglog: HTMLDialogElement;
	const defaultEditScriptModel: {
		index: number;
		id: string;
		name: string;
		text: string;
	} = {
		index: -1,
		id: "",
		text: "",
		name: "",
	};
	let editScriptModel = cloneDeep(defaultEditScriptModel);

	const showEditDialog = (event: MouseEvent) => {
		const index = parseInt(
			(event.target as HTMLButtonElement).dataset["index"]
		);

		editScriptModel = {
			index,
			id: transformed[index].id,
			text: transformed[index].text,
			name: transformed[index].name,
		};

		editScriptDiglog.showModal();
	};

	const showConfirmDeleteDialog = async (event: MouseEvent) => {
		const index = parseInt(
			(event.target as HTMLButtonElement).dataset["index"]
		);

		const ok = await confirmDeleteDialog.confirm(
			browser.i18n.getMessage("confirmDelete", transformed[index].name)
		);

		if (ok) {
			store.userConfig.update((uc) => {
				uc.scripts = uc.scripts.filter((_, i) => i != index);
				return uc;
			});
		}
	};

	const showAddDialog = () => {
		addScriptModel = cloneDeep(defaultAddScriptModel);
		addScriptDialog.showModal();
	};

	const onAddScriptSave = () => {
		const form = addScriptDialog.querySelector("form");
		if (!form.reportValidity()) {
			return;
		}
		let { id, text, name: name } = addScriptModel;
		if (!id) {
			id = uuidv4();
		}
		store.userConfig.update((uc) => {
			uc.scripts.unshift({ id, name, text });
			return uc;
		});
	};

	const onEditScriptSave = () => {
		const form = editScriptDiglog.querySelector("form");
		if (!form.checkValidity()) {
			return;
		}
		let { index, id, name: name, text } = editScriptModel;

		store.userConfig.update((uc) => {
			uc.scripts[index].id = id;
			uc.scripts[index].text = text;
			uc.scripts[index].name = name;
			return uc;
		});
	};
</script>

<div style="display: flex;">
	<div>
		<button id="addScript" on:click={showAddDialog}>{locale.add}</button>
		<table>
			<thead>
				<tr>
					<th>{locale.name}</th>
					<th>{locale.operation}</th>
				</tr>
			</thead>
			<tbody>
				{#each transformed as script, i}
					<tr>
						<td>{script.name}</td>
						<td>
							<button
								type="button"
								data-index={i}
								on:click={showEditDialog}
							>
								{locale.edit}
							</button>
							<button
								type="button"
								data-index={i}
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
	<dialog
		id="addScriptModal"
		bind:this={addScriptDialog}
		style="height: 80%; width: 60%;"
	>
		<form method="dialog">
			<p>
				<strong>{locale.add}</strong>
			</p>
			<p>
				<label for="text">{locale.name}</label>
				<input
					type="text"
					required={true}
					bind:value={addScriptModel.name}
				/>
			</p>
			<p>
				<label for="text">{locale.add}</label>
				<textarea
					rows="6"
					cols="6"
					name="text"
					required={true}
					bind:value={addScriptModel.text}
				/>
			</p>
			<button type="submit" on:click={onAddScriptSave}
				>{locale.add}</button
			>
		</form>
	</dialog>
	<dialog bind:this={editScriptDiglog} style="height: 80%; width: 60%;">
		<form method="dialog">
			<p>
				<strong>{locale.edit}</strong>
			</p>
			<p>
				<label for="">{locale.name}</label>
				<input
					type="text"
					name="name"
					required={true}
					bind:value={editScriptModel.name}
				/>
			</p>
			<p>
				<label for="text">{locale.scriptContent}</label>
				<textarea
					rows="6"
					name="text"
					required={true}
					bind:value={editScriptModel.text}
				/>
			</p>
			<button type="submit" on:click={onEditScriptSave}
				>{locale.save}</button
			>
		</form>
	</dialog>
	<ConfirmDialog bind:this={confirmDeleteDialog} />
</div>
