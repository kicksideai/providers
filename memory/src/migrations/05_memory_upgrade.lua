-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local json = require("json")
local canonical_json = require("canonical_json")
local sql = require("sql")

local RETIRED_REFERENCES = {
    ["kickside.memory:knowledge_based_memory"] = "kickside.memory:memory",
    ["kickside.memory:memory_kb"] = "kickside.memory:memory_store",
    ["kickside.memory:memory_recall_tool"] = "kickside.memory.agent:search_tool",
    ["kickside.memory:lifecycle_binding"] = "kickside.memory.agent:lifecycle_binding",
    ["kickside.memory:checkpoint_binding"] = "kickside.memory.agent:checkpoint_binding",
    ["kickside.memory:runtime_lifecycle"] = "kickside.memory.agent:lifecycle",
    ["kickside.memory:runtime_checkpoint"] = "kickside.memory.agent:checkpoint",
}
local DOCUMENT_MEMORY_CONTEXT_FIELDS = {
    "kb_ids", "write_kb_id", "recall_max_chars", "recall_prompt", "checkpoint_model", "checkpoint_prompt",
    "checkpoint_temperature", "checkpoint_max_tokens", "checkpoint_source_max_chars",
}
local CANCELLED_SOURCE_REASON = "cancelled: source records do not provide author attribution"

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

local function merge_missing(target: any, source: any)
    if type(target) ~= "table" or type(source) ~= "table" then return end
    for key, value in pairs(source) do
        if target[key] == nil then target[key] = value
        else merge_missing(target[key], value) end
    end
end

