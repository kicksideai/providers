local ctx = require("ctx")
local confluence = require("confluence")
local data_error = require("data_error")
local transport = require("transport")
local markdown = require("markdown")

local M = {}

type Deps = { transport: any?, confluence: any?, component_id: string? }

local MAX_LIMIT = 100
local DEFAULT_LIMIT = 50

local CONTENT_TYPES: { [string]: boolean } = { page = true, blogpost = true }

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function cql_quote(value: string): string
    return '"' .. value:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function resolve_type(config: any): string?
    local typ = trim(config.content_type)
    if typ == "" then typ = "page" end
    if CONTENT_TYPES[typ] then return typ end
    return nil
end

local function build_cql(config: any, cursor: any, content_type: string, status: string, since: string?): string
    local clauses: { string } = {
        "space = " .. cql_quote(trim(config.space_key)),
        "type = " .. content_type,
        "status = " .. status,
    }
    local hw_field = status == "trashed" and (cursor.trashed_hw) or (cursor.active_hw)
    local start = since
    local live = cursor.phase == "live_active" or cursor.phase == "live_trashed"
    if live and type(hw_field) == "string" and hw_field ~= "" then start = hw_field end
    if type(start) == "string" and start ~= "" then
        clauses[#clauses + 1] = "lastmodified " .. (live and ">" or ">=") .. " " .. cql_quote(start)
    end
    return table.concat(clauses, " AND ") .. " ORDER BY lastmodified ASC"
end

local function version_of(row: any): string
    local version = type(row.version) == "table" and row.version or {}
    local when = trim((version :: any).when)
    if when ~= "" then return when end
    local number = (version :: any).number
    if number ~= nil then return tostring(number) end
    return tostring(row.id or "")
end

local function version_number(row: any): integer?
    local version = type(row.version) == "table" and row.version or {}
    local n = tonumber((version :: any).number)
    return n and (n :: integer) or nil
end

local function content_body(api: any, row: any): string
    return tostring(api.page_body(row) or "")
end

local function source_url(conn: any, row: any): string
    return confluence.web_url(conn, row) or ("confluence://content/" .. tostring(row.id or ""))
end

local function item_from(api: any, conn: any, row: any, content_type: string, op: string): any
    local id = tostring(row.id or "")
    local version = version_of(row)
    local key = "confluence:content:" .. id
    local title = markdown.from_storage(row.title)
    if title == "" then title = content_type .. " " .. id end
    local body = markdown.from_storage(content_body(api, row))
    local payload = {
        id = id,
        confluence_type = content_type,
        entity = "content",
        title = title,
        content = body ~= "" and ("# " .. title .. "\n\n" .. body) or ("# " .. title),
        content_type = "text/markdown",
        source_url = source_url(conn, row),
        properties = row,
        space_key = type(row.space) == "table" and (row.space :: any).key or nil,
        version = version_number(row),
        updated_at = version,
    }
    return {
        item_key = key,
        dedup_key = key .. ":" .. op .. ":" .. version,
        op = op,
        source_version = version ~= "" and version or nil,
        occurred_at = version ~= "" and version or nil,
        payload = op == "upsert" and payload or nil,
    }
end

local function max_version(hw: any, items: { any }): string
    local max = type(hw) == "string" and hw or ""
    for _, item in ipairs(items) do
        local v = type(item.source_version) == "string" and item.source_version or ""
        if v > max then max = v end
    end
    return max
end

local function next_start(data: any): integer?
    local size = tonumber(type(data) == "table" and data.size) or nil
    local start = tonumber(type(data) == "table" and data.start) or 0
    local total = tonumber(type(data) == "table" and data.totalSize) or tonumber(type(data) == "table" and data.total)
    if total and size and (start + size) < total then return (start + size) :: integer end
    local links = type(data) == "table" and data._links or nil
    if type(links) == "table" and type((links :: any).next) == "string" then return (start + (size or 0)) :: integer end
    return nil
end

local function pull_status(api: any, conn: any, content_type: string, req: any, config: any, cursor: any, limit: number, status: string, op: string, since: string?): (any?, error?)
    local start = tonumber(cursor.start) or 0
    local res, search_err = api.search(conn, build_cql(config, cursor, content_type, status, since), limit, start)
    if search_err then return nil, search_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "search Confluence content") end
    local data = type(res.data) == "table" and res.data or {}
    local rows = type((data :: any).results) == "table" and (data :: any).results or {}
    local items: { any } = {}
    for _, row in ipairs(rows :: { any }) do
        local full = row
        if op == "upsert" then
            local gr, page_err = api.get_page(conn, tostring(row.id or ""))
            if page_err then return nil, page_err end
            if type(gr) ~= "table" or not gr.success then return data_error.from_result(gr, "get Confluence content") end
            full = gr.data
        end
        items[#items + 1] = item_from(api, conn, full, content_type, op)
    end
    local ns = next_start(data)
    local active_hw = cursor.active_hw
    local trashed_hw = cursor.trashed_hw
    if status == "trashed" then trashed_hw = max_version(trashed_hw, items) else active_hw = max_version(active_hw, items) end
    if ns ~= nil and ns > start then
        return { success = true, items = items, next_cursor = { phase = cursor.phase, start = ns, active_hw = active_hw, trashed_hw = trashed_hw }, has_more = true, coverage = { mode = "delta" } }
    end
    if status == "current" then
        local next_phase = cursor.phase == "live_active" and "live_trashed" or "backfill_trashed"
        return { success = true, items = items, next_cursor = { phase = next_phase, start = 0, active_hw = active_hw, trashed_hw = trashed_hw }, has_more = true, coverage = { mode = "delta" }, retry_after_ms = #items == 0 and 0 or nil }
    end
    return { success = true, items = items, next_cursor = { phase = "live_active", start = 0, active_hw = active_hw, trashed_hw = trashed_hw }, has_more = false, coverage = { mode = "delta" } }
end

function M.pull(req: any, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    deps = type(deps) == "table" and deps or {}
    local tp = deps.transport or transport
    local api: any = deps.confluence or confluence
    local config = type(req.config) == "table" and req.config or {}
    local content_type = resolve_type(config)
    if not content_type then return data_error.invalid_config("config.content_type must be page or blogpost") end
    if trim(config.space_key) == "" then return data_error.invalid_config("config.space_key is required") end

    local component_id = trim(deps.component_id)
    if component_id == "" then component_id = trim(config.connection_id) end
    if component_id == "" then component_id = trim(ctx.get("component_id")) end
    local conn, cerr = tp.connect(component_id)
    if cerr or not conn then return data_error.connection(tostring(cerr or "no connection")) end

    local limit = tonumber(req.limit) or DEFAULT_LIMIT
    if limit < 1 then limit = 1 end
    if limit > MAX_LIMIT then limit = MAX_LIMIT end
    local cursor: any = type(req.cursor) == "table" and req.cursor or { phase = "backfill_active", start = 0 }
    local since: string? = nil
    if type(config.backfill_since) == "string" then since = config.backfill_since end
    local phase = cursor.phase or "backfill_active"
    if phase == "backfill_trashed" or phase == "live_trashed" then
        return pull_status(api, conn, content_type, req, config, cursor, limit, "trashed", "delete", since)
    end
    return pull_status(api, conn, content_type, req, config, cursor, limit, "current", "upsert", since)
end

function M.pull_keys(req: any, deps: Deps?): (any?, error?)
    local page, pull_err = M.pull(req, deps)
    if pull_err then return nil, pull_err end
    if page.success ~= true then return page end
    local keys: { any } = {}
    for _, item in ipairs(type(page.items) == "table" and page.items or {}) do
        keys[#keys + 1] = { item_key = item.item_key, dedup_key = item.dedup_key }
    end
    page.items = nil
    page.keys = keys
    return page
end

return M
