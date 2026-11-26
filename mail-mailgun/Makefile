# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
WIPPY ?= wippy
SHELL := bash
.SHELLFLAGS := -o pipefail -ec
ENCRYPTION_KEY ?= 0000000000000000000000000000000000000000000000000000000000000000
export ENCRYPTION_KEY

.PHONY: lockrefresh lint check-dependencies check-docs test test-pg test-defaults verify publish
lockrefresh:
	cd test && $(WIPPY) update

lint:
	cd test && $(WIPPY) lint --ns 'kickside.mail.mailgun' --ns 'kickside.mail.mailgun.*' $(WIPPY_ARGS)

test-pg: WIPPY_PROFILE = --profile postgres
test-defaults: WIPPY_PROFILE = --profile defaults

test test-pg test-defaults:
	WIPPY="$(WIPPY)" WIPPY_TEST_LOG=.wippy/$@.log ./test/run.sh $(WIPPY_PROFILE) $(WIPPY_ARGS)

check-dependencies:
	bash ../scripts/verify_provider_dependencies.sh

check-docs:
	python3 -B ../test-support/check-mail-driver-docs.py .

verify:
	$(MAKE) lint check-dependencies check-docs test test-defaults

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
