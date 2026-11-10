-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("07 preserve answer settings", function()
        database("postgres", function()
            up(function(db)
                local _, err = db:execute([[UPDATE kb10_stores
                    SET config = jsonb_set(config, '{analysis_model}', '""'::jsonb)
                    WHERE NOT (config ? 'analysis_model') OR config->'analysis_model' = 'null'::jsonb]])
                if err then error(tostring(err)) end
            end)
        end)
        database("sqlite", function()
            up(function(db)
                local _, err = db:execute([[UPDATE kb10_stores
                    SET config = json_set(config, '$.analysis_model', '')
                    WHERE json_type(config, '$.analysis_model') IS NULL
                        OR json_type(config, '$.analysis_model') = 'null']])
                if err then error(tostring(err)) end
            end)
        end)
    end)
end)
