import { ContextType } from "../config/config"
import type { KVRecord } from "../types"
import { URLFixer } from "../utils/url"
import type { OpSummary } from "./op"

export class OpSource {
    private _isContentEditable: boolean = false
    private _isDraggable: boolean = false
    private _type: ContextType | null = null
    private _src: string = ""
    private _imgSrc: string = ""
    private _link: string = ""
    private _linkText: string = ""
    private _text: string = ""
    private _nodeName: string = ""
    private _url: string = ""

    private constructor() {

    }

    toPlainObject(): KVRecord {
        return JSON.parse(JSON.stringify(this))
    }

    static fromPlainObject(obj: KVRecord): OpSource {
        const os = new OpSource()
        Object.assign(os, obj)
        return os
    }

    clone(): OpSource {
        const os = new OpSource()
        Object.assign(os, this)
        return os
    }

    static fromNode(target: Node): OpSource {
        const os = new OpSource()
        const win = target.ownerDocument.defaultView

        if (target instanceof win.HTMLAnchorElement) {
            os._type = ContextType.link
            os._link = new URL(target.href).toString()
            os._linkText = target.textContent
        } else if (target instanceof win.HTMLImageElement) {
            os._type = ContextType.image
            os._src = target.src
            os._imgSrc = os._src
            os._text = target.title
        } else if (win.getSelection().toString().length > 0) {
            os._type = ContextType.selection
            os._text = win.getSelection().toString()
        } else if (target instanceof win.Text) {
            os._type = ContextType.selection
            os._text = target.textContent
        } else {
            os._type = null
        }

        if (target instanceof win.Node) {
            os._nodeName = target.nodeName
        }

        if (target instanceof HTMLElement) {
            os._isContentEditable = target.isContentEditable
            os._isDraggable = target.draggable
            const img = target.querySelector("img")
            if (img) {
                os._imgSrc = img.src
            }
        }

        if (os.type === ContextType.selection) {
            const url = new URLFixer().fix(os.text)
            if (url) {
                os._link = url.toString()
                os._linkText = os.text
                os._type = ContextType.link
            }
        }

        return os
    }

    get text(): string {
        return this._text
    }

    get src(): string {
        return this._src
    }

    get imgSrc(): string {
        return this._imgSrc
    }

    get link(): string {
        return this._link
    }

    get linkText(): string {
        return this._linkText
    }

    get targetNodeName(): string {
        return this._nodeName
    }

    get type(): ContextType | null {
        return this._type
    }

    get isContentEditable(): boolean {
        return this._isContentEditable
    }

    get isDraggable(): boolean {
        return this._isDraggable
    }

    summary(): OpSummary {

        // TODO: cache types variable
        let types: ContextType[] = []

        if (this.type == ContextType.selection) {
            types.push(ContextType.selection)
        } else if (this.type == ContextType.link) {
            types.push(ContextType.link)
            if (this.imgSrc.length > 0) {
                types.push(ContextType.image)
            }
        } else if (this.type == ContextType.image) {
            types.push(ContextType.image)
        }

        return {
            contextTypes: types,
            selection: this.text,
            link: this.link,
            imgSrc: this.imgSrc,
            linkText: this.linkText,
        }
    }
}
