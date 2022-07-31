<svelte:options tag="glitter-drag-indicator" />

<script lang="ts">
	import { get_current_component } from "svelte/internal";
	import type { IndicatorMessage } from "../message";

	
	// https://github.com/sveltejs/svelte/issues/3091
	let component = get_current_component()
	let radius = 0
	let x = 0
	let y = 0
	
	$: left = `${x-radius}px`
	$: top = `${y-radius}px`
	$: height = `${radius * 2}px`
	$: width = `${radius * 2}px`
	$: borderRadius = `${radius * 2}px ${radius *2}px`
	
	const cb = (msg: CustomEvent<IndicatorMessage>)=>{
		radius = msg.detail.radius
		x = msg.detail.center.x
		y = msg.detail.center.y
	}

	component.addEventListener("indicator", cb)

</script>

<div style="left: {left}; top: {top}; height: {height}; width: {width}; border-radius: {borderRadius}">

</div>

<style>
	
	div {
		position: absolute;
		border-radius: 0px 0px;
		/* border-width: 1px; */
		border-style: solid;
    	border-color: rgba(0, 0, 0, 0.25);
	}

</style>	