export VERSION
MODULE := box
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY
.PHONY: build lint typecheck test test-pg lockrefresh publish
setup: lockrefresh
verify: lint test
build:
	@echo "Native Wippy HTTP adapter; no host binaries or frontend build required."
lint typecheck:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(MODULE)' --ns 'kickside.$(MODULE).*'
test:
	@output="$$( cd test && wippy test $(WIPPY_TEST_ARGS) 2>&1 )"; status=$$?; \
	printf '%s\n' "$$output"; \
	if [ $$status -ne 0 ] || printf '%s\n' "$$output" | grep -qE 'FAILED|No tests found' || \
		! printf '%s\n' "$$output" | grep -q 'PASSED'; then exit 1; fi
test-pg:
	cd test && wippy test --profile postgres $(WIPPY_TEST_ARGS)
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
publish:
	@echo "Releases use GitHub Release Please." >&2
	@exit 1
