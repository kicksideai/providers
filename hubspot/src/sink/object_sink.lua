local ctx = require("ctx")
local config_helper = require("config")
local data_error = require("data_error")
local transport = require("transport")

local M = {}

type JsonValue = nil | boolean | number | string | { JsonValue } | { [string]: JsonValue }
type JsonObject = { [string]: JsonValue }
type Opts = { object_type: string? }
type Deps = { transport: unknown? }
type Config = {
    connection_id: string?,
    object_type: string?,
    external_key_property: string?,
    objects: JsonObject?,
}
type Input = {
    id: string?,
    object_id: string?,
    item_key: string?,
    external_key: string?,
    external_key_property: string?,
    properties: JsonObject?,
}
type DestinationRef = { object_type: string?, object_id: string?, id: string? }
type WriteRequest = {
    config: Config?,
    dest_ref: DestinationRef?,
    dest_version: string?,
    dest_refs: { [string]: { dest_ref: DestinationRef? } }?,
    map_slot: string?,
    input: Input?,
    sink_op: string?,
    identity_key: string?,
    idempotency_key: string?,
}
type HubSpotRow = {
    id: string?,
    updatedAt: string?,
    properties: JsonObject?,
}
type SearchData = { results: { HubSpotRow }? }
type TransportResult = {
    success: boolean?,
    data: unknown?,
    error: string?,
    status_code: number?,
    retry_after_ms: number?,
}
type Transport = {
    connect: (string?) -> (unknown?, unknown?),
    search_objects: (unknown, string, JsonObject) -> (TransportResult?, unknown?),
    create_object: (unknown, string, JsonObject) -> (TransportResult?, unknown?),
    update_object: (unknown, string, string, JsonObject) -> (TransportResult?, unknown?),
    archive_object: (unknown, string, string) -> (TransportResult?, unknown?),
}
type WriteResult = {
    success: boolean,
    result: string?,
    dest_ref: DestinationRef?,
    dest_version: string?,
    error: unknown?,
    retry_after_ms: number?,
}

local function trim(value: unknown): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function version_of(value: unknown): string?
    if type(value) ~= "table" then return nil end
    local row = value :: HubSpotRow
    if type(row.updatedAt) == "string" and row.updatedAt ~= "" then return row.updatedAt end
    local props = type(row.properties) == "table" and row.properties or {}
    local v = props.lastmodifieddate or props.hs_lastmodifieddate or props.createdate or props.hs_createdate
    if type(v) == "string" then return v end
    return nil
end

local function dest_ref(object_type: string, id: string): DestinationRef
    return { object_type = object_type, object_id = id }
end

local function object_id_from(request: WriteRequest, input: Input): string
    local ref = request.dest_ref
    if type(ref) ~= "table" and type(request.dest_refs) == "table" then
        local slot = trim(request.map_slot)
        if slot == "" then slot = "default" end
        local receipt = request.dest_refs[slot]
        if type(receipt) == "table" then ref = receipt.dest_ref end
    end
    if type(ref) == "table" then
        local id = trim(ref.object_id)
        if id ~= "" then return id end
        id = trim(ref.id)
        if id ~= "" then return id end
    end
    return trim(input.object_id or input.id)
end

local function resolve_object_type(opts: Opts, config: Config): string?
    local object_type = trim(opts.object_type)
    if object_type == "" then object_type = trim(config.object_type) end
    if config_helper.is_writable_object_type(object_type) then return object_type end
    return nil
end

local function properties(input: Input, config: Config, request: WriteRequest): JsonObject
    local props: JsonObject = {}
    if type(input.properties) == "table" then
        for k, v in pairs(input.properties) do props[k] = v end
    end
    local key_prop = trim(input.external_key_property or config.external_key_property)
    local key = trim(input.external_key)
    if key == "" then key = trim(input.item_key) end
    if key == "" then key = trim(request.identity_key) end
    if key_prop ~= "" and key ~= "" then props[key_prop] = key end
    return props
end

local function find_by_external_key(tp: Transport, conn: unknown, object_type: string, input: Input, config: Config, request: WriteRequest): (string?, HubSpotRow?, unknown?)
    local key_prop = trim(input.external_key_property or config.external_key_property)
    local key = trim(input.external_key)
    if key == "" then key = trim(input.item_key) end
    if key == "" then key = trim(request.identity_key) end
    if key_prop == "" or key == "" then return nil, nil, nil end
    local res, search_err = tp.search_objects(conn, object_type, {
        limit = 1,
        properties = { key_prop },
        filterGroups = { { filters = { { propertyName = key_prop, operator = "EQ", value = key } } } },
    })
    if search_err then return nil, nil, search_err end
    if type(res) ~= "table" or not res.success then return nil, nil, data_error.from_result(res, "search " .. object_type .. " external key") end
    local rows = type(res.data) == "table" and (res.data :: SearchData).results or nil
    local row = type(rows) == "table" and rows[1] or nil
    if type(row) == "table" and row.id ~= nil then return tostring(row.id), row, nil end
    return nil, nil, nil
