-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local DIAGNOSTIC = [[{"kind":"Internal","code":"legacy_failure","explanation":"A previous memory operation fails; its diagnostic predates classified reporting.","retryable":false}]]
local function sanitize(db: any)
    local _, err = db:execute("UPDATE kickside_memory_kb_runs SET last_error = $1 WHERE status = 'failed' AND (last_error IS NULL OR CAST(last_error AS TEXT) <> $1)", { DIAGNOSTIC })
    if err then error(err) end
end

return require("migration").define(function()
    migration("04 memory classified run diagnostics", function()
        database("postgres", function() up(sanitize) end)
        database("sqlite", function() up(sanitize) end)
    end)
end)
