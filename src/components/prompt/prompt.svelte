<svelte:options tag={null} />

<script lang="ts">
	let content = "";

	export function show(html: string) {
		content = html;
	}
</script>

<div id="main">{@html content}</div>

<style>
	#main {
		position: fixed;
		left: 0;
		top: 0;
		background-color: rgba(9, 150, 248, 0.85);
		color: white !important;
		pointer-events: none;
		z-index: 2147483647;
		font-size: 14px;
		padding: 0px 8px 0px 8px;
	}
</style>
