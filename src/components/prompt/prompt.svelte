<svelte:options tag="glitter-drag-status" />

<script lang="ts">
	import { get_current_component } from "svelte/internal";
	import { EventType } from "../types";
	let content = ""
	$: style = "margin: 0px 8px 0px 8px;"


	let component = get_current_component();

	// https://github.com/sveltejs/svelte/issues/3091
	component.addEventListener(EventType.Status, (msg: CustomEvent)=>{
		content = msg.detail.content
	})

	component["update"] = (text: string) => {
		content = text
	}

</script>

<div style="{style}">{content}</div>
