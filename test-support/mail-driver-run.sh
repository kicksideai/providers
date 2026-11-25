#!/usr/bin/env bash
# SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
set -euo pipefail
cd "$(dirname "$1")"
shift
module=$(basename "$(dirname "$PWD")")
driver=${module#mail-}
mkdir -p .wippy
exec 9>.wippy/harness.lock
flock -n 9 || { echo "A $module harness is already running" >&2; exit 1; }

export TMPDIR="${TMPDIR:-$PWD/.wippy/tmp}"
mkdir -p "$TMPDIR"
rm -rf -- ".wippy/$driver-requests"
rm -f -- .wippy/driver-test.sqlite{,-wal,-shm}

# Linking needs the fixture port before the HTTP service starts.
port=$(python3 - <<'PY'
import socket

with socket.socket() as listener:
    listener.bind(('127.0.0.1', 0))
    print(listener.getsockname()[1])
PY
)
log="${WIPPY_TEST_LOG:-.wippy/test.log}"
WIPPY_TEST_REQUIRE_CASES=1 "${WIPPY:-wippy}" test --set "vars.stub_port=$port" "$@" 2>&1 | tee -- "$log"
LC_ALL=C sed -E 's/\x1B\[[0-?]*[ -/]*[@-~]//g' "$log" | tr '\r' '\n' | awk '
  /No tests found|No tests match/ { empty=1 }
  /^[[:space:]]*FAILED([[:space:]]|$)/ { failed=1 }
  /^[[:space:]]*PASSED([[:space:]]|$)/ { passed=1 }
  END { exit(empty || failed || !passed) }
'
