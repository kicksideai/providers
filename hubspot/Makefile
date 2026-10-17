export VERSION
# kickside/hubspot - `make publish` packs and publishes the module (public).
MODULE := hubspot
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: build lint test publish
build:
	cd ui && npm ci && npm run build
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(MODULE)' --ns 'kickside.$(MODULE).*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
