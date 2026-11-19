-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local keys = { "summary_model", "chunk_enrichment_model" }

return require("migration").define(function()
    migration("12 preserve contextual model settings", function()
        database("postgres", function()
            up(function(db)
                for _, key in ipairs(keys) do
                    local _, err = db:execute([[UPDATE kb10_stores
                        SET config = jsonb_set(config, ARRAY[$1::text], 'false'::jsonb)
                        WHERE config->($1::text) = '""'::jsonb]], { key })
                    if err then error(tostring(err)) end
                end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                for _, key in ipairs(keys) do
                    local _, err = db:execute([[UPDATE kb10_stores
                        SET config = json_set(config, $1, json('false'))
                        WHERE json_extract(config, $1) = '']], { "$." .. key })
                    if err then error(tostring(err)) end
                end
            end)
        end)
    end)
end)
