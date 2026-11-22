-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function execute(db, query)
    local _, err = db:execute(query)
    if err then error(err) end
end

return require("migration").define(function()
    migration("19 Wiki placement enrollment progress", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(db)
                    execute(db, [[CREATE INDEX idx_kb10_placement_enrollment
                        ON kb10_stores (id) WHERE kb_type = 'wiki' AND COALESCE(enrichment_agent_id, '') = '']])
                    execute(db, [[CREATE TABLE kb10_placement_enrollment (
                        id INTEGER PRIMARY KEY CHECK (id = 1),
                        upper_id TEXT NOT NULL, after_id TEXT NOT NULL,
                        enrolled BIGINT NOT NULL, skipped BIGINT NOT NULL, unresolved BIGINT NOT NULL,
                        issues TEXT NOT NULL, done INTEGER NOT NULL CHECK (done IN (0, 1))
                    )]])
                end)
            end)
        end
    end)
end)
