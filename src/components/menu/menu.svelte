<svelte:options tag={null} />

<script lang="ts">
	import { LogLevel } from "../../config/config";
	import { rootLog } from "../../utils/log";
	import {
		EventType,
		type MenuOptions,
		type ShowMenuOptions,
	} from "../types";
	const log = rootLog.subLogger(LogLevel.VVV, "menu");
	let selectedMenuId = "";

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

	export function polar2cartesian(
		r: number,
		theta: number,
		offset?: number[]
	) {
		const [x, y] = offset ? offset : [0, 0];
		return [r * Math.cos(theta) + x, r * Math.sin(theta) + y];
	}

	export function degToRad(degrees) {
		return degrees * (Math.PI / 180);
	}

	export async function buildMenu(svg: SVGSVGElement, opts: MenuOptions) {
		const NAMESPACE = "http://www.w3.org/2000/svg";
		const colorDef = `
	<radialGradient id="sector-color" href="#hover-color" gradientUnits="userSpaceOnUse">
      <stop
         style="stop-color:#808080;stop-opacity:0.8;"
         offset="0"
         id="stop14616" />
      <stop
         style="stop-color:#999999;stop-opacity:0.5;"
         offset="0.3"
         id="stop20477" />
      <stop
         style="stop-color:#b2b2b2;stop-opacity:0.2;"
         offset="1"
         id="stop14618" />
	</radialGradient>
	`;
		const {
			items,
			dividerLineLength,
			circleRadius,
			iconOffset,
			iconSize,
			textOffset,
		} = opts;

		const [width, height] = [200, 200];
		const center = [width / 2, height / 2];
		const arcRadius = dividerLineLength + circleRadius;
		const angleUnit = 360 / items.length;
		const halfAngleUnit = angleUnit / 2;

		svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
		svg.dataset["arcRadius"] = `${arcRadius}`;
		svg.dataset["angleUnit"] = `${angleUnit}`;
		svg.dataset["dividerLineLength"] = `${dividerLineLength}`;
		svg.dataset["iconOffset"] = `${iconOffset}`;
		svg.dataset["iconSize"] = `${iconSize}`;
		svg.dataset["textOffset"] = `${textOffset}`;

		{
			const defs = document.createElementNS(NAMESPACE, "defs");
			defs.innerHTML = colorDef;
			svg.append(defs);
		}

		{
			const style = document.createElement("style");
			style.textContent = `
				g .sector-fill {
					fill: #fff0;
					stroke: none;
				}

				g:hover .sector-fill {
					fill: url("#sector-color");
				}

				g.hover .sector-fill {
					fill: url("#sector-color");
				}

				g.hover .sector-fill text {
					fill: white;
				}

				g text {
					font-size: 4px;
					fill: white; 
					text-shadow: #000 0px 0 2px;
				)
			`;
			svg.append(style);
		}

		{
			const circle = document.createElementNS(NAMESPACE, "circle");
			circle.setAttribute("cx", `${center[0]}`);
			circle.setAttribute("cy", `${center[1]}`);
			circle.setAttribute("r", `${circleRadius}`);
			circle.setAttribute("fill", "none");
			svg.append(circle);
		}

		const gs = [];
		const textPositions = [];
		for (let i = 0; i < items.length; i++) {
			const g = document.createElementNS(NAMESPACE, "g");
			gs.push(g);
			g.setAttribute("id", `${items[i].id}`);
			g.classList.add("item");
			{
				const startAngle = angleUnit * i - halfAngleUnit;
				const endAngle = angleUnit * i + halfAngleUnit;

				const start = polar2cartesian(
					circleRadius,
					degToRad(startAngle),
					center
				);
				const startDivider = polar2cartesian(
					dividerLineLength,
					degToRad(startAngle),
					start
				);

				const end = polar2cartesian(
					circleRadius,
					degToRad(endAngle),
					center
				);
				const endDivider = polar2cartesian(
					dividerLineLength,
					degToRad(endAngle),
					end
				);

				{
					const sectorFillArea = document.createElementNS(
						NAMESPACE,
						"path"
					);
					sectorFillArea.classList.add("sector-fill");
					sectorFillArea.setAttribute(
						"d",
						`
					M ${start[0]},${start[1]}
					L ${startDivider[0]},${startDivider[1]}
					A ${arcRadius} ${arcRadius} 0 0 1 ${endDivider[0]},${endDivider[1]}
					L ${end[0]},${end[1]}
					A ${circleRadius} ${circleRadius} 0 0 0 ${start[0]},${start[1]}
				`
					);
					g.append(sectorFillArea);
				}

				{
					const sectorOutline = document.createElementNS(
						NAMESPACE,
						"path"
					);
					sectorOutline.classList.add("sector-outline");
					sectorOutline.setAttribute("fill", "none");
					sectorOutline.setAttribute("stroke", "grey");
					sectorOutline.setAttribute("stroke-width", `${0.2}`);
					sectorOutline.setAttribute(
						"d",
						`
					M ${start[0]},${start[1]}
					L ${startDivider[0]},${startDivider[1]}
					M ${endDivider[0]},${endDivider[1]}
					L ${end[0]},${end[1]}
					A ${circleRadius} ${circleRadius} 0 0 0 ${start[0]},${start[1]}
				`
					);
					g.append(sectorOutline);
				}
			}

			{
				const degree = angleUnit * i;
				let align = "middle";
				if (degree >= 45 && degree < 45 + 90 * 1) {
					align = "middle";
				} else if (degree >= 45 + 90 * 1 && degree < 45 + 90 * 2) {
					align = "end";
				} else if (degree >= 45 + 90 * 2 && degree < 45 + 90 * 3) {
					align = "middle";
				} else {
					align = "start";
				}
				const textPos = polar2cartesian(
					textOffset,
					degToRad(angleUnit * i),
					center
				);
				const text = document.createElementNS(NAMESPACE, "text");
				text.textContent = items[i].title;
				text.setAttribute("text-anchor", align);
				text.setAttribute("x", `${textPos[0]}`);
				text.setAttribute("y", `${textPos[1]}`);
				g.append(text);
				textPositions.push(textPos);
			}
			{
				try {
					const parser = new document.defaultView.DOMParser();
					const parseDoc = parser.parseFromString(
						items[i].html,
						"text/html"
					);

					const iconSvg = parseDoc.querySelector("svg");
					const iconImg = parseDoc.querySelector("img");

					const iconPos = polar2cartesian(
						iconOffset,
						degToRad(angleUnit * i),
						center
					);
					const image = document.createElementNS(NAMESPACE, "image");
					image.setAttribute("x", `${iconPos[0] - iconSize / 2}`);
					image.setAttribute("y", `${iconPos[1] - iconSize / 2}`);
					image.setAttribute("width", `${iconSize}`);
					image.setAttribute("height", `${iconSize}`);

					if (iconSvg) {
						const blob = new Blob([iconSvg.outerHTML], {
							type: "image/svg+xml",
						});
						const urlPromise: Promise<string> = new Promise(
							(resolve) => {
								const fr = new FileReader();
								fr.addEventListener(
									"loadend",
									() => {
										const url = fr.result as string;
										resolve(url);
									},
									{ once: true }
								);
								fr.readAsDataURL(blob);
							}
						);
						const url = await urlPromise;
						image.setAttribute("href", url);
						g.append(image);
					} else if (iconImg) {
						image.setAttribute("href", iconImg.src);
						g.append(image);
					}
				} catch (e) {
					console.error(e);
				}
			}
		}
		svg.append(...gs);
		return textPositions;
	}

	let svgElem: SVGSVGElement;
	let container: HTMLElement;
	export async function show(opts: ShowMenuOptions) {
		while (svgElem && svgElem.firstChild) {
			svgElem.firstChild.remove();
		}
		const textPositions = await buildMenu(svgElem, {
			items: opts.items,
			dividerLineLength: 28,
			circleRadius: opts.circleRadius / scaleFactor(),
			iconOffset: 24,
			iconSize: 8,
			textOffset: 36,
		});
	}

	export function reset() {
		onUpdateSelectedId("");
	}

	export function box() {
		return [800, 800];
	}

	export function scaleFactor() {
		return 3;
	}
</script>

<!-- svelte-ignore a11y-mouse-events-have-key-events -->
<div
	id="container"
	on:dragover={dragover}
	on:dragleave={dragleave}
	width={box()[0]}
	height={box()[1]}
	bind:this={container}
>
	<svg
		version="1.1"
		width={box()[0]}
		height={box()[1]}
		xmlns="http://www.w3.org/2000/svg"
		bind:this={svgElem}
	/>
</div>

<style>
	#container {
		position: absolute;
	}
</style>
