export VERSION
# kickside/code-execution — sandboxed code execution for agents (tools-only SDK/eval
# backend). `make test` runs the standalone suite; `make publish` publishes the module.
MODULE := code-execution

.PHONY: build publish lint
build:
	cd ui && npm ci && npm run build
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.$(subst -,_,$(MODULE))' --ns 'kickside.$(subst -,_,$(MODULE)).*'
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
