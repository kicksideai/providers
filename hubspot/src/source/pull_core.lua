local ctx = require("ctx")
local config_helper = require("config")
local data_error = require("data_error")
local transport = require("transport")
local associations = require("associations")
local hydration = require("hydration")
local item_builder = require("item_builder")
local labels = require("labels")
local rows_helper = require("pull_core_rows")
local archived_pull = require("pull_core_archived")

local M = {}

type Opts = {
    object_type: string?,
}

type Deps = {
    transport: unknown,
    component_id: string?,
}

type Properties = { [string]: unknown }
type Row = {
    id: unknown, properties: Properties?, createdAt: unknown, updatedAt: unknown,
    archived: boolean?,
}
-- Active scans page by keyset, never by HubSpot's opaque `after` cursor:
-- search results with equal sort values have no stable order across pages,
-- so a watermark tie group wider than one page leaks rows through `after`.
--   tie_ts / tie_last_id  draining the rows at watermark tie_ts by hs_object_id
--   resume_ts             the watermark a drained group ended on; the scan
--                         resumes strictly after it
type Cursor = {
    phase: string?, after: string?, active_hw: string?,
    active_hw_ids: { string }?, archived_hw: string?,
    tie_ts: string?, tie_last_id: string?, resume_ts: string?,
    connection_id: string?, object_type: string?,
}
type Config = {
    connection_id: string?, object_type: string?, backfill_since: string?,
}
type PullRequest = { config: unknown, cursor: unknown, limit: number?, component_id: string? }
type PullItem = item_builder.Item
type Coverage = { mode: string }
type Key = { item_key: string, dedup_key: string }
type PullResult = {
    success: boolean,
    items: { PullItem }?,
    keys: { Key }?,
    next_cursor: Cursor?,
    has_more: boolean?,
    coverage: Coverage?,
    retry_after_ms: number?,
    error: data_error.DataError?,
}
type TransportResult = { success: boolean?, data: unknown?, error: unknown?, status_code: number? }
type PullError = config_helper.ConfigError | TransportResult
type SearchBody = {
    limit: number, properties: { string }, sorts: { Properties },
    after: string?, filterGroups: { Properties }?,
}
type Connection = { component_id: unknown }
type Transport = {
    connect: fun(string?): (Connection?, unknown?),
    watermark_value: fun(unknown): string?,
    search_objects: fun(Connection, string, SearchBody): (TransportResult?, unknown?),
    search_incremental: fun(Connection, string, { string }, string?, number, string?, string): (TransportResult?, unknown?),
    list_objects: fun(Connection, string, Properties): (TransportResult?, unknown?),
    list_properties: fun(Connection, string): (TransportResult?, unknown?),
    batch_read_objects: fun(Connection, string, { string }, { string }): (TransportResult?, unknown?),
    list_owners: fun(Connection, Properties?): (TransportResult?, unknown?),
    list_pipelines: fun(Connection, string): (TransportResult?, unknown?),
}

local MAX_LIMIT = 200
local DEFAULT_LIMIT = 50

local function trim(value: unknown): string
    if type(value) ~= "string" then
        return ""
    end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local ID_PROPERTY = "hs_object_id"

-- Filter values for datetime properties travel as the portal expects them;
-- a transport without a normalizer (test fakes) compares raw strings.
local function filter_value(tp: Transport, value: string): string
    if type(tp.watermark_value) == "function" then
        local normalized = tp.watermark_value(value)
        if type(normalized) == "string" and normalized ~= "" then return normalized end
    end
    return value
end

local function scan_start(cursor: Cursor, since: string?): string?
    local start = since
    local active_hw = cursor.active_hw
    if type(active_hw) == "string" and active_hw ~= "" and cursor.phase == "live_active" then
        start = active_hw
    end
    if type(start) == "string" and start ~= "" then return start end
    return nil
end

