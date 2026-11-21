-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local function execute(db, query)
    local _, err = db:execute(query)
    if err then error(err) end
end

local function create_indexes(db, indexes, ordered, suffix)
    for _, index in ipairs(indexes) do
        local name, relation, key = table.unpack(index)
        local columns = ordered and "store_id, " .. key or "store_id"
        execute(db, "CREATE INDEX " .. name .. suffix .. " ON " .. relation .. " (" .. columns .. ")")
    end
end

local function rebuild_indexes(db, dialect, indexes, ordered)
    local postgres = dialect == "postgres"
    -- Build before dropping any old index so PostgreSQL only needs the
    -- stronger drop locks for the final swap.
    if postgres then create_indexes(db, indexes, ordered, "_replacement") end
    for _, index in ipairs(indexes) do
        local name = index[1]
        execute(db, "DROP INDEX " .. name)
        if postgres then execute(db, "ALTER INDEX " .. name .. "_replacement RENAME TO " .. name) end
    end
    if not postgres then
        create_indexes(db, indexes, ordered, "")
        -- Dropping an index also drops its SQLite planner statistics.
        for _, index in ipairs(indexes) do execute(db, "ANALYZE " .. index[1]) end
    end
end

return require("migration").define(function()
    migration("16 export page indexes", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                local indexes = {
                    {"idx_kb10_nodes_store", "kb10_nodes", "id"},
                    {"idx_kb10_edges_store", "kb10_edges", "id"},
                }
                if dialect == "postgres" then
                    indexes[#indexes + 1] = {"idx_kb10_emb_store", "kb10_embeddings", "node_id"}
                end
                up(function(db)
                    rebuild_indexes(db, dialect, indexes, true)
                end)
                down(function(db)
                    rebuild_indexes(db, dialect, indexes, false)
                end)
            end)
        end
    end)
end)
