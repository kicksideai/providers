export VERSION
# kickside/llm-ocr - `make publish` packs and publishes the module (public).
MODULE := llm-ocr
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test
lint:
	mkdir -p .build
	TMPDIR=$(CURDIR)/.build wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.llm_ocr' --ns 'kickside.llm_ocr.*'
test:
	$(MAKE) lint
	cd test && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
