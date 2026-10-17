export VERSION
MODULE := mcp-client

.PHONY: build lint test test-prepare publish
build:
	cd ui && npm install && npm run build
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'app.*' --ns kickside.mcp_client --ns 'kickside.mcp_client.*'
test-prepare:
	cp src/worker.lua test/worker_source.lua
.PHONY: test-backend typecheck
test-backend: test-prepare
	cd test && wippy test $(WIPPY_TEST_ARGS)
typecheck:
	cd ui && npm ci && npm run type-check
test:
	$(MAKE) test-backend
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh: test-prepare
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
