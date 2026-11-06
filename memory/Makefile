export VERSION
# kickside/memory — memory knowledge-base engine and agent trait.
MODULE := memory
WIPPY_BIN ?= wippy

.PHONY: build dev lint typecheck test-ui test test-pg lockrefresh verify publish
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
lockrefresh: ui-kit-refresh
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
verify: lockrefresh lint typecheck build test
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend
test-backend: test

include ../ui-kit.mk
