import { MenuLayout } from "../config/config"
import type { Position } from "../types"



export enum EventType {
	Status = "gd-status",
	StatusProxy = "gd-status-proxy",
	Indicator = "gd-indicator",
	IndicatorProxy = "gd-indicator-proxy",
	Menu = "gd-menu",
	MenuProxy = "gd-menu-proxy",
	MenuSelectedId = "gd-menu-id"
}

export enum ProxyEventType {
	Menu = "gd-proxy:menu",
	Status = "gd-proxy:status",
	Indicator = "gd-proxy:indicator",
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
	items: MenuItem[]
}

export interface GenericFunction {
	name: string
	args: unknown[]
}

export interface Indicator {
	show(radius: number, pos: Position)
	hide()
}

export interface Prompt {
	show(text: string)
	hide()
}

export interface Menu {
	show(opts: ShowMenuOptions): void
	hide(): void
}