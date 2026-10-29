-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local http = require("http")
local security = require("security")
local http_errors = require("http_errors")
local component = require("component")
local types = require("types")
local config = require("memory_config")
local stores = require("memory_stores")
local items = require("memory_items")
local runs = require("memory_runs")
local ops = require("memory_ops")
local models = require("memory_models")

local M = {}

local MAX_PAGE = 200
local MAX_OFFSET = 1000000

local function reply(res: any, status: any, payload: any)
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(status)
    res:write_json(payload)
end

local function refuse(res: any, status: any, message: string)
    reply(res, status, { success = false, error = message })
end

local function fail(res: any, err: any)
    local status, classification = http_errors.classify(err)
    refuse(res, status, (type(err) == "userdata" and classification.kind ~= nil) and err:message() or tostring(err))
end

local function open(access: integer): (any?, any?, string?, any?)
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, nil, nil end
    if not security.actor() then
        refuse(res, http.STATUS.UNAUTHORIZED, "authentication required")
        return nil, nil, nil
    end
    local id = types.trim(req:param("id"))
    if id == "" then
        refuse(res, http.STATUS.BAD_REQUEST, "memory id is required")
        return nil, nil, nil
    end
    local _, access_err = component.validate_access(id, access)
    if access_err then fail(res, access_err); return nil, nil, nil end
    local store, store_err = stores.get(id)
    if store_err then fail(res, store_err); return nil, nil, nil end
    return res, req, id, store
end

local function body_of(req: any): (any?, error?)
    local raw = req:body()
    if type(raw) ~= "string" or raw == "" then return {} end
    return types.decode_object(raw, "body")
end

local function int_param(req: any, name: string, default: integer, min: integer, max: integer): (integer?, string?)
    local raw = req:query(name)
    if raw == nil or raw == "" then return default, nil end
    local n = tonumber(raw)
    if not n or math.floor(n) ~= n or n < min or n > max then
        return nil, name .. " must be an integer between " .. min .. " and " .. max
    end
    return math.floor(n), nil
end

local function page_params(req: any, default_limit: integer): (integer?, integer?, string?)
    local limit, limit_err = int_param(req, "limit", default_limit, 1, MAX_PAGE)
    if limit_err then return nil, nil, limit_err end
    local offset, offset_err = int_param(req, "offset", 0, 0, MAX_OFFSET)
    if offset_err then return nil, nil, offset_err end
    return limit, offset, nil
end

