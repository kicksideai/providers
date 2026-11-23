# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
WIPPY ?= wippy
SHELL := bash
.SHELLFLAGS := -o pipefail -ec
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: lockrefresh lint check-dependencies test verify publish
lockrefresh:
	cd test && $(WIPPY) update

lint:
	cd test && $(WIPPY) lint --ns 'kickside.mail.sendgrid' --ns 'kickside.mail.sendgrid.*' $(WIPPY_ARGS)

test:
	@mkdir -p test/.wippy
	cd test && WIPPY_TEST_REQUIRE_CASES=1 $(WIPPY) test $(WIPPY_ARGS) 2>&1 | tee .wippy/test.log
	LC_ALL=C sed -E 's/\x1B\[[0-?]*[ -/]*[@-~]//g' test/.wippy/test.log | tr '\r' '\n' | \
		awk '/No tests found|No tests match/ { empty=1 } /^[[:space:]]*FAILED([[:space:]]|$$)/ { failed=1 } /^[[:space:]]*PASSED([[:space:]]|$$)/ { passed=1 } END { exit(empty || failed || !passed) }'

check-dependencies:
	bash ../scripts/verify_provider_dependencies.sh

verify: lockrefresh
	$(MAKE) lint check-dependencies test

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
