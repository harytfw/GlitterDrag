<svelte:options />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";
	import browser from "webextension-polyfill";

	import {
	    CommandRequest,
	    LogLevel,
	    type PlainCommandRequest
	} from "../config/config";

	import { defaultLocaleMessage } from "../localization/helper";
	import type { KVRecord } from "../types";
	import { rootLog } from "../utils/log";
	import { isFirefox } from "../utils/vendor";
	import ConfirmDialog from "./confirm_dialog.svelte";
	import { builtinSearchEngines } from "./search_engines";
	import * as store from "./store";
	import {
	    browserSearchEngineToCommandRequest,
	    getBrowserSearchEngineName,
	    uuidv4
	} from "./utils";

	const log = rootLog.subLogger(LogLevel.V, "requests");
	const locale = defaultLocaleMessage;

	let origin: PlainCommandRequest[] = [];
	let transformed: CommandRequest[] = [];
	store.requests.subscribe((val) => {
		origin = cloneDeep(val);
		transformed = origin.map((s) => new CommandRequest(s));
	});

	let addDialog: HTMLDialogElement;
	let confirmDeleteDialog: ConfirmDialog;

	const defaultAddModel: {
		id: string;
		name: string;
		url: string;
		query: KVRecord;
	} = {
		id: "",
		name: "",
		url: "",
		query: {},
	};
	let addModel = cloneDeep(defaultAddModel);

	let editDiglog: HTMLDialogElement;
	let editConfigDialog: HTMLDialogElement;
	const defaultEditModel: {
		id: string;
		name: string;
		url: string;
		query: KVRecord;
	} = {
		id: "",
		name: "",
		url: "",
		query: {},
	};

	let editModel = cloneDeep(defaultEditModel);

	const showEditDialog = (event: MouseEvent) => {
		const id = (event.target as HTMLButtonElement).dataset["id"];
		const cfg = transformed.find((r) => r.id === id);
		if (!cfg) {
			throw new Error("TODO:");
		}

		editModel = {
			id: cfg.id,
			name: cfg.name,
			url: cfg.url.toString(),
			query: cloneDeep(cfg.query),
		};

		editDiglog.showModal();
	};

	const showConfigEditor = (event: MouseEvent) => {
		const id = (event.target as HTMLButtonElement).dataset["id"];
		const cfg = transformed.find((r) => r.id === id);
		if (!cfg) {
			throw new Error("TODO:");
		}

		let query = cloneDeep(cfg.query);
		for (const key of cfg.url.searchParams.keys()) {
			query[key] = cfg.url.searchParams.get(key);
		}

		editModel = {
			id: cfg.id,
			name: cfg.name,
			url: cfg.url.toString(),
			query: query,
		};

		editConfigDialog.showModal();
	};

	const showAddDialog = () => {
		addModel = cloneDeep(defaultAddModel);
		addDialog.showModal();
	};

	const importSearchEngineFromExtension = async () => {
		const added: PlainCommandRequest[] = [];

		const engines = Array.from(builtinSearchEngines.general);

		if (browser.i18n.getUILanguage().startsWith("zh-CN")) {
			engines.push(...builtinSearchEngines.chinese);
		}

		for (const se of engines) {
			const dup = origin.find(
				(o) => o.name === se.name && o.url === se.url
			);
			if (dup) {
				continue;
			}
			added.push({
				id: uuidv4(),
				name: se.name,
				url: se.url,
			});
		}

		store.userConfig.update((uc) => {
			uc.requests = [...added, ...uc.requests];
			return uc;
		});
	};

	const importSearchEngineFromBrowser = async () => {
		const reqs = await browserSearchEngineToCommandRequest();
		const added: PlainCommandRequest[] = [];
		for (const req of reqs) {
			const name = getBrowserSearchEngineName(req);
			const dup = origin.find(
				(o) => getBrowserSearchEngineName(o) === name
			);
			if (!dup) {
				added.push(req);
			}
		}

		store.userConfig.update((uc) => {
			uc.requests = [...added, ...uc.requests];
			return uc;
		});
	};

	const showConfirmDeleteDialog = async (event: MouseEvent) => {
		const id = (event.target as HTMLButtonElement).dataset["id"];
		const cfg = transformed.find((r) => r.id === id);
		if (!cfg) {
			throw new Error("TODO: ");
		}

		const ok = await confirmDeleteDialog.confirm(
			browser.i18n.getMessage("confirmDelete", cfg.name)
		);

		if (!ok) {
			return;
		}

		store.userConfig.update((uc) => {
			uc.requests = uc.requests.filter((r) => r.id !== id);
			return uc;
		});
	};

	const onAdd = () => {
		const form = addDialog.querySelector("form");
		if (!form.reportValidity()) {
			return;
		}
		let { id, url, name, query } = addModel;
		if (!id) {
			id = uuidv4();
		}
		query = cloneDeep(query);
		store.userConfig.update((uc) => {
			const item: PlainCommandRequest = {
				id,
				url,
				query,
				name,
			};
			log.VV("add request: ", item);
			uc.requests.unshift(item);
			return uc;
		});
	};

	const onConfirmEdit = () => {
		const form = editDiglog.querySelector("form");
		if (!form.reportValidity()) {
			return;
		}
		let { id, url, query, name } = editModel;
		updateRequest(id, { name, url, query });
	};

	let configEditor: HTMLTextAreaElement;
	const onEditConfigConfirm = () => {
		try {
			const cfg = JSON.parse(configEditor.value) as KVRecord;
			let { id } = editModel;
			let { url, query, name } = cfg;
			updateRequest(id, { url, query, name, id });
		} catch (e) {}
	};

	function updateRequest(id: string, data: PlainCommandRequest) {
		try {
			store.userConfig.update((uc) => {
				let index = uc.requests.findIndex((r) => r.id === id);

				if (index < 0) {
					throw new Error("TODO: ");
				}

				const cfg = cloneDeep(uc.requests[index]);
				log.VV("before update request: ", cloneDeep(cfg));
				cfg.name = data.name;
				cfg.url = data.url;
				cfg.query = cloneDeep(data.query);

				uc.requests[index] = cfg;

				log.VV("after update request: ", cloneDeep(cfg));
				return uc;
			});
		} catch (e) {
			log.E(e);
			alert(e);
		}
	}
