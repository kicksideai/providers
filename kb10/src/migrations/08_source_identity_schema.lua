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
                    if postgres then
                        execute(tx, [[CREATE TYPE kb10_source_key AS
                            (store_id text COLLATE "C", external_source text COLLATE "C", external_id text COLLATE "C")]])
                        execute(tx, [[ALTER TABLE kb10_nodes ADD CONSTRAINT kb10_nodes_source_root
                            EXCLUDE USING hash ((ROW(store_id, external_source, external_id)::kb10_source_key) WITH =)
                            WHERE (external_source IS NOT NULL AND external_id IS NOT NULL)]])
                    else
                        execute(tx, [[CREATE UNIQUE INDEX kb10_nodes_source_root
                            ON kb10_nodes (store_id, external_source, external_id)
                            WHERE external_source IS NOT NULL AND external_id IS NOT NULL]])
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

                    -- The published lookup also addresses nodes that carry source metadata
                    -- independently of their parent, including imported and historical nodes.
                    local source, id = ops.source_metadata_columns(db_type)
                    local key = ops.source_key_expression(db_type, "store_id", source, id)
                    local index = postgres and " USING hash ((" .. key .. "))" or key
                    execute(tx, "CREATE INDEX kb10_nodes_source_members ON kb10_nodes " .. index ..
                        " WHERE external_source IS NULL AND " .. source .. " IS NOT NULL AND " .. id .. " IS NOT NULL")
                end)
            end)
        end
    end)
end)
