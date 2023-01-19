<svelte:options />

<script lang="ts">
	import { Feature, LogLevel } from "../config/config";

	import { localeMessageProxy } from "../locale";
	import { rootLog } from "../utils/log";
	import { Tab } from "./common";
	import { currentTab } from "./store";
	import * as store from "./store";
	import defaultTo from "lodash-es/defaultTo";

	const log = rootLog.subLogger(LogLevel.V, "nav");
	const locale = localeMessageProxy();

	let tabName = "";

	currentTab.subscribe((t) => {
		tabName = t;
	});

	const onNavClick = (event: MouseEvent) => {
		if (event.target instanceof HTMLAnchorElement) {
			const t = (event.target as HTMLAnchorElement).dataset["tab"] as Tab;
			if (t) {
				currentTab.update(() => t);
				log.V("nav change: ", t);
			}
		}
	};

	let features: Set<Feature> = new Set();
	store.userConfig.subscribe((cfg) => {
		features = new Set(defaultTo(cfg.features, []) as Feature[]);
	});
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<nav
	on:click={onNavClick}
	style="display: flex; flex-direction: column; width: 10rem"
>
	<a
		href="#{Tab.actions}"
		class:current={tabName === Tab.actions}
		data-tab={Tab.actions}>{locale.tabTitleActions}</a
	>
	<a
		href="#{Tab.common}"
		class:current={tabName === Tab.common}
		data-tab={Tab.common}>{locale.tabTitleCommon}</a
	>
	<a
		href="#{Tab.scripts}"
		class:current={tabName === Tab.scripts}
		data-tab={Tab.scripts}>{locale.tabTitleScripts}</a
	>
	<a
		href="#{Tab.assets}"
		class:current={tabName === Tab.assets}
		data-tab={Tab.assets}>{locale.tabTitleAssets}</a
	>
	<a
		href="#{Tab.requests}"
		class:current={tabName === Tab.requests}
		data-tab={Tab.requests}>{locale.tabTitleRequests}</a
	>
	{#if features.has(Feature.featureTab)}
		<a
			href="#{Tab.feature}"
			class:current={tabName === Tab.feature}
			data-tab={Tab.feature}>{"Feature"}</a
		>
	{/if}
	<a
		href="#{Tab.compatibility}"
		class:current={tabName === Tab.compatibility}
		data-tab={Tab.compatibility}>{locale.tabTitleCompatibility}</a
	>
	<a
		href="#{Tab.configEditor}"
		class:current={tabName === Tab.configEditor}
		data-tab={Tab.configEditor}>{locale.tabTitleEditor}</a
	>
</nav>
