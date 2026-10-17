export VERSION
# kickside/code-execution — sandboxed code execution for agents (tools-only SDK/eval
# backend). `make test` runs the standalone suite; Release Please publishes releases.
MODULE := code-execution

.PHONY: build publish lint test
build:
	cd ui && npm ci && npm run build
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
