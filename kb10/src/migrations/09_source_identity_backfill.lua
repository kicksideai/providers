-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")

return require("migration").define(function()
    migration("09 source identity backfill", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, checkpoint)
                    local postgres = dialect == "postgres"
                    local db_type = postgres and sql.type.POSTGRES or sql.type.SQLITE
                    local page, page_err = tx:query("SELECT id FROM kb10_nodes " ..
                        (checkpoint and "WHERE id > $1 " or "") .. "ORDER BY id LIMIT 200",
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
                    local existing = ops.source_key_expression(db_type, "owner.store_id", "owner.external_source", "owner.external_id")
                    local candidate = ops.source_key_expression(db_type, "candidate.store_id", "candidate.source", "candidate.external")

                    -- The previously published writer orders by node id. Keep the
                    -- first address and its generation. Other trees keep their public ids.
                    local _, err = tx:execute("WITH candidates AS (SELECT id, store_id, " .. source ..
                        " AS source, " .. id .. " AS external, row_number() OVER (PARTITION BY store_id" .. collation ..
                        ", " .. source .. collation .. ", " .. id .. collation .. " ORDER BY id) AS pick" ..
                        " FROM kb10_nodes WHERE id IN (" .. ops.placeholders(#ids) .. ") AND node_type = 'document' " ..
                        " AND parent_id IS NULL AND " .. strings .. " AND " .. source .. " <> '' AND " .. id .. " <> '')" .. [[
                        UPDATE kb10_nodes AS node SET external_source = candidate.source, external_id = candidate.external
                        FROM candidates AS candidate WHERE node.id = candidate.id AND candidate.pick = 1
                            AND NOT EXISTS (SELECT 1 FROM kb10_nodes AS owner
                                WHERE owner.external_source IS NOT NULL AND owner.external_id IS NOT NULL AND ]] ..
                        existing .. " = " .. candidate .. ")", ids)
                    if err then error(err) end
                    if #page < 200 then return nil end
                    return ids[#page]
                end, "batch")
            end)
        end
    end)
end)
