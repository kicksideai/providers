-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")
local batch_size = 200

return require("migration").define(function()
    migration("09 source identity backfill", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, checkpoint)
                    local postgres = dialect == "postgres"
                    local db_type = postgres and sql.type.POSTGRES or sql.type.SQLITE
                    local page, page_err = tx:query("SELECT id FROM kb10_nodes " ..
                        (checkpoint and "WHERE id > $1 " or "") .. "ORDER BY id LIMIT " .. batch_size,
                        checkpoint and {checkpoint} or {})
                    if page_err then error(page_err) end
                    if #page == 0 then return nil end

                    local ids = {}
                    for i, row in ipairs(page) do ids[i] = tostring(row.id) end
                    local source, id = ops.source_metadata_columns(db_type)
                    local strings = postgres and [[jsonb_typeof(metadata->'external_source') = 'string'
                            AND jsonb_typeof(metadata->'external_id') = 'string']]
                        or [[json_type(metadata, '$.external_source') = 'text'
                            AND json_type(metadata, '$.external_id') = 'text']]
                    local collation = postgres and ' COLLATE "C"' or " COLLATE BINARY"
                    local lineage = ops.source_thread_column(db_type, "metadata")
                    local existing = ops.source_root_key(db_type, "owner")
                    local key = ops.source_root_value(db_type, "candidate.store_id", "candidate.source",
                        "candidate.external", "candidate.lineage")
                    -- The first address in each lineage owns the tuple. Later
                    -- addresses retain their full tree and graph references.
                    local statement = "WITH candidates AS (SELECT id, store_id, " .. source ..
                        " AS source, " .. id .. " AS external, " .. lineage .. " AS lineage, " ..
                        "row_number() OVER (PARTITION BY store_id" .. collation .. ", " .. source .. collation ..
                        ", " .. id .. collation .. ", " .. lineage .. collation .. " ORDER BY id) AS pick" ..
                        " FROM kb10_nodes WHERE id IN (" .. ops.placeholders(#ids) .. ") AND " .. ops.SOURCE_ROOT ..
                        " AND " .. strings .. " AND " .. source .. " <> '' AND " .. id .. " <> '')" ..
                        " UPDATE kb10_nodes SET external_source = candidate.source, external_id = candidate.external," ..
                        " source_lineage = candidate.lineage FROM candidates AS candidate" ..
                        " WHERE kb10_nodes.id = candidate.id AND candidate.pick = 1" ..
                        " AND NOT EXISTS (SELECT 1 FROM kb10_nodes AS owner WHERE owner.external_source IS NOT NULL" ..
                        " AND owner.external_id IS NOT NULL AND " .. existing .. " = " .. key .. ")"
                    local _, err = tx:execute(statement, ids)
                    if err then error(err) end

                    if #page == batch_size then return ids[#page] end
                    return nil
                end, "batch")
            end)
        end
    end)
end)