end

local function ok(result: string, object_type: string, data: unknown, id: string?): WriteResult
    local row = type(data) == "table" and (data :: HubSpotRow) or nil
    local oid = id or (row and trim(row.id) or "")
    local out: WriteResult = { success = true, result = result }
    if oid ~= "" then out.dest_ref = dest_ref(object_type, oid) end
    local version = version_of(data)
    if version then out.dest_version = version end
    return out
end

local function create_or_update(tp: Transport, conn: unknown, object_type: string, request: WriteRequest, input: Input, config: Config): (WriteResult?, unknown?)
    local oid = object_id_from(request, input)
    local found
    if oid == "" then
        local ferr
        oid, found, ferr = find_by_external_key(tp, conn, object_type, input, config, request)
        if ferr then return nil, ferr end
        if oid == nil then oid = "" end
    end
    local props = properties(input, config, request)
    if oid ~= "" then
        local res, update_err = tp.update_object(conn, object_type, oid, props)
        if update_err then return nil, update_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "update " .. object_type) end
        return ok("updated", object_type, res.data, oid)
    end
    local res, create_err = tp.create_object(conn, object_type, props)
    if create_err then return nil, create_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "create " .. object_type) end
    return ok("created", object_type, res.data, nil)
end

local function delete(tp: Transport, conn: unknown, object_type: string, request: WriteRequest, input: Input, config: Config): (WriteResult?, unknown?)
    local oid = object_id_from(request, input)
    if oid == "" then
        local ferr
        oid, _, ferr = find_by_external_key(tp, conn, object_type, input, config, request)
        if ferr then return nil, ferr end
        if oid == nil then oid = "" end
    end
    if oid == "" then return data_error.invalid_request("delete requires dest_ref.object_id, input.object_id, or an external key") end
    local res, archive_err = tp.archive_object(conn, object_type, oid)
    if archive_err then return nil, archive_err end
    if type(res) == "table" and res.success then return { success = true, result = "deleted", dest_ref = dest_ref(object_type, oid) } end
    if type(res) == "table" and tonumber(res.status_code) == 404 then return { success = true, result = "deleted", dest_ref = dest_ref(object_type, oid) } end
    return data_error.from_result(res, "archive " .. object_type)
end

function M.write(value: unknown, opts: Opts?, deps: Deps?): (WriteResult?, unknown?)
    local request = type(value) == "table" and (value :: WriteRequest) or ({} :: WriteRequest)
    if trim(request.identity_key) == "" or trim(request.idempotency_key) == "" then
        return data_error.invalid_request("identity_key and idempotency_key are required") :: WriteResult
    end
    if type(request.input) ~= "table" then return data_error.invalid_request("write input must be a record") :: WriteResult end
    opts = type(opts) == "table" and opts or {}
    deps = type(deps) == "table" and deps or {}
    local tp = (type(deps.transport) == "table" and deps.transport or transport) :: Transport
    local config = type(request.config) == "table" and request.config or ({} :: Config)
    local input = type(request.input) == "table" and request.input or ({} :: Input)
    local op = trim(request.sink_op)
    if op == "" then return data_error.invalid_request("sink_op is required") :: WriteResult end
    local object_type = resolve_object_type(opts :: Opts, config)
    if not object_type then return data_error.invalid_config("object_type must be contacts, companies, deals, or tasks") end
    if not config_helper.enabled_for(config, object_type, "sink") then
        return data_error.invalid_config("config.objects." .. object_type .. ".direction disables HubSpot sink sync")
    end

    local connection_id = trim(config.connection_id)
    if connection_id == "" then connection_id = trim(ctx.get("connection_id")) end
    local conn, cerr = tp.connect(connection_id ~= "" and connection_id or nil)
    if cerr then return nil, cerr end
    if not conn then return data_error.connection("no connection") end

    if op == "upsert" then return create_or_update(tp, conn, object_type, request, input, config) end
    if op == "delete" then return delete(tp, conn, object_type, request, input, config) end
    return data_error.invalid_request("unsupported sink operation: " .. op)
end

return M
