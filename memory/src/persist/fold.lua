-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local db = require("memory_db")
local types = require("types")
local index = require("search_index")
local items = require("memory_items")
local payloads = require("memory_payloads")

local M = {}

local PROVENANCE_INSERT = "INSERT INTO kickside_memory_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at) "

local NULL = {}
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
        if type(ref) == "table" and (types.trim(ref.event_id) ~= "" or
            (ref.host_kind == "item" and types.trim(ref.host_id) ~= "")) then
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
    for _, name in ipairs({ "status", "superseded_by", "invalid_at", "conflict_group", "content", "value", "content_hash", "priority", "source" }) do
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

local function next_version_tx(tx: any, component_id: string, scope_key: string, key: string): (integer?, error?)
    local rows, err = tx:query(
        "SELECT MAX(version) AS version FROM kickside_memory_items WHERE component_id = $1 AND scope_key = $2 AND key = $3",
        { component_id, scope_key, key })
    if err then return nil, types.failed("memory version read failed", err) end
    return (rows and rows[1] and tonumber(rows[1].version) or 0) + 1, nil
end

local function apply_added(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any, recorded_at: string): error?
    local item_id = types.trim(body.item_id)
    if item_id == "" then return types.invalid("item.added requires item_id") end
    local existing, read_err = items.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if existing then return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at) end
    local payload, payload_err = payloads.get_tx(tx, component_id, item_id)
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
            content, payload and payloads.encode_value(payload.value) or sql.NULL, body.content_hash, status, version, body.valid_at, recorded_at,
            tonumber(body.confidence) or sql.NULL, body.source, body.run_id or sql.NULL, tonumber(body.priority) or 0, seq })
    if err then return types.failed("memory item insert failed", err) end
    if not payload then return nil end
    local _, vector_err = payloads.replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    local fts_err = set_fts_tx(tx, sqlite, item_id, content)
    if fts_err then return fts_err end
    return add_provenance_tx(tx, component_id, item_id, body.provenance, recorded_at)
end

local function apply_revised(tx: any, sqlite: boolean, component_id: string, seq: integer, body: any): error?
    local item_id = types.trim(body.item_id)
    local current, read_err = items.get_tx(tx, component_id, item_id)
    if read_err then return read_err end
    if not current or current.last_seq >= seq then return nil end
    local payload, payload_err = payloads.get_tx(tx, component_id, types.trim(body.payload_id))
    if payload_err then return payload_err end
    local fields: { [string]: any } = { content_hash = body.content_hash }
    if body.source ~= nil then fields.source = body.source end
    if body.priority ~= nil then fields.priority = math.floor(tonumber(body.priority) or 0) end
    if payload then
        fields.content = payload.content
        fields.content_hash = payload.content_hash
    end
    local update_err = set_status_tx(tx, component_id, item_id, seq, fields)
    if update_err then return update_err end
    if not payload then return nil end
    local _, vector_err = payloads.replace_embedding_tx(tx, sqlite, component_id, item_id, payload.embedding, payload.content_hash)
    if vector_err then return vector_err end
    return set_fts_tx(tx, sqlite, item_id, payload.content)
end

local function supersede_tx(tx: any, component_id: string, item_id: string, successor_id: string, seq: integer, invalid_at: string): error?
    return set_status_tx(tx, component_id, item_id, seq, {
        status = types.STATUS.SUPERSEDED, superseded_by = successor_id, invalid_at = invalid_at, conflict_group = NULL,
    })
end

-- Source ownership joins identify the retained inputs that erasure clears.
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

-- Item sequence numbers make redelivery idempotent within the fenced transaction.
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

return M
