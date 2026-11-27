-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("10 SQLite search row keys", function()
        database("sqlite", function()
            up(function(tx)
                local _, fts_err = tx:execute("ALTER TABLE kb10_nodes ADD COLUMN fts_rowid INTEGER")
                if fts_err then error(fts_err) end
                local _, embedding_err = tx:execute("ALTER TABLE kb10_nodes ADD COLUMN embedding_ids TEXT")
                if embedding_err then error(embedding_err) end
            end)
            down(function(tx)
                for _, column in ipairs({"embedding_ids", "fts_rowid"}) do
                    local _, err = tx:execute("ALTER TABLE kb10_nodes DROP COLUMN " .. column)
                    if err then error(err) end
                end
            end)
        end)
    end)
end)
