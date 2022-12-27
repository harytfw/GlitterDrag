import trimStart from 'lodash-es/trimStart';
import browser from 'webextension-polyfill';
import { CommandKind, ContextType, LogLevel, TabPosition } from '../config/config';
import { buildRuntimeMessage, RuntimeMessageName } from '../message/message';
import { rootLog } from '../utils/log';
import { VarSubstituteTemplate } from '../utils/var_substitute';
import { isFirefox } from '../utils/vendor';
import { getTabIndex, handlePreferContextData, primaryContextData, primaryContextType, } from '../context/utils';
import { Protocol, RequestResolver } from '../resolver/resolver';
import { searchText as searchTextViaBrowser } from './search';
import { buildDownloadableURL, buildVars, dumpFunc, generatedDownloadFileName, guessImageType, isOpenableURL, urlToArrayBuffer } from './utils';
import { defaultVolatileState } from '../state/state';
import type { ExecuteContext } from '../context/context';

const log = rootLog.subLogger(LogLevel.VVV, 'executor')

export class Executor {

    async execute(ctx: ExecuteContext) {
        log.VVV('command:', ctx.action.command, 'ctx: ', ctx)

        switch (ctx.action.command) {
            case CommandKind.open: {
                await this.openHandler(ctx);
                return
            }
            case CommandKind.copy: {
                await this.copyHandler(ctx);
                return
            }
            case CommandKind.request: {
                await this.requestHandler(ctx);
                return
            }
            case CommandKind.download: {
                await this.downloadHandler(ctx);
                return
            }
            case CommandKind.dump: {
                await this.dumpHandler(ctx)
                return
            }
            case CommandKind.script: {
                await this.scriptHandler(ctx)
            }
            default: {
                throw new Error("unknown action command: " + ctx.action.command)
            }
        }
    }

    async openHandler(ctx: ExecuteContext) {
        this.openTab(ctx, primaryContextData(ctx))
    }

    async copyImage(ctx: ExecuteContext) {
        // TODO: chrome
        const buf = await urlToArrayBuffer(new URL(ctx.data.imageSource))
        const imageType = guessImageType(buf)
        if (imageType === "jpeg" || imageType === "png") {
            browser.clipboard.setImageData(buf, imageType)
        } else {
            log.E("unknown image type", buf.slice(0, 4))
        }
    }

    async copyHandler(ctx: ExecuteContext) {
        const type = primaryContextType(ctx)
        switch (type) {
            case ContextType.image: {

                async function copyImageSource() {
                    browser.tabs.sendMessage(ctx.tab.id, buildRuntimeMessage(RuntimeMessageName.copy, ctx.data.imageSource))
                }

                handlePreferContextData(ctx, copyImageSource, { "image": this.copyImage, "imageSource": copyImageSource })
                return
            }
            default: {
                browser.tabs.sendMessage(ctx.tab.id, buildRuntimeMessage(RuntimeMessageName.copy, primaryContextData(ctx)))
                return
            }
        }
    }



    async requestHandler(ctx: ExecuteContext) {

        const id = ctx.action.config.requestId

        log.VVV("request id in config: ", id)

        const request = ctx.config.requests.find((req) => id === req.id)

        if (!request) {
            return
        }

        const resolver = new RequestResolver(ctx, request)

        switch (resolver.protocol) {
            case Protocol.browserSearch:
                {
                    const tabHoldingSearch = await this.openTab(ctx, 'about:blank')
                    await new Promise(r => setTimeout(r, 50))

                    const query = primaryContextData(ctx)
                    const engine = resolver.resolveEngine()

                    log.VV("search: ", query, "with: ", engine)

                    await searchTextViaBrowser({
                        query: query,
                        engine: engine,
                        tabId: tabHoldingSearch.id,
                    })
                    return
                }
            default:
                {
                    const url = resolver.resolveURL()
                    log.VVV(request, "resolved url:", url)

                    await this.openTab(ctx, url)

                    return
                }
        }
    }

