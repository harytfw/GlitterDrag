<svelte:options tag="droponfly-indicator" />

<script lang="ts">
	import { get_current_component } from "svelte/internal";
import type { Position } from "../../types";

	
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
	
	component["update"] = (r: number, pos: Position) => {
		radius = r
		x = pos.x
		y = pos.y
	}

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