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
rm -rf -- ".wippy/$driver-requests" .wippy/driver-signals
rm -f -- .wippy/driver-test.sqlite{,-wal,-shm}

# Linking needs the fixture port before the HTTP service starts.
port=$(python3 - <<'PY'
import socket

with socket.socket() as listener:
    listener.bind(('127.0.0.1', 0))
    print(listener.getsockname()[1])
PY
)
# The stub uses the same HTTPS and certificate verification path as delivery.
umask 077
tls=$(mktemp -d .wippy/tls.XXXXXXXX)
trap 'rm -rf -- "$tls"' EXIT
openssl req -x509 -newkey rsa:2048 -nodes -days 1 -subj /CN=localhost \
  -addext 'subjectAltName=DNS:localhost,IP:127.0.0.1' \
  -keyout "$tls/key.pem" -out "$tls/cert.pem" 2>"$tls/openssl.log" || { cat "$tls/openssl.log" >&2; exit 1; }
{
  printf 'version: "1.0"\noverride:\n'
  python3 - "$PWD/.wippy" <<'PYTHON'
import json
import sys
from pathlib import Path

state = Path(sys.argv[1])
paths = {
    "host:db:file": "driver-test.sqlite",
    "host:env_storage:file_path": "test.env",
    "host:uploads:directory": "uploads",
    "testing:signals:directory": "driver-signals",
}
for field, name in paths.items():
    print(f"  test.mail_driver_fixture.{field}: {json.dumps(str(state / name))}")
PYTHON
  printf '  app:%s_gateway:tls:\n    mode: manual\n    cert: |\n' "$driver"
  sed 's/^/      /' "$tls/cert.pem"
  printf '    key: |\n'
  sed 's/^/      /' "$tls/key.pem"
} > "$tls/fixture.yaml"

log="${WIPPY_TEST_LOG:-.wippy/test.log}"
SSL_CERT_FILE="$PWD/$tls/cert.pem" WIPPY_TEST_REQUIRE_CASES=1 "${WIPPY:-wippy}" test \
  --config .wippy.yaml --config "$tls/fixture.yaml" --set "vars.stub_port=$port" "$@" 2>&1 | tee -- "$log"
LC_ALL=C sed -E 's/\x1B\[[0-?]*[ -/]*[@-~]//g' "$log" | tr '\r' '\n' | awk '
  /No tests found|No tests match/ { empty=1 }
  /^[[:space:]]*FAILED([[:space:]]|$)/ { failed=1 }
  /^[[:space:]]*PASSED([[:space:]]|$)/ { passed=1 }
  END { exit(empty || failed || !passed) }
'
