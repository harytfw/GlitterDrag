import { MenuLayout } from "../config/config"
import type { Position } from "../types"



export enum EventType {
	Status = "gd-status",
	StatusProxy = "gd-status-proxy",
	Indicator = "gd-indicator",
	IndicatorProxy = "gd-indicator-proxy",
	Menu = "gd-menu",
	MenuProxy = "gd-menu-proxy",
	MenuSelectedIDProxy = "gd-menu-selected-id",
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
	htmlContent: string
	style?: ""
}

export interface MenuMessage {
	type: "show" | "hide" | "reset"
	center?: Position
	layout?: MenuLayout
	items?: MenuItem[]
}
