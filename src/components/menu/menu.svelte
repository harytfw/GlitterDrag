<svelte:options tag="glitter-drag-menu" />

<script lang="ts">
	import cloneDeep from "lodash-es/cloneDeep";

	import { get_current_component } from "svelte/internal";
	import { MenuLayout } from "../../config/config";
	import type { Position } from "../../types";
	import { updateStatus } from "../status/status";
	import { EventType, type MenuItem, type MenuMessage } from "../message";

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

	const cb = (msg: CustomEvent<MenuMessage>) => {
		if (msg.detail.type === "reset") {
			selectedMenuId = ""
			return
		}
		center = msg.detail.center;
		layout = msg.detail.layout;
		items = cloneDeep(msg.detail.items);
		if (layout === MenuLayout.circle) {
			items = items.slice(0, 12);
		} else {
			items = items.slice(0, 16);
		}
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

	component.addEventListener(EventType.Menu, cb);

	const updateSelectedId = (id: string) => {
		selectedMenuId = id;
		component.dataset["id"] = id;
	};

	const dragover = (event: DragEvent) => {
		const closest = closestMenuItem(event.target);


		if (!(closest instanceof HTMLElement)) {
			return;
		}

		const id = closest.dataset["id"];
		const idx = closest.dataset["index"];

		if (selectedMenuId !== id) {
			updateSelectedId(id);
			updateStatus({
				type: "show",
				text: items[idx].title,
			});
		}
	};

	const dragleave = (event: DragEvent) => {
		const closest = closestMenuItem(event.target);

		if (closest === event.target) {
			updateSelectedId("");
		}
	};
</script>

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
			{@html item.htmlContent}
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
		border-color: #777;
	}
</style>
