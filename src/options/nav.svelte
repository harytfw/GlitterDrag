<svelte:options />

<script lang="ts">
	import { LogLevel } from "../config/config";

	import { defaultLocaleMessage } from "../localization/helper";
	import { rootLog } from "../utils/log";
	import { Tab } from "./common";
	import { currentTab } from "./store";
	const log = rootLog.subLogger(LogLevel.V, "nav");
	const locale = defaultLocaleMessage;

	const onNavClick = (event: MouseEvent) => {
		if (event.target instanceof HTMLAnchorElement) {
			const t = (event.target as HTMLAnchorElement).dataset["tab"] as Tab;
			if (t) {
				currentTab.update(() => t);
				log.V("nav change: ", t);
			}
		}
	};
</script>

<nav on:click={onNavClick}>
	<a href="#{Tab.common}" data-tab={Tab.common}>{locale.tabTitleCommon}</a>
	<a href="#{Tab.actions}" data-tab={Tab.actions}>{locale.tabTitleActions}</a>
	<a href="#{Tab.scripts}" data-tab={Tab.scripts}>{locale.tabTitleScripts}</a>
	<a href="#{Tab.assets}" data-tab={Tab.assets}>{locale.tabTitleAssets}</a>
	<a href="#{Tab.requests}" data-tab={Tab.requests}>{locale.tabTitleRequests}</a>
	<a href="#{Tab.configEditor}" data-tab={Tab.configEditor}>{locale.tabTitleEditor}</a>
</nav>
