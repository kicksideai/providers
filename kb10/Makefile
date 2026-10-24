export VERSION
# kickside/kb10 — `make publish` packs and publishes the module (public).
MODULE := kb10
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY
PYTHON ?= python3
WIPPY_BIN ?= wippy
UI_KIT_WAPP ?=

.PHONY: build dev publish lint test
build: ui-kit
	cd ui && npm install && npm run build
dev: ui-kit
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*' --ns app --ns 'app.*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: typecheck-ui
typecheck-ui: ui-kit
	cd ui && ./node_modules/.bin/vue-tsc --noEmit

.PHONY: test-ui
test-ui: ui-kit
	cd ui && npm run test -- $(UI_TEST_ARGS)

.PHONY:
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)

.PHONY: ui-kit
ui-kit:
	@set -e; \
	wapp="$(UI_KIT_WAPP)"; \
	if [ -z "$$wapp" ]; then \
	  ( cd build-inputs && $(WIPPY_BIN) update --src-dir src ); \
	  wapp=$$(ls build-inputs/.wippy/vendor/kickside/ui-kit-*.wapp 2>/dev/null | grep -v sha256 | sort | tail -1); \
	fi; \
	test -n "$$wapp" || { echo "no kickside/ui-kit .wapp; is the module published?"; exit 1; }; \
	$(WIPPY_BIN) artifacts materialize "$$wapp" kickside.ui_kit:package_fs --root ui/.wippy; \
	cd ui && npm install --no-audit --no-fund
