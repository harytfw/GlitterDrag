export BUILD_VERSION ?= 2.1.4
export BUILD_DIR ?= $(shell realpath ./build)
export BUILD_SRC ?= $(shell realpath ./src)

cli = node ./scripts/cli.mjs
.PHONY: build
build: TARGET ?= firefox 
build:
	$(cli) build --target $(TARGET)

.PHONY: build-watch
build-watch: TARGET ?= firefox 
build-watch:
	$(cli) build --target $(TARGET) --watch

.PHONY: ext-firefox
ext-firefox: BUILD_PROFILE ?= debug
ext-firefox: 
	$(cli) build --target firefox --lint --profile $(BUILD_PROFILE)

.PHONY: ext-chromium
ext-chromium: BUILD_PROFILE ?= debug
ext-chromium:
	$(cli) build --target chromium --profile $(BUILD_PROFILE)

.PHONY: test
test: TARGET ?= firefox-test 
test:
	$(cli) test --target $(TARGET)

.PHONY: watch
watch: TARGET ?= firefox 
watch:
	$(cli) watch

.PHONY: clean
clean:
	$(cli) clean