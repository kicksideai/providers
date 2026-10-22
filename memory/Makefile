export VERSION
# kickside/memory — memory knowledge-base engine, agent trait and memory provider.
MODULE := memory

.PHONY: build dev ui-kit lint typecheck test test-pg lockrefresh verify publish
# @kickside/ui-kit is a build input: resolved in build-inputs/, materialized into
# the UI workspace before npm installs it.
ui-kit:
	cd build-inputs && wippy install
	wippy artifacts materialize $$(ls build-inputs/.wippy/vendor/kickside/ui-kit-*.wapp | grep -v sha256 | sort | tail -1) kickside.ui_kit:package_fs --root ui/.wippy
build: ui-kit
	cd ui && npm ci && npm run build
dev:
	cd ui && npm run dev
typecheck: ui-kit
	cd ui && npm ci && npm run type-check
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'app.*' --ns 'kickside.memory' --ns 'kickside.memory.*' --level error
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
test-pg:
	cd test && wippy test --profile postgres $(WIPPY_TEST_ARGS)
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
	cd build-inputs && wippy update --src-dir src
verify: lockrefresh lint typecheck build test
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
