#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
set -euo pipefail
exec "$(dirname "$0")/../../test-support/mail-driver-run.sh" "$0" "$@"
