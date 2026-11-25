# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
WIPPY ?= wippy
SHELL := bash
.SHELLFLAGS := -o pipefail -ec
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: lockrefresh lint check-dependencies test test-pg verify publish
lockrefresh:
	cd test && $(WIPPY) update

lint:
	cd test && $(WIPPY) lint --ns 'kickside.mail.resend' --ns 'kickside.mail.resend.*' $(WIPPY_ARGS)

test-pg: WIPPY_PROFILE = --profile postgres

test test-pg:
	WIPPY="$(WIPPY)" WIPPY_TEST_LOG=.wippy/$@.log ./test/run.sh $(WIPPY_PROFILE) $(WIPPY_ARGS)

check-dependencies:
	bash ../scripts/verify_provider_dependencies.sh

verify: lockrefresh
	$(MAKE) lint check-dependencies test

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
