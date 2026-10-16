return require("migration").define(function()
    migration("05 retrieval observations", function()
        for _, engine in ipairs({ "postgres", "sqlite" }) do
            database(engine, function()
                up(function(db)
                    local id = engine == "postgres" and "BIGSERIAL PRIMARY KEY" or "INTEGER PRIMARY KEY AUTOINCREMENT"
                    local _, err = db:execute("CREATE TABLE IF NOT EXISTS kb10_query_log (id " .. id .. ", store_id TEXT NOT NULL REFERENCES kb10_stores(id) ON DELETE CASCADE, query TEXT NOT NULL, strategy TEXT NOT NULL, top_score DOUBLE PRECISION NOT NULL, results INTEGER NOT NULL, created_at TEXT NOT NULL)")
                    if err then error(tostring(err)) end
                    local _, index_err = db:execute("CREATE INDEX IF NOT EXISTS idx_kb10_query_log_store_id ON kb10_query_log(store_id, id)")
                    if index_err then error(tostring(index_err)) end
                    local _, state_err = db:execute([[CREATE TABLE IF NOT EXISTS kb10_tuning_state (
                        store_id TEXT PRIMARY KEY REFERENCES kb10_stores(id) ON DELETE CASCADE,
                        observed INTEGER NOT NULL DEFAULT 0,
                        claimed_observed INTEGER NOT NULL DEFAULT 0,
                        lease_token TEXT NOT NULL DEFAULT '',
                        lease_until TEXT NOT NULL DEFAULT '',
                        applied_at TEXT,
                        last_error TEXT,
                        rationale TEXT
                    )]])
                    if state_err then error(tostring(state_err)) end
                end)
                down(function(db)
                    local _, err = db:execute("DROP TABLE kb10_query_log")
                    if err then error(tostring(err)) end
                    local _, state_err = db:execute("DROP TABLE kb10_tuning_state")
                    if state_err then error(tostring(state_err)) end
                end)
            end)
        end
    end)
end)
