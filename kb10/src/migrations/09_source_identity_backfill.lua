-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local sql = require("sql")
local ops = require("ops")

return require("migration").define(function()
    migration("09 source identity backfill", function()
        for _, dialect in ipairs({"postgres", "sqlite"}) do
            database(dialect, function()
                up(function(tx, checkpoint)
                    local exact_pass = not checkpoint or checkpoint:sub(1, 1) == "e"
                    local phase = exact_pass and "e" or "p"
                    local after = checkpoint and checkpoint:sub(2) or ""
                    local page, page_err = tx:query("SELECT n.id, n.store_id, n.metadata, s.component_id FROM (" ..
                        "SELECT id, store_id, CASE WHEN " .. ops.SOURCE_ROOT .. " AND source_scope IS NULL" ..
                        " THEN metadata END AS metadata FROM kb10_nodes" ..
                        (after ~= "" and " WHERE id > $1" or "") .. " ORDER BY id LIMIT 200" ..
                        ") AS n LEFT JOIN kb10_stores AS s ON n.metadata IS NOT NULL AND s.id = n.store_id ORDER BY n.id",
                        after ~= "" and {after} or {})
                    if page_err then error(page_err) end
                    if #page == 0 then
                        if exact_pass then return "p" end
                        return nil
                    end

                    ops.decode_metadata(page)
                    local postgres = dialect == "postgres"
                    local db_type = postgres and sql.type.POSTGRES or sql.type.SQLITE
                    local params, values = {}, {}
                    for _, row in ipairs(page) do
                        local binding, exact = ops.legacy_source_binding(row.component_id, row.metadata)
                        if row.component_id and binding and exact == exact_pass then
                            local first = #params + 1
                            values[#values + 1] = postgres and "($" .. first .. "::uuid, " ..
                                ops.placeholders(4, first + 1) .. ")" or "(" .. ops.placeholders(5, first) .. ")"
                            params[first] = tostring(row.id)
                            params[first + 1] = row.store_id
                            params[first + 2] = binding.source_scope
                            params[first + 3] = binding.external_source
                            params[first + 4] = binding.external_id
                        end
                    end
                    if #values > 0 then
                        local collation = postgres and ' COLLATE "C"' or ' COLLATE BINARY'
                        local _, err = tx:execute(
                            "WITH bindings(id, store_id, source_scope, external_source, external_id) AS (VALUES " ..
                            table.concat(values, ", ") .. "), candidates AS (SELECT *, row_number() OVER (" ..
                            "PARTITION BY store_id" .. collation .. ", source_scope" .. collation ..
                            ", external_source" .. collation .. ", external_id" .. collation .. " ORDER BY id) AS pick FROM bindings)" ..
                            " UPDATE kb10_nodes SET source_scope = candidate.source_scope," ..
                            " external_source = candidate.external_source, external_id = candidate.external_id" ..
                            " FROM candidates AS candidate WHERE kb10_nodes.id = candidate.id AND candidate.pick = 1" ..
                            " AND (SELECT owner.id FROM kb10_nodes AS owner WHERE owner." .. ops.SOURCE_BOUND ..
                            " AND " .. ops.source_root_key(db_type, "owner.") ..
                            " = " .. ops.source_root_key(db_type, "candidate.") .. " LIMIT 1) IS NULL", params)
                        if err then error(err) end
                    end
                    return phase .. tostring(page[#page].id)
                end, "batch")
                -- Existing identities remain valid in schema 08.
                down(function(_db) end)
            end)
        end
    end)
end)
