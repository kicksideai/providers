-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Typed memory items: staged payloads, the fold of ledger events into the read
-- model, the reads the engine, agent surfaces and API share, and hybrid search
-- through the shared search index.
--
-- The ledger carries structure only. A writer stores each new item's text,
-- typed value and vector, and appends the event that adds it, in one
-- transaction; the fold copies the payload into the searchable item row.
-- Forgetting an item erases its payloads, vector, full-text row, provenance and
-- every captured span that held it.

local sql = require("sql")
local json = require("json")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")

local M = {}

-- Marks a column that an event clears.
local NULL = {}

local COLUMNS = {
    "component_id", "claim_id", "kind", "scope_family", "scope_id", "scope_key", "key", "cardinality", "content", "value",
    "content_hash", "status", "version", "valid_at", "invalid_at", "recorded_at", "superseded_by", "conflict_group",
    "confidence", "source", "run_id", "priority", "last_seq",
}

local SEARCH_SPEC = {
    vectors = "kickside_memory_embeddings",
    vector_key = "item_id",
    rows = "kickside_memory_items",
    row_key = "id",
    partition = "component_id",
    columns = COLUMNS,
    fts = "kickside_memory_fts",
    fts_key = "item_id",
    tsvector = "search_vector",
}

local PROVENANCE_INSERT = "INSERT INTO kickside_memory_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at) "

local SELECT = "SELECT id, " .. table.concat(COLUMNS, ", ") .. " FROM kickside_memory_items"

local function decode(row: any): any
    row.value = types.decode_json(row.value)
    row.version = tonumber(row.version) or 0
    row.priority = tonumber(row.priority) or 0
    row.last_seq = tonumber(row.last_seq) or 0
    if row.confidence ~= nil then row.confidence = tonumber(row.confidence) end
    return row
end

