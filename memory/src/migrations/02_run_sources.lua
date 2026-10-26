-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local runs = require("memory_runs")

local function migrate(db: any)
    local _, create_err = db:execute([[CREATE TABLE IF NOT EXISTS kickside_memory_kb_run_sources (
        component_id TEXT NOT NULL, run_id TEXT NOT NULL, event_id TEXT NOT NULL,
        PRIMARY KEY (component_id, run_id, event_id)
    )]])
    if create_err then error(create_err) end
    local _, index_err = db:execute("CREATE INDEX IF NOT EXISTS idx_kickside_memory_kb_run_sources_event ON kickside_memory_kb_run_sources (component_id, event_id, run_id)")
    if index_err then error(index_err) end
    local after = ""
    while true do
        local page, read_err = db:query("SELECT id, component_id, input FROM kickside_memory_kb_runs WHERE run_type = 'derive' AND id > $1 ORDER BY id LIMIT 200", { after })
        if read_err then error(read_err) end
        if not page or #page == 0 then break end
        for _, row in ipairs(page) do
            if type(row.input) == "string" then
                local input, decode_err = json.decode(row.input)
                if decode_err then error(decode_err) end
                row.input = input
            end
            local sources_err = runs.sources_tx(db, row)
            if sources_err then error(sources_err) end
            after = row.id
        end
    end
end

return require("migration").define(function()
    migration("02 memory run source ownership", function()
        database("postgres", function() up(migrate) end)
        database("sqlite", function() up(migrate) end)
    end)
end)
