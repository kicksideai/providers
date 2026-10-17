export VERSION
# kickside/webscout - `make publish` packs and publishes the module (public).
MODULE := webscout
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(MODULE)' --ns 'kickside.$(MODULE).*'
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
build:
	@test -f static/settings-card.js || { echo "static/settings-card.js is missing"; exit 1; }
	@command -v node >/dev/null 2>&1 \
		&& node --check static/settings-card.js \
		|| echo "node not found; skipped the syntax check"
	@echo "$(MODULE): the card ships as authored; nothing to bundle"
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY:
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
