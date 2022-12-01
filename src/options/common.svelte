<svelte:options />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";
	import set from "lodash-es/set";
	import toString from "lodash-es/toString";

	import {
		CommonConfig,
		LogLevel,
		type PlainCommonConfig,
	} from "../config/config";

	import { defaultLocaleMessage } from "../localization/helper";
	import { rootLog } from "../utils/log";
	import { modeOptions, type PrimitiveType } from "./common";
	import * as store from "./store";

	let origin: PlainCommonConfig = {};
	let transformed: CommonConfig = new CommonConfig(origin);
	store.common.subscribe((val) => {
		origin = cloneDeep(val);
		transformed = new CommonConfig(origin);
	});
	const log = rootLog.subLogger(LogLevel.V, "common");
	const locale = defaultLocaleMessage;

	const onFormChange = (e: Event) => {
		const c = e.target as HTMLElement;
		const form = c.closest("form");
		const formData = new FormData(form);

		let path: string = "";
		let values: PrimitiveType[] = [];
		if (c instanceof HTMLInputElement) {
			path = c.name;
			values = formData.getAll(c.name).map((entry) => entry.toString());
		} else if (c instanceof HTMLSelectElement) {
			path = c.name;
			values = formData.getAll(c.name).map((entry) => entry.toString());
		} else {
			throw new Error("unhandle element: " + c.tagName);
		}

		switch (path) {
			case "minDistance": {
				values = values.map((v) => Number.parseInt(v as string));
				break;
			}
			default: {
				break;
			}
		}

		if (values.length != 1) {
			throw new Error(
				"expected one values, but actually got: " + toString(values)
			);
		}

		store.userConfig.update((uc) => {
			log.V("update common config, path: ", path, " values: ", values);
			set(uc.common, path, values[0]);
			return uc;
		});
	};
</script>

<div style="display: flex;">
	<form on:change={onFormChange} on:submit|preventDefault={() => {}}>
		<p>
			<label for="minDistance">{locale.minimumDistance}</label>
			<input
				type="number"
				name="minDistance"
				value={transformed.minDistance}
			/>
		</p>
	</form>
</div>
