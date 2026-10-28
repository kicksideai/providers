-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function has_cycle(db: any, engine: string): boolean
    if engine == "postgres" then
        local rows, err = db:query([[SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'kickside_memory_runs' AND column_name = 'cycle']])
        if err then error(tostring(err)) end
        return rows and #rows > 0
    end
    local rows, err = db:query("PRAGMA table_info(kickside_memory_runs)")
    if err then error(tostring(err)) end
    for _, row in ipairs(rows or {}) do if row.name == "cycle" then return true end end
    return false
end

return require("migration").define(function()
    migration("03 run cycle", function()
        database("postgres", function()
            up(function(db)
                if not has_cycle(db, "postgres") then execute(db, "ALTER TABLE kickside_memory_runs ADD COLUMN cycle text") end
                execute(db, "UPDATE kickside_memory_runs SET cycle = started_at WHERE cycle IS NULL AND run_type = 'consolidate' " ..
                    "AND status IN ('running', 'failed') AND started_at IS NOT NULL")
            end)
            down(function() error("memory run cycle migration is forward-only") end)
        end)
        database("sqlite", function()
            up(function(db)
                if not has_cycle(db, "sqlite") then execute(db, "ALTER TABLE kickside_memory_runs ADD COLUMN cycle TEXT") end
                execute(db, "UPDATE kickside_memory_runs SET cycle = started_at WHERE cycle IS NULL AND run_type = 'consolidate' " ..
                    "AND status IN ('running', 'failed') AND started_at IS NOT NULL")
            end)
            down(function() error("memory run cycle migration is forward-only") end)
        end)
    end)
end)
