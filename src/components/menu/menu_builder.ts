import type { MenuItem, MenuOptions } from "../types";

export const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
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

export async function toDataURL(text: string, type: string): Promise<string> {

	const blob = new Blob([text], {
		type: type,
	});

	return new Promise(
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
}

export async function rebuildMenu(svg: SVGSVGElement, opt: MenuOptions) {

	const { width, height } = opt
	const center = [width / 2, height / 2];
	const arcRadius = opt.dividerLineLength + opt.circleRadius;
	const angleUnit = 360 / opt.items.length;
	const halfAngle = angleUnit / 2;

	// remove all children
	svg.replaceChildren();

	svg.setAttribute("viewBox", `0 0 ${width} ${height}`);
	svg.dataset["arcRadius"] = `${arcRadius}`;
	svg.dataset["angleUnit"] = `${angleUnit}`;
	svg.dataset["dividerLineLength"] = `${opt.dividerLineLength}`;
	svg.dataset["iconOffset"] = `${opt.iconOffset}`;
	svg.dataset["iconSize"] = `${opt.iconSize}`;
	svg.dataset["textOffset"] = `${opt.textOffset}`;
	svg.dataset["fontSize"] = `${opt.fontSize}`;


	const styleContent = `
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
		font-size: ${opt.fontSize}px;
		fill: white; 
		text-shadow: #000 0px 0 4px;
		font-weight: bold;
	}
`;


	{
		const defs = document.createElementNS(SVG_NAMESPACE, "defs");
		defs.innerHTML = colorDef;
		svg.append(defs);
	}

	{
		const style = document.createElement("style");
		style.textContent = styleContent;
		svg.append(style);
	}

	{
		const circle = document.createElementNS(SVG_NAMESPACE, "circle");
		circle.setAttribute("cx", `${center[0]}`);
		circle.setAttribute("cy", `${center[1]}`);
		circle.setAttribute("r", `${opt.circleRadius}`);
		circle.setAttribute("fill", "none");
		svg.append(circle);
	}
	{
		const gs = []
		for (let i = 0; i < opt.items.length; i++) {
			const g = await createMenuItem(opt.items[i], angleUnit * i);
			gs.push(g)
		}
		svg.append(...gs);
	}
	async function createMenuItem(item: MenuItem, axisAngle: number) {
		const g = document.createElementNS(SVG_NAMESPACE, "g");
		g.setAttribute("id", `${item.id}`);
		g.classList.add("item");
		{
			const startAngle = axisAngle - halfAngle;
			const endAngle = axisAngle + halfAngle;

			const start = polar2cartesian(
				opt.circleRadius,
				degToRad(startAngle),
				center
			);

			const startDivider = polar2cartesian(
				opt.dividerLineLength,
				degToRad(startAngle),
				start
			);

			const end = polar2cartesian(
				opt.circleRadius,
				degToRad(endAngle),
				center
			);
			const endDivider = polar2cartesian(
				opt.dividerLineLength,
				degToRad(endAngle),
				end
			);

			{
				const sectorFillArea = document.createElementNS(
					SVG_NAMESPACE,
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
					A ${opt.circleRadius} ${opt.circleRadius} 0 0 0 ${start[0]},${start[1]}
				`
				);
				g.append(sectorFillArea);
			}

			{
				const sectorOutline = document.createElementNS(
					SVG_NAMESPACE,
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
					A ${opt.circleRadius} ${opt.circleRadius} 0 0 0 ${start[0]},${start[1]}
				`
				);
				g.append(sectorOutline);
			}
		}

		{
			let align = "middle";
			if (axisAngle >= 45 && axisAngle < 45 + 90 * 1) {
				align = "middle";
			} else if (axisAngle >= 45 + 90 * 1 && axisAngle < 45 + 90 * 2) {
				align = "end";
			} else if (axisAngle >= 45 + 90 * 2 && axisAngle < 45 + 90 * 3) {
				align = "middle";
			} else {
				align = "start";
			}
			const textPos = polar2cartesian(
				opt.textOffset,
				degToRad(axisAngle),
				center
			);
			const text = document.createElementNS(SVG_NAMESPACE, "text");
			text.textContent = item.title;
			text.setAttribute("text-anchor", align);
			text.setAttribute("x", `${textPos[0]}`);
			text.setAttribute("y", `${textPos[1]}`);
			g.append(text);
		}
		{
			try {
				const parser = new document.defaultView.DOMParser();
				const parseDoc = parser.parseFromString(
					item.html,
					"text/html"
				);

				const iconSvg = parseDoc.querySelector("svg");
				const iconImg = parseDoc.querySelector("img");

				const iconPos = polar2cartesian(
					opt.iconOffset,
					degToRad(axisAngle),
					center
				);
				const image = document.createElementNS(SVG_NAMESPACE, "image");
				image.setAttribute("x", `${iconPos[0] - opt.iconSize / 2}`);
				image.setAttribute("y", `${iconPos[1] - opt.iconSize / 2}`);
				image.setAttribute("width", `${opt.iconSize}`);
				image.setAttribute("height", `${opt.iconSize}`);

				if (iconSvg) {
					const url = await toDataURL(iconSvg.outerHTML, "image/svg+xml");
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
		return g
	}
}