    async downloadHandler(ctx: ExecuteContext): Promise<number> {
        const url = await buildDownloadableURL(ctx)
        const genFilename = generatedDownloadFileName(ctx, url)

        let fullFilename: string | undefined = undefined

        if (genFilename) {
            const vars = buildVars(ctx)
            const template = new VarSubstituteTemplate(ctx.action.config.directory)
            fullFilename = [template.substitute(vars), "/", genFilename].join("")
            fullFilename = trimStart(fullFilename, '/')
        }

        log.VVV("download url: ", url, "genFilename: ", genFilename, "fullFilename: ", fullFilename)

        const downloadId = await browser.downloads.download({
            url: url.toString(),
            saveAs: ctx.action.config.showSaveAsDialog,
            filename: fullFilename,
        })

        return downloadId
    }

    async dumpHandler(ctx: ExecuteContext): Promise<browser.Tabs.Tab> {
        const tab = await browser.tabs.create({
            url: "about:blank"
        })
        await new Promise(r => setTimeout(r, 50));

        let plainCtx = JSON.parse(JSON.stringify(ctx))

        let arg1 = {
            ctx: plainCtx,
            backgroundTabCounter: ctx.state.backgroundTabCounter,
            localStorage: await browser.storage.local.get()
        }

        await browser.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: dumpFunc,
            args: [arg1]
        })
        return tab
    }

    async scriptHandler(ctx: ExecuteContext): Promise<void> {
        const script = ctx.config.scripts.find(s => s.id === ctx.action.config.scriptId)
        if (!script) {
            log.E(`script "${script.id}" not found`)
            return
        }

        await browser.tabs.sendMessage(ctx.tab.id, buildRuntimeMessage(RuntimeMessageName.executeScript, {
            text: script.text,
            data: {
                text: ctx.data.selection,
                link: ctx.data.link,
                linkText: ctx.data.linkText,
                imageSource: ctx.data.imageSource,
                primary: primaryContextData(ctx),
            }
        }), {
            frameId: ctx.frameId
        })
        return
    }


    async openTab(ctx: ExecuteContext, urlArg: string | URL) {

        let url = urlArg.toString()

        if (!isOpenableURL(urlArg)) {
            log.V(urlArg, "is not openable")
        }

        if ([TabPosition.newWindow, TabPosition.privateWindow].includes(ctx.action.config.tabPosition!)) {

            const incognito = ctx.action.config.tabPosition === TabPosition.privateWindow

            log.VVV('create new window, incognito: ', incognito)
            const win = await browser.windows.create({
                incognito,
                url,
            });
            const tabs = await browser.tabs.query({
                windowId: win.id
            })
            return tabs[0];
        }


        if (ctx.action.config.tabPosition === TabPosition.current) {
            log.VVV('update current active tab with url', url)
            return browser.tabs.update(ctx.tab.id, { url });
        }

        const tabsOfCurrentWindow = await browser.tabs.query({
            windowId: ctx.tab.windowId,
        });


        const option: browser.Tabs.CreateCreatePropertiesType = {
            active: Boolean(ctx.action.config.activeTab),
            index: getTabIndex(ctx, tabsOfCurrentWindow.length),
            url,
            windowId: ctx.tab.windowId,
            openerTabId: ctx.tab.id,
        };

        if (isFirefox()) {
            let cookieStoreId = ctx.tab.cookieStoreId

            if (ctx.action.config.container) {
                const arr = await browser.contextualIdentities.query({ name: ctx.action.config.container })
                for (const c of arr) {
                    cookieStoreId = c.cookieStoreId
                    break
                }
            }

            option.cookieStoreId = cookieStoreId
        }


        log.VVV('create new tab with option', option)

        if (!ctx.action.config.activeTab && ctx.action.config.tabPosition === TabPosition.next) {
            const state = await defaultVolatileState()
            state.backgroundTabCounter += 1
        }

        return browser.tabs.create(option);
    }
}