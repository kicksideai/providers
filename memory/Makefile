export VERSION
# kickside/memory — agent memory policies and knowledge-backed capabilities.
MODULE := memory

.PHONY: build dev publish lint
build:
	cd ui && npm install && npm run build
dev:
	cd ui && npm run dev
lint:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'app.*' --ns 'kickside.memory' --ns 'kickside.memory.*' --level error
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-backend test-pg
test-backend:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS)
test-pg:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS) --profile postgres

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
