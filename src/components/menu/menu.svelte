<svelte:options tag={null} />

<script lang="ts">
	import { LogLevel } from "../../config/config";
	import { rootLog } from "../../utils/log";
	import { EventType, type ShowMenuOptions } from "../types";
	import { rebuildMenu } from "./menu_builder";

	const log = rootLog.subLogger(LogLevel.VVV, "menu");

	const closestMenuItem = (target: EventTarget): Element | null => {
		if (!(target instanceof Element)) {
			return null;
		}

		const closest = target.closest(".item");

		if (!(closest instanceof Element)) {
			return null;
		}

		return closest;
	};

	let selectedMenuId = "";
	const onUpdateSelectedId = (id: string) => {
		selectedMenuId = id;
		log.VVV("update selected id: ", id);
		window.top.dispatchEvent(
			new CustomEvent(EventType.MenuSelectedId, { detail: id })
		);
	};

	const dragover = (event: MouseEvent) => {
		log.VVV("menu", event);
		const closest = closestMenuItem(event.target);

		if (!(closest instanceof Element)) {
			for (const hover of svgElem.querySelectorAll(".hover")) {
				hover.classList.remove("hover");
			}
			onUpdateSelectedId("");
			return;
		}

		const id = closest.id;

		if (selectedMenuId !== id) {
			for (const hover of svgElem.querySelectorAll(".hover")) {
				hover.classList.remove("hover");
			}
			closest.classList.add("hover");
			onUpdateSelectedId(id);
		}
	};

	const dragleave = (event: MouseEvent) => {
		log.VVV("menu", event);
		const closest = closestMenuItem(event.target);

		if (closest === event.target) {
			onUpdateSelectedId("");
		}
	};

	let svgElem: SVGSVGElement;
	let container: HTMLElement;
	const boxSize = 800;
	export async function show(opts: ShowMenuOptions) {
		const svgSize = 200;
		const scaleFactor = svgSize / boxSize;
		// FIXME: avoid rebuild menu every time for the same options
		await rebuildMenu(svgElem, {
			items: opts.items,
			dividerLineLength: 28,
			circleRadius: opts.circleRadius * scaleFactor,
			iconOffset: 24,
			iconSize: 8,
			textOffset: 36,
			fontSize: 4,
			height: svgSize,
			width: svgSize,
		});
	}

	export function reset() {
		onUpdateSelectedId("");
	}

	export const box: [number, number] = [boxSize, boxSize];
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	id="container"
	on:dragover={dragover}
	on:dragleave={dragleave}
	style="width: {box[0]}px; height: {box[1]}px;"
	bind:this={container}
>
	<svg
		version="1.1"
		width={box[0]}
		height={box[1]}
		xmlns="http://www.w3.org/2000/svg"
		bind:this={svgElem}
	/>
</div>

<style>
	#container {
		position: absolute;
	}
</style>
