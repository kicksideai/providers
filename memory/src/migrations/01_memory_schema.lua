-- Memory storage. The ledger holds structure only; memory text and typed
-- values live in kickside_memory_payloads, committed with the event that adds
-- the item and erased on forget. kickside_memory_items is the projection of the
-- ledger with a searchable copy of each payload, so a rebuild restores
-- structure from the ledger and text from the payloads. kickside_memory_keys
-- holds each key's cardinality per scope, set by the first item of the key. kickside_memory_runs and
-- kickside_memory_cursors hold the frozen identity and progress of deferred
-- capture work.

local function run(db: any, statements: { string })
    for _, statement in ipairs(statements) do
        local _, err = db:execute(statement)
        if err then error(tostring(err)) end
    end
end

local POSTGRES = {
    [=[CREATE EXTENSION IF NOT EXISTS vector]=],
    [=[CREATE TABLE kickside_memory_stores (
        component_id text PRIMARY KEY,
        kb_type text NOT NULL,
        embedding_model text NOT NULL,
        config jsonb NOT NULL DEFAULT '{}'::jsonb,
        created_at text NOT NULL,
        updated_at text NOT NULL
    )]=],
    [=[CREATE TABLE kickside_memory_items (
        id text PRIMARY KEY,
        component_id text NOT NULL,
        claim_id text NOT NULL,
        kind text NOT NULL,
        scope_family text NOT NULL,
        scope_id text NOT NULL,
        scope_key text NOT NULL,
        key text NOT NULL,
        cardinality text NOT NULL,
        content text NOT NULL,
        value jsonb,
        content_hash text NOT NULL,
        status text NOT NULL,
        version integer NOT NULL,
        valid_at text NOT NULL,
        invalid_at text,
        recorded_at text NOT NULL,
        superseded_by text,
        conflict_group text,
        confidence real,
        source text NOT NULL,
        run_id text,
        priority integer NOT NULL DEFAULT 0,
        last_seq bigint NOT NULL,
        search_vector tsvector GENERATED ALWAYS AS (to_tsvector('simple', regexp_replace(COALESCE(content, ''), '[^[:alnum:]]+', ' ', 'g'))) STORED
    )]=],
    [=[CREATE INDEX idx_kickside_memory_items_scope ON kickside_memory_items (component_id, scope_key, kind, status)]=],
    [=[CREATE INDEX idx_kickside_memory_items_key ON kickside_memory_items (component_id, scope_key, key, status)]=],
    [=[CREATE INDEX idx_kickside_memory_items_claim ON kickside_memory_items (component_id, claim_id)]=],
    [=[CREATE INDEX idx_kickside_memory_items_conflict ON kickside_memory_items (component_id, conflict_group)]=],
    [=[CREATE INDEX idx_kickside_memory_items_successor ON kickside_memory_items (component_id, superseded_by)]=],
    [=[CREATE INDEX idx_kickside_memory_items_fts ON kickside_memory_items USING gin (search_vector)]=],
    [=[CREATE TABLE kickside_memory_payloads (
        item_id text PRIMARY KEY,
        component_id text NOT NULL,
        owner_item_id text NOT NULL,
        content text NOT NULL,
        value jsonb,
        content_hash text NOT NULL,
        created_at text NOT NULL
    )]=],
    [=[CREATE INDEX idx_kickside_memory_payloads_owner ON kickside_memory_payloads (component_id, owner_item_id)]=],
    [=[CREATE TABLE kickside_memory_keys (
        component_id text NOT NULL,
        scope_key text NOT NULL,
        key text NOT NULL,
        cardinality text NOT NULL,
        PRIMARY KEY (component_id, scope_key, key)
    )]=],
    [=[CREATE TABLE kickside_memory_provenance (
        item_id text NOT NULL,
        component_id text NOT NULL,
        host_kind text NOT NULL,
        host_id text NOT NULL,
        event_id text NOT NULL,
        recorded_at text NOT NULL,
        PRIMARY KEY (item_id, host_kind, host_id, event_id)
    )]=],
    [=[CREATE INDEX idx_kickside_memory_provenance_component ON kickside_memory_provenance (component_id)]=],
    [=[CREATE TABLE kickside_memory_embeddings (
        item_id text PRIMARY KEY,
        component_id text NOT NULL,
        embedding vector(512) NOT NULL
    )]=],
    [=[CREATE INDEX idx_kickside_memory_embeddings_component ON kickside_memory_embeddings (component_id)]=],
    [=[CREATE INDEX idx_kickside_memory_embeddings_vector ON kickside_memory_embeddings USING hnsw (embedding vector_cosine_ops)]=],
    [=[CREATE TABLE kickside_memory_cursors (
        component_id text NOT NULL,
        host_kind text NOT NULL,
        host_id text NOT NULL,
        agent_id text NOT NULL DEFAULT '',
        last_event_id text NOT NULL DEFAULT '',
        pinned_head bigint,
        pinned_prompt text,
        pinned_ids text,
        updated_at text NOT NULL,
        PRIMARY KEY (component_id, host_kind, host_id)
    )]=],
    [=[CREATE TABLE kickside_memory_runs (
        id text PRIMARY KEY,
        component_id text NOT NULL,
        run_type text NOT NULL,
        status text NOT NULL,
        job_id text,
        host_kind text,
        host_id text,
        agent_id text,
        from_event_id text,
        to_event_id text,
        input jsonb NOT NULL DEFAULT '{}'::jsonb,
        stats jsonb NOT NULL DEFAULT '{}'::jsonb,
        last_error text,
        actor_id text,
        actor_context text,
        created_at text NOT NULL,
        started_at text,
        finished_at text
    )]=],
    [=[CREATE INDEX idx_kickside_memory_runs_component ON kickside_memory_runs (component_id, run_type, created_at)]=],
}

