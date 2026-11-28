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
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN external_id TEXT COLLATE " .. collation)
                    execute(tx, "ALTER TABLE kb10_nodes ADD COLUMN source_scope TEXT COLLATE " .. collation .. [[
                        CHECK ((source_scope IS NULL AND external_source IS NULL AND external_id IS NULL) OR (
                            source_scope IS NOT NULL AND external_source IS NOT NULL AND external_source <> '' AND
                            external_id IS NOT NULL AND external_id <> '' AND
                            node_type = 'document' AND parent_id IS NULL))]])
                    local root_key = ops.source_root_key(db_type)
                    if postgres then
                        execute(tx, [[CREATE TYPE kb10_source_pair AS
                            (store_id text COLLATE "C", external_source text COLLATE "C", external_id text COLLATE "C")]])
                        execute(tx, [[CREATE TYPE kb10_source_key AS
                            (store_id text COLLATE "C", source_scope text COLLATE "C",
                             external_source text COLLATE "C", external_id text COLLATE "C")]])
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

                    local key, predicate = ops.source_member_key(db_type)
                    key = postgres and "USING hash ((" .. key .. "))" or key
                    execute(tx, "CREATE INDEX kb10_nodes_source_members ON kb10_nodes " .. key .. " WHERE " .. predicate)
                end)
                down(function(tx)
                    execute(tx, "DROP INDEX kb10_nodes_source_members")
                    if dialect == "postgres" then
                        execute(tx, "ALTER TABLE kb10_nodes DROP CONSTRAINT kb10_nodes_source_root")
                        execute(tx, "DROP TYPE kb10_source_key")
                        execute(tx, "DROP TYPE kb10_source_pair")
                    else
                        execute(tx, "DROP INDEX kb10_nodes_source_root")
                    end
                    for _, idx in ipairs({
                        {"idx_kb10_nodes_parent", "kb10_nodes", "parent_id"},
                        {"idx_kb10_edges_from", "kb10_edges", "from_node_id"},
                        {"idx_kb10_edges_to", "kb10_edges", "to_node_id"},
                    }) do
                        execute(tx, "DROP INDEX " .. idx[1])
                        execute(tx, "CREATE INDEX " .. idx[1] .. " ON " .. idx[2] .. " (store_id, " .. idx[3] .. ")")
                    end
                    for _, column in ipairs({"source_scope", "external_id", "external_source"}) do
                        execute(tx, "ALTER TABLE kb10_nodes DROP COLUMN " .. column)
                    end
                end)
            end)
        end
    end)
end)
