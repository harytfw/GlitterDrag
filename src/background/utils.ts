import cloneDeep from 'lodash-es/cloneDeep';
import browser from 'webextension-polyfill'
import { Configuration, ActionConfig } from "../config/config";
import type { ExecuteArgs } from "../message/message";
import type { ExtensionStorage } from "../types";
import { primarySelection, primaryType, type ExecuteContext } from "./context";
import { VolatileState } from './volatile_state';

export function createObjectURL(blob = new Blob(), revokeTime = 1000 * 60 * 3) {
    const url = window.URL.createObjectURL(blob);
    setTimeout((u: string) => window.URL.revokeObjectURL(u), revokeTime, url); // auto revoke
    return url;
}

export function createBlobObjectURLForText(text = "") {
    let blob = new window.Blob([text], {
        type: "text/plain"
    });
    return createObjectURL(blob);
}

export function isOpenableURL(u: string | URL): string | null {
    if (u instanceof URL) {
        return u.toString()
    }

    try {
        return new URL(u).toString();
    } catch (_) { }

    if (u.startsWith("about:")) {
        return u
    }

    return null
}

export function dumpFunc(data: any) {
    console.log(data)
    let pre = document.createElement("pre")
    pre.style.color = "black"
    pre.style.backgroundColor = "white"
    pre.textContent = JSON.stringify(data, null, 2)
    document.body.appendChild(pre)
}

export async function urlToArrayBuffer(url: URL) {
    const controller = new AbortController();
    const signal = controller.signal;
    setTimeout(() => controller.abort(), 1000 * 10)

    // cache ?
    const resp = await fetch(url, { signal })
    const buf = await resp.arrayBuffer()
    return buf
}

const revokeTime = 1000 * 60 * 1

export function bufferToObjectURL(buf: ArrayBuffer): URL {
    const blob = new Blob([buf], {})
    const url = URL.createObjectURL(blob)
    setTimeout(() => URL.revokeObjectURL(url), revokeTime)
    return new URL(url)
}

const PNG = [0x89, 0x50, 0x4e, 0x47]
const JPEG = [0xff, 0xd8, 0xff, 0xe0]

export function guessImageType(buf: ArrayBuffer): "png" | "jpeg" | "unknown" {
    const view = new Uint8Array(buf)

    if (view.length < 4) {
        return "unknown"
    }

    const test = (_: any, i: number, arr: number[]) => arr[i] === view[i]

    if (PNG.every(test)) {
        return "png"
    }

    if (JPEG.every(test)) {
        return "jpeg"
    }

    return "unknown"
}

const pngPrefix = "data:image/png"
const jpegPrefix = "data:image/jpeg"


export function guessImageTypeFromBase64(data: string): "png" | "jpeg" | "unknown" {
    if (data.startsWith(pngPrefix)) {
        return "png"
    }

    if (data.startsWith(jpegPrefix)) {
        return "jpeg"
    }

    return "unknown"
}

export function dateTimeAsFileName(date: Date): string {
    return `${date.getFullYear()}-${date.getMonth()}-${date.getDate()} ${date.getHours()}-${date.getMinutes()}-${date.getSeconds()}`
}


export async function buildDownloadableURL(ctx: ExecuteContext): Promise<URL> {
    const type = primaryType(ctx)
    switch (type) {
        case "text":
            const encoder = new TextEncoder()
            const buf = encoder.encode(primarySelection(ctx))
            return bufferToObjectURL(buf)
        case "image":
            const url = new URL(primarySelection(ctx))
            switch (url.protocol) {
                case "data:":
                    const buf = await urlToArrayBuffer(url)
                    return bufferToObjectURL(buf)
                case "http:":
                case "https:":
                    return url
            }
        case "link":
            return new URL(primarySelection(ctx))
    }
}

export function guessFilenameFromURL(url: URL): string | null {
    let parts = url.pathname
        .split("/")
        .filter(p => p.length > 0)

    if (parts.length > 0) {
        return parts[parts.length - 1]
    }

    return url.hostname
}

export function generatedDownloadFileName(ctx: ExecuteContext, url: URL): string | null {
    const type = primaryType(ctx)
    switch (type) {
        case "text": {
            return dateTimeAsFileName(new Date()) + ".txt"
        }
        case "image": {
            const sel = primarySelection(ctx)
            if (sel.startsWith("data:")) {
                const type = guessImageTypeFromBase64(sel)
                if (type === "png" || type === "jpeg") {
                    return [dateTimeAsFileName(new Date()), ".", type].join("")
                }
                return dateTimeAsFileName(new Date())
            }
            const filename = guessFilenameFromURL(url)
            return filename
        }
        case "link": {
            const filename = guessFilenameFromURL(url)
            return filename
        }
        default:
            return null
    }
}

export async function buildExecuteContext(args: ExecuteArgs, sender: browser.Runtime.MessageSender): Promise<Readonly<ExecuteContext>> {
    const storage = (await browser.storage.local.get('userConfig')) as ExtensionStorage
    const state = await VolatileState.load()
    const config = new Configuration(storage.userConfig)
    return Object.assign({}, {
        backgroundTabCounter: state.backgroundTabCounter,
        windowId: sender.tab.windowId,
        tabId: sender.tab.id,
        tabIndex: sender.tab.index,
        frameId: sender.frameId,
        tabURL: sender.tab.url,
        action: new ActionConfig(args.action),
        config,
    }, args)
}


export function buildVars(ctx: ExecuteContext): Map<string, string|number> {
    return new Map([])
}