-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Historical writes also used an empty JSON array for an empty settings table.
return require("migration").define(function()
    migration("07 preserve answer settings", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([[UPDATE kb10_stores
                    SET config = CASE WHEN config = '[]'::jsonb THEN '{"analysis_model":""}'::jsonb
                        ELSE jsonb_set(config, '{analysis_model}', '""'::jsonb) END
                    WHERE config = '[]'::jsonb
                        OR (jsonb_typeof(config) = 'object' AND config->>'analysis_model' IS NULL)]])
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([[UPDATE kb10_stores
                    SET config = CASE WHEN json_type(config) = 'array' THEN '{"analysis_model":""}'
                        ELSE json_set(config, '$.analysis_model', '') END
                    WHERE (json_type(config) = 'array' AND json_array_length(config) = 0)
                        OR (json_type(config) = 'object' AND json_extract(config, '$.analysis_model') IS NULL)]])
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
