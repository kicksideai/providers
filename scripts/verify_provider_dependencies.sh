#!/usr/bin/env bash

set -euo pipefail

root="$(cd "$(dirname "$0")/.." && pwd)"
failed=0

dependencies() {
  awk '
    function emit() {
      if (kind == "ns.dependency") print component "\t" version
    }
    /^  - name:/ {
      emit()
      kind = ""
      component = ""
      version = ""
      next
    }
    /^    kind:/ { kind = $2; next }
    /^    component:/ { component = $2; next }
    /^    version:/ {
      version = $2
      quote = substr(version, 1, 1)
      if (quote == sprintf("%c", 39) || quote == "\"") {
        version = substr(version, 2, length(version) - 2)
      }
      next
    }
    END { emit() }
  ' "$1"
}

verify_module() {
  local module="$1"
  shift
  local declarations
  declarations="$(dependencies "$root/$module/src/_index.yaml")"

  local component count version
  for component in "$@"; do
    count="$(awk -F '\t' -v wanted="$component" '$1 == wanted { count++ } END { print count + 0 }' <<<"$declarations")"
    if [[ "$count" != 1 ]]; then
      printf '%s: expected one direct dependency on %s, found %s\n' "$module" "$component" "$count" >&2
      failed=1
      continue
    fi

    version="$(awk -F '\t' -v wanted="$component" '$1 == wanted { print $2 }' <<<"$declarations")"
    if [[ "$version" != '*' ]]; then
      printf '%s: %s must stay unpinned (*), got %s\n' "$module" "$component" "$version" >&2
      failed=1
    fi
  done

  if awk -F '\t' '$1 == "kickside/data" { found = 1 } END { exit !found }' <<<"$declarations"; then
    printf '%s: kickside.data registry contracts belong to kickside/contract; kickside/data is not a module\n' "$module" >&2
    failed=1
  fi
}

# Registry namespaces are not Hub package identities. In particular,
# kickside.data:* is published by kickside/contract.
verify_module notion kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module linear kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module airtable kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module dropbox kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module box kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module atlassian kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module github kickside/component kickside/connection kickside/contract kickside/oauth kickside/settings
verify_module gitlab kickside/component kickside/connection kickside/contract
verify_module bitbucket kickside/component kickside/connection kickside/contract
verify_module discord kickside/component kickside/connection kickside/contract kickside/dm kickside/channel
verify_module slack kickside/component kickside/connection kickside/contract kickside/dm kickside/channel
verify_module telegram kickside/component kickside/connection kickside/contract kickside/dm kickside/channel
verify_module asr kickside/uploads kickside/settings
verify_module llm-ocr kickside/core kickside/uploads kickside/settings wippy/llm
verify_module google kickside/component kickside/contract kickside/oauth kickside/settings
verify_module fireflies kickside/component kickside/connection kickside/contract
verify_module hubspot kickside/component kickside/connection kickside/contract
verify_module phantombuster kickside/component kickside/connection kickside/contract kickside/uploads
verify_module webscout kickside/settings
verify_module webscout-brave kickside/webscout kickside/settings
verify_module webscout-tavily kickside/webscout kickside/settings
verify_module sso-github kickside/sso kickside/settings
verify_module sso-google kickside/sso kickside/settings
verify_module sso-microsoft kickside/sso kickside/settings
verify_module sso-oidc kickside/sso kickside/settings

for service_file in \
  slack/src/socket/_index.yaml \
  discord/src/gateway/_index.yaml \
  telegram/src/polling/_index.yaml; do
  if grep -qE '^[[:space:]]+- app:db[[:space:]]*$' "$root/$service_file"; then
    printf '%s: provider service must not depend on foreign app:db\n' "$service_file" >&2
    failed=1
  fi
done

while IFS= read -r lock; do
  printf 'production lock is not allowed: %s\n' "${lock#"$root/"}" >&2
  failed=1
done < <(find "$root" -mindepth 2 -maxdepth 2 -name wippy.lock -type f -print)

if [[ "$failed" != 0 ]]; then
  exit 1
fi

printf 'provider dependency declarations verified (24 modules)\n'
