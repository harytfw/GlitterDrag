
SRC = ./src
DIST = ./dist
BROWSER ?= $(shell which firefox-developer-edition)
NODE_MODULES = ./node_modules

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
		./options/options.html

.PHONY: extension-firefox
extension-firefox: manifest-firefox compile lint package

.PHONY: extension-chromium
extension-chromium: manifest-chromium compile package

.PHONY: manifest-firefox
manifest-firefox:
	@cp $(SRC)/manifest_firefox.json $(DIST)/manifest.json

.PHONY: manifest-chromium
manifest-chromium:
	@cp $(SRC)/manifest_chromium.json $(DIST)/manifest.json

.PHONY: package
package:
	@web-ext build -s $(DIST) --overwrite-dest

.PHONY: clean
clean:
	@rm -rf $(DIST)

.PHONY: compile
compile:
	@entryPoints="$(entryPoints)" src=$(SRC) dist=$(DIST) npx rollup -c;
	@echo $(assets) | tr " " "\n" | rsync --files-from=- -r $(SRC) $(DIST)

.PHONY: lint
lint:
	@web-ext lint -s $(DIST)

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