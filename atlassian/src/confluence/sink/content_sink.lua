local ctx = require("ctx")
local confluence = require("confluence")
local data_error = require("data_error")
local transport = require("transport")

local M = {}

type Deps = { transport: any?, confluence: any? }

local CONTENT_TYPES: { [string]: boolean } = { page = true, blogpost = true }

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function escape_html(s: string): string
    return s:gsub("&", "&amp;"):gsub("<", "&lt;"):gsub(">", "&gt;")
end

local function to_storage(value: any): string
    local text = trim(value)
    if text == "" then return "" end
    local parts: { string } = {}
    for para in (text .. "\n\n"):gmatch("(.-)\n\n") do
        local p = trim(para)
        if p ~= "" then parts[#parts + 1] = "<p>" .. escape_html(p):gsub("\n", "<br/>") .. "</p>" end
    end
    return table.concat(parts, "")
end

local function cql_quote(value: string): string
    return '"' .. value:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function resolve_type(config: any, input: any): string?
    local typ = trim(input.content_type)
    if typ == "" then typ = trim(config.content_type) end
    if typ == "" then typ = "page" end
    if CONTENT_TYPES[typ] then return typ end
    return nil
end

local function resolve_dest_ref(req: any): any
    if type(req.dest_ref) == "table" then return req.dest_ref end
    local refs = type(req.dest_refs) == "table" and req.dest_refs or nil
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    local selected = refs and type((refs :: any)[slot]) == "table" and (refs :: any)[slot] or nil
    if selected and type((selected :: any).dest_ref) == "table" then return (selected :: any).dest_ref end
    return nil
end

local function content_id_from(req: any, input: any): string
    local ref = resolve_dest_ref(req)
    if type(ref) == "table" then
        local id = trim((ref :: any).content_id or (ref :: any).id)
        if id ~= "" then return id end
    end
    return trim(input.content_id or input.page_id or input.id)
end

local function version_of(row: any): string?
    if type(row) ~= "table" then return nil end
    local version = type((row :: any).version) == "table" and (row :: any).version or {}
    local when = trim((version :: any).when)
    if when ~= "" then return when end
    local n = (version :: any).number
    if n ~= nil then return tostring(n) end
    return nil
end

local function version_number(row: any): integer
    if type(row) ~= "table" then return 0 end
    local version = type((row :: any).version) == "table" and (row :: any).version or {}
    return (tonumber((version :: any).number) or tonumber((row :: any).version) or 0) :: integer
end

local function ok(result: string, content_type: string, data: any, id: string?): any
    local cid = trim(id or (type(data) == "table" and (data :: any).id or ""))
    local out: any = { success = true, result = result }
    if cid ~= "" then out.dest_ref = { content_id = cid, content_type = content_type } end
    local version = version_of(data)
    if version then out.dest_version = version end
    return out
end

local function find_by_title(api: any, conn: any, config: any, input: any, content_type: string): (string?, any?, any?, error?)
    local title = trim(input.title)
    if title == "" then return nil, nil, nil end
    local space = trim(input.space_key or config.space_key)
    if space == "" then return nil, nil, nil end
    local cql = "space = " .. cql_quote(space) .. " AND type = " .. content_type .. " AND title = " .. cql_quote(title)
    local res, search_err = api.search(conn, cql, 1, 0)
    if search_err then return nil, nil, nil, search_err end
    if type(res) ~= "table" or not res.success then return nil, nil, data_error.from_result(res, "search Confluence title") end
    local rows = type(res.data) == "table" and (res.data :: any).results or nil
    local row = type(rows) == "table" and rows[1] or nil
    if type(row) == "table" then return trim(row.id), row, nil end
    return nil, nil, nil
end

local function current_version(api: any, conn: any, id: string, fallback: any): (integer?, any?, any?, error?)
    local n = tonumber(fallback)
    if n and n > 0 then return n :: integer, nil, nil end
    local cur, page_err = api.get_page(conn, id)
    if page_err then return nil, nil, nil, page_err end
    if type(cur) ~= "table" or not cur.success then return nil, nil, data_error.from_result(cur, "get Confluence content") end
    return version_number(cur.data), cur.data, nil
end

local function create_or_update(api: any, conn: any, req: any, input: any, config: any, content_type: string): (any?, error?)
    local id = content_id_from(req, input)
    local found
    if id == "" then
        local ferr, typed_err
        id, found, ferr, typed_err = find_by_title(api, conn, config, input, content_type)
        if typed_err then return nil, typed_err end
        if ferr then return ferr end
        if id == nil then id = "" end
    end
    local body = to_storage(input.body or input.content or input.description)
    if id ~= "" then
        local version, cur, verr, typed_err = current_version(api, conn, id, input.version)
        if typed_err then return nil, typed_err end
        if verr then return verr end
        local title = trim(input.title)
        if title == "" and type(cur) == "table" then title = trim((cur :: any).title) end
        local res, update_err = api.update_content(conn, id, content_type, title, body, version or 0)
        if update_err then return nil, update_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "update Confluence content") end
        return ok("updated", content_type, res.data, id)
    end
    local space = trim(input.space_key or config.space_key)
    local res, create_err = api.create_content(conn, space, content_type, input.title, body, input.parent_id)
    if create_err then return nil, create_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "create Confluence content") end
    return ok("created", content_type, res.data, nil)
end

local function delete(api: any, conn: any, req: any, input: any): (any?, error?)
    local id = content_id_from(req, input)
    if id == "" then return data_error.invalid_request("delete requires dest_ref.content_id or input.content_id") end
    local res, delete_err = api.delete_content(conn, id)
    if delete_err then return nil, delete_err end
    if type(res) == "table" and res.success then return { success = true, result = "deleted" } end
    if type(res) == "table" and tonumber(res.status_code) == 404 then return { success = true, result = "deleted" } end
    return data_error.from_result(res, "delete Confluence content")
end

function M.write(req: any, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    if trim(req.identity_key) == "" or trim(req.idempotency_key) == "" then
        return data_error.invalid_request("identity_key and idempotency_key are required")
    end
    if type(req.input) ~= "table" then return data_error.invalid_request("write input must be a record") end
    deps = type(deps) == "table" and deps or {}
    local tp = deps.transport or transport
    local api = deps.confluence or confluence
    local config = type(req.config) == "table" and req.config or {}
    local input = type(req.input) == "table" and req.input or {}
    local content_type = resolve_type(config, input)
    if not content_type then return data_error.invalid_config("content_type must be page or blogpost") end
    local connection_id = trim(config.connection_id)
    if connection_id == "" then connection_id = trim(ctx.get("connection_id")) end
    local conn, cerr = tp.connect(connection_id ~= "" and connection_id or nil)
    if cerr or not conn then return data_error.connection(tostring(cerr or "no connection")) end

    local op = trim(req.sink_op)
    if op == "" then op = "upsert" end
    if op == "upsert" or op == "create" or op == "update" then return create_or_update(api, conn, req, input, config, content_type) end
    if op == "delete" then return delete(api, conn, req, input) end
    if op == "add_comment" then
        local id = content_id_from(req, input)
        if id == "" then return data_error.invalid_request("add_comment requires content id") end
        local res, comment_err = api.add_comment(conn, id, to_storage(input.comment or input.body))
        if comment_err then return nil, comment_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "add Confluence comment") end
        return ok("updated", content_type, res.data, id)
    end
    return data_error.invalid_request("unsupported sink operation: " .. op)
end

return M
