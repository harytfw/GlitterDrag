const MINIUM_MOVEMENT = 10
const LEFT_BUTTON = 0
const MIDDLE_BUTTON = 1
const STATE_IDLE = 0
const STATE_WORKING = 2

interface Range {
	node: Node,
	offset: number,
}

function getRange(x: number, y: number): Range | null {
	let range = null
	if (typeof (document as any).caretPositionFromPoint === "function") {
		const { offsetNode: node, offset: offset } = (document as any).caretPositionFromPoint(x, y);
		range = {
			node, offset,
		};
	} else {
		const { startContainer: node, startOffset: offset } = document.caretRangeFromPoint(x, y);
		range = {
			node, offset,
		};
	}
	return range
}

export class MiddleButtonSelector {
	x1: number
	y1: number
	x2: number
	y2: number
	se: Selection
	state: number
	style: HTMLStyleElement
	target: HTMLElement

	constructor(selection: Selection, target: HTMLElement) {

		this.x1 = 0.0, this.y1 = 0.0;
		this.x2 = 0.0, this.y2 = 0.0;
		this.se = selection

		this.state = STATE_IDLE;

		this.mouseup = this.mouseup.bind(this);
		this.mousedown = this.mousedown.bind(this);
		this.mousemove = this.mousemove.bind(this);
		this.auxclick = this.auxclick.bind(this);

		this.style = document.createElement("style");
		this.style.textContent = "a { pointer-events:none; }";
		this.target = target
	}

	async start() {
		this.target.addEventListener("mouseup", this.mouseup);
		this.target.addEventListener("mousedown", this.mousedown);
		this.target.addEventListener("mousemove", this.mousemove);
		this.target.addEventListener("auxclick", this.auxclick);
	}

	async stop() {
		this.target.removeEventListener("mouseup", this.mouseup)
		this.target.removeEventListener("mousedown", this.mousedown)
		this.target.removeEventListener("mousemove", this.mousemove)
		this.target.removeEventListener("auxclick", this.auxclick)
	}

	mousedown(e: MouseEvent) {
		if (e.button !== MIDDLE_BUTTON) {
			return
		}
		e.preventDefault();
		if (this.state === STATE_IDLE) {
			this.state = STATE_WORKING
			this.x1 = e.clientX
			this.y1 = e.clientY
			const range = getRange(e.clientX, e.clientY);
			this.se.setBaseAndExtent(range.node, range.offset, range.node, range.offset)
		}
	}

	mouseup(e: MouseEvent) {
		this.state = STATE_IDLE
		if (e.button !== MIDDLE_BUTTON) {
			return
		}
		e.preventDefault()
	}

	mousemove(e: MouseEvent) {
		if (this.state === STATE_WORKING) {
			const range = getRange(e.clientX, e.clientY)
			this.se.extend(range.node, range.offset)
			e.preventDefault()
		}
	}

	auxclick(e: MouseEvent) {
		this.state = STATE_IDLE;
		if (e.button === MIDDLE_BUTTON && this.se.toString() !== "") {
			e.preventDefault();
		}
	}
};