local function rewrite_references(value: any): boolean
    if type(value) ~= "table" then return false end
    local changed = false
    local renamed: { any } = {}
    for key, nested in pairs(value) do
        if type(nested) == "string" and RETIRED_REFERENCES[nested] then
            value[key] = RETIRED_REFERENCES[nested]
            changed = true
        elseif rewrite_references(nested) then
            changed = true
        end
        if type(key) == "string" and RETIRED_REFERENCES[key] then
            renamed[#renamed + 1] = { retired = key, current = RETIRED_REFERENCES[key] }
        end
    end
    for _, reference in ipairs(renamed) do
        local retired = value[reference.retired]
        local current = value[reference.current]
        if current == nil then value[reference.current] = retired
        else merge_missing(current, retired) end
        value[reference.retired] = nil
        changed = true
    end
    return changed
end

local function has_document_memory_context(context: any): boolean
    local trait_contexts = type(context) == "table" and context.trait_contexts or nil
    if type(trait_contexts) ~= "table" then return false end
    for _, trait_id in ipairs({ "kickside.memory:knowledge_based_memory", "kickside.memory:memory" }) do
        local memory_context = trait_contexts[trait_id]
        if type(memory_context) == "table" then
            for _, field in ipairs(DOCUMENT_MEMORY_CONTEXT_FIELDS) do
                if memory_context[field] ~= nil then return true end
            end
        end
    end
    return false
end

local function migrate_component_references(db: any, sqlite: boolean)
    if not has_table(db, sqlite, "kickside_components") then return end
    for _, row in ipairs(query(db, "SELECT component_id, private_context FROM kickside_components WHERE private_context IS NOT NULL")) do
        local context, decode_err = json.decode(tostring(row.private_context))
        if decode_err then error(tostring(decode_err)) end
        if type(context) == "table" and not has_document_memory_context(context) then
            local changed = rewrite_references(context)
            if changed then
                local encoded, encode_err = json.encode(context)
                if encode_err then error(tostring(encode_err)) end
                execute(db, [[UPDATE kickside_components
                    SET private_context = $1, context_revision = COALESCE(context_revision, 0) + 1,
                        updated_at = ]] .. (sqlite and "strftime('%Y-%m-%dT%H:%M:%SZ', 'now')" or "to_char(now() AT TIME ZONE 'UTC', 'YYYY-MM-DD\"T\"HH24:MI:SS\"Z\"')") .. [[
                    WHERE component_id = $2]], {encoded, row.component_id})
            end
        end
    end
end

local function normalize_cursor_shape(db: any, sqlite: boolean)
    if sqlite then
        local columns = query(db, "PRAGMA table_info(kickside_memory_cursors)")
        local last_event
        for _, column in ipairs(columns) do if column.name == "last_event_id" then last_event = column; break end end
        if last_event and (tonumber(last_event.notnull) or 0) ~= 0 then
            execute(db, [[CREATE TABLE kickside_memory_cursors_next (
                component_id TEXT NOT NULL, host_kind TEXT NOT NULL, host_id TEXT NOT NULL, agent_id TEXT,
                owner_scope_key TEXT, last_event_id TEXT, pinned_head INTEGER, pinned_prompt TEXT, pinned_ids TEXT,
                updated_at TEXT NOT NULL, PRIMARY KEY (component_id, host_kind, host_id))]])
            execute(db, [[INSERT INTO kickside_memory_cursors_next
                (component_id, host_kind, host_id, agent_id, owner_scope_key, last_event_id, pinned_head, pinned_prompt, pinned_ids, updated_at)
                SELECT component_id, host_kind, host_id, NULLIF(agent_id, ''), owner_scope_key, NULLIF(last_event_id, ''),
                    pinned_head, pinned_prompt, pinned_ids, updated_at FROM kickside_memory_cursors]])
            execute(db, "DROP TABLE kickside_memory_cursors")
            execute(db, "ALTER TABLE kickside_memory_cursors_next RENAME TO kickside_memory_cursors")
        else
            execute(db, "UPDATE kickside_memory_cursors SET agent_id = NULL WHERE agent_id = ''")
            execute(db, "UPDATE kickside_memory_cursors SET last_event_id = NULL WHERE last_event_id = ''")
        end
    else
        execute(db, "ALTER TABLE kickside_memory_cursors ALTER COLUMN agent_id DROP NOT NULL")
        execute(db, "ALTER TABLE kickside_memory_cursors ALTER COLUMN agent_id DROP DEFAULT")
        execute(db, "ALTER TABLE kickside_memory_cursors ALTER COLUMN last_event_id DROP NOT NULL")
        execute(db, "ALTER TABLE kickside_memory_cursors ALTER COLUMN last_event_id DROP DEFAULT")
        execute(db, "UPDATE kickside_memory_cursors SET agent_id = NULL WHERE agent_id = ''")
        execute(db, "UPDATE kickside_memory_cursors SET last_event_id = NULL WHERE last_event_id = ''")
    end
end

local function normalize_run_shape(db: any)
    for _, field in ipairs({ "host_kind", "host_id", "agent_id", "from_event_id", "to_event_id" }) do
        execute(db, "UPDATE kickside_memory_runs SET " .. field .. " = NULL WHERE " .. field .. " = ''")
    end
    for _, run in ipairs(query(db, "SELECT id, input FROM kickside_memory_runs")) do
        local input, decode_err = json.decode(tostring(run.input))
        if decode_err then error(tostring(decode_err)) end
        if type(input) == "table" and input.host ~= nil then
            input.host = nil
            local encoded, encode_err = json.encode(input)
            if encode_err then error(tostring(encode_err)) end
            execute(db, "UPDATE kickside_memory_runs SET input = $1 WHERE id = $2", {encoded, run.id})
        end
    end
end

local function needs_cancel(input: any): boolean
    if type(input) ~= "table" or type(input.span) ~= "table" or #input.span == 0 then return false end
    for _, message in ipairs(input.span) do
        if type(message) ~= "table" or type(message.author) ~= "table" then return true end
    end
    return false
end

local function cancel_published_derives(db: any, sqlite: boolean)
    local cancelled: { any } = {}
    for _, run in ipairs(query(db, [[SELECT id, component_id, job_id, status, host_kind, host_id, from_event_id, to_event_id, input
        FROM kickside_memory_runs WHERE run_type = 'derive' AND status IN ('scheduled', 'running', 'failed')]])) do
        local input, decode_err = json.decode(tostring(run.input))
        if decode_err then error(tostring(decode_err)) end
        if needs_cancel(input) then
            execute(db, [[UPDATE kickside_memory_runs SET status = 'cancelled', last_error = $1,
                finished_at = COALESCE(finished_at, created_at) WHERE id = $2]], {CANCELLED_SOURCE_REASON, run.id})
            cancelled[#cancelled + 1] = run
        end
    end
    if has_table(db, sqlite, "kickside_job") then
        for _, run in ipairs(cancelled) do
            if type(run.job_id) == "string" and run.job_id ~= "" then
                execute(db, [[UPDATE kickside_job SET status = 'cancelled', last_error = $1,
                    finished_at = COALESCE(finished_at, created_at) WHERE id = $2 AND status IN ('pending', 'running')]],
                    {CANCELLED_SOURCE_REASON, run.job_id})
            end
        end
    end
    local predecessors: { [string]: { [string]: { from_event_id: string? } } } = {}
    for _, run in ipairs(cancelled) do
        if type(run.host_kind) == "string" and run.host_kind ~= "" and type(run.host_id) == "string" and run.host_id ~= ""
            and type(run.to_event_id) == "string" and run.to_event_id ~= "" then
            local key = tostring(run.component_id) .. "\0" .. run.host_kind .. "\0" .. run.host_id
            predecessors[key] = predecessors[key] or {}
            predecessors[key][run.to_event_id] = { from_event_id = run.from_event_id }
        end
    end
    for _, cursor in ipairs(query(db, "SELECT component_id, host_kind, host_id, last_event_id FROM kickside_memory_cursors")) do
        local key = tostring(cursor.component_id) .. "\0" .. tostring(cursor.host_kind) .. "\0" .. tostring(cursor.host_id)
        local chain = predecessors[key]
        local position = cursor.last_event_id
        local rewound = false
        while chain and position ~= nil and chain[position] ~= nil do
            position = chain[position].from_event_id
            rewound = true
        end
        if rewound then
            execute(db, [[UPDATE kickside_memory_cursors SET last_event_id = $1 WHERE component_id = $2 AND host_kind = $3 AND host_id = $4]],
                {position or sql.NULL, cursor.component_id, cursor.host_kind, cursor.host_id})
        end
    end
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
    execute(db, [[CREATE INDEX IF NOT EXISTS idx_kickside_memory_provenance_host
        ON kickside_memory_provenance (component_id, item_id, event_id, host_kind, host_id)]])
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
    normalize_run_shape(db)
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
    normalize_cursor_shape(db, sqlite)
    execute(db, "CREATE INDEX IF NOT EXISTS idx_kickside_memory_cursors_owner_scope ON kickside_memory_cursors (component_id, owner_scope_key)")
    add_column(db, sqlite, "kickside_memory_runs", "cycle", "TEXT")
    execute(db, [[UPDATE kickside_memory_runs SET cycle = started_at WHERE cycle IS NULL AND run_type = 'consolidate'
        AND status IN ('running', 'failed') AND started_at IS NOT NULL]])
    migrate_event_keys(db, sqlite)
    execute(db, [[UPDATE kickside_components SET impl_id = 'kickside.memory:memory_store'
        WHERE impl_id = 'kickside.memory:memory_kb']])
    migrate_component_references(db, sqlite)
    cancel_published_derives(db, sqlite)
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
