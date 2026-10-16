export VERSION
# kickside/atlassian — `make publish` packs and publishes the module (public).
MODULE := atlassian
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: build dev publish lint test
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
