-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

local function has_column(db: any, engine: string): boolean
    if engine == "postgres" then
        local rows, err = db:query([[SELECT 1 FROM information_schema.columns
            WHERE table_schema = 'public' AND table_name = 'kickside_memory_cursors' AND column_name = 'owner_scope_key']])
        if err then error(tostring(err)) end
        return rows and #rows > 0
    end
    local rows, err = db:query("PRAGMA table_info(kickside_memory_cursors)")
    if err then error(tostring(err)) end
    for _, row in ipairs(rows or {}) do if row.name == "owner_scope_key" then return true end end
    return false
end

return require("migration").define(function()
    migration("02 cursor owner scope", function()
        database("postgres", function()
            up(function(db)
                if not has_column(db, "postgres") then execute(db, "ALTER TABLE kickside_memory_cursors ADD COLUMN owner_scope_key text") end
                execute(db, [[WITH pinned AS (
                    SELECT c.component_id, c.host_kind, c.host_id, i.scope_key
                    FROM kickside_memory_cursors c
                    CROSS JOIN LATERAL jsonb_array_elements_text(COALESCE(c.pinned_ids, '[]')::jsonb) AS p(item_id)
                    JOIN kickside_memory_items i ON i.component_id = c.component_id AND i.id = p.item_id
                ), inferred AS (
                    SELECT c.component_id, c.host_kind, c.host_id, MIN(p.scope_key) AS owner_scope_key
                    FROM kickside_memory_cursors c
                    JOIN pinned p ON p.component_id = c.component_id AND p.host_kind = c.host_kind AND p.host_id = c.host_id
                    WHERE p.scope_key LIKE 'owner:%'
                    GROUP BY c.component_id, c.host_kind, c.host_id, c.pinned_ids
                    HAVING COUNT(*) = jsonb_array_length(COALESCE(c.pinned_ids, '[]')::jsonb)
                        AND COUNT(DISTINCT p.scope_key) = 1
                )
                UPDATE kickside_memory_cursors c SET owner_scope_key = inferred.owner_scope_key
                FROM inferred WHERE c.component_id = inferred.component_id AND c.host_kind = inferred.host_kind AND c.host_id = inferred.host_id]])
                execute(db, "CREATE INDEX IF NOT EXISTS idx_kickside_memory_cursors_owner_scope ON kickside_memory_cursors (component_id, owner_scope_key)")
            end)
            down(function(db)
                error("memory cursor owner scope migration is forward-only")
            end)
        end)
        database("sqlite", function()
            up(function(db)
                if not has_column(db, "sqlite") then execute(db, "ALTER TABLE kickside_memory_cursors ADD COLUMN owner_scope_key TEXT") end
                execute(db, [[UPDATE kickside_memory_cursors AS c SET owner_scope_key = (
                    SELECT MIN(i.scope_key)
                    FROM json_each(COALESCE(c.pinned_ids, '[]')) AS p
                    JOIN kickside_memory_items i ON i.component_id = c.component_id AND i.id = p.value
                    WHERE i.scope_key LIKE 'owner:%'
                    HAVING COUNT(*) = json_array_length(COALESCE(c.pinned_ids, '[]'))
                        AND COUNT(DISTINCT i.scope_key) = 1
                )
                WHERE json_array_length(COALESCE(c.pinned_ids, '[]')) > 0]])
                execute(db, "CREATE INDEX IF NOT EXISTS idx_kickside_memory_cursors_owner_scope ON kickside_memory_cursors (component_id, owner_scope_key)")
            end)
            down(function(db)
                error("memory cursor owner scope migration is forward-only")
            end)
        end)
    end)
end)
