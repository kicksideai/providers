-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("16 export page indexes", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                local indexes = {
                    {"idx_kb10_nodes_store_seek", "kb10_nodes", "id"},
                    {"idx_kb10_edges_store_seek", "kb10_edges", "id"},
                }
                if dialect == "postgres" then
                    indexes[#indexes + 1] = {"idx_kb10_emb_store_seek", "kb10_embeddings", "node_id"}
                end
                up(function(db)
                    for _, index in ipairs(indexes) do
                        local name, relation, key = table.unpack(index)
                        local _, err = db:execute("CREATE INDEX " .. name .. " ON " .. relation .. " (store_id, " .. key .. ")")
                        if err then error(err) end
                    end
                end)
                down(function(db)
                    for _, index in ipairs(indexes) do
                        local _, err = db:execute("DROP INDEX " .. index[1])
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
