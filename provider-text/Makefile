# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
.PHONY: lint publish

lint:
	@version=$$(jq -ers '.[0]["provider-text"] // .[1].packages["provider-text"]["initial-version"]' ../.release-please-manifest.json ../release-please-config.json) && \
		wippy publish --dry-run --create --module-visibility public --module-type library --version "$$version"

publish:
	@echo "Releases use GitHub Release Please (.github/workflows/release.yml)." >&2
	@exit 1
