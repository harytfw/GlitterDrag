export BUILD_VERSION ?= 2.1.2
export SRC ?= $(shell realpath ./src)
export BUILD_DIR ?= $(shell realpath ./build)
export BROWSER ?= $(shell which firefox-developer-edition)
export NODE_MODULES ?= $(shell realpath ./node_modules)
export BUILD_PROFILE ?= debug
export BUILD_COMMIT_ID ?= $(shell git rev-parse --short HEAD)
export BUILD_DATE ?= $(shell date --rfc-3339=seconds)
export BUILD_NODE_VERSION ?= $(shell node --version)
export BUILD_ROLLUP_VERSION ?= $(shell npx rollup --version)
export BUILD_OS ?= $(shell node -e "console.log(require('os').platform())")

export TARGET_BROWSER = firefox
export TARGET_DIST = $(BUILD_DIR)/$(TARGET_BROWSER)/dist

export ENTRY_POINTS = background content_scripts options components

.PHONY: ext-firefox
ext-firefox: export TARGET_BROWSER = firefox
ext-firefox: setup-dist assets compile lint package

.PHONY: ext-chromium
ext-chromium: export TARGET_BROWSER = chromium
ext-chromium: setup-dist assets compile package

.PHONY: ext-test
ext-test: TARGET_BROWSER = firefox
ext-test: ENTRY_POINTS += test
ext-test: export BUILD_PROFILE = debug
ext-test: setup-dist assets mocha-assets compile

.PHONY: setup-dist
setup-dist: TARGET_DIST = $(BUILD_DIR)/$(TARGET_BROWSER)/dist
setup-dist:
	$(shell [ ! -d $(TARGET_DIST) ] && mkdir -p $(TARGET_DIST)/)

.PHONY: lint
lint:
	@pnpm exec web-ext lint -s $(TARGET_DIST)

.PHONY: compile
compile:
	@npx rollup -c;

.PHONY: manifest
manifest:
	@node scripts/gen_manifest.js > $(TARGET_DIST)/manifest.json

.PHONY: assets
assets: manifest
	
	@mkdir -p $(TARGET_DIST)/content_scripts && \
		cp -f -r $(SRC)/content_scripts/content_script.css $(TARGET_DIST)/content_scripts/
	
	@mkdir -p $(TARGET_DIST)/options && \
		cp -f $(SRC)/options/options.html $(TARGET_DIST)/options/options.html
	
	@mkdir -p $(TARGET_DIST)/res && \
		cp -r -f $(NODE_MODULES)/simpledotcss/simple.min.css $(TARGET_DIST)/res/simple.min.css

	@cp -r -f $(SRC)/icon/ $(SRC)/_locales/ $(TARGET_DIST)/

.PHONY: mocha-assets
mocha-assets:
	@mkdir -p $(TARGET_DIST)/test && \
		cp $(NODE_MODULES)/mocha/mocha.js \
			$(NODE_MODULES)/mocha/mocha.css \
			$(NODE_MODULES)/chai/chai.js \
			$(SRC)/test/mocha.html \
			$(TARGET_DIST)/test

.PHONY: package
package:
	@mkdir -p $(BUILD_DIR)/artifacts
	@cd $(TARGET_DIST) && zip -r $(BUILD_DIR)/artifacts/gliiterdrag-pro-$(BUILD_VERSION)-$(TARGET_BROWSER).zip .

.PHONY: clean
clean:
	@rm -rf $(BUILD_DIR)

.PHONY: run-browser
run-browser:
	web-ext run -v \
		-s $(TARGET_DIST) \
		-f "$(BROWSER)"

start-server: port ?= 8000
start-server:
	@python3 -m http.server $(port)
