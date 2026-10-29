-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local canonical_json = require("canonical_json")

local function execute(db: any, statement: string, params: any?)
    local _, err = db:execute(statement, params or {})
    if err then error(tostring(err)) end
end

local function query(db: any, statement: string, params: any?): { any }
    local rows, err = db:query(statement, params or {})
    if err then error(tostring(err)) end
    return rows or {}
end

local function has_table(db: any, sqlite: boolean, name: string): boolean
    local statement = sqlite and "SELECT name FROM sqlite_master WHERE type = 'table' AND name = $1"
        or "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name = $1"
    return #query(db, statement, {name}) > 0
end

local function add_column(db: any, sqlite: boolean, name: string, column: string, definition: string)
    local rows = sqlite and query(db, "PRAGMA table_info(" .. name .. ")")
        or query(db, "SELECT column_name AS name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = $1", {name})
    for _, row in ipairs(rows) do if row.name == column then return end end
    execute(db, "ALTER TABLE " .. name .. " ADD COLUMN " .. column .. " " .. definition)
end

local function rename_schema(db: any, sqlite: boolean)
    for _, suffix in ipairs({"stores", "items", "payloads", "provenance", "cursors", "runs"}) do
        local previous = "kickside_memory_kb_" .. suffix
        if has_table(db, sqlite, previous) then
            execute(db, "ALTER TABLE " .. previous .. " RENAME TO kickside_memory_" .. suffix)
        end
    end
    if has_table(db, sqlite, "kickside_memory_kb_keys") then
        execute(db, [[CREATE TABLE kickside_memory_keys (
            id TEXT NOT NULL UNIQUE, component_id TEXT NOT NULL, scope_key TEXT NOT NULL,
            key TEXT NOT NULL, cardinality TEXT NOT NULL, PRIMARY KEY (component_id, scope_key, key))]])
        for _, row in ipairs(query(db, "SELECT component_id, scope_key, key, cardinality FROM kickside_memory_kb_keys")) do
            local id, err = canonical_json.hash({"key", row.component_id, row.scope_key, row.key})
            if err then error(tostring(err)) end
            execute(db, "INSERT INTO kickside_memory_keys (id, component_id, scope_key, key, cardinality) VALUES ($1, $2, $3, $4, $5)",
                {id, row.component_id, row.scope_key, row.key, row.cardinality})
        end
        execute(db, "DROP TABLE kickside_memory_kb_keys")
    end
    if has_table(db, sqlite, "kickside_memory_kb_embeddings") then
        if sqlite then
            execute(db, [[CREATE VIRTUAL TABLE kickside_memory_embeddings USING vec0(
                item_id TEXT PRIMARY KEY, component_id TEXT PARTITION KEY, embedding float[512], +content_hash TEXT)]])
            execute(db, [[INSERT INTO kickside_memory_embeddings (item_id, component_id, embedding, content_hash)
                SELECT item_id, component_id, embedding, content_hash FROM kickside_memory_kb_embeddings]])
            execute(db, "DROP TABLE kickside_memory_kb_embeddings")
        else
            execute(db, "ALTER TABLE kickside_memory_kb_embeddings RENAME TO kickside_memory_embeddings")
        end
    end
    if sqlite and has_table(db, true, "kickside_memory_kb_fts") then
        execute(db, "ALTER TABLE kickside_memory_kb_fts RENAME TO kickside_memory_fts")
    end
    if sqlite then
        for _, row in ipairs(query(db, "SELECT name, sql FROM sqlite_master WHERE type = 'index' AND name LIKE 'idx_kickside_memory_kb_%'")) do
            execute(db, "DROP INDEX " .. row.name)
            local definition = row.sql:gsub("kickside_memory_kb_", "kickside_memory_"):gsub("idx_kickside_memory_runs_component", "idx_kickside_memory_runs_by_component")
            execute(db, definition)
        end
    else
        for _, row in ipairs(query(db, "SELECT indexname FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%kickside_memory_kb_%'")) do
            local name = row.indexname:gsub("kickside_memory_kb_", "kickside_memory_"):gsub("idx_kickside_memory_runs_component", "idx_kickside_memory_runs_by_component")
            execute(db, "ALTER INDEX " .. row.indexname .. " RENAME TO " .. name)
        end
        execute(db, "ALTER TABLE kickside_memory_runs ALTER COLUMN job_id TYPE uuid USING job_id::uuid")
    end