</script>

<section style="display: flex;">
	<div>
		<button on:click={showAddDialog}>{locale.add}</button>
		{#if isFirefox()}
			<button on:click={importSearchEngineFromBrowser}
				>{locale.importSearchEngineFromBrowser}</button
			>
		{/if}
		<button on:click={importSearchEngineFromExtension}
			>{locale.importSearchEngineFromExtension}</button
		>
		<table>
			<thead>
				<tr>
					<th>{locale.name}</th>
					<th>{locale.operation}</th>
				</tr>
			</thead>
			<tbody>
				{#each transformed as req, i}
					<tr>
						<td>{req.name}</td>
						<td>
							<button
								type="button"
								data-id={req.id}
								on:click={showEditDialog}
							>
								{locale.edit}
							</button>
							<button
								type="button"
								data-id={req.id}
								on:click={showConfigEditor}
							>
								{locale.editConfig}
							</button>
							<button
								type="button"
								data-id={req.id}
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
	<dialog bind:this={addDialog} style="height: 80%; width: 60%;">
		<form method="dialog">
			<p>
				<strong>{locale.add}</strong>
			</p>
			<p>
				<label for="">{locale.name}</label>
				<input type="text" required={true} bind:value={addModel.name} />
			</p>
			<p>
				<label for="text">{locale.requestUrl}</label>
				<input type="url" required={true} bind:value={addModel.url} />
			</p>
			<p>
				<label for="text">{locale.requestQuery}</label>
			</p>
			<button type="submit" on:click={onAdd}>{locale.add}</button>
		</form>
	</dialog>
	<dialog bind:this={editDiglog} style="height: 80%; width: 60%;">
		<form method="dialog">
			<p>
				<strong>{locale.editRequest}</strong>
			</p>
			<p>
				<label for="name">{locale.name}</label>
				<input
					type="text"
					name="name"
					required={true}
					bind:value={editModel.name}
				/>
			</p>
			<p>
				<label for="text">{locale.requestUrl}</label>
				<input type="url" required={true} bind:value={editModel.url} />
			</p>
			<button on:click={onConfirmEdit}>{locale.save}</button>
		</form>
	</dialog>
	<dialog bind:this={editConfigDialog} style="height: 80%; width: 60%;">
		<form method="dialog">
			<p>
				<strong>{locale.editRequest}</strong>
			</p>
			<textarea
				bind:this={configEditor}
				rows="20"
				value={JSON.stringify(
					{
						name: editModel.name,
						url: editModel.url,
						query: editModel.query,
					},
					null,
					"    "
				)}
			/>
			<button on:click={onEditConfigConfirm}>{locale.save}</button>
		</form>
	</dialog>
	<ConfirmDialog bind:this={confirmDeleteDialog} />
</section>