local SQLITE = {
    [=[CREATE TABLE kickside_memory_stores (
        component_id TEXT PRIMARY KEY,
        kb_type TEXT NOT NULL,
        embedding_model TEXT NOT NULL,
        config TEXT NOT NULL DEFAULT '{}',
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
    )]=],
    [=[CREATE TABLE kickside_memory_items (
        id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL,
        claim_id TEXT NOT NULL,
        kind TEXT NOT NULL,
        scope_family TEXT NOT NULL,
        scope_id TEXT NOT NULL,
        scope_key TEXT NOT NULL,
        key TEXT NOT NULL,
        cardinality TEXT NOT NULL,
        content TEXT NOT NULL,
        value TEXT,
        content_hash TEXT NOT NULL,
        status TEXT NOT NULL,
        version INTEGER NOT NULL,
        valid_at TEXT NOT NULL,
        invalid_at TEXT,
        recorded_at TEXT NOT NULL,
        superseded_by TEXT,
        conflict_group TEXT,
        confidence REAL,
        source TEXT NOT NULL,
        run_id TEXT,
        priority INTEGER NOT NULL DEFAULT 0,
        last_seq INTEGER NOT NULL
    )]=],
    [=[CREATE INDEX idx_kickside_memory_items_scope ON kickside_memory_items (component_id, scope_key, kind, status)]=],
    [=[CREATE INDEX idx_kickside_memory_items_key ON kickside_memory_items (component_id, scope_key, key, status)]=],
    [=[CREATE INDEX idx_kickside_memory_items_claim ON kickside_memory_items (component_id, claim_id)]=],
    [=[CREATE INDEX idx_kickside_memory_items_conflict ON kickside_memory_items (component_id, conflict_group)]=],
    [=[CREATE INDEX idx_kickside_memory_items_successor ON kickside_memory_items (component_id, superseded_by)]=],
    [=[CREATE VIRTUAL TABLE kickside_memory_fts USING fts5(
        item_id UNINDEXED, content,
        tokenize = 'unicode61 remove_diacritics 2'
    )]=],
    [=[CREATE TABLE kickside_memory_payloads (
        item_id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL,
        owner_item_id TEXT NOT NULL,
        content TEXT NOT NULL,
        value TEXT,
        content_hash TEXT NOT NULL,
        created_at TEXT NOT NULL
    )]=],
    [=[CREATE INDEX idx_kickside_memory_payloads_owner ON kickside_memory_payloads (component_id, owner_item_id)]=],
    [=[CREATE TABLE kickside_memory_keys (
        component_id TEXT NOT NULL,
        scope_key TEXT NOT NULL,
        key TEXT NOT NULL,
        cardinality TEXT NOT NULL,
        PRIMARY KEY (component_id, scope_key, key)
    )]=],
    [=[CREATE TABLE kickside_memory_provenance (
        item_id TEXT NOT NULL,
        component_id TEXT NOT NULL,
        host_kind TEXT NOT NULL,
        host_id TEXT NOT NULL,
        event_id TEXT NOT NULL,
        recorded_at TEXT NOT NULL,
        PRIMARY KEY (item_id, host_kind, host_id, event_id)
    )]=],
    [=[CREATE INDEX idx_kickside_memory_provenance_component ON kickside_memory_provenance (component_id)]=],
    [=[CREATE VIRTUAL TABLE kickside_memory_embeddings USING vec0(
        item_id TEXT PRIMARY KEY,
        component_id TEXT PARTITION KEY,
        embedding float[512]
    )]=],
    [=[CREATE TABLE kickside_memory_cursors (
        component_id TEXT NOT NULL,
        host_kind TEXT NOT NULL,
        host_id TEXT NOT NULL,
        agent_id TEXT NOT NULL DEFAULT '',
        last_event_id TEXT NOT NULL DEFAULT '',
        pinned_head INTEGER,
        pinned_prompt TEXT,
        pinned_ids TEXT,
        updated_at TEXT NOT NULL,
        PRIMARY KEY (component_id, host_kind, host_id)
    )]=],
    [=[CREATE TABLE kickside_memory_runs (
        id TEXT PRIMARY KEY,
        component_id TEXT NOT NULL,
        run_type TEXT NOT NULL,
        status TEXT NOT NULL,
        job_id TEXT,
        host_kind TEXT,
        host_id TEXT,
        agent_id TEXT,
        from_event_id TEXT,
        to_event_id TEXT,
        input TEXT NOT NULL DEFAULT '{}',
        stats TEXT NOT NULL DEFAULT '{}',
        last_error TEXT,
        actor_id TEXT,
        actor_context TEXT,
        created_at TEXT NOT NULL,
        started_at TEXT,
        finished_at TEXT
    )]=],
    [=[CREATE INDEX idx_kickside_memory_runs_component ON kickside_memory_runs (component_id, run_type, created_at)]=],
}

local DROP = {
    "DROP TABLE kickside_memory_runs",
    "DROP TABLE kickside_memory_cursors",
    "DROP TABLE kickside_memory_embeddings",
    "DROP TABLE kickside_memory_provenance",
    "DROP TABLE kickside_memory_payloads",
    "DROP TABLE kickside_memory_keys",
    "DROP TABLE kickside_memory_items",
    "DROP TABLE kickside_memory_stores",
}

return require("migration").define(function()
    migration("01 memory schema", function()
        database("postgres", function()
            up(function(db) run(db, POSTGRES) end)
            down(function(db) run(db, DROP) end)
        end)
        database("sqlite", function()
            up(function(db) run(db, SQLITE) end)
            down(function(db)
                run(db, { "DROP TABLE kickside_memory_fts" })
                run(db, DROP)
            end)
        end)
    end)
end)
