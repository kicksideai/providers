export VERSION
# kickside/kb10 — `make publish` packs and publishes the module (public).
MODULE := kb10
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY
PYTHON ?= python3

.PHONY: build dev publish lint test
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*' --ns app --ns 'app.*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: typecheck-ui
typecheck-ui:
	cd ui && ./node_modules/.bin/vue-tsc --noEmit

.PHONY: test-ui
test-ui:
	cd ui && npm run test -- $(UI_TEST_ARGS)

.PHONY:
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
