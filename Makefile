
export SRC = ./src
export DIST = ./dist
export BROWSER ?= $(shell which firefox-developer-edition)
export NODE_MODULES = ./node_modules
export WEB_EXT_ARTIFACTS = ./web-ext-artifacts
export BUILD_PROFILE ?= debug
export BUILD_COMMIT_ID = $(shell git rev-parse --short HEAD)
export BUILD_DATE = $(shell date --rfc-3339=seconds)
export BUILD_NODE_VERSION = $(shell node --version)
export BUILD_ROLLUP_VERSION = $(shell npx rollup --version)
export BUILD_OS = $(shell node -e "console.log(require('os').platform())")

$(shell [ ! -d $(DIST) ] && mkdir $(DIST))

entryPoints = background content_scripts options components
assets = ./content_scripts/content_script.css \
	 	./icon/drag.png \
		./options/options.html \
		./_locales

.PHONY: extension
extension: extension-firefox extension-chromium

.PHONY: extension-firefox
extension-firefox: clean manifest-firefox compile lint package-firefox

.PHONY: extension-chromium
extension-chromium: clean manifest-chromium compile package-chromium

.PHONY: manifest-firefox
manifest-firefox:
	@cp $(SRC)/manifest_firefox.json $(DIST)/manifest.json

.PHONY: manifest-chromium
manifest-chromium:
	@cp $(SRC)/manifest_chromium.json $(DIST)/manifest.json

.PHONY: package-firefox
package-firefox:
	@pnpm exec web-ext build -s $(DIST) -a $(WEB_EXT_ARTIFACTS)/firefox  --overwrite-dest

.PHONY: packagec-chromium
package-chromium:
	@pnpm exec web-ext build -s $(DIST) -a $(WEB_EXT_ARTIFACTS)/chromium --overwrite-dest

.PHONY: clean
clean:
	@rm -rf $(DIST)
	@mkdir $(DIST)

.PHONY: compile
compile:
	@entryPoints="$(entryPoints)" src=$(SRC) dist=$(DIST) npx rollup -c;
	@echo $(assets) | tr " " "\n" | rsync --files-from=- -r $(SRC) $(DIST)
	@node scripts/copy_simplecss.mjs

.PHONY: lint
lint:
	@pnpm exec web-ext lint -s $(DIST)

.PHONY: run-browser
run-browser:
	web-ext run -v \
		-s $(DIST) \
		-f "$(BROWSER)"

start-server: port ?= 8000
start-server:
	@python3 -m http.server $(port)


.PHONY: compile-with-test
compile-with-test: export BUILD_PROFILE=test
compile-with-test: export BUILD_MOCHA_FILTER=$(filter)
compile-with-test: entryPoints += test
compile-with-test: compile
	@cp $(NODE_MODULES)/mocha/mocha.js \
	   $(NODE_MODULES)/mocha/mocha.css \
	   $(SRC)/test/mocha.html \
	   $(DIST)/test/

.PHONY: test-firefox
test-firefox: manifest-firefox compile-with-test package

.PHONY: test-chromium
test-chromium: manifest-chromium compile-with-test package