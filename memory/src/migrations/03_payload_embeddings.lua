-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(err) end
end

return require("migration").define(function()
    migration("03 memory payload embeddings", function()
        database("postgres", function()
            up(function(db)
                execute(db, "ALTER TABLE kickside_memory_kb_payloads ADD COLUMN IF NOT EXISTS embedding TEXT")
                execute(db, [[UPDATE kickside_memory_kb_payloads p SET embedding = e.embedding::text
                    FROM kickside_memory_kb_embeddings e WHERE p.component_id = e.component_id
                    AND p.owner_item_id = e.item_id AND p.content_hash = e.content_hash AND p.embedding IS NULL]])
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local columns, err = db:query("PRAGMA table_info(kickside_memory_kb_payloads)")
                if err then error(err) end
                local found = false
                for _, column in ipairs(columns) do if column.name == "embedding" then found = true end end
                if not found then execute(db, "ALTER TABLE kickside_memory_kb_payloads ADD COLUMN embedding TEXT") end
                execute(db, [[UPDATE kickside_memory_kb_payloads SET embedding = (
                    SELECT vec_to_json(e.embedding) FROM kickside_memory_kb_embeddings e
                    WHERE e.component_id = kickside_memory_kb_payloads.component_id AND e.item_id = kickside_memory_kb_payloads.owner_item_id
                    AND e.content_hash = kickside_memory_kb_payloads.content_hash)
                    WHERE embedding IS NULL]])
            end)
        end)
    end)
end)
