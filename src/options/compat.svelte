<svelte:options />

<script lang="ts">
	import browser from "webextension-polyfill";
	import cloneDeep from "lodash-es/cloneDeep";
	import defaultTo from "lodash-es/defaultTo";
	import {
		CompatibilityRule,
		CompatibilityStatus,
		LogLevel,
		type PlainCompatibilityRule,
	} from "../config/config";

	import { LocaleMessageHelper, localeMessageProxy } from "../locale";
	import { rootLog } from "../utils/log";
	import { applyValueChange, type ValueChange } from "./cfg_utils";
	import { compatibilityStatusOptions } from "./common";
	import * as store from "./store";
	import { isValueInputElement } from "./utils";
	import { checkCompatibility } from "../content_scripts/compat";

	const log = rootLog.subLogger(LogLevel.V, "compat");
	const locale = localeMessageProxy();
	const localeHelper = new LocaleMessageHelper();

	function queryIndex(target: EventTarget): number {
		if (!(target instanceof HTMLElement)) {
			return -1;
		}

		const dataElem = target.closest("[data-index]");
		if (dataElem instanceof HTMLElement) {
			return parseInt(dataElem.dataset["index"]);
		}
		return -1;
	}

	function addEmptyRule() {
		log.V("add empty rule");
		store.userConfig.update((cfg) => {
			cfg.compatibility = defaultTo(cfg.compatibility, []);
			cfg.compatibility.push({});
			return cfg;
		});
	}

	async function onChange(event: Event) {
		const target = event.target;
		if (!isValueInputElement(target)) {
			return;
		}
		const index = queryIndex(target);
		if (index < 0) {
			return;
		}

		const change: ValueChange = {
			path: target.name,
			values: [target.value],
			multiple: false,
		};

		store.userConfig.update((cfg) => {
			cfg.compatibility[index] = applyValueChange(
				cfg.compatibility[index],
				[change]
			);
			return cfg;
		});
	}

	function onDelete(event: Event) {
		const target = event.target;
		if (!(target instanceof HTMLButtonElement)) {
			return;
		}
		const index = queryIndex(target);
		if (index < 0) {
			return;
		}
		log.V("delete rule at index: ", index);
		store.userConfig.update((cfg) => {
			cfg.compatibility.splice(index, 1);
			return cfg;
		});
	}

	async function matchRules() {
		const tabs = await browser.tabs.query({});
		const urls = tabs.map((tab) => tab.url);
		ruleMatchResult = urls.map((url) => {
			let info = "ok";
			let status = CompatibilityStatus.enable;

			try {
				status = checkCompatibility(url, rules);
			} catch (e) {
				console.error(e);
				info = "" + e;
			}

			return {
				url: url,
				status: status,
				info: info,
			};
		});
	}

	let ruleMatchResult: {
		url: string;
		status: CompatibilityStatus;
		info: string;
	}[] = [];

	let plainRules: PlainCompatibilityRule[] = [];
	$: rules = plainRules.map((r) => new CompatibilityRule(r));

	store.userConfig.subscribe((cfg) => {
		plainRules = cloneDeep(defaultTo(cfg.compatibility, []));
	});
</script>

<div style="display: flex; flex-direction: column">
	<p>
		{locale.helpCompatibility}
	</p>
	<p>
		<button on:click={addEmptyRule}>{locale.addRule}</button>
	</p>
	<table id="compat-rules">
		<thead>
			<tr>
				<th>
					{locale.compatibilityPattern}
				</th>
				<th>
					{locale.compatibilityStatus}
				</th>
				<th>
					{locale.operation}
				</th>
			</tr>
		</thead>
		<tbody>
			{#each rules as rule, i}
				<tr data-index={i} on:change={onChange}>
					<td>
						<input
							name="regexp"
							type="text"
							spellcheck="false"
							placeholder="URL pattern"
							value={rule.regexp}
						/>
					</td>
					<td>
						<select name="status" value={rule.status}>
							{#each compatibilityStatusOptions as opt}
								<option value={opt.value}>{opt.label}</option>
							{/each}
						</select>
					</td>
					<td>
						<button on:click={onDelete}>x</button>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
	<p>
		<button on:click={matchRules}
			>{locale.checkCompatibilityRule}</button
		>
	</p>
	<table>
		<thead>
			<tr>
				<th> {locale.compatibilityStatus} </th>
				<th> URL </th>
				<th> Info </th>
			</tr>
		</thead>
		<tbody>
			{#each ruleMatchResult as result}
				<tr>
					<td>{localeHelper.compatibilityStatus(result.status)}</td>
					<td>{result.url}</td>
					<td>{result.info}</td>
				</tr>
			{/each}
		</tbody>
	</table>
</div>
