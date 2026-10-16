export VERSION
# kickside/sso-microsoft - `make publish` packs and publishes the module (public).
MODULE := sso-microsoft
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: publish lint test
lint:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy lint $(WIPPY_LINT_ARGS) --ns app --ns 'kickside.sso.providers.microsoft' --ns 'kickside.sso.providers.microsoft.*' --level error
	wippy publish --dry-run $(WIPPY_PUBLISH_ARGS) --version 0.0.0
test:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS)
publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

.PHONY: test-pg
test-pg:
	cd test && wippy install $(WIPPY_INSTALL_ARGS) && wippy test $(WIPPY_TEST_ARGS) --profile postgres

.PHONY: lockrefresh
lockrefresh:
	cd test && wippy update $(WIPPY_UPDATE_ARGS)
