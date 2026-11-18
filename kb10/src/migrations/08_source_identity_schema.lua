-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")

local function execute(tx, statement)
    local _, err = tx:execute(statement)
    if err then error(err) end
end

return require("migration").define(function()
    migration("08 source identity schema", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx)
                    local postgres = dialect == "postgres"
                    local db_type = postgres and sql.type.POSTGRES or sql.type.SQLITE
                    local collation = postgres and '"C"' or "BINARY"
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN external_source TEXT COLLATE " .. collation)
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN external_id TEXT COLLATE " .. collation .. [[
                        CHECK ((external_source IS NULL AND external_id IS NULL) OR (
                            external_source IS NOT NULL AND external_source <> '' AND
                            external_id IS NOT NULL AND external_id <> '' AND
                            node_type = 'document' AND parent_id IS NULL))]])
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN source_lineage TEXT COLLATE " .. collation)
                    local root_key = ops.source_root_key(db_type)
                    if postgres then
                        execute(tx, [[CREATE TYPE kb10_source_pair AS
                            (store_id text COLLATE "C", external_source text COLLATE "C", external_id text COLLATE "C")]])
                        execute(tx, [[CREATE TYPE kb10_source_key AS
                            (store_id text COLLATE "C", external_source text COLLATE "C",
                             external_id text COLLATE "C", source_lineage text COLLATE "C")]])
                        execute(tx, "ALTER TABLE kb10_nodes ADD CONSTRAINT kb10_nodes_source_root " ..
                            "EXCLUDE USING hash ((" .. root_key .. ") WITH =) WHERE (" .. ops.SOURCE_BOUND .. ")")
                    else
                        execute(tx, "CREATE UNIQUE INDEX kb10_nodes_source_root ON kb10_nodes " ..
                            root_key .. " WHERE " .. ops.SOURCE_BOUND)
                    end

                    -- Foreign-key checks address the node columns without a store filter.
                    for _, index in ipairs({
                        {"idx_kb10_nodes_parent", "kb10_nodes", "parent_id"},
                        {"idx_kb10_edges_from", "kb10_edges", "from_node_id"},
                        {"idx_kb10_edges_to", "kb10_edges", "to_node_id"},
                    }) do
                        execute(tx, "DROP INDEX " .. index[1])
                        execute(tx, "CREATE INDEX " .. index[1] .. " ON " .. index[2] ..
                            " (" .. index[3] .. ", store_id)")
                    end

                    for _, roots in ipairs({true, false}) do
                        local index, predicate = ops.source_lookup_index(db_type, roots)
                        local name = roots and "kb10_nodes_source_root_lookup" or "kb10_nodes_source_members"
                        execute(tx, "CREATE INDEX " .. name .. " ON kb10_nodes " .. index .. " WHERE " .. predicate)
                    end
                end)
            end)
        end
    end)
end)
