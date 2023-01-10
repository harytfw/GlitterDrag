import { program } from 'commander'
import fs from 'fs-extra'
import { spawn } from 'node:child_process'
import pathLib from 'node:path'
import * as rollup from 'rollup'
import webExt from 'web-ext'
import { WebSocketServer } from 'ws'
import zipDir from 'zip-dir'
import buildRollupConfig from './build_rollup.mjs'
import genManifest from './gen_manifest.mjs'
import { isTestTarget, mustEnv } from './utils.mjs'

const BUILD_DIR = mustEnv("BUILD_DIR", "./build")
const BUILD_SRC = mustEnv("BUILD_SRC", "./src")
const BUILD_VERSION = mustEnv("BUILD_VERSION", "2.1.0")

const FIREFOX = "firefox-developer-edition"
function copyAssets(destDir) {
	const assets = [
		{
			src: pathLib.join(BUILD_SRC, "options/options.html"),
			dest: pathLib.join(destDir, "options/options.html")
		},
		{
			src: pathLib.join(BUILD_SRC, "/icon"),
			dest: pathLib.join(destDir, "/icon")
		},
		{
			src: pathLib.join(BUILD_SRC, "/_locales"),
			dest: pathLib.join(destDir, "/_locales")
		},

		{
			src: "node_modules/simpledotcss/simple.min.css",
			dest: pathLib.join(destDir, "res/simple.min.css")
		},
	]
	for (const entry of assets) {
		fs.copySync(entry.src, entry.dest)
	}
}

function copyTestAssets(dest) {
	dest = pathLib.join(dest, "/test")
	const assets = [
		{
			src: pathLib.join("node_modules/mocha/mocha.js"),
			dest: pathLib.join(dest, "mocha.js")
		},
		{
			src: pathLib.join("node_modules/mocha/mocha.css"),
			dest: pathLib.join(dest, "mocha.css")
		},
		{
			src: pathLib.join("node_modules/chai/chai.js"),
			dest: pathLib.join(dest, "chai.js")
		},
		{
			src: pathLib.join(BUILD_SRC, "/test/mocha.html"),
			dest: pathLib.join(dest, "mocha.html")
		}
	]
	for (const entry of assets) {
		fs.copySync(entry.src, entry.dest)
	}
}

function buildDist(target) {
	return pathLib.join(BUILD_DIR, target, "dist")
}

function buildManifest(dist, version, target) {
	const manifest = genManifest({
		version: version,
		target: target,
	})
	fs.writeFileSync(pathLib.join(dist, "manifest.json"), JSON.stringify(manifest, null, "  "))
}

async function buildWithRollup(config) {
	for (const optionsObj of config) {
		try {
			const bundle = await rollup.rollup(optionsObj);
			await bundle.write(optionsObj.output);
			if (bundle) {
				// closes the bundle
				await bundle.close();
			}
		} catch (err) {
			console.error(err)
		}
	}
}

function validateTarget(target) {
	if (!["firefox", "chromium", "firefox-test"].includes(target)) {
		throw new Error("not support build target: " + target)
	}
}

const defaultEntryPoints = ["background", "content_scripts", "options", "components"]

program.command('build')
	.description('Build extension')
	.option('-t, --target <target>', "The browser target to build", "firefox")
	.option('--profile <profile>', "The profile of compilation", "debug")
	.option('--artifacts <dir>', "The directory to store artifacts", "artifacts")
	.option('--lint', "Use web-ext the validate extension source", false)
	.option('--watch', "Watch source file change", false)
	.option('--websocket-server <addr>', "The address of websocket server for capture event of unit test", "ws://localhost:8000")
	.action(async (args, options) => {
		validateTarget(args.target)
		const dist = pathLib.join(BUILD_DIR, args.target, "dist")
		copyAssets(dist)
		buildManifest(dist, BUILD_VERSION, args.target)

		const entryPoints = [...defaultEntryPoints]
		if (isTestTarget(args.target)) {
			entryPoints.push("test")
			copyTestAssets()
		}
		console.debug("args:", args)
		console.debug("entryPoints: ", entryPoints)

		const config = buildRollupConfig({
			profile: args.profile,
			src: BUILD_SRC,
			dist: dist,
			entryPoints: entryPoints,
			watch: args.watch,
			target: args.target,
			websocketServer: args.websocketServer,
		})
		const artifacts = pathLib.join(
			BUILD_DIR,
			args.artifacts
		)
		fs.ensureDirSync(artifacts)

		if (args.watch) {
			const watcher = rollup.watch(config)
			watcher.on('event', (event) => {
				if (event.code === "BUNDLE_END") {
					console.log("code: ", event.code, "input:", event.input, "output:", event.output)
				}
				const { result } = event;
				if (result) {
					result.close();
				}
			});
		} else {
			await buildWithRollup(config)

			if (args.lint) {
				webExt.cmd.lint({ sourceDir: dist })
			}
			await zipDir(
				dist,
				{
					saveTo: pathLib.join(
						artifacts,
						`glitterdrag-pro-${BUILD_VERSION}-${args.target}.zip`
					)
				}
			);
		}

	});

program.command('test')
	.description('Start Firefox browser and run unit tests')
	.option('-t, --target <target>', "The target to build", "firefox-test")
	.option('-s, --websocket-server', "The address of websocket server for capture event of unit test", "ws://localhost:8000")
	.action(async (args) => {
		validateTarget(args.target)
		const dist = buildDist(args.target)

		async function runBrowser(signal) {

			return new Promise((resolve, reject) => {

				const proc = spawn("pnpm", ["exec", "web-ext", "run", "-f", FIREFOX, "-s", dist], {
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
			const url = new URL(args.websocketServer)
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

		const controller = new AbortController()
		const resultPromise = waitTestComplete()
		const browser = runBrowser(controller.signal)

		const result = await resultPromise
		await browser
		console.log("tests: %d, passes: %d, failures: %d", result.tests, result.passes, result.failures)
		if (result.failure > 0) {
			process.exit(1)
		} else {
			process.exit(0)
		}
	});

program.command('watch')
	.description('detect dist directory change and reload extension')
	.option('-t, --target', "The target to build", "firefox")
	.action((args) => {

		validateTarget(args.target)
		
		const dist = buildDist(args.target)

		return new Promise((resolve, reject) => {
			const proc = spawn("pnpm", ["exec", "web-ext", "run", "-f", FIREFOX, "-s", dist], {
				stdio: ["ignore", process.stdout, process.stderr],
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
	});

program.command('clean')
	.description('clean build directory')
	.action(() => {
		fs.removeSync(BUILD_DIR)
	});

await program.parseAsync();