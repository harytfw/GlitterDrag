<svelte:options tag="glitter-drag-menu" />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";

	import { get_current_component } from "svelte/internal";
	import { MenuLayout } from "../../config/config";
	import type { Position } from "../../types";
	import { rootLog } from "../../utils/log";
	import { EventType, type MenuItem, type ShowMenuOptions } from "../types";

	let component = get_current_component() as HTMLElement;
	let items: MenuItem[] = [];
	let layout: MenuLayout = MenuLayout.circle;
	let distance = 120;
	let containerOffset = 30;
	let center: Position = { x: 0, y: 0 };
	let selectedMenuId = "";

	$: containerStyle =
		layout === MenuLayout.grid
			? `display:grid; grid-template-columns: 1fr 1fr 1fr;`
			: `display:block; left: ${center.x - containerOffset}px; top: ${
					center.y - containerOffset
			  }px`;

	const circularItemStyle = (
		_item: MenuItem,
		i: number,
		items: MenuItem[]
	) => {
		const angle = 360 / items.length;
		return `position:absolute; transform: rotate(${
			i * angle * 1
		}deg) translateY(${-distance}px) rotate(${i * angle * -1}deg`;
	};

	const closestMenuItem = (target: EventTarget): HTMLElement | null => {
		if (!(target instanceof Element)) {
			return null;
		}

		const closest = target.closest(".item");

		if (!(closest instanceof HTMLElement)) {
			return null;
		}

		return closest;
	};

	const updateSelectedId = (id: string) => {
		selectedMenuId = id;
		component.dataset["id"] = id;
		rootLog.VVV("update selected id: ", id);
		window.top.dispatchEvent(
			new CustomEvent(EventType.MenuSelectedId, { detail: id })
		);
	};

	const dragover = (event: MouseEvent) => {
		const closest = closestMenuItem(event.target);

		if (!(closest instanceof HTMLElement)) {
			return;
		}

		const id = closest.dataset["id"];
		const idx = closest.dataset["index"];

		if (selectedMenuId !== id) {
			updateSelectedId(id);
		}
	};

	const dragleave = (event: MouseEvent) => {
		const closest = closestMenuItem(event.target);

		if (closest === event.target) {
			updateSelectedId("");
		}
	};

	component["update"] = (opts: ShowMenuOptions) => {
		const docRect = document.documentElement.getBoundingClientRect();

		let x = opts.position.x;
		let y = opts.position.y;

		const len = distance + containerOffset;

		const right = x + len;
		const left = x - len;
		const top = y - len;
		const bottom = y + len;

		if (right > docRect.width) {
			x = docRect.width - len;
		} else if (left < 0) {
			x = len;
		}

		if (bottom > docRect.height) {
			y = docRect.height - len;
		} else if (top < 0) {
			y = len;
		}

		center = { x, y };
		layout = cloneDeep(opts.layout);
		items = cloneDeep(opts.items);
		if (layout === MenuLayout.circle) {
			items = items.slice(0, 12);
		} else {
			items = items.slice(0, 16);
		}
	};

	component["reset"] = () => {
		updateSelectedId("");
	};
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	id="container"
	on:dragover={dragover}
	on:dragleave={dragleave}
	style={containerStyle}
>
	{#each items as item, i}
		<div
			class="item"
			data-index={i}
			data-id={item.id}
			style={layout === MenuLayout.circle
				? circularItemStyle(item, i, items)
				: ""}
		>
			{@html item.html}
		</div>
	{/each}
</div>

<style>
	#container {
		position: absolute;
	}

	.item {
		width: 60px;
		height: 60px;
		border-radius: 18px;
		border-style: solid;
		border-width: 2px;
		border-color: #ccc;
	}
</style>
