export VERSION
# providers monorepo — independent Wippy provider modules co-located in one repo.

MODULES := airtable box dropbox linear notion asr atlassian bitbucket code_execution discord fireflies github gitlab google hubspot kb10 search-index llm-ocr mcp-client memory phantombuster simplefin slack sso-github sso-google sso-microsoft sso-oidc telegram webscout webscout-brave webscout-tavily
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: list build lint $(MODULES)

list:
	@echo $(MODULES)

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

$(MODULES):
	$(MAKE) -C $@
