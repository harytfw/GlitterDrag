
import { ActionConfig, Configuration, TypeConstraint, TypePriority } from "../config/config";
import type { ExecuteArgs } from "../message/message";

export interface ExecuteContext extends ExecuteArgs {
	readonly action: ActionConfig
	readonly windowId: number
	readonly tabId: number,
	readonly tabIndex: number,
	readonly tabURL: string,
	readonly frameId: number,
	readonly config: Readonly<Configuration>
	readonly backgroundTabCounter: number
}

export function primaryType(ctx: ExecuteContext): "text" | "link" | "image" {

	for (const p of ctx.action.config.priorities) {
		if (TypePriority.text === p && ctx.text) {
			return TypePriority.text
		}
		if (TypePriority.link === p && ctx.link) {
			return TypePriority.link
		}
		if (TypePriority.image === p && ctx.image) {
			return TypePriority.image
		}
	}

	for (const t of ctx.action.condition.types) {

		if (TypeConstraint.text === t && ctx.text) {
			return TypeConstraint.text
		}

		if (TypeConstraint.link === t && ctx.link) {
			return TypeConstraint.link
		}

		if (TypeConstraint.image === t && ctx.image) {
			return TypeConstraint.image
		}
	}

	if (ctx.image) {
		return "image"
	}

	if (ctx.link) {
		return "link"
	}

	return "text"
}


export function primarySelection(ctx: ExecuteContext): string {
	const t = primaryType(ctx)
	switch (t) {
		case "text": return ctx.text
		case "link": return ctx.link
		case "image": return ctx.image
	}
}