end

local function migrate_event_keys(db: any, sqlite: boolean)
    local key_field = sqlite and "json_type(body, '$.key') = 'text'" or "jsonb_typeof(body->'key') = 'string'"
    local rows = query(db, [[SELECT id, thread_id, body FROM kickside_event
        WHERE type = 'kickside.memory.events:item.added' AND ]] .. key_field .. [[
        AND CAST(thread_id AS TEXT) IN (SELECT component_id FROM kickside_memory_stores)]])
    if #rows == 0 then return end
    -- Event bodies change once, inside the migration runner's transaction.
    local trigger
    if sqlite then
        trigger = query(db, "SELECT sql FROM sqlite_master WHERE type = 'trigger' AND name = 'trg_kickside_event_immutable'")[1].sql
        execute(db, "DROP TRIGGER trg_kickside_event_immutable")
    else
        execute(db, "ALTER TABLE kickside_event DISABLE TRIGGER trg_kickside_event_immutable")
    end
    for _, row in ipairs(rows) do
        local body, decode_err = json.decode(tostring(row.body))
        if decode_err then error(tostring(decode_err)) end
        local scope_key = body.scope_family .. ":" .. body.scope_id
        local key_id, hash_err = canonical_json.hash({"key", tostring(row.thread_id), scope_key, body.key})
        if hash_err then error(tostring(hash_err)) end
        execute(db, [[INSERT INTO kickside_memory_keys (id, component_id, scope_key, key, cardinality)
            VALUES ($1, $2, $3, $4, $5) ON CONFLICT (component_id, scope_key, key) DO NOTHING]],
            {key_id, tostring(row.thread_id), scope_key, body.key, body.cardinality})
        body.key_id = key_id
        body.key = nil
        local encoded, encode_err = json.encode(body)
        if encode_err then error(tostring(encode_err)) end
        execute(db, "UPDATE kickside_event SET body = $1 WHERE id = $2", {encoded, row.id})
    end
    if sqlite then execute(db, trigger)
    else execute(db, "ALTER TABLE kickside_event ENABLE TRIGGER trg_kickside_event_immutable") end
end

