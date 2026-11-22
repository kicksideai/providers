-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function execute(db, query)
    local _, err = db:execute(query)
    if err then error(err) end
end

return require("migration").define(function()
    migration("17 pending graph placement", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(db)
                    execute(db, "ALTER TABLE kb10_stores ADD COLUMN placement_cursor_id TEXT")
                    execute(db, "ALTER TABLE kb10_nodes ADD COLUMN placement_wake_id TEXT")
                    execute(db, "ALTER TABLE kb10_nodes ADD COLUMN placement_identity TEXT")
                    execute(db, [[CREATE INDEX idx_kb10_placement_pending
                        ON kb10_nodes (store_id, placement_wake_id, id)
                        WHERE placement_wake_id IS NOT NULL]])
                end)
            end)
        end
    end)
end)
