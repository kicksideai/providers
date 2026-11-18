-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")
local logger = require("logger"):named("kb10.source_identity")
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
                    local existing = ops.source_key_expression(db_type, "owner.store_id", "owner.external_source", "owner.external_id")
                    local candidate = ops.source_key_expression(db_type, "candidate.store_id", "candidate.source", "candidate.external")
                    local member_source, member_id = ops.source_metadata_columns(db_type, "member.metadata")
                    local member = ops.source_key_expression(db_type, "member.store_id", member_source, member_id)
                    local same_key = "member.external_source IS NULL AND " .. member_source .. " IS NOT NULL AND " ..
                        member_id .. " IS NOT NULL AND " .. member .. " = " .. candidate ..
                        " AND member.node_type = 'document' AND member.parent_id IS NULL"

                    -- Probe both indexes before binding any root. The first address
                    -- reports collisions even when the other root is in a later page.
                    local candidates, err = tx:query("WITH candidates AS (SELECT id, store_id, " .. source ..
                        " AS source, " .. id .. " AS external, " .. ops.source_thread_column(db_type, "metadata") ..
                        " AS lineage, row_number() OVER (PARTITION BY store_id" .. collation ..
                        ", " .. source .. collation .. ", " .. id .. collation .. " ORDER BY id) AS pick" ..
                        " FROM kb10_nodes WHERE id IN (" .. ops.placeholders(#ids) .. ") AND node_type = 'document' " ..
                        " AND parent_id IS NULL AND " .. strings .. " AND " .. source .. " <> '' AND " .. id .. " <> '')" ..
                        " SELECT candidate.id, (SELECT member.id FROM kb10_nodes AS member WHERE " .. same_key ..
                        " AND member.id <> candidate.id AND (candidate.lineage IS NULL OR " ..
                        ops.source_thread_column(db_type, "member.metadata") .. " IS DISTINCT FROM candidate.lineage)" ..
                        " LIMIT 1) AS collision_id FROM candidates AS candidate WHERE candidate.pick = 1" ..
                        " AND NOT EXISTS (SELECT 1 FROM kb10_nodes AS owner WHERE owner.external_source IS NOT NULL" ..
                        " AND owner.external_id IS NOT NULL AND " .. existing .. " = " .. candidate .. ")" ..
                        " AND NOT EXISTS (SELECT 1 FROM kb10_nodes AS member WHERE " .. same_key ..
                        " AND member.id < candidate.id)", ids)
                    if err then error(err) end

                    local bind, collisions = {}, {}
                    for _, row in ipairs(candidates) do
                        if row.collision_id then
                            collisions[#collisions + 1] = {root = tostring(row.id), other_root = tostring(row.collision_id)}
                        else
                            bind[#bind + 1] = tostring(row.id)
                        end
                    end
                    if #bind > 0 then
                        local _, bind_err = tx:execute("UPDATE kb10_nodes SET external_source = " .. source ..
                            ", external_id = " .. id .. " WHERE id IN (" .. ops.placeholders(#bind) .. ")", bind)
                        if bind_err then error(bind_err) end
                    end
                    if #collisions > 0 then
                        logger:warn("source identity collisions retain separate public roots", {roots = collisions})
                    end

                    if #page == batch_size then return ids[#page] end
                    return nil
                end, "batch")
            end)
        end
    end)
end)
