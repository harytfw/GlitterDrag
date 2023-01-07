export BUILD_VERSION ?= 2.1.4
export BUILD_DIR ?= $(shell realpath ./build)
export SRC ?= $(shell realpath ./src)
export BUILD_PROFILE ?= debug
export BUILD_WEBSOCKET_SERVER = 
export ENTRY_POINTS = background content_scripts options components
export TARGET_BROWSER = firefox
export TARGET_DIST = $(BUILD_DIR)/firefox/dist

.PHONY: ext-firefox
ext-firefox: TARGET_BROWSER = firefox
ext-firefox: TARGET_DIST = $(BUILD_DIR)/firefox/dist
ext-firefox: setup-dist assets compile lint
	cd $(TARGET_DIST) && zip -r $(BUILD_DIR)/artifacts/glitterdrag-pro-$(BUILD_VERSION)-firefox.zip .

.PHONY: ext-chromium
ext-test: TARGET_BROWSER = chromium
ext-chromium: TARGET_DIST = $(BUILD_DIR)/chromium/dist
ext-chromium: setup-dist assets compile
	cd $(TARGET_DIST) && zip -r $(BUILD_DIR)/artifacts/glitterdrag-pro-$(BUILD_VERSION)-chromium.zip .

.PHONY: test
test: TARGET_BROWSER = firefox-test
test: ENTRY_POINTS += test
test: TARGET_DIST = $(BUILD_DIR)/test/dist
test: BUILD_WEBSOCKET_SERVER = ws://localhost:8000
test: setup-dist assets mocha-assets compile
	@node scripts/test_bootstrap.js

.PHONY: open-mocha
open-mocha: TARGET_DIST = $(BUILD_DIR)/firefox/dist
open-mocha: ENTRY_POINTS += test
open-mocha: setup-dist assets mocha-assets compile
	web-ext run -v \
			-s $(TARGET_DIST) \
			-f "$(shell which firefox-developer-edition)"

.PHONY: setup-dist
setup-dist:
	$(shell [ ! -d $(TARGET_DIST) ] && mkdir -p $(TARGET_DIST)/)

.PHONY: lint
lint:
	@pnpm exec web-ext lint -s $(TARGET_DIST)

.PHONY: compile
compile:
	@pnpm exec rollup -c "./scripts/rollup.config.js"

.PHONY: manifest
manifest:
	@node scripts/gen_manifest.js > $(TARGET_DIST)/manifest.json

.PHONY: assets
assets: manifest
	
	@mkdir -p $(TARGET_DIST)/options && \
		cp -f $(SRC)/options/options.html $(TARGET_DIST)/options/options.html
	
	@mkdir -p $(TARGET_DIST)/res && \
		cp -r -f node_modules/simpledotcss/simple.min.css $(TARGET_DIST)/res/simple.min.css

	@cp -r -f $(SRC)/icon/ $(SRC)/_locales/ $(TARGET_DIST)/

.PHONY: mocha-assets
mocha-assets:
	@mkdir -p $(TARGET_DIST)/test && \
		cp node_modules/mocha/mocha.js \
			node_modules/mocha/mocha.css \
			node_modules/chai/chai.js \
			$(SRC)/test/mocha.html \
			$(TARGET_DIST)/test

.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)