export VERSION
MODULE := search-index
.PHONY: lint test test-pg lockrefresh publish
lint:
	cd test && wippy lint $(WIPPY_LINT_ARGS) --ns 'kickside.search_index' --ns app
test:
	cd test && wippy test $(WIPPY_TEST_ARGS)
test-pg:
	cd test && wippy test --profile postgres $(WIPPY_TEST_ARGS)
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
publish:
	@echo "Releases use GitHub Release Please." >&2
	@exit 1
