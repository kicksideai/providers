local json = require("json")
local time = require("time")
local component = require("component")

local M = {}

local EVENT_CONTENT_UPSERTED = "kickside.knowledge.events:content.upserted"
local EVENT_CONTENT_DELETED = "kickside.knowledge.events:content.deleted"
local EVENT_GRAPH_CHANGED = "kickside.knowledge.events:graph.changed"

local function decode_object(value: any): { [string]: any }
    if type(value) == "table" then return value :: { [string]: any } end
    if type(value) ~= "string" or value == "" then return {} end
    local decoded, err = json.decode(value)
    if err or type(decoded) ~= "table" then return {} end
    return decoded :: { [string]: any }
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function int_delta(value: any): integer
    local n = tonumber(value)
    if not n then return 0 end
    return math.floor(n) :: integer
end

local function clamp_count(value: any): integer
    local n = tonumber(value) or 0
    n = math.floor(n)
    if n < 0 then return 0 end
    return n :: integer
end

local function add_count(value: any, delta: any): integer
    return clamp_count((tonumber(value) or 0) + int_delta(delta))
end

local function worker_config(input: any, projection: any): { [string]: any }
    local inline = type(input.worker_config) == "table" and input.worker_config or nil
    if inline then return inline :: { [string]: any } end
    local body = decode_object(type(projection) == "table" and projection.body or nil)
    local cfg = type(body.worker_config) == "table" and body.worker_config or {}
    return cfg :: { [string]: any }
end

local function target_kb_id(input: any, projection: any, events: { any }): string?
    local cfg = worker_config(input, projection)
    local ids = type(cfg.target_kb_ids) == "table" and cfg.target_kb_ids or {}
    if type(ids[1]) == "string" and ids[1] ~= "" then return ids[1] end
    for _, ev in ipairs(events) do
        local body = decode_object(type(ev) == "table" and (ev :: any).body or nil)
        local kb_id = trim(body.kb_id)
        if kb_id ~= "" then return kb_id end
    end
    return nil
end

local function apply_change(counts: any, ev: any): string?
    if type(ev) ~= "table" then return nil end
    local event_type = tostring((ev :: any).type or "")
    if event_type == EVENT_CONTENT_UPSERTED or event_type == EVENT_CONTENT_DELETED then
        counts.pending_source_count = add_count(counts.pending_source_count, 1)
        counts.status = "syncing"
        counts.last_error = ""
        return trim((ev :: any).created_at)
    end
    if event_type ~= EVENT_GRAPH_CHANGED then return nil end
    local body = decode_object((ev :: any).body)
    counts.pending_source_count = add_count(counts.pending_source_count, -int_delta(body.source_processed_delta))
    counts.document_count = add_count(counts.document_count, body.document_delta)
    counts.chunk_count = add_count(counts.chunk_count, body.chunk_delta)
    counts.summary_count = add_count(counts.summary_count, body.summary_delta)
    counts.embedding_count = add_count(counts.embedding_count, body.embedding_delta)
    counts.failed_count = add_count(counts.failed_count, body.failed_delta)
    counts.concept_count = add_count(counts.concept_count, body.concept_delta)
    local status = trim(body.status)
    if status ~= "" then counts.status = status end
    if body.last_error ~= nil then counts.last_error = tostring(body.last_error or "") end
    if body.auto_summary ~= nil then counts.auto_summary = tostring(body.auto_summary or "") end
    if body.auto_description ~= nil then counts.auto_description = tostring(body.auto_description or "") end
    return trim((ev :: any).created_at)
end

local function sync_public_meta(input: any, kb_id: string, counts: any, updated_at: string): (boolean, string?)
    local component_api = (type(input.component) == "table" and input.component) or component
    local status = trim(counts.status) ~= "" and trim(counts.status) or "ready"
    if clamp_count(counts.pending_source_count) > 0 then
        status = "syncing"
    end
    local ok, err = component_api.set_meta(kb_id, {
        status = status,
        last_error = counts.last_error ~= nil and tostring(counts.last_error or "") or "",
        document_count = clamp_count(counts.document_count),
        chunk_count = clamp_count(counts.chunk_count),
        summary_count = clamp_count(counts.summary_count),
        embedding_count = clamp_count(counts.embedding_count),
        failed_count = clamp_count(counts.failed_count),
        concept_count = counts.concept_count,
        auto_summary = counts.auto_summary ~= nil and tostring(counts.auto_summary or "") or "",
        auto_description = counts.auto_description ~= nil and tostring(counts.auto_description or "") or "",
        last_materialized_at = updated_at,
        graph_updated_at = updated_at,
    })
    if ok == true then return true, nil end
    return false, tostring(err or "component.set_meta failed")
end

function M.run(input: any): any
    input = type(input) == "table" and input or {}
    local projection = type(input.projection) == "table" and input.projection or {}
    local body: any = decode_object(projection.body)
    body.counts = type(body.counts) == "table" and body.counts or {
        status = "ready",
        last_error = "",
        document_count = 0,
        chunk_count = 0,
        summary_count = 0,
        embedding_count = 0,
        failed_count = 0,
        concept_count = 0,
        pending_source_count = 0,
        auto_summary = "",
        auto_description = "",
    }

    local events: { any } = (type(input.events) == "table" and input.events or {}) :: { any }
    local kb_id = target_kb_id(input, projection, events)
    if not kb_id then return nil, "target_kb_ids[1] is required" end

    local updated_at = trim(body.graph_updated_at)
    for _, ev in ipairs(events :: { any }) do
        local event_time = apply_change(body.counts, ev)
        if event_time and event_time ~= "" then
            updated_at = event_time
        end
    end
    if updated_at == "" then updated_at = time.now():utc():format(time.RFC3339) end
    body.graph_updated_at = updated_at

    local meta_ok, meta_err = sync_public_meta(input, kb_id, body.counts, updated_at)
    if not meta_ok then return nil, meta_err end

    local range = type(input.range) == "table" and input.range or {}
    return { body = body, last_seq = tonumber(range.to_seq) or nil }
end

return M
