#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .wippy
uploads=$(mktemp -d "$PWD/.wippy/uploads.XXXXXXXX")
trap 'rm -rf -- "$uploads"' EXIT
../../test-support/mail-driver-run.sh "$PWD/run.sh" \
  --override "test.mail_driver_fixture.host:uploads:directory=$uploads" "$@"
