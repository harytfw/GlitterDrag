import browser from 'webextension-polyfill'
import { CommandKind, LogLevel, TabPosition } from '../config/config';
import { newRuntimeMessage as buildRuntimeMessage } from '../message/message';
import { rootLog } from '../utils/log';
import { VarSubstituteTemplate } from '../utils/var_substitute';
import { primarySelection, primaryType, type ExecuteContext } from './context';
import { Protocol, RequestResolver } from './resolver';
import { buildDownloadableURL, buildVars, dumpFunc, generatedDownloadFileName, guessImageType, isOpenableURL, urlToArrayBuffer } from './utils';
import { VolatileState } from './volatile_state';

const log = rootLog.subLogger(LogLevel.VVV, 'executor')

export class Executor {

    async execute(ctx: ExecuteContext) {
        log.VVV('command:', ctx.action.command, 'ctx: ', ctx)

        switch (ctx.action.command) {
            case CommandKind.open:
                await this.openHandler(ctx);
                return
            case CommandKind.copy:
                await this.copyHandler(ctx);
                return
            case CommandKind.request:
                await this.requestHandler(ctx);
                return
            case CommandKind.download:
                await this.downloadHandler(ctx);
                return
            case CommandKind.dump:
                await this.dumpHandler(ctx)
            default:
                throw new Error("unknown action command: " + ctx.action.command)
        }
    }

    async openHandler(ctx: ExecuteContext) {
        this.openTab(ctx, primarySelection(ctx))
    }

    async copyHandler(ctx: ExecuteContext) {
        const type = primaryType(ctx)
        switch (type) {
            case "text":
            case "link":
                browser.tabs.sendMessage(ctx.tabId, buildRuntimeMessage("copy", primarySelection(ctx)), {
                    frameId: ctx.frameId
                })
                return
            case "image":
                // TODO: chrome
                const buf = await urlToArrayBuffer(new URL(primarySelection(ctx)))
                const imageType = guessImageType(buf)
                if (imageType === "jpeg" || imageType === "png") {
                    browser.clipboard.setImageData(buf, imageType)
                } else {
                    log.E("unknown image type", buf.slice(0, 4))
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
            case Protocol.search:
                {
                    const tabHoldingSearch = await this.openTab(ctx, 'about:blank')
                    await new Promise(r => setTimeout(r, 50))

                    const query = primarySelection(ctx)
                    const engine = resolver.resolveEngine()

                    log.VV("search: ", query, "with: ", engine)

                    browser.search.search({
                        query: query,
                        engine: engine,
                        tabId: tabHoldingSearch.id
                    })
                    return
                }
            case Protocol.extension:
                {
                    const message = resolver.resolveMessage()
                    const resp = await browser.runtime.sendMessage(resolver.resolveExtensionId(), message)

                    log.V("send message ", message, " to extension ", resolver.resolveExtensionId(), "response: ", resp)

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

    async downloadHandler(ctx: ExecuteContext) {
        const url = await buildDownloadableURL(ctx)
        const genFilename = generatedDownloadFileName(ctx, url)
        
        let fullFilename = undefined

        if (genFilename) {
            const vars = buildVars(ctx)
            const template = new VarSubstituteTemplate(ctx.action.config.directory)
            fullFilename = [template.substitute(vars), "/", genFilename].join("")
        }

        log.VVV("download url: ", url, "genFilename: ", genFilename, "fullFilename: ", fullFilename)
        
        await browser.downloads.download({
            url: url.toString(),
            saveAs: ctx.action.config.showSaveAsDialog,
            filename: fullFilename,
        })

        return
    }

    async dumpHandler(ctx: ExecuteContext) {
        const tab = await browser.tabs.create({
            url: "about:blank"
        })
        await new Promise(r => setTimeout(r, 50));

        let plainCtx = JSON.parse(JSON.stringify(ctx))

        let arg1 = {
            ctx: plainCtx,
            backgroundTabCounter: ctx.backgroundTabCounter,
            localStorage: await browser.storage.local.get()
        }

        await browser.scripting.executeScript({
            target: {
                tabId: tab.id
            },
            func: dumpFunc,
            args: [arg1]
        })
    }

    private getTabIndex(ctx: ExecuteContext, tabsLength = 0, currentTabIndex = 0) {

        let index = 0;
        switch (ctx.action.config.tabPosition) {
            case TabPosition.before: index = currentTabIndex; break;
            case TabPosition.next: index = currentTabIndex + ctx.backgroundTabCounter + 1; break;
            case TabPosition.start: index = 0; break;
            case TabPosition.end: index = tabsLength; break;
            default: throw new Error("unknown tab position:" + ctx.action.config.tabPosition);
        }

        log.VVV({
            tabsLength,
            currentTabIndex,
            activeTab: ctx.action.config.activeTab,
            tabPosition: ctx.action.config.tabPosition,
            childTabCount: ctx.backgroundTabCounter,
            index
        });

        return index;
    }

    async openTab(ctx: ExecuteContext, urlArg: string | URL) {

        let url = urlArg.toString()

        if (!isOpenableURL(urlArg)) {
            log.V(urlArg, "is not openable")
        }

        if ([TabPosition.window, TabPosition.privateWindow].includes(ctx.action.config.tabPosition!)) {

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
            return browser.tabs.update(ctx.tabId, { url });
        }

        const tabsOfCurrentWindow = await browser.tabs.query({
            windowId: ctx.windowId,
        });

        const option: browser.Tabs.CreateCreatePropertiesType = {
            active: Boolean(ctx.action.config.activeTab),
            index: this.getTabIndex(ctx, tabsOfCurrentWindow.length, ctx.tabIndex),
            url,
            windowId: ctx.windowId,
            openerTabId: ctx.tabId
        };

        log.VVV('create new tab with option', option)

        if (!ctx.action.config.activeTab && ctx.action.config.tabPosition === TabPosition.next) {
            const state = await VolatileState.load()
            state.backgroundTabCounter = state.backgroundTabCounter + 1
        }

        return browser.tabs.create(option);
    }
}