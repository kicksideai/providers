export VERSION
# providers monorepo — independent Wippy provider modules co-located in one repo.

MODULES := airtable box dropbox linear notion asr atlassian bitbucket code_execution discord fireflies github gitlab google hubspot kb10 search-index llm-ocr mail-resend mcp-client memory phantombuster provider-text simplefin slack sso-github sso-google sso-microsoft sso-oidc telegram webscout webscout-brave webscout-tavily
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: list ui-kit build lint verify-connection-secrets $(MODULES)

list:
	@echo $(MODULES)

# Prepare each module's declared UI Kit artifact before legal inventory/builds.
ui-kit:
	@for module in $(MODULES); do \
		if [ -f "$$module/build-inputs/wippy.lock" ]; then \
			$(MAKE) -C $$module ui-kit || exit $$?; \
		fi; \
	done

build:
	@for module in $(MODULES); do \
		if grep -q '^build:' "$$module/Makefile"; then \
			$(MAKE) -C $$module build || exit $$?; \
		fi; \
	done

lint:
	@for module in $(MODULES); do \
		$(MAKE) -C $$module $@ || exit $$?; \
	done

verify-connection-secrets:
	@set -eu; \
	checker_dir=$$(mktemp -d); \
	trap 'rm -rf "$$checker_dir"' EXIT; \
	checker="$$checker_dir/check-connection-secrets.mjs"; \
	curl --fail --silent --show-error --retry 3 \
		https://raw.githubusercontent.com/kicksideai/module/15817c3f94e210fee6f8307e0e5fa83ee77183c3/scripts/check-connection-secrets.mjs \
		--output "$$checker"; \
	printf '%s  %s\n' cc96d5d47e3cf97b9e28a9b3fd5cdddf62abcdbcbd6b81011a465c8ce0a8350b "$$checker" | sha256sum --check; \
	for module in $(MODULES); do \
		node "$$checker" "$$module/src"; \
	done; \
	printf '%s\n' 'Provider connection secret declarations verified'

$(MODULES):
	$(MAKE) -C $@