local function upgrade(db: any, sqlite: boolean)
    rename_schema(db, sqlite)
    for _, field in ipairs({{"stores", "config"}, {"runs", "input"}, {"runs", "stats"}}) do
        local predicate = sqlite and ("json(" .. field[2] .. ") = '[]'") or (field[2] .. " = '[]'::jsonb")
        execute(db, "UPDATE kickside_memory_" .. field[1] .. " SET " .. field[2] .. " = '{}' WHERE " .. predicate)
    end
    add_column(db, sqlite, "kickside_memory_payloads", "embedding", "TEXT")
    local vector = sqlite and "vec_to_json(e.embedding)" or "e.embedding::text"
    execute(db, [[UPDATE kickside_memory_payloads AS p SET embedding = (SELECT ]] .. vector .. [[
        FROM kickside_memory_embeddings e WHERE e.component_id = p.component_id AND e.item_id = p.owner_item_id
            AND e.content_hash = p.content_hash) WHERE p.embedding IS NULL]])
    execute(db, [[CREATE TABLE IF NOT EXISTS kickside_memory_run_sources (
        component_id TEXT NOT NULL, run_id TEXT NOT NULL, event_id TEXT NOT NULL,
        PRIMARY KEY (component_id, run_id, event_id))]])
    execute(db, "CREATE INDEX IF NOT EXISTS idx_kickside_memory_run_sources_event ON kickside_memory_run_sources (component_id, event_id, run_id)")
    for _, run in ipairs(query(db, "SELECT id, component_id, input FROM kickside_memory_runs")) do
        local input, decode_err = json.decode(tostring(run.input))
        if decode_err then error(tostring(decode_err)) end
        for _, messages in ipairs({input.span or {}, input.context or {}}) do
            for _, message in ipairs(messages) do
                if type(message.id) ~= "string" or message.id == "" then error("memory source event id is required") end
                execute(db, [[INSERT INTO kickside_memory_run_sources (component_id, run_id, event_id)
                    VALUES ($1, $2, $3) ON CONFLICT (component_id, run_id, event_id) DO NOTHING]], {run.component_id, run.id, message.id})
            end
        end
    end
    add_column(db, sqlite, "kickside_memory_cursors", "owner_scope_key", "TEXT")
    if sqlite then
        execute(db, [[UPDATE kickside_memory_cursors AS c SET owner_scope_key = (
                    SELECT MIN(CASE WHEN i.scope_key LIKE 'owner:%' THEN i.scope_key END)
                    FROM json_each(COALESCE(c.pinned_ids, '[]')) AS p
                    JOIN kickside_memory_items i ON i.component_id = c.component_id AND i.id = p.value
                    HAVING COUNT(*) = json_array_length(COALESCE(c.pinned_ids, '[]'))
                        AND COUNT(DISTINCT CASE WHEN i.scope_key LIKE 'owner:%' THEN i.scope_key END) = 1
                )
                WHERE c.owner_scope_key IS NULL AND json_array_length(COALESCE(c.pinned_ids, '[]')) > 0]])
    else
        execute(db, [[WITH inferred AS (
                    SELECT c.component_id, c.host_kind, c.host_id,
                        MIN(CASE WHEN i.scope_key LIKE 'owner:%' THEN i.scope_key END) AS owner_scope_key,
                        jsonb_array_length(COALESCE(c.pinned_ids, '[]')::jsonb) AS pinned_count,
                        COUNT(i.id) AS found_count,
                        COUNT(DISTINCT CASE WHEN i.scope_key LIKE 'owner:%' THEN i.scope_key END) AS owner_count
                    FROM kickside_memory_cursors c
                    LEFT JOIN LATERAL jsonb_array_elements_text(COALESCE(c.pinned_ids, '[]')::jsonb) AS p(item_id) ON true
                    LEFT JOIN kickside_memory_items i ON i.component_id = c.component_id AND i.id = p.item_id
                    WHERE c.owner_scope_key IS NULL
                    GROUP BY c.component_id, c.host_kind, c.host_id, c.pinned_ids
                )
                UPDATE kickside_memory_cursors c SET owner_scope_key = inferred.owner_scope_key
                FROM inferred WHERE c.component_id = inferred.component_id AND c.host_kind = inferred.host_kind AND c.host_id = inferred.host_id
                    AND inferred.pinned_count > 0 AND inferred.found_count = inferred.pinned_count AND inferred.owner_count = 1]])
    end
    execute(db, [[UPDATE kickside_memory_cursors SET pinned_prompt = NULL, pinned_ids = NULL, pinned_head = NULL
        WHERE owner_scope_key IS NULL]])
    execute(db, "CREATE INDEX IF NOT EXISTS idx_kickside_memory_cursors_owner_scope ON kickside_memory_cursors (component_id, owner_scope_key)")
    add_column(db, sqlite, "kickside_memory_runs", "cycle", "TEXT")
    execute(db, [[UPDATE kickside_memory_runs SET cycle = started_at WHERE cycle IS NULL AND run_type = 'consolidate'
        AND status IN ('running', 'failed') AND started_at IS NOT NULL]])
    migrate_event_keys(db, sqlite)
    execute(db, [[UPDATE kickside_components SET impl_id = 'kickside.memory:memory_store'
        WHERE impl_id = 'kickside.memory:memory_kb']])
    if sqlite then execute(db, [[
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
    else execute(db, [=[
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
                ]=]) end
end

return require("migration").define(function()
    migration("05 memory upgrade", function()
        database("postgres", function()
            up(function(db) upgrade(db, false) end)
            down(function() error("memory upgrade migration is forward-only") end)
        end)
        database("sqlite", function()
            up(function(db) upgrade(db, true) end)
            down(function() error("memory upgrade migration is forward-only") end)
        end)
    end)
end)
