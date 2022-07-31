<svelte:options tag="glitter-drag-status" />

<script lang="ts">
	import { get_current_component } from "svelte/internal";
	import { EventType } from "../message";
	let content = ""
	
	// https://github.com/sveltejs/svelte/issues/3091
	get_current_component().addEventListener(EventType.Status, (msg: CustomEvent)=>{
		content = msg.detail.content
	})

</script>

<div>{content}</div>
