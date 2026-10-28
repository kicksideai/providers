# @kickside/ui-kit is a module build input. build-inputs/wippy.lock pins it;
# `ui-kit` installs the locked artifact and materializes it into ui/.wippy, and
# `ui-kit-refresh` moves the lock and ui/package-lock.json to the newest release.
# UI_KIT_WAPP materializes a local .wapp instead of the locked one.
WIPPY_BIN ?= wippy
UI_KIT_WAPP ?=
UI_KIT_LOCK := build-inputs/wippy.lock

.PHONY: ui-kit ui-install ui-kit-refresh
ui-kit:
	@set -e; \
	wapp="$(UI_KIT_WAPP)"; \
	if [ -z "$$wapp" ]; then \
	  ( cd build-inputs && $(WIPPY_BIN) install ); \
	  version=$$(awk '/name: kickside\/ui-kit$$/ { found = 1 } found && /version:/ { print $$2; exit }' $(UI_KIT_LOCK)); \
	  test -n "$$version" || { echo "$(UI_KIT_LOCK) has no kickside/ui-kit entry" >&2; exit 1; }; \
	  wapp="build-inputs/.wippy/vendor/kickside/ui-kit-$$version.wapp"; \
	fi; \
	test -f "$$wapp" || { echo "kickside/ui-kit artifact missing: $$wapp" >&2; exit 1; }; \
	$(WIPPY_BIN) artifacts materialize "$$wapp" kickside.ui_kit:package_fs --root ui/.wippy
ui-install: ui-kit
	cd ui && npm ci --no-audit --no-fund
ui-kit-refresh:
	cd build-inputs && $(WIPPY_BIN) update --src-dir src
	$(MAKE) ui-kit
	cd ui && npm install --package-lock-only --no-audit --no-fund
