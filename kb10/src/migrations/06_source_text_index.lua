-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
return require("migration").define(function()
    migration("06 source text index", function()
        database("postgres", function()
            up(function(db)
                -- Source bodies remain intact; retrieval indexes their bounded children.
                local _, drop_err = db:execute("ALTER TABLE kb10_nodes DROP COLUMN search_vector")
                if drop_err then error(tostring(drop_err)) end
                local _, column_err = db:execute([=[
                    ALTER TABLE kb10_nodes ADD COLUMN search_vector tsvector GENERATED ALWAYS AS (
                        to_tsvector('simple'::regconfig, regexp_replace(
                            CASE WHEN node_type = 'document' THEN ''::text ELSE COALESCE(content, ''::text) END,
                            '[^[:alnum:]]+'::text, ' '::text, 'g'::text
                        ))
                    ) STORED
                ]=])
                if column_err then error(tostring(column_err)) end
                local _, index_err = db:execute("CREATE INDEX idx_kb10_nodes_fts ON kb10_nodes USING gin (search_vector)")
                if index_err then error(tostring(index_err)) end
            end)
        end)
        database("sqlite", function()
            up(function(_db) end)
        end)
    end)
end)