local function paged(rows: { any }, limit: integer, offset: integer): ({ any }, integer?)
    local page: { any } = {}
    for i = 1, math.min(limit, #rows) do page[i] = rows[i] end
    return page, #rows > limit and offset + limit or nil
end

local function list_param(req: any, name: string): { string }?
    local raw = types.trim(req:query(name))
    if raw == "" then return nil end
    local out: { string } = {}
    for part in raw:gmatch("[^,]+") do out[#out + 1] = types.trim(part) end
    return out
end

function M.list_items()
    local res, req, id, store = open(component.ACCESS.READ)
    if not res then return end
    local limit, offset, page_err = page_params(req, 50)
    if page_err then return refuse(res, http.STATUS.BAD_REQUEST, page_err) end
    local query = types.trim(req:query("q"))
    local filter = {
        kinds = list_param(req, "kind"), statuses = list_param(req, "status"), limit = (limit :: integer) + 1, offset = offset,
    }
    local rows, err
    if query == "" then
        rows, err = items.list(id :: string, filter)
    else
        local vectors, embed_err = models.embed(store.embedding_model, { query })
        if embed_err then return fail(res, embed_err) end
        filter.query_text = query
        filter.limit = (offset :: integer) + (limit :: integer) + 1
        local ranked, search_err = items.search(id :: string, vectors[1], filter)
        err = search_err
        rows = {}
        for i = (offset :: integer) + 1, #(ranked or {}) do rows[#rows + 1] = ranked[i] end
    end
    if err then return fail(res, err) end
    local page, next_offset = paged(rows :: { any }, limit :: integer, offset :: integer)
    local result: { [string]: any } = { success = true, items = page, count = #page }
    if next_offset then result.next_offset = next_offset end
    reply(res, http.STATUS.OK, result)
end

function M.list_memories()
    local res, req = http.response(), http.request()
    if not res or not req then return end
    if not security.actor() then return refuse(res, http.STATUS.UNAUTHORIZED, "authentication required") end
    local limit, offset, page_err = page_params(req, 50)
    if page_err then return refuse(res, http.STATUS.BAD_REQUEST, page_err) end
    local query = types.trim(req:query("q")):lower()
    local matches, scanned = 0, 0
    local page: { any } = {}
    local more = false
    while true do
        local rows, err = component.query({
            impl_ids = { "kickside.memory:memory_store" }, include = { meta = true }, access_mask = component.ACCESS.READ,
            text = query, order_by = { field = "created_at", direction = "DESC" }, limit = MAX_PAGE, offset = scanned,
        })
        if err then return fail(res, err) end
        for _, row in ipairs(rows or {}) do
            local meta = row.meta or {}
            local name = meta.title or ""
            if query == "" or name:lower():find(query, 1, true) then
                matches = matches + 1
                if matches > (offset :: integer) then
                    if #page == (limit :: integer) then more = true; break end
                    page[#page + 1] = { id = row.component_id, name = name, title = name,
                        description = meta.comment or "", item_count = tonumber(meta.item_count) or 0 }
                end
            end
        end
        if more or #(rows or {}) < MAX_PAGE then break end
        scanned = scanned + #rows
    end
    local result: { [string]: any } = { success = true, items = page, count = #page }
    if more then result.next_offset = (offset :: integer) + (limit :: integer) end
    reply(res, http.STATUS.OK, result)
end

function M.list_topics()
    local res, req, id = open(component.ACCESS.READ)
    if not res then return end
    local limit, offset, page_err = page_params(req, 50)
    if page_err then return refuse(res, http.STATUS.BAD_REQUEST, page_err) end
    local family, kind = types.trim(req:query("scope_family")), types.trim(req:query("kind"))
    if family ~= "" and not types.SCOPE_SET[family] then return refuse(res, http.STATUS.BAD_REQUEST, "invalid scope_family") end
    if kind ~= "" and not types.KIND_SET[kind] then return refuse(res, http.STATUS.BAD_REQUEST, "invalid kind") end
    local topics, err = items.topics(id :: string, family, kind, (limit :: integer) + 1, offset :: integer)
    if err then return fail(res, err) end
    local more = #topics > (limit :: integer)
    if more then table.remove(topics) end
    local result: { [string]: any } = { success = true, topics = topics, count = #topics }
    if more then result.next_offset = (offset :: integer) + (limit :: integer) end
    reply(res, http.STATUS.OK, result)
end

function M.get_item()
    local res, req, id = open(component.ACCESS.READ)
    if not res then return end
    local limit, offset, page_err = page_params(req, 50)
    if page_err then return refuse(res, http.STATUS.BAD_REQUEST, page_err) end
    local item_id = types.trim(req:param("item_id"))
    local item, err = items.get(id :: string, item_id)
    if err then return fail(res, err) end
    if not item then return refuse(res, http.STATUS.NOT_FOUND, "memory item not found") end
    local provenance, prov_err = items.sources(id :: string, item_id)
    if prov_err then return fail(res, prov_err) end
    local history, history_err = items.list(id :: string, {
        scope_keys = { (item :: any).scope_key }, key = (item :: any).key, limit = (limit :: integer) + 1, offset = offset,
    })
    if history_err then return fail(res, history_err) end
    local versions: { any } = {}
    for i = 1, math.min(limit :: integer, #(history :: any)) do versions[i] = (history :: any)[i] end
    local result: { [string]: any } = { success = true, item = item, provenance = provenance, versions = versions }
    if #(history :: any) > (limit :: integer) then result.next_offset = (offset :: integer) + (limit :: integer) end
    reply(res, http.STATUS.OK, result)
end

local function write_op(fn: (string, any, any) -> (any?, error?))
    local res, req, id = open(component.ACCESS.WRITE)
    if not res then return end
    local body, body_err = body_of(req)
    if body_err then return refuse(res, http.STATUS.BAD_REQUEST, "body must be a JSON object") end
    local result, err = fn(id :: string, req, body)
    if err then return fail(res, err) end
    local out: { [string]: any } = { success = true }
    for k, v in pairs(result or {}) do out[k] = v end
    reply(res, http.STATUS.OK, out)
end

function M.create_item()
    write_op(function(id: string, _req: any, body: any): (any?, error?)
        return ops.create(id, body)
    end)
end

function M.edit_item()
    write_op(function(id: string, req: any, body: any): (any?, error?)
        return ops.edit(id, types.trim(req:param("item_id")), body)
    end)
end

function M.forget_item()
    write_op(function(id: string, req: any, _body: any): (any?, error?)
        return ops.forget(id, types.trim(req:param("item_id")))
    end)
end

function M.archive_item()
    write_op(function(id: string, req: any, _body: any): (any?, error?)
        return ops.archive(id, types.trim(req:param("item_id")))
    end)
end

function M.restore_item()
    write_op(function(id: string, req: any, _body: any): (any?, error?)
        return ops.restore(id, types.trim(req:param("item_id")))
    end)
end

function M.resolve_conflict()
    write_op(function(id: string, req: any, body: any): (any?, error?)
        return ops.resolve_conflict(id, types.trim(req:param("group_id")), types.trim(body.winner_id))
    end)
end

function M.list_conflicts()
    local res, req, id = open(component.ACCESS.READ)
    if not res then return end
    local limit, offset, page_err = page_params(req, 20)
    if page_err then return refuse(res, http.STATUS.BAD_REQUEST, page_err) end
    local page, err = items.conflict_groups(id :: string, offset :: integer, limit :: integer)
    if err then return fail(res, err) end
    local members, members_err = items.group_members(id :: string, (page :: any).groups)
    if members_err then return fail(res, members_err) end
    local by_group: { [string]: any } = {}
    local out: { any } = {}
    for _, group_id in ipairs((page :: any).groups) do
        by_group[group_id] = { group_id = group_id, items = {} }
        out[#out + 1] = by_group[group_id]
    end
    for _, row in ipairs(members :: any) do table.insert(by_group[row.conflict_group].items, row) end
    local result: { [string]: any } = { success = true, groups = out, count = #out }
    if (page :: any).more then result.next_offset = (offset :: integer) + (limit :: integer) end
    reply(res, http.STATUS.OK, result)
end

function M.status()
    local res, _req, id, store = open(component.ACCESS.READ)
    if not res then return end
    local defaults, defaults_err = config.defaults()
    if defaults_err then return fail(res, defaults_err) end
    local schema, schema_err = config.schema()
    if schema_err then return fail(res, schema_err) end
    local counts, count_err = items.counts(id :: string)
    if count_err then return fail(res, count_err) end
    local recent, runs_err = runs.list(id :: string, nil, 20)
    if runs_err then return fail(res, runs_err) end
    local view: { any } = {}
    for _, run in ipairs(recent :: any) do
        view[#view + 1] = {
            id = run.id, run_type = run.run_type, status = run.status, last_error = run.last_error, stats = run.stats,
            host_kind = run.host_kind, created_at = run.created_at, started_at = run.started_at, finished_at = run.finished_at,
        }
    end
    reply(res, http.STATUS.OK, {
        success = true, config = (store :: any).config, defaults = defaults, config_schema = schema,
        counts = counts, runs = view,
    })
end

return M
