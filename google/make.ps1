param(
    [ValidateSet('test', 'lint')][string]$Target = 'lint',
    [Parameter(ValueFromRemainingArguments = $true)][string[]]$WippyArgs
)
$ErrorActionPreference = 'Stop'
$wippyBin = if ($env:WIPPY_BIN) { $env:WIPPY_BIN } else { 'wippy' }
if (-not $env:ENCRYPTION_KEY) { $env:ENCRYPTION_KEY = '0' * 64 }
$testPort = if ($env:WIPPY_TEST_PORT) { $env:WIPPY_TEST_PORT } else { '19146' }
if ($testPort -notmatch '^\d+$' -or [int]$testPort -lt 1 -or [int]$testPort -gt 65535) {
    throw 'WIPPY_TEST_PORT must be a TCP port number'
}
Push-Location (Join-Path $PSScriptRoot 'test')
try {
    $fixtureRoot = Join-Path $PSScriptRoot 'test/.local/tmp/tmp-fixtures'
    [void][IO.Directory]::CreateDirectory($fixtureRoot)
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot 'src/client/transport.lua') -Destination (Join-Path $fixtureRoot 'capacity_client.lua')
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot '../lua-fixtures/tests/capacity_http_fixture.lua') -Destination (Join-Path $fixtureRoot 'capacity_http_fixture.lua')
    Copy-Item -LiteralPath (Join-Path $PSScriptRoot '../lua-fixtures/tests/capacity_transport_guard.lua') -Destination (Join-Path $fixtureRoot 'capacity_transport_guard.lua')
    if ($Target -eq 'test') {
        & $wippyBin install
        if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
        # Match Makefile test: omitted, boolean true and boolean false.
        & node (Join-Path $PSScriptRoot 'test/run-visibility-tests.mjs') $wippyBin --set "vars.http_port=$testPort" @WippyArgs
    } else {
        & $wippyBin lint --ns 'kickside.google' --ns 'kickside.google.*' @WippyArgs
    }
    exit $LASTEXITCODE
} finally {
    Pop-Location
}
