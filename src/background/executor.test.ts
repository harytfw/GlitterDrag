
import browser, { tabs } from 'webextension-polyfill';
import { ActionConfig, CommandKind } from "../config/config"
import { closeTab } from '../utils/test';
import { Executor } from "./executor"
import { blankExecuteContext } from "../context/test_helper"

function buildActionConfig(command: CommandKind): ActionConfig {
    return new ActionConfig({ "command": command })
}

describe("test executor", async () => {
    const executor = new Executor()

    it("open tab", async () => {
        const ctx = await blankExecuteContext()
        let t: browser.Tabs.Tab
        try {
            t = await executor.openTab(ctx, "http://example.com")
        } finally {
            t && closeTab(t?.id)
        }
    })


    it("dump context", async () => {
        const ctx = await blankExecuteContext()
        await executor.dumpHandler(ctx)
    })

    it("copy text", async () => {
        const ctx = await blankExecuteContext(new ActionConfig({ command: CommandKind.copy }))

        ctx.data.selection = "copy demo"
        await executor.copyHandler(ctx)
    })

    it("copy image", async () => {
        const ctx = await blankExecuteContext(new ActionConfig({ command: CommandKind.copy }))

        ctx.data.imageSource = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAoAAAAKCAYAAACNMs+9AAAA8UlEQVQYlY3QoaqDYACG4dd5ysDgQBwz+QdZWFBYsTnwHryek3cVZi1isngHljVBUNAi/Ay3MIaWnXhY88tP+HiVqqo+rNhmDQL4aZoGx3FI05RpmhBCcDweKYoCXdeJooh5nlEty/rd7/ecTifatsV1XWzbZpomwjDkfr+TJAnK9Xr9qKpKEAR0XUdVVXieh2EY7Ha7/4/b7ZbX6wWAEAJN0+j7/gsBbN7vN5qmAfB8PjFNk3EcGYbhGw7DgOM4PB4Pbrcb5/OZy+VCWZZIKQFYloWN7/scDgfyPKeua6SU1HXNsixkWYaUkjiOUdYG/wONbmSLuq2dcQAAAABJRU5ErkJggg=="
        await executor.copyHandler(ctx)
    })

    it("download text", async () => {

        const ctx = await blankExecuteContext(buildActionConfig(CommandKind.download))

        ctx.data.selection = "hello world"

        let downloadId: number | undefined
        try {
            downloadId = await executor.downloadHandler(ctx)
        } finally {
            browser.downloads.removeFile(downloadId)
        }
    })
})