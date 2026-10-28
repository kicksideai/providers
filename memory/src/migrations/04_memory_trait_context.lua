-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local function execute(db: any, statement: string)
    local _, err = db:execute(statement)
    if err then error(tostring(err)) end
end

return require("migration").define(function()
    migration("04 memory trait context", function()
        database("postgres", function()
            up(function(db)
                execute(db, [=[
                    UPDATE kickside_components
                    SET private_context = jsonb_set(
                            private_context,
                            '{trait_contexts,kickside.memory:memory}',
                            (private_context #> '{trait_contexts,kickside.memory:memory}')
                                - 'read_enabled' - 'write_enabled' - 'recall_limit'
                        ),
                        context_revision = COALESCE(context_revision, 0) + 1,
                        updated_at = to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS"Z"')
                    WHERE jsonb_typeof(private_context) = 'object'
                      AND jsonb_typeof(private_context #> '{trait_contexts,kickside.memory:memory}') = 'object'
                      AND (private_context #> '{trait_contexts,kickside.memory:memory}') ?| ARRAY['read_enabled', 'write_enabled', 'recall_limit']
                ]=])
            end)
            down(function() error("memory trait context migration is forward-only") end)
        end)
        database("sqlite", function()
            up(function(db)
                execute(db, [[
                    UPDATE kickside_components
                    SET private_context = json_remove(
                            private_context,
                            '$.trait_contexts."kickside.memory:memory".read_enabled',
                            '$.trait_contexts."kickside.memory:memory".write_enabled',
                            '$.trait_contexts."kickside.memory:memory".recall_limit'
                        ),
                        context_revision = COALESCE(context_revision, 0) + 1,
                        updated_at = strftime('%Y-%m-%dT%H:%M:%SZ', 'now')
                    WHERE json_type(private_context) = 'object'
                      AND json_type(private_context, '$.trait_contexts."kickside.memory:memory"') = 'object'
                      AND (
                        json_type(private_context, '$.trait_contexts."kickside.memory:memory".read_enabled') IS NOT NULL
                        OR json_type(private_context, '$.trait_contexts."kickside.memory:memory".write_enabled') IS NOT NULL
                        OR json_type(private_context, '$.trait_contexts."kickside.memory:memory".recall_limit') IS NOT NULL
                      )
                ]])
            end)
            down(function() error("memory trait context migration is forward-only") end)
        end)
    end)
end)
