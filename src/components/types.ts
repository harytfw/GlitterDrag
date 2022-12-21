import { MenuLayout } from "../config/config"
import type { Position } from "../types"



export enum EventType {
	MenuSelectedId = "glitter-drag:menu-id"
}

export enum ProxyEventType {
	Menu = "glitter-drag:menu-proxy",
	Prompt = "glitter-drag:prompt-proxy",
	Indicator = "glitter-drag:indicator-proxy",
}

export interface IndicatorMessage {
	type: "show" | "hide"
	radius?: number
	center?: Position
}


export interface StatusMessage {
	type: "show" | "hide"
	text?: string
}


export interface MenuItem {
	id: string,
	title: string,
	html: string
	style?: ""
}

export interface MenuMessage {
	type: "show" | "hide" | "reset"
	center?: Position
	layout?: MenuLayout
	items?: MenuItem[]
}

export interface ShowMenuOptions {
	position: Position,
	layout: MenuLayout,
	items: MenuItem[],
	circleRadius: number,
}

export interface GenericFunction {
	name: string
	args: unknown[]
}

export interface IndicatorInterface {
	show(radius: number, pos: Position)
	hide()
}

export interface PromptInterface {
	show(text: string)
	hide()
}

export interface MenuInterface {
	show(opts: ShowMenuOptions): void
	hide(): void
}


export interface MenuOptions {
	items: MenuItem[];
	dividerLineLength: number;
	circleRadius: number;
	iconOffset: number;
	iconSize: number;
	textOffset: number;
}
