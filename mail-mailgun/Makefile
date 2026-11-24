# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
WIPPY ?= wippy
SHELL := bash
.SHELLFLAGS := -o pipefail -ec
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: lockrefresh build ui-test typecheck lint check-dependencies test verify publish
lockrefresh: ui-kit-refresh
	cd test && $(WIPPY) update

build: ui-install
	cd ui && npm run build

ui-test: ui-install
	npm --prefix ui test

typecheck: ui-install
	npm --prefix ui run type-check

lint:
	cd test && $(WIPPY) lint --ns 'kickside.mail.mailgun' --ns 'kickside.mail.mailgun.*' $(WIPPY_ARGS)

test:
	@mkdir -p test/.wippy
	cd test && WIPPY_TEST_REQUIRE_CASES=1 $(WIPPY) test $(WIPPY_ARGS) 2>&1 | tee .wippy/test.log
	LC_ALL=C sed -E 's/\x1B\[[0-?]*[ -/]*[@-~]//g' test/.wippy/test.log | tr '\r' '\n' | \
		awk '/No tests found|No tests match/ { empty=1 } /^[[:space:]]*FAILED([[:space:]]|$$)/ { failed=1 } /^[[:space:]]*PASSED([[:space:]]|$$)/ { passed=1 } END { exit(empty || failed || !passed) }'

check-dependencies:
	bash ../scripts/verify_provider_dependencies.sh

verify: lockrefresh
	$(MAKE) build typecheck ui-test lint check-dependencies test

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1

WIPPY_BIN ?= $(WIPPY)
include ../ui-kit.mk
