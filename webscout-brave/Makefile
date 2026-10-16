export VERSION
# kickside/webscout-brave - `make publish` packs and publishes the module (public).
MODULE := webscout-brave
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.webscout.providers.brave' --ns 'kickside.webscout.providers.brave.*'
test:
	@cd test && output="$$(wippy test $(WIPPY_TEST_ARGS) 2>&1)"; status=$$?; \
		printf '%s\n' "$$output"; \
		[ $$status -eq 0 ] && ! printf '%s\n' "$$output" | grep -q "No tests found"
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
