-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("15 source publication", function()
        for _, dialect in ipairs({"sqlite", "postgres"}) do
            database(dialect, function()
                up(function(db)
                    for _, column in ipairs({"source_publication_token", "source_publication_result"}) do
                        local _, err = db:execute("ALTER TABLE kb10_stores ADD COLUMN " .. column .. " TEXT")
                        if err then error(err) end
                    end
                end)
                down(function(db)
                    for _, column in ipairs({"source_publication_result", "source_publication_token"}) do
                        local _, err = db:execute("ALTER TABLE kb10_stores DROP COLUMN " .. column)
                        if err then error(err) end
                    end
                end)
            end)
        end
    end)
end)