local function decode_all(rows: any): { any }
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do out[#out + 1] = decode(row) end
    return out
end

local function encoded(value: any): any
    if value == nil then return sql.NULL end
    return json.encode(value)
end

function M.get_tx(tx: any, component_id: string, item_id: string): (any?, error?)
    local rows, err = tx:query(SELECT .. " WHERE component_id = $1 AND id = $2", { component_id, item_id })
    if err then return nil, types.failed("memory item read failed", err) end
    if not rows or #rows == 0 then return nil, nil end
    return decode(rows[1]), nil
end

local function set_fts_tx(tx: any, sqlite: boolean, item_id: string, content: string?): error?
    if not sqlite then return nil end
    local _, del_err = tx:execute("DELETE FROM kickside_memory_fts WHERE item_id = $1", { item_id })
    if del_err then return types.failed("memory full-text delete failed", del_err) end
    if content and content ~= "" then
        local _, ins_err = tx:execute("INSERT INTO kickside_memory_fts (item_id, content) VALUES ($1, $2)", { item_id, content })
        if ins_err then return types.failed("memory full-text insert failed", ins_err) end
    end
    return nil
end

local function add_provenance_tx(tx: any, component_id: string, item_id: string, refs: any, recorded_at: string): error?
    for _, ref in ipairs(type(refs) == "table" and refs or {}) do
        if type(ref) == "table" and types.trim(ref.event_id) ~= "" then
            local _, err = tx:execute(
                PROVENANCE_INSERT .. "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING",
                { item_id, component_id, types.trim(ref.host_kind), types.trim(ref.host_id), types.trim(ref.event_id), recorded_at })
            if err then return types.failed("memory provenance insert failed", err) end
        end
    end
    return nil
end

local function set_status_tx(tx: any, component_id: string, item_id: string, seq: integer, fields: { [string]: any }): error?
    local sets: { string } = {}
    local params: { any } = {}
    for _, name in ipairs({ "status", "superseded_by", "invalid_at", "conflict_group", "content", "value", "content_hash", "priority" }) do
        if fields[name] == NULL then
            sets[#sets + 1] = name .. " = NULL"
        elseif fields[name] ~= nil then
            params[#params + 1] = fields[name]
            sets[#sets + 1] = name .. " = $" .. #params
        end
    end
    params[#params + 1] = seq
    sets[#sets + 1] = "last_seq = $" .. #params
    params[#params + 1] = component_id
    params[#params + 1] = item_id
    params[#params + 1] = seq
    local _, err = tx:execute("UPDATE kickside_memory_items SET " .. table.concat(sets, ", ") ..
        " WHERE component_id = $" .. (#params - 2) .. " AND id = $" .. (#params - 1) .. " AND last_seq < $" .. #params, params)
    if err then return types.failed("memory item update failed", err) end
    return nil
end

local function payload_tx(tx: any, component_id: string, payload_id: string): (any?, error?)
    local rows, err = tx:query("SELECT content, value, content_hash, embedding FROM kickside_memory_payloads WHERE component_id = $1 AND item_id = $2",
        { component_id, payload_id })
    if err then return nil, types.failed("memory payload read failed", err) end
    if not rows or #rows == 0 then return nil, nil end
    rows[1].value = types.decode_json(rows[1].value)
    return rows[1], nil
end

local function next_version_tx(tx: any, component_id: string, scope_key: string, key: string): (integer?, error?)
    local rows, err = tx:query(
        "SELECT MAX(version) AS version FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND key = $3",
        { component_id, scope_key, key })
    if err then return nil, types.failed("memory version read failed", err) end
    return (rows and rows[1] and tonumber(rows[1].version) or 0) + 1, nil
end

-- Folding and re-embedding replace vectors under the accepted item's lock.
local function replace_embedding_tx(tx: any, sqlite: boolean, component_id: string, item_id: string, embedding: string?, content_hash: string): (boolean?, error?)
    local rows, read_err = tx:query("SELECT status, content_hash FROM kickside_memory_items WHERE component_id = $1 AND id = $2" ..
        (sqlite and "" or " FOR UPDATE"), { component_id, item_id })
    if read_err then return nil, types.failed("memory embedding snapshot read failed", read_err) end
    if not rows or not rows[1] or rows[1].status == types.STATUS.FORGOTTEN or rows[1].content_hash ~= content_hash then return false, nil end
    local _, payload_err = tx:execute("UPDATE kickside_memory_payloads SET embedding = $1 WHERE component_id = $2 AND owner_item_id = $3 AND content_hash = $4",
        { embedding or sql.NULL, component_id, item_id, content_hash })
    if payload_err then return nil, types.failed("memory embedding payload update failed", payload_err) end
    local _, del_err = tx:execute("DELETE FROM kickside_memory_embeddings WHERE component_id = $1 AND item_id = $2", { component_id, item_id })
    if del_err then return nil, types.failed("memory vector delete failed", del_err) end
    if embedding then
        local err = index.insert_rows_tx(tx, "kickside_memory_embeddings", { "item_id", "component_id", "embedding", "content_hash" },
            { { item_id, component_id, embedding, content_hash } })
        if err then return nil, types.failed("memory vector insert failed", err) end
    end
    return true, nil
end

-- An added item takes its text and value from the payload staged under its
-- id; an item whose payload was erased before the fold lands erased.
local function apply_added(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any, recorded_at: string): error?
    local item_id = types.trim(body.item_id)
    if item_id == "" then return types.invalid("item.added requires item_id") end
    local existing, read_err = M.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if existing then return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at) end
    local payload, payload_err = payload_tx(tx, component_id, item_id)
    if payload_err then return payload_err end
    local scope_key = types.scope_key(body.scope_family, body.scope_id)
    local keys, key_err = tx:query("SELECT key FROM kickside_memory_keys WHERE component_id = $1 AND id = $2", { component_id, body.key_id })
    if key_err then return types.failed("memory key read failed", key_err) end
    if not keys or not keys[1] then return types.internal("memory item has no topic key") end
    local key = keys[1].key
    local version, version_err = next_version_tx(tx, component_id, scope_key, key)
    if version_err then return version_err end
    local status = payload and types.STATUS.CURRENT or types.STATUS.FORGOTTEN
    local content = payload and payload.content or ""
    local _, err = tx:execute(
        "INSERT INTO kickside_memory_items (id, component_id, claim_id, kind, scope_family, scope_id, scope_key, key, cardinality, " ..
        "content, value, content_hash, status, version, valid_at, recorded_at, confidence, source, run_id, priority, last_seq) " ..
        "VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21)",
        { item_id, component_id, body.claim_id, body.kind, body.scope_family, body.scope_id, scope_key, key, body.cardinality,
            content, payload and encoded(payload.value) or sql.NULL, body.content_hash, status, version, body.valid_at, recorded_at,
            tonumber(body.confidence) or sql.NULL, body.source, body.run_id or sql.NULL, tonumber(body.priority) or 0, seq })
    if err then return types.failed("memory item insert failed", err) end
    if not payload then return nil end
    local _, vector_err = replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    local fts_err = set_fts_tx(tx, sqlite, item_id, content)
    if fts_err then return fts_err end
    return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
end

-- A revision replaces the presentation of an item (its text and priority)
-- with the payload stored under the revision's payload id; both payloads stay
-- until the item is forgotten, so a rebuild replays the same text.
local function apply_revised(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any): error?
    local item_id = types.trim(body.item_id)
    local current, read_err = M.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if not current or current.last_seq >= seq then return nil end
    local payload, payload_err = payload_tx(tx, component_id, types.trim(body.payload_id))
    if payload_err then return payload_err end
    local fields: { [string]: any } = { content_hash = body.content_hash }
    if body.priority ~= nil then fields.priority = math.floor(tonumber(body.priority) or 0) end
    if payload then
        fields.content = payload.content
        fields.content_hash = payload.content_hash
    end
    local update_err = set_status_tx(tx, component_id, item_id, seq, fields)
    if update_err then return update_err end
    if not payload then return nil end
    local _, vector_err = replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    return set_fts_tx(tx, sqlite, item_id, payload.content)
end

local function supersede_tx(tx: any, component_id: string, item_id: string, successor_id: string, seq: integer, invalid_at: string): error?
    return set_status_tx(tx, component_id, item_id, seq, {
        status = types.STATUS.SUPERSEDED, superseded_by = successor_id, invalid_at = invalid_at, conflict_group = NULL,
    })
end

-- Source events identify retained inputs without inspecting memory text or values.
local function scrub_runs_tx(tx: any, component_id: string, forgotten: { string }): error?
    for first = 1, #forgotten, 200 do
        local params: { any } = { component_id }
        for i = first, math.min(first + 199, #forgotten) do params[#params + 1] = forgotten[i] end
        local ids = index.placeholders(#params - 1, 2)
        local _, err = tx:execute("UPDATE kickside_memory_runs SET input = '{}' WHERE component_id = $1 AND (" ..
            "id IN (SELECT run_id FROM kickside_memory_items WHERE component_id = $1 AND id IN (" .. ids .. ")) OR " ..
            "id IN (SELECT s.run_id FROM kickside_memory_run_sources s JOIN kickside_memory_provenance p " ..
            "ON p.component_id = s.component_id AND p.event_id = s.event_id WHERE p.component_id = $1 AND p.item_id IN (" .. ids .. ")))", params)
        if err then return types.failed("memory source input erase failed", err) end
    end
    return nil
end

local function invalidate_pins_tx(tx: any, component_id: string, item_id: string?): error?
    local statement = "UPDATE kickside_memory_cursors SET pinned_prompt = NULL, pinned_ids = NULL, pinned_head = NULL WHERE component_id = $1"
    local params: { any } = { component_id }
    if item_id then statement = statement .. " AND pinned_ids LIKE $2"; params[2] = '%"' .. item_id .. '"%' end
    local _, err = tx:execute(statement, params)
    if err then return types.failed("memory pin invalidation failed", err) end
    return nil
end

-- Erases a forgotten item: its payload and vector, full-text row, provenance,
-- the captured spans that stated it, and every pinned prompt that included it.
local function apply_forgotten(tx: any, sqlite: boolean, component_id: string, seq: integer, item_id: string, recorded_at: string): error?
    for _, statement in ipairs({
        "DELETE FROM kickside_memory_payloads WHERE component_id = $1 AND owner_item_id = $2",
        "DELETE FROM kickside_memory_embeddings WHERE component_id = $1 AND item_id = $2",
        "DELETE FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2",
    }) do
        local _, err = tx:execute(statement, { component_id, item_id })
        if err then return types.failed("memory erase failed", err) end
    end
    local fts_err = set_fts_tx(tx, sqlite, item_id, nil)
    if fts_err then return fts_err end
    local pin_err = invalidate_pins_tx(tx, component_id, item_id)
    if pin_err then return pin_err end
    return set_status_tx(tx, component_id, item_id, seq, {
        status = types.STATUS.FORGOTTEN, invalid_at = recorded_at, content = "", value = NULL, conflict_group = NULL,
    })
end

local function apply_event(tx: any, sqlite: boolean, component_id: string, event: any): error?
    local seq = math.floor(tonumber(event.seq) or 0) :: integer
    local body = type(event.body) == "table" and event.body or {}
    local recorded_at = types.utc(event.created_at) or types.now()
    local kind = event.type
    if kind == types.EVENT.ITEM_ADDED then
        return apply_added(tx, sqlite, component_id, seq, body, recorded_at)
    elseif kind == types.EVENT.ITEM_REVISED then
        return apply_revised(tx, sqlite, component_id, seq, body)
    elseif kind == types.EVENT.ITEM_SUPERSEDED then
        return supersede_tx(tx, component_id, types.trim(body.item_id), types.trim(body.by), seq, body.invalid_at or recorded_at)
    elseif kind == types.EVENT.ITEM_MERGED then
        local into = types.trim(body.into)
        for _, item_id in ipairs(type(body.item_ids) == "table" and body.item_ids or {}) do
            local _, copy_err = tx:execute(
                PROVENANCE_INSERT .. "SELECT $1, component_id, host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance " ..
                "WHERE component_id = $2 AND item_id = $3 ON CONFLICT DO NOTHING", { into, component_id, item_id })
            if copy_err then return types.failed("memory provenance merge failed", copy_err) end
            local err = supersede_tx(tx, component_id, item_id, into, seq, recorded_at)
            if err then return err end
        end
        return nil
    elseif kind == types.EVENT.ITEM_CONFLICTED then
        for _, item_id in ipairs(type(body.item_ids) == "table" and body.item_ids or {}) do
            local err = set_status_tx(tx, component_id, item_id, seq, { status = types.STATUS.CONFLICT, conflict_group = body.group_id })
            if err then return err end
        end
        return nil
    elseif kind == types.EVENT.ITEM_ARCHIVED then
        local pin_err = invalidate_pins_tx(tx, component_id, types.trim(body.item_id))
        if pin_err then return pin_err end
        return set_status_tx(tx, component_id, types.trim(body.item_id), seq, {
            status = types.STATUS.ARCHIVED, invalid_at = recorded_at, conflict_group = NULL,
        })
    elseif kind == types.EVENT.ITEM_RESTORED then
        local pin_err = invalidate_pins_tx(tx, component_id, nil)
        if pin_err then return pin_err end
        return set_status_tx(tx, component_id, types.trim(body.item_id), seq, {
            status = types.STATUS.CURRENT, invalid_at = NULL, superseded_by = NULL, conflict_group = NULL,
        })
    elseif kind == types.EVENT.ITEM_FORGOTTEN then
        return apply_forgotten(tx, sqlite, component_id, seq, types.trim(body.item_id), recorded_at)
    elseif kind == types.EVENT.PROVENANCE_ADDED then
        return add_provenance_tx(tx, component_id, types.trim(body.item_id), { body }, recorded_at)
    elseif kind == types.EVENT.CAPTURE_ADVANCED then
        -- The successful derive consumes its span; event sequence orders replay.
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_cursors (component_id, host_kind, host_id, agent_id, last_event_id, updated_at) " ..
            "VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT (component_id, host_kind, host_id) DO UPDATE SET agent_id = excluded.agent_id, last_event_id = excluded.last_event_id, updated_at = excluded.updated_at " ..
            "WHERE kickside_memory_cursors.last_event_id = $7",
            { component_id, types.trim(body.host_kind), types.trim(body.host_id), types.trim(body.agent_id), types.trim(body.last_event_id), recorded_at, types.trim(body.from_event_id) })
        if err then return types.failed("memory cursor fold failed", err) end
        return nil
    end
    return nil
end

-- Folds ledger events into the read model in one fenced transaction. Each
-- item carries the sequence of the last event applied to it, so a redelivered
-- batch changes nothing.
function M.fold(component_id: string, events: { any }): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        local forgotten: { string } = {}
        for _, event in ipairs(events) do
            if event.type == types.EVENT.ITEM_FORGOTTEN then forgotten[#forgotten + 1] = types.trim(event.body.item_id) end
        end
        local scrub_err = scrub_runs_tx(tx, component_id, forgotten)
        if scrub_err then return nil, scrub_err end
        for _, event in ipairs(events) do
            local err = apply_event(tx, sqlite, component_id, event)
            if err then return nil, err end
        end
        return true, nil
    end)
end

type Staged = {
    payload_id: string,
    owner_item_id: string,
    content: string,
    value: any,
    content_hash: string,
    vector: { number }?,
    key_id: string?,
    scope_key: string?,
    key: string?,
    cardinality: string?,
}

-- Stages immutable payloads in the transaction that appends their events.
function M.stage_tx(tx: any, component_id: string, staged: { Staged }): error?
    for _, entry in ipairs(staged) do
        if entry.key_id then
            local _, key_err = tx:execute("INSERT INTO kickside_memory_keys (id, component_id, scope_key, key, cardinality) VALUES ($1, $2, $3, $4, $5) ON CONFLICT (component_id, scope_key, key) DO NOTHING",
                { entry.key_id, component_id, entry.scope_key, entry.key, entry.cardinality })
            if key_err then return types.failed("memory key stage failed", key_err) end
        end
        local _, err = tx:execute(
            "INSERT INTO kickside_memory_payloads (item_id, component_id, owner_item_id, content, value, content_hash, embedding, created_at) " ..
            "VALUES ($1, $2, $3, $4, $5, $6, $7, $8) ON CONFLICT (item_id) DO NOTHING",
            { entry.payload_id, component_id, entry.owner_item_id, entry.content, encoded(entry.value), entry.content_hash, entry.vector and index.vector_literal(entry.vector) or sql.NULL, types.now() })
        if err then return types.failed("memory payload stage failed", err) end
    end
    return nil
end

function M.get(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        return M.get_tx(conn, component_id, item_id)
    end)
end

type ListFilter = {
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    scope_family: string?,
    key: string?,
    claim_ids: { string }?,
    conflict_groups: { string }?,
    limit: integer?,
    offset: integer?,
}

function M.list(component_id: string, filter: ListFilter): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local where: { string } = { "component_id = $1" }
        local params: { any } = { component_id }
        local function add_in(column: string, values: { string }?)
            if values and #values > 0 then
                where[#where + 1] = column .. " IN (" .. index.placeholders(#values, #params + 1) .. ")"
                for _, v in ipairs(values) do params[#params + 1] = v end
            end
        end
        local function add_eq(column: string, value: string?)
            if value and value ~= "" then
                params[#params + 1] = value
                where[#where + 1] = column .. " = $" .. #params
            end
        end
        add_in("kind", filter.kinds)
        add_in("status", filter.statuses)
        add_in("scope_key", filter.scope_keys)
        add_eq("scope_family", filter.scope_family)
        add_eq("key", filter.key)
        add_in("claim_id", filter.claim_ids)
        add_in("conflict_group", filter.conflict_groups)
        params[#params + 1] = filter.limit or 100
        params[#params + 1] = filter.offset or 0
        local rows, err = conn:query(SELECT .. " WHERE " .. table.concat(where, " AND ") ..
            " ORDER BY kind, priority DESC, key, version DESC, id LIMIT $" .. (#params - 1) .. " OFFSET $" .. #params, params)
        if err then return nil, types.failed("memory item list failed", err) end
        return decode_all(rows), nil
    end)
end

-- Complete reads for state transitions; public pages retain their limits.
function M.all(component_id: string, filter: ListFilter): (any?, error?)
    local out: { any } = {}
    local page_filter: any = {}
    for k, v in pairs(filter) do page_filter[k] = v end
    page_filter.limit = 200
    page_filter.offset = 0
    while true do
        local page, err = M.list(component_id, page_filter)
        if err then return nil, err end
        for _, row in ipairs(page) do out[#out + 1] = row end
        if #page < page_filter.limit then return out, nil end
        page_filter.offset = page_filter.offset + #page
    end
end

function M.key_cardinality(component_id: string, scope_key: string, key: string): (string?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query("SELECT cardinality FROM kickside_memory_keys WHERE component_id = $1 AND scope_key = $2 AND key = $3",
            { component_id, scope_key, key })
        if err then return nil, types.failed("memory key cardinality read failed", err) end
        return rows and rows[1] and rows[1].cardinality or nil, nil
    end)
end

function M.count_current(tx: any, component_id: string, scope_key: string, key: string): (number?, error?)
    local rows, err = tx:query("SELECT COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND key = $3 AND status = $4",
        { component_id, scope_key, key, types.STATUS.CURRENT })
    if err then return nil, types.failed("memory current count failed", err) end
    return tonumber(rows[1].n), nil
end

-- Same claims and explicit supersession edges form a lineage, independently
-- of other values sharing a multi-valued key.
function M.lineage(component_id: string, item: any): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query("WITH RECURSIVE lineage(claim_id) AS (SELECT claim_id FROM kickside_memory_items WHERE component_id = $1 AND id = $2 " ..
            "UNION SELECT n.claim_id FROM lineage l JOIN kickside_memory_items p ON p.component_id = $1 AND p.claim_id = l.claim_id " ..
            "JOIN kickside_memory_items n ON (n.component_id = $1 AND n.superseded_by = p.id) OR " ..
            "(n.component_id = $1 AND n.id = p.superseded_by)) " ..
            SELECT .. " WHERE component_id = $1 AND scope_key = $3 AND claim_id IN (SELECT claim_id FROM lineage) ORDER BY id",
            { component_id, item.id, item.scope_key })
        if err then return nil, types.failed("memory lineage read failed", err) end
        return decode_all(rows), nil
    end)
end

-- Distinct { kind, key, cardinality } of the live items of a scope, ordered.
function M.keys(component_id: string, scope_key: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT DISTINCT kind, key, cardinality, content, value FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND status IN ($3, $4) " ..
            "ORDER BY kind, key LIMIT $5",
            { component_id, scope_key, types.STATUS.CURRENT, types.STATUS.CONFLICT, limit })
        if err then return nil, types.failed("memory key read failed", err) end
        for _, row in ipairs(rows or {}) do row.value = types.decode_json(row.value) end
        return rows or {}, nil
    end)
end

function M.topics(component_id: string, family: string, kind: string, limit: integer, offset: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local params: { any } = { types.STATUS.CURRENT, component_id }
        local where = "component_id = $2"
        for _, filter in ipairs({ { "scope_family", family }, { "kind", kind } }) do
            if filter[2] ~= "" then
                params[#params + 1] = filter[2]
                where = where .. " AND " .. filter[1] .. " = $" .. #params
            end
        end
        params[#params + 1] = limit
        params[#params + 1] = offset
        local rows, err = conn:query("SELECT key, cardinality, SUM(CASE WHEN status = $1 THEN 1 ELSE 0 END) AS current_count " ..
            "FROM kickside_memory_items WHERE " .. where .. " GROUP BY key, cardinality ORDER BY key, cardinality LIMIT $" .. (#params - 1) .. " OFFSET $" .. #params, params)
        if err then return nil, types.failed("memory topic read failed", err) end
        for _, row in ipairs(rows or {}) do row.current_count = tonumber(row.current_count) or 0 end
        return rows or {}, nil
    end)
end

-- One page of conflict group ids, ordered, and whether more follow.
function M.conflict_groups(component_id: string, offset: integer, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT DISTINCT conflict_group FROM kickside_memory_items WHERE component_id = $1 AND status = $2 AND conflict_group IS NOT NULL " ..
            "ORDER BY conflict_group LIMIT $3 OFFSET $4",
            { component_id, types.STATUS.CONFLICT, limit + 1, offset })
        if err then return nil, types.failed("memory conflict group read failed", err) end
        local groups: { string } = {}
        for i = 1, math.min(limit, #(rows or {})) do groups[i] = tostring(rows[i].conflict_group) end
        return { groups = groups, more = #(rows or {}) > limit }, nil
    end)
end

-- Every current member of the given conflict groups, optionally limited to
-- scopes the caller is authorized to read.
function M.group_members(component_id: string, groups: { string }, scope_keys: { string }?): (any?, error?)
    if #groups == 0 then return {}, nil end
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local params: { any } = { component_id, types.STATUS.CONFLICT }
        for _, group in ipairs(groups) do params[#params + 1] = group end
        local where = " WHERE component_id = $1 AND status = $2 AND conflict_group IN (" .. index.placeholders(#groups, 3) .. ")"
        if scope_keys and #scope_keys > 0 then
            where = where .. " AND scope_key IN (" .. index.placeholders(#scope_keys, #params + 1) .. ")"
            for _, scope_key in ipairs(scope_keys) do params[#params + 1] = scope_key end
        end
        local rows, err = conn:query(SELECT .. where .. " ORDER BY conflict_group, id", params)
        if err then return nil, types.failed("memory conflict member read failed", err) end
        return decode_all(rows), nil
    end)
end

function M.provenance(component_id: string, item_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT host_kind, host_id, event_id, recorded_at FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 ORDER BY recorded_at, event_id",
            { component_id, item_id })
        if err then return nil, types.failed("memory provenance read failed", err) end
        return rows or {}, nil
    end)
end

function M.has_provenance(component_id: string, item_id: string, ref: any): (boolean?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT 1 AS found FROM kickside_memory_provenance WHERE component_id = $1 AND item_id = $2 AND host_kind = $3 AND host_id = $4 AND event_id = $5",
            { component_id, item_id, ref.host_kind, ref.host_id, ref.event_id })
        if err then return nil, types.failed("memory provenance read failed", err) end
        return rows ~= nil and #rows > 0, nil
    end)
end

function M.counts(component_id: string): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT status, COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1 GROUP BY status", { component_id })
        if err then return nil, types.failed("memory counts read failed", err) end
        local counts = { current = 0, superseded = 0, conflict = 0, archived = 0, forgotten = 0, total = 0 }
        for _, row in ipairs(rows or {}) do
            local n = tonumber(row.n) or 0
            counts[tostring(row.status)] = n
            counts.total = counts.total + n
        end
        local groups, group_err = conn:query(
            "SELECT COUNT(DISTINCT conflict_group) AS n FROM kickside_memory_items WHERE component_id = $1 AND status = $2",
            { component_id, types.STATUS.CONFLICT })
        if group_err then return nil, types.failed("memory conflict count failed", group_err) end
        counts.conflict_groups = groups and groups[1] and tonumber(groups[1].n) or 0
        return counts, nil
    end)
end

function M.set_embedding(component_id: string, item_id: string, vector: { number }, content_hash: string): (any?, error?)
    return db.write(component_id, function(tx: any, sqlite: boolean): (any, error?)
        return replace_embedding_tx(tx, sqlite, component_id, item_id, index.vector_literal(vector), content_hash)
    end)
end

type SearchFilter = {
    group_by: string?,
    kinds: { string }?,
    statuses: { string }?,
    scope_keys: { string }?,
    query_text: string?,
    limit: integer?,
}

-- Hybrid search over items of one memory: vector neighbors fused with
-- full-text matches, constrained by kind, status and scope.
function M.search(component_id: string, vector: { number }, filter: SearchFilter): (any?, error?)
    local filters: { any } = {}
    if filter.kinds and #filter.kinds > 0 then filters[#filters + 1] = { column = "kind", values = filter.kinds } end
    if filter.statuses and #filter.statuses > 0 then filters[#filters + 1] = { column = "status", values = filter.statuses } end
    if filter.scope_keys and #filter.scope_keys > 0 then filters[#filters + 1] = { column = "scope_key", values = filter.scope_keys } end
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = index.search(conn, SEARCH_SPEC, vector, {
            partition = component_id, limit = filter.limit or 10, filters = filters, query_text = filter.query_text, group_by = filter.group_by,
        })
        if err then return nil, types.failed("memory search failed", err) end
        return decode_all(rows), nil
    end)
end

-- Every item of the memory, paged by id, for re-embedding.
function M.page_for_embedding(component_id: string, after_id: string, limit: integer): (any?, error?)
    return db.read(function(conn: any, _sqlite: boolean): (any, error?)
        local rows, err = conn:query(
            "SELECT id, content, content_hash FROM kickside_memory_items WHERE component_id = $1 AND id > $2 AND status <> $3 ORDER BY id LIMIT $4",
            { component_id, after_id, types.STATUS.FORGOTTEN, limit })
        if err then return nil, types.failed("memory embedding page read failed", err) end
        return rows or {}, nil
    end)
end

return M
