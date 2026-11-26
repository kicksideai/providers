export VERSION
# kickside/google — `make publish` packs and publishes the module (public).
MODULE := google
.DEFAULT_GOAL := lint
WIPPY_BIN ?= wippy
WIPPY_TEST_PORT ?= 19146
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test build prepare-test
prepare-test:
	mkdir -p test/.local/tmp/tmp-fixtures
	cp src/client/transport.lua test/.local/tmp/tmp-fixtures/capacity_client.lua
	cp ../lua-fixtures/tests/capacity_http_fixture.lua test/.local/tmp/tmp-fixtures/capacity_http_fixture.lua
	cp ../lua-fixtures/tests/capacity_transport_guard.lua test/.local/tmp/tmp-fixtures/capacity_transport_guard.lua
lint: prepare-test
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
test: prepare-test
	cd test && "$(WIPPY_BIN)" install $(WIPPY_INSTALL_ARGS)
	# Run omitted, boolean true and boolean false through the same harness.
	node test/run-visibility-tests.mjs "$(WIPPY_BIN)" --set "vars.http_port=$(WIPPY_TEST_PORT)" $(WIPPY_TEST_ARGS)
build:
	cd ui && npm ci && npm run build
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
# The harness reads fixture copies that prepare-test makes, so the update loads them too.
lockrefresh: prepare-test
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