local function search_body(
    tp: Transport,
    object_type: string,
    config: Config,
    limit: number,
    cursor: Cursor,
    since: string?,
    watermark_property: string
): (SearchBody?, PullError?)
    local properties, config_err = config_helper.properties_for(config, object_type)
    if config_err then return nil, config_err end
    local body: SearchBody = {
        limit = limit,
        properties = properties,
        sorts = { { propertyName = watermark_property, direction = "ASCENDING" } },
    }
    local tie_ts = cursor.tie_ts
    if type(tie_ts) == "string" and tie_ts ~= "" then
        -- Draining one watermark group: deterministic order by object id.
        body.sorts = { { propertyName = ID_PROPERTY, direction = "ASCENDING" } }
        local filters: { Properties } = {
            { propertyName = watermark_property, operator = "EQ", value = filter_value(tp, tie_ts) },
        }
        local last_id = cursor.tie_last_id
        if type(last_id) == "string" and last_id ~= "" then
            filters[#filters + 1] = { propertyName = ID_PROPERTY, operator = "GT", value = last_id }
        end
        body.filterGroups = { { filters = filters } }
        return body
    end
    local resume_ts = cursor.resume_ts
    if type(resume_ts) == "string" and resume_ts ~= "" then
        body.filterGroups = { { filters = { { propertyName = watermark_property, operator = "GT", value = filter_value(tp, resume_ts) } } } }
        return body
    end
    local start = scan_start(cursor, since)
    if start then
        body.filterGroups = { { filters = { { propertyName = watermark_property, operator = "GTE", value = start } } } }
    end
    return body
end


local function watermark_from(body: SearchBody, watermark_property: string): string?
    local groups = type(body.filterGroups) == "table" and body.filterGroups or {}
    local group = type(groups[1]) == "table" and groups[1] or {}
    local filters = type((group :: Properties).filters) == "table" and (group :: Properties).filters :: { Properties } or {}
    local filter = type(filters[1]) == "table" and filters[1] or {}
    local value = filter.value
    if filter.propertyName == watermark_property and type(value) == "string" then
        return value
    end
    return nil
end

local function search_active(
    tp: Transport,
    conn: Connection,
    object_type: string,
    config: Config,
    limit: number,
    cursor: Cursor,
    since: string?
): (TransportResult?, unknown?)
    local watermark_property = config_helper.watermark_property_for(config, object_type)
    local body, body_err = search_body(tp, object_type, config, limit, cursor, since, watermark_property)
    if body_err then return nil, body_err end
    local request_body = body :: SearchBody
    local keyset = (type(cursor.tie_ts) == "string" and cursor.tie_ts ~= "")
        or (type(cursor.resume_ts) == "string" and cursor.resume_ts ~= "")
    if type(tp.search_incremental) == "function" and not keyset then
        return tp.search_incremental(
            conn,
            object_type,
            request_body.properties,
            watermark_from(request_body, watermark_property),
            request_body.limit,
            request_body.after,
            watermark_property
        )
    end
    return tp.search_objects(conn, object_type, request_body)
end

local function string_set(values: unknown): { [string]: boolean }
    local out: { [string]: boolean } = {}
    if type(values) ~= "table" then
        return out
    end
    for _, value in ipairs(values :: { unknown }) do
        if type(value) == "string" and value ~= "" then
            out[value] = true
        end
    end
    return out
end

local function set_values(set: { [string]: boolean }): { string }
    local out: { string } = {}
    for value, present in pairs(set) do
        if present then
            out[#out + 1] = value
        end
    end
    table.sort(out)
    return out
end

local function external_id_of(item: PullItem): string
    local payload = type(item.payload) == "table" and item.payload or {}
    local provenance = type(payload.provenance) == "table" and payload.provenance :: Properties or {}
    return type(provenance.external_id) == "string" and provenance.external_id or ""
end

local function high_water(hw: unknown, ids: unknown, items: { PullItem }): (string, { string })
    local max = type(hw) == "string" and hw or ""
    local seen = string_set(ids)
    for _, item in ipairs(items) do
        local v = type(item.source_version) == "string" and item.source_version or ""
        local external_id = external_id_of(item)
        if v > max then
            max = v
            seen = {}
        end
        if v == max and external_id ~= "" then
            seen[external_id] = true
        end
    end
    return max, set_values(seen)
end

local function id_after(a: string, b: string): boolean
    local na, nb = tonumber(a), tonumber(b)
    if na ~= nil and nb ~= nil then return na > nb end
    return a > b
end

-- Where the next active page starts. A full page ends inside its highest
-- watermark group, which may continue on the portal; that group is drained
-- by object id before the scan resumes strictly after it.
local function keyset_after_page(cursor: Cursor, rows: { Row }, limit: number, watermark_property: string): (string?, string?, string?)
    local tie_ts = cursor.tie_ts
    if type(tie_ts) == "string" and tie_ts ~= "" then
        if #rows < limit then return nil, nil, tie_ts end
        local last_id = cursor.tie_last_id
        for _, row in ipairs(rows) do
            local id = tostring(row.id or "")
            if id ~= "" and (type(last_id) ~= "string" or last_id == "" or id_after(id, last_id :: string)) then last_id = id end
        end
        return tie_ts, last_id, nil
    end
    if #rows < limit then return nil, nil, nil end
    -- The page ended inside its highest watermark group: drain that group
    -- from its start (already delivered rows dedup by id) before resuming.
    local max_ts = ""
    for _, row in ipairs(rows) do
        local props = type(row.properties) == "table" and row.properties or {}
        local v = props[watermark_property]
        local ts = type(v) == "string" and v or (v ~= nil and tostring(v) or "")
        if ts > max_ts then max_ts = ts end
    end
    if max_ts == "" then return nil, nil, nil end
    return max_ts, nil, nil
end

-- A row already delivered at the high watermark is skipped: the live scan
-- re-reads the boundary with GTE, and a tie drain re-reads the whole group
-- the opening page sliced unstably.
local function should_skip_seen(cursor: Cursor, item: PullItem): boolean
    local hw = cursor.active_hw
    if type(hw) ~= "string" or hw == "" then
        return false
    end
    if item.source_version ~= hw then
        return false
    end
    local seen = string_set(cursor.active_hw_ids)
    return seen[external_id_of(item)] == true
end

local function resolve_object(opts: Opts, config: Config): string?
    local object_type = trim(opts.object_type)
    if object_type == "" then
        object_type = trim(config.object_type)
    end
    if config_helper.is_object_type(object_type) then
        return object_type
    end
    return nil
end

local function pull_active(
    tp: Transport,
    conn: Connection,
    object_type: string,
    _req: PullRequest,
    config: Config,
    cursor: Cursor,
    limit: number,
    since: string?,
    keys_only: boolean
): (PullResult?, PullError?)
    local res, search_err = search_active(tp, conn, object_type, config, limit, cursor, since)
    if search_err then return nil, search_err end
    if type(res) ~= "table" or not res.success then
        return data_error.from_result(res, "search " .. object_type)
    end
    local rows, rows_err = rows_helper.rows_from(res.data)
    if not rows then return data_error.invalid_request("invalid HubSpot " .. object_type .. " response: " .. tostring(rows_err)) end
    local hydrated, hydrate_err = hydration.hydrate(tp, conn, object_type, config, rows)
    if not hydrated then
        if type(hydrate_err) == "table" and hydrate_err.success == false then
            return data_error.from_result(hydrate_err, "hydrate " .. object_type)
        end
        return nil, hydrate_err
    end
    local labelled_rows, labels_err = labels.enrich(tp, conn, object_type, config, hydrated)
    if labels_err then
        if type(labels_err) == "table" and labels_err.success == false then
            return data_error.from_result(labels_err, "resolve " .. object_type .. " labels")
        end
        return nil, labels_err
    end
    rows = labelled_rows :: { Row }
    -- An engagement travels with the CRM objects it is associated with. The read
    -- is paged, and a page that could not be read FAILS this pull: an engagement
    -- delivered with a truncated association set is placed on the wrong record,
    -- and nothing downstream can tell that from a genuinely unassociated one.
    local associations_by_id: { [string]: item_builder.Associations }? = nil
    if not keys_only then
        -- A reconcile listing answers identities and discards every payload, so
        -- it never spends the association reads a delivered item needs.
        local hydrated_associations, association_err = associations.hydrate(tp, conn, object_type, rows)
        if association_err then
            if type(association_err) == "table" and association_err.success == false then
                return data_error.from_result(association_err, "hydrate " .. object_type .. " associations")
            end
            return nil, association_err
        end
        associations_by_id = hydrated_associations
    end
    local items: { PullItem } = {}
    local origin_mode = cursor.phase == "live_active" and "live" or "backfill"
    local emitted: { [string]: boolean } = {}
    local watermark_property = config_helper.watermark_property_for(config, object_type)
    for _, row in ipairs(type(rows) == "table" and rows or {}) do
        local row_associations = associations_by_id ~= nil
            and associations_by_id[tostring(row.id or "")]
            or nil
        local item, item_err = item_builder.from_row(
            row, object_type, "upsert", origin_mode, watermark_property, config, row_associations
        )
        if item_err then return nil, item_err end
        local external_id = external_id_of(item :: PullItem)
        local dedup = cursor.phase == "live_active" or (type(cursor.tie_ts) == "string" and cursor.tie_ts ~= "")
        if not emitted[external_id] and not (dedup and should_skip_seen(cursor, item)) then
            emitted[external_id] = true
            items[#items + 1] = item
        end
    end
    local active_hw, active_hw_ids = high_water(
        cursor.active_hw,
        cursor.active_hw_ids,
        items
    )
    local archived_hw = cursor.archived_hw
    local tie_ts, tie_last_id, resume_ts = keyset_after_page(cursor, rows, limit, watermark_property)
    if tie_ts ~= nil or resume_ts ~= nil then
        return {
            success = true,
            items = items,
            next_cursor = {
                phase = cursor.phase,
                tie_ts = tie_ts,
                tie_last_id = tie_last_id,
                resume_ts = resume_ts,
                active_hw = active_hw,
                active_hw_ids = active_hw_ids,
                archived_hw = archived_hw,
                connection_id = cursor.connection_id,
                object_type = object_type,
            },
            has_more = true,
            coverage = { mode = "delta" },
        }
    end
    local enumerate_archived = config_helper.can_enumerate_archived(object_type)
    local next_phase = "live_active"
    if enumerate_archived then
        next_phase = cursor.phase == "live_active" and "live_archived" or "backfill_archived"
    end
    return {
        success = true,
        items = items,
        next_cursor = {
            phase = next_phase,
            active_hw = active_hw,
            active_hw_ids = active_hw_ids,
            archived_hw = archived_hw,
            connection_id = cursor.connection_id,
            object_type = object_type,
        },
        has_more = enumerate_archived,
        coverage = { mode = "delta" },
    }
end

local function pull_one(
    tp: Transport,
    conn: Connection,
    object_type: string,
    req: PullRequest,
    config: Config,
    cursor: Cursor,
    limit: number,
    since: string?,
    keys_only: boolean
): (PullResult?, PullError?)
    local phase = cursor.phase
    if phase == "backfill_archived" or phase == "live_archived" then
        return archived_pull.pull(tp, conn, object_type, config, cursor, limit)
    end
    return pull_active(tp, conn, object_type, req, config, cursor, limit, since, keys_only)
end

local function scoped_cursor(raw: unknown, connection_id: string, object_type: string): Cursor
    local cursor = type(raw) == "table" and raw :: Cursor or { phase = "backfill_active" }
    if cursor.connection_id ~= connection_id or cursor.object_type ~= object_type then
        return { phase = "backfill_active", connection_id = connection_id, object_type = object_type }
    end
    cursor.connection_id = connection_id
    cursor.object_type = object_type
    return cursor
end

local function pull_page(request: unknown, opts: Opts?, deps: Deps?, keys_only: boolean): (PullResult?, PullError?)
    local req = type(request) == "table" and request :: PullRequest or {} :: PullRequest
    opts = type(opts) == "table" and opts or {}
    deps = type(deps) == "table" and deps or {}
    local candidate = deps.transport or transport
    if type(candidate) ~= "table" then
        return data_error.invalid_config("HubSpot source transport is unavailable")
    end
    local tp = candidate :: Transport
    -- The connection instance reaches this call three ways: the test seam, the
    -- request field the reconcile key listing carries, and the component context
    -- a binding open installs.
    local component_id = trim(deps.component_id)
    if component_id == "" then
        component_id = trim(req.component_id)
    end
    if component_id == "" then
        component_id = trim(ctx.get("component_id"))
    end

    local config = type(req.config) == "table" and req.config :: Config or {}
    local selected = resolve_object(opts :: Opts, config)
    if not selected then
        return data_error.invalid_config("config.object_type must be one of contacts, companies, deals, tasks, meetings, notes, emails, calls")
    end
    if not config_helper.enabled_for(config, selected, "source") then
        return data_error.invalid_config("config.objects." .. selected .. ".direction disables HubSpot source sync")
    end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then
        limit = 1
    end
    if limit > MAX_LIMIT then
        limit = MAX_LIMIT
    end

    local selected_connection_id = component_id ~= "" and component_id or trim(config.connection_id)
    local conn, cerr = tp.connect(selected_connection_id ~= "" and selected_connection_id or nil)
    if cerr then return nil, cerr end
    if not conn then return data_error.connection("no connection") end

    local cursor = scoped_cursor(
        req.cursor,
        selected_connection_id ~= "" and selected_connection_id or tostring(conn.component_id or ""),
        selected
    )
    local since: string? = nil
    if type(config.backfill_since) == "string" then
        since = config.backfill_since
    end
    return pull_one(tp, conn, selected, req, config, cursor, limit, since, keys_only)
end

function M.pull(request: unknown, opts: Opts?, deps: Deps?): (PullResult?, PullError?)
    return pull_page(request, opts, deps, false)
end

function M.pull_keys(req: unknown, opts: Opts?, deps: Deps?): (PullResult?, PullError?)
    local page, err = pull_page(req, opts, deps, true)
    if err then return nil, err end
    if page.success ~= true then
        return page
    end
    local keys: { Key } = {}
    for _, item in ipairs(type(page.items) == "table" and page.items or {}) do
        keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
    end
    page.items = nil
    page.keys = keys
    return page
end

M.PullResult = PullResult

return M
