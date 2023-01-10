import browser from 'webextension-polyfill'
import buildInfo from '../build_info';

const {
	EVENT_RUN_BEGIN,
	EVENT_RUN_END,
	EVENT_TEST_PASS,
	EVENT_TEST_FAIL,
} = Mocha.Runner.constants

// https://mochajs.org/api/reporters_json-stream.js.html
class StreamReporter extends Mocha.reporters.HTML {

	writeEvent: (any) => void

	constructor(runner: Mocha.Runner, options?: Mocha.MochaOptions) {
		super(runner, options)

		const total = runner.total;

		if (options?.reporterOptions?.writeEvent) {
			this.writeEvent = options.reporterOptions.writeEvent
		} else {
			this.writeEvent = () => { }
		}

		runner.once(EVENT_RUN_BEGIN, () => {
			this.writeEvent(['start', { total }]);
		});

		runner.on(EVENT_TEST_PASS, (test) => {
			this.writeEvent(['pass', this.clean(test)]);
		});

		runner.on(EVENT_TEST_FAIL, (test, err) => {
			const cleanTest = this.clean(test);
			cleanTest.err = err.message;
			cleanTest.stack = err.stack || null;
			this.writeEvent(['fail', cleanTest]);
		});

		runner.once(EVENT_RUN_END, () => {
			this.writeEvent(['end', this.stats]);
		});
	}

	clean(test) {
		return {
			title: test.title,
			fullTitle: test.fullTitle(),
			file: test.file,
			duration: test.duration,
			currentRetry: test.currentRetry(),
			speed: test.speed,
			err: null,
			stack: null
		};
	}
}


async function closeInstance() {
	const ids = (await browser.windows.getAll()).map(w => w.id)
	for (const id of ids) {
		await browser.windows.remove(id)
	}
}

export let ws = null
if (buildInfo.target.endsWith("test") && buildInfo.websocketServer) {
	ws = new WebSocket(buildInfo.websocketServer)
	ws.addEventListener("open", (event) => {
		console.log("open", event)
	})

	ws.addEventListener("message", (event) => {
		console.log("message", event)
	})

	ws.addEventListener("close", () => {
		// closeInstance()
	})

	ws.addEventListener("error", (event) => {
		console.error(event)
		// closeInstance()
	})
}

mocha.setup({
	ui: "bdd",
});

mocha.reporter(StreamReporter, {
	writeEvent: function (event) {
		if (ws) {
			ws.send(JSON.stringify(event))
			const [type, _payload] = event
			if (type === "end") {
				closeInstance()
			}
		}
	}
})

mocha.checkLeaks();


