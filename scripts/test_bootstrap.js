import { WebSocketServer } from 'ws';
import { spawn } from 'node:child_process';
import webExt from 'web-ext'


const TEST_TIMEOUT_MS = 1000 * 60 * 5

const { TARGET_DIST, BUILD_WEBSOCKET_SERVER } = process.env

async function runBrowser(signal) {

  return new Promise((resolve, reject) => {

    const proc = spawn("pnpm", ["exec", "web-ext", "run", "-f", "firefox-developer-edition" , "-s", TARGET_DIST], {
      stdio: ["ignore", process.stdout, process.stderr],
      signal: signal
    })

    proc.on("error", (err) => {
      console.error(err)
      resolve()
    })

    proc.on("close", (code) => {
      if (code === 0) {
        resolve()
      } else {
        reject("code: " + code)
      }
    })
  })
}

async function waitTestComplete() {
  const url = new URL(BUILD_WEBSOCKET_SERVER)
  let port = undefined
  if (url.port.length > 0) {
    port = Number.parseInt(url.port)
  }
  const wss = new WebSocketServer({ host: url.hostname, port, });

  return new Promise((resolve) => {
    wss.on('connection', (ws) => {
      ws.on('message', (data) => {
        const [type, payload] = JSON.parse(data)
        switch (type) {
          case "start": {
            ws.send("ok")
            break
          }
          case "pass": {
            ws.send("ok")
            console.info("pass: %s", payload.fullTitle)
            break
          }
          case "fail": {
            ws.send("ok")
            console.error("fail: %s", payload.fullTitle)
            break
          }
          case "end": {
            ws.close()
            wss.close()
            resolve(payload)
            break
          }
          default: {
            throw new Error("unknown event type: ", type)
          }
        }
      });
      ws.send("ok")
    });
  })
}

async function main() {
  const controller = new AbortController()

  const browser = runBrowser(controller.signal)

  const summary = await waitTestComplete()

  await browser

  console.log("tests: %d, passes: %d, failures: %d", summary.tests, summary.passes, summary.failures)
  // console.log(summary)
  if (summary.failure > 0) {
    process.exit(1)
  } else {
    process.exit(0)
  }
}

main()