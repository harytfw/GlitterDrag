<svelte:options />

<script lang="ts">
	import { LogLevel } from "../config/config";

	import { defaultLocaleMessage } from "../localization/helper";
	import { rootLog } from "../utils/log";
	import { Tab } from "./common";
	import { currentTab } from "./store";
	const log = rootLog.subLogger(LogLevel.V, "nav");
	const locale = defaultLocaleMessage;


	let tabName = ""

	currentTab.subscribe((t)=>{
		tabName = t
	})

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

<!-- svelte-ignore a11y-click-events-have-key-events -->
<nav on:click={onNavClick} style="display: flex; flex-direction: column; width: 10rem">
	<a href="#{Tab.common}" class:current="{tabName === Tab.common}" data-tab={Tab.common}>{locale.tabTitleCommon}</a>
	<a href="#{Tab.actions}" class:current="{tabName === Tab.actions}" data-tab={Tab.actions}>{locale.tabTitleActions}</a>
	<a href="#{Tab.scripts}" class:current="{tabName === Tab.scripts}" data-tab={Tab.scripts}>{locale.tabTitleScripts}</a>
	<a href="#{Tab.assets}" class:current="{tabName === Tab.assets}" data-tab={Tab.assets}>{locale.tabTitleAssets}</a>
	<a href="#{Tab.requests}" class:current="{tabName === Tab.requests}" data-tab={Tab.requests}>{locale.tabTitleRequests}</a>
	<a href="#{Tab.configEditor}" class:current="{tabName === Tab.configEditor}" data-tab={Tab.configEditor}>{locale.tabTitleEditor}</a>
</nav>
