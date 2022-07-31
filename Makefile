
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
export BUILD_TARGET_BROWSER ?= firefox

$(shell [ ! -d $(DIST) ] && mkdir $(DIST))

entryPoints = background content_scripts options components
assets = ./content_scripts/content_script.css \
	 	./icon/drag.png \
		./options/options.html

.PHONY: extension
extension: compile lint
	@web-ext build -s $(DIST) --overwrite-dest

.PHONY: clean
clean:
	@rm -rf $(DIST)

.PHONY: compile
compile: manifest.json
	@entryPoints="$(entryPoints)" src=$(SRC) dist=$(DIST) npx rollup -c;
	@echo $(assets) | tr " " "\n" | rsync --files-from=- -r $(SRC) $(DIST)

.PHONY: manifest.json
manifest.json:
	@cp $(SRC)/manifest_$(BUILD_TARGET_BROWSER).json $(DIST)/manifest.json

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


.PHONY: compile-test
compile-test: entryPoints += test
compile-test: compile
	@cp $(NODE_MODULES)/mocha/mocha.js \
	   $(NODE_MODULES)/mocha/mocha.css \
	   $(SRC)/test/mocha.html \
	   $(DIST)/test/

.PHONY: test
test: export BUILD_PROFILE=test
test: export BUILD_MOCHA_FILTER=$(filter)
test: compile-test lint
