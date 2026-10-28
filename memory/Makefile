export VERSION
# kickside/memory — memory knowledge-base engine, agent trait and memory provider.
MODULE := memory
WIPPY_BIN ?= wippy
UI_KIT_WAPP ?=

.PHONY: build dev ui-kit ui-install lint typecheck test-ui test test-pg lockrefresh verify publish
# @kickside/ui-kit is a build input: resolved in build-inputs/, materialized into
# the UI workspace before npm installs it.
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
ui-install: ui-kit
	cd ui && npm ci
build: ui-install
	cd ui && npm run build
dev:
	cd ui && npm run dev
typecheck: ui-install
	cd ui && npm run type-check
test-ui: ui-install
	cd ui && npm test
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'app.*' --ns 'kickside.memory' --ns 'kickside.memory.*' --level error
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
test-pg:
	cd test && wippy test --profile postgres $(WIPPY_TEST_ARGS)
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
	cd build-inputs && wippy update --src-dir src
verify: lockrefresh lint typecheck build test
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend
test-backend: test
