local capacity_http = require("capacity_http")
local http_client = require("http_client")
local json = require("json")
local time = require("time")
local config = require("config")
local types = require("types")

local M = {}
local MAX_RETRIES = 3
local RETRY_AFTER_CAP_MS = 60000
-- Every request is bounded; a caller's deadline narrows the bound further.
local REQUEST_TIMEOUT_S = 30

type JsonValue = nil | boolean | number | string | { JsonValue } | { [string]: JsonValue }
type JsonObject = { [string]: JsonValue }
type Query = { [string]: string | number | boolean }
type StatusSet = { [number]: boolean }
type Response = {
    status_code: integer,
    body: unknown?,
    headers: unknown?,
}
type RequestOptions = { headers: { [string]: string }, body: string?, timeout: number? }
type HttpClient = {
    request: (string, string, RequestOptions) -> (unknown?, unknown?),
}
type ErrorBody = { message: unknown?, error: unknown?, retryAfter: unknown?, retry_after: unknown? }
type Paging = { next: unknown? }
type PagingRoot = { paging: unknown? }
type PagingNext = { after: unknown? }
type ParsedTime = { unix_nano: (self: ParsedTime) -> number }
type Sort = { propertyName: string, direction: string }
type Filter = { propertyName: string, operator: string, value: string }
type SearchBody = {
    limit: number,
    properties: { string },
    sorts: { Sort },
    after: string?,
    filterGroups: { { filters: { Filter } } }?,
}
type ObjectInput = { id: string }

local http = http_client :: HttpClient

local function is_json(value: unknown, depth: number): boolean
    if value == nil or type(value) == "boolean" or type(value) == "number" or type(value) == "string" then return true end
    if type(value) ~= "table" or depth >= 64 then return false end
    for key, child in pairs(value) do
        if type(key) ~= "string" and type(key) ~= "number" then return false end
        if not is_json(child, depth + 1) then return false end
    end
    return true
end

local function object_body(value: unknown): JsonObject?
    if type(value) ~= "table" or not is_json(value, 0) then return nil end
    return value :: JsonObject
end

local function malformed(message: string): error
    return errors.new({ kind = errors.INTERNAL, message = message })
end

local function normalize_response(value: unknown): (Response?, error?)
    if type(value) ~= "table" then return nil, malformed("HTTP client returned no response") end
    local raw = value :: { [string]: unknown }
    if type(raw.status_code) ~= "number" then return nil, malformed("HTTP response is missing status_code") end
    if raw.body ~= nil and type(raw.body) ~= "string" then return nil, malformed("HTTP response body must be a string") end
    if raw.headers ~= nil and type(raw.headers) ~= "table" then return nil, malformed("HTTP response headers must be an object") end
    return value :: Response, nil
end

function M._set_http_client_for_test(client: unknown)
    if client == nil then http = http_client :: HttpClient; return end
    if type(client) ~= "table" or type(client.request) ~= "function" then
        error("HTTP test client must define request", 2)
    end
    http = client :: HttpClient
end

local default_sleep_ms = function(ms: number)
    time.sleep(tostring(ms) .. "ms")
end
local sleep_ms = default_sleep_ms

function M._set_sleep_for_test(fn: unknown)
    if fn == nil then sleep_ms = default_sleep_ms; return end
    if type(fn) ~= "function" then error("sleep test hook must be a function", 2) end
    sleep_ms = fn :: (number) -> ()
end

local function headers(api_key: string): { [string]: string }
    return {
        ["Authorization"] = "Bearer " .. api_key,
        ["Accept"] = "application/json",
        ["Content-Type"] = "application/json",
    }
end
M.headers = headers

local function encode_segment(s: string): string
    return (s:gsub("[^%w%-%_%.%~]", function(c: string): string
        return string.format("%%%02X", string.byte(c))
    end))
end
M.encode_segment = encode_segment

local function build_url(path: string, query: Query?): string
    local url = types.api_base() .. path
    if query and next(query) then
        local params: { string } = {}
        for key, value in pairs(query) do
            if value ~= nil then params[#params + 1] = tostring(key) .. "=" .. encode_segment(tostring(value)) end
        end
        if #params > 0 then url = url .. "?" .. table.concat(params, "&") end
    end
    return url
end
M.build_url = build_url

-- extract_error(response) -> (message, status_code, body): the HubSpot error
-- message, the HTTP status and the decoded error body (the raw body when it is
-- not JSON).
function M.extract_error(response: unknown): (string, integer, unknown)
    local typed: Response? = nil
    if type(response) == "table" then typed = response :: Response end
    local status_code: integer = typed and (tonumber(typed.status_code) :: integer) or 0
    local message = "request failed"
    local data: unknown = nil
    if typed and type(typed.body) == "string" and typed.body ~= "" then
        local body = typed.body
        local parsed = json.decode(body)
        if type(parsed) == "table" then
            data = parsed
            local error_body = parsed :: ErrorBody
            message = tostring(error_body.message or error_body.error or body)
        else
            data = body
            message = body
        end
    end
    if status_code == 401 then return "unauthorized (check the HubSpot private-app token)", status_code, data end
    if status_code == 403 then return "forbidden (the token is missing a required scope)", status_code, data end
    if status_code == 404 then return "not found", status_code, data end
    if status_code == 429 then return "rate limited", status_code, data end
    return message, status_code, data
end

function M.retry_after_ms(response: unknown): number
    local secs: number? = nil
    local typed: Response? = nil
    if type(response) == "table" then typed = response :: Response end
    if typed and type(typed.body) == "string" and typed.body ~= "" then
        local parsed = json.decode(typed.body)
        if type(parsed) == "table" then
            local error_body = parsed :: ErrorBody
            local retry_after = error_body.retryAfter or error_body.retry_after
            if type(retry_after) == "number" then secs = retry_after end
            if secs == nil and type(retry_after) == "string" then secs = tonumber(retry_after) end
        end
    end
    if secs == nil and typed and type(typed.headers) == "table" then
        local response_headers = typed.headers :: { [string]: unknown }
        secs = tonumber(response_headers["Retry-After"] or response_headers["retry-after"])
        if secs == nil then
            local ms = tonumber(response_headers["X-HubSpot-RateLimit-Interval-Milliseconds"]
                or response_headers["x-hubspot-ratelimit-interval-milliseconds"])
            if ms ~= nil then secs = ms / 1000 end
        end
    end
    local ms = math.floor((secs or 1) * 1000)
    if ms < 0 then ms = 0 end
    if ms > RETRY_AFTER_CAP_MS then ms = RETRY_AFTER_CAP_MS end
    return ms
end

local function ok(ok_codes: StatusSet?, status: integer): boolean
    if ok_codes then return ok_codes[status] == true end
    return status == 200 or status == 201 or status == 204
end

local function decode_success(response: Response): unknown
    if response.status_code == 204 or response.body == nil or response.body == "" then
        return nil
    end
    local parsed, decode_err = json.decode(response.body :: string)
    if decode_err or parsed == nil then return response.body end
    return parsed
end

-- remaining_ms(deadline) -> the milliseconds left before the caller's
-- RFC3339 deadline, or nil when the caller named none.
local function remaining_ms(deadline: string?): number?
    if type(deadline) ~= "string" or deadline == "" then return nil end
    local parsed, err = time.parse(time.RFC3339, deadline)
    if err or not parsed then return 0 end
    return math.floor(parsed:sub(time.now()):milliseconds())
end

local function deadline_passed(): error
    return errors.new({ kind = errors.TIMEOUT, retryable = true, message = "the caller's deadline passed before the HubSpot request" })
end

-- A HubSpot answer is a Result (a failed answer carries HubSpot's message, HTTP
-- status and error body); a request that cannot be encoded or sent, or whose
-- caller's deadline has passed, is a typed error. request_json runs it under
-- the connection's provider capacity.
function M.request(conn: types.Conn, method: string, path: string, body: JsonValue, query: Query?, ok_codes: StatusSet?, max_retries: number?): (types.Result?, error?)
    if conn.component_id then max_retries = 0 end
    local opts: RequestOptions = { headers = headers(conn.api_key) }
    if body ~= nil then
        local encoded, encode_err = json.encode(body)
        if encode_err then return nil, errors.wrap(encode_err, "HubSpot request body is not serializable") end
        opts.body = encoded :: string
    end

    local retries = tonumber(max_retries)
    if retries == nil then retries = MAX_RETRIES end
    local url = build_url(path, query)
    for attempt = 0, retries do
        local left = remaining_ms(conn.deadline)
        if left ~= nil and left < 1000 then return nil, deadline_passed() end
        opts.timeout = left ~= nil and math.min(REQUEST_TIMEOUT_S, math.floor(left / 1000)) or REQUEST_TIMEOUT_S
        local raw_response, err = http.request(method, url, opts)
        if err then return nil, errors.wrap(err, "HubSpot " .. method .. " " .. path .. " request failed") end
        local response, response_err = normalize_response(raw_response)
        if not response then return nil, response_err end

        if ok(ok_codes, response.status_code) then
            return ({ success = true, data = decode_success(response), status_code = response.status_code :: integer } :: types.Result)
        end

        local wait_ms = M.retry_after_ms(response)
        local wait_left = remaining_ms(conn.deadline)
        local backoff_fits = wait_left == nil or wait_ms < wait_left
        if response.status_code == 429 and attempt < retries and backoff_fits then
            sleep_ms(wait_ms)
        else
            local message, code, error_body = M.extract_error(response)
            local result = ({ success = false, error = message, status_code = code, data = error_body } :: types.Result)
            if code == 429 then result.retry_after_ms = M.retry_after_ms(response) end
            return result
        end
    end

    return ({ success = false, error = "rate limited after retries", status_code = 429, retry_after_ms = 1000 } :: types.Result)
end
M.request_json = capacity_http.wrap(M.request)

function M.request_json_once(conn: types.Conn, method: string, path: string, body: JsonValue, query: Query?, ok_codes: StatusSet?): (types.Result?, error?)
    return M.request_json(conn, method, path, body, query, ok_codes, 0)
end

function M.get(conn: types.Conn, path: string, query: Query?): (types.Result?, error?)
    return M.request_json(conn, "GET", path, nil, query, { [200] = true })
end
function M.post(conn: types.Conn, path: string, body: JsonValue): (types.Result?, error?)
    return M.request_json(conn, "POST", path, body, nil, { [200] = true, [201] = true })
end
function M.patch(conn: types.Conn, path: string, body: JsonValue): (types.Result?, error?)
    return M.request_json(conn, "PATCH", path, body, nil, { [200] = true })
end
function M.delete(conn: types.Conn, path: string): (types.Result?, error?)
    return M.request_json(conn, "DELETE", path, nil, nil, { [200] = true, [204] = true })
end

function M.next_after(data: unknown): string?
    if type(data) ~= "table" then return nil end
    local paging = (data :: PagingRoot).paging
    if type(paging) ~= "table" then return nil end
    local nextv = (paging :: Paging).next
    if type(nextv) ~= "table" then return nil end
    local after = (nextv :: PagingNext).after
    if type(after) == "string" then return after end
    return nil
end

function M.watermark_value(value: unknown): string?
    if type(value) ~= "string" or value == "" then return nil end
    if value:match("^%d+$") then return value end
    local parsed, err = time.parse(time.RFC3339, value)
    if err or not parsed then return value end
    return tostring(math.floor((parsed :: ParsedTime):unix_nano() / 1000000))
end

local function watermark_property_for(object_type: string, watermark_property: unknown): string
    if type(watermark_property) == "string" and watermark_property ~= "" then return watermark_property end
    return config.watermark_property_for(nil, object_type)
end

function M.incremental_search_body(object_type: string, properties: { string }, watermark: string?, limit: number?, after: string?, watermark_property: string?): SearchBody
    local watermark_field = watermark_property_for(object_type, watermark_property)
    local body: SearchBody = {
        limit = limit or 100,
        properties = properties,
        sorts = { { propertyName = watermark_field, direction = "ASCENDING" } },
    }
    if type(after) == "string" and after ~= "" then body.after = after end
    local value = M.watermark_value(watermark)
    if value then
        body.filterGroups = { { filters = { { propertyName = watermark_field, operator = "GTE", value = value } } } }
    end
    return body
end

-- ── Read ─────────────────────────────────────────────────────────────────
function M.account_info(conn: types.Conn): (types.Result?, error?)
    return M.get(conn, "/account-info/v3/details", nil)
end

function M.test_connection(conn: types.Conn): (types.Result?, error?)
    return M.account_info(conn)
end

function M.list_objects(conn: types.Conn, object_type: string, query: Query?): (types.Result?, error?)
    return M.get(conn, "/crm/v3/objects/" .. object_type, query)
end

function M.get_object(conn: types.Conn, object_type: string, object_id: string, query: Query?): (types.Result?, error?)
    return M.get(conn, "/crm/v3/objects/" .. object_type .. "/" .. encode_segment(object_id), query)
end

function M.batch_read_objects(conn: types.Conn, object_type: string, object_ids: { string }, properties: { string }): (types.Result?, error?)
    local inputs: { ObjectInput } = {}
    for _, id in ipairs(object_ids or {}) do
        if type(id) == "string" and id ~= "" then inputs[#inputs + 1] = { id = id } end
    end
    return M.request_json(conn, "POST", "/crm/v3/objects/" .. object_type .. "/batch/read", {
        inputs = inputs,
        properties = properties or {},
    }, nil, { [200] = true })
end

function M.batch_read_associations(
    conn: types.Conn,
    from_type: string,
    to_type: string,
    inputs: { types.AssociationInput }
): (types.AssociationBatchResult?, error?)
    local normalized: { types.AssociationInput } = {}
    if #inputs == 0 then
        return ({ success = false, error = "association batch requires at least one object id", status_code = 0 } :: types.AssociationBatchResult)
    end
    if #inputs > 1000 then
        return ({ success = false, error = "association batch cannot exceed 1000 object ids", status_code = 0 } :: types.AssociationBatchResult)
    end
    for index, input in ipairs(inputs) do
        if type(input.id) ~= "string" or input.id == "" then
            return ({
                success = false,
                error = "association batch input " .. tostring(index) .. " requires a non-empty string id",
                status_code = 0,
            } :: types.AssociationBatchResult)
        end
        local after = input.after
        if after ~= nil and (type(after) ~= "string" or after == "") then
            return ({
                success = false,
                error = "association batch input " .. tostring(index) .. " has an invalid after cursor",
                status_code = 0,
            } :: types.AssociationBatchResult)
        end
        local item: types.AssociationInput = { id = input.id }
        if after ~= nil then item.after = after end
        normalized[#normalized + 1] = item
    end
    local path = "/crm/v4/associations/" .. encode_segment(from_type) .. "/" .. encode_segment(to_type) .. "/batch/read"
    local result, err = M.request_json(conn, "POST", path, { inputs = normalized }, nil, {
        [200] = true,
        [207] = true,
    })
    return result :: types.AssociationBatchResult?, err
end

function M.search_objects(conn: types.Conn, object_type: string, body: unknown): (types.Result?, error?)
    local payload = object_body(body)
    if not payload then
        return ({ success = false, error = "search body must be a JSON object", status_code = 0 } :: types.Result)
    end
    return M.request_json(conn, "POST", "/crm/v3/objects/" .. object_type .. "/search", payload, nil, { [200] = true })
end

function M.search_incremental(conn: types.Conn, object_type: string, properties: { string }, watermark: string?, limit: number?, after: string?, watermark_property: string?): (types.Result?, error?)
    return M.search_objects(conn, object_type, M.incremental_search_body(object_type, properties, watermark, limit, after, watermark_property))
end

function M.list_owners(conn: types.Conn, query: Query?): (types.Result?, error?)
    return M.get(conn, "/crm/v3/owners", query)
end

function M.list_pipelines(conn: types.Conn, object_type: string): (types.Result?, error?)
    if not config.is_object_type(object_type) then
        return ({ success = false, error = "unsupported pipeline object type", status_code = 0 } :: types.Result)
    end
    return M.get(conn, "/crm/v3/pipelines/" .. encode_segment(object_type), nil)
end

function M.list_properties(conn: types.Conn, object_type: string): (types.Result?, error?)
    return M.get(conn, "/crm/v3/properties/" .. object_type, nil)
end

function M.get_property(conn: types.Conn, object_type: string, name: string): (types.Result?, error?)
    return M.get(conn, "/crm/v3/properties/" .. encode_segment(object_type) .. "/" .. encode_segment(name), nil)
end

function M.get_pipeline(conn: types.Conn, object_type: string, id: string): (types.Result?, error?)
    return M.get(conn, "/crm/v3/pipelines/" .. encode_segment(object_type) .. "/" .. encode_segment(id), nil)
end

function M.get_owner(conn: types.Conn, id: string): (types.Result?, error?)
    return M.get(conn, "/crm/v3/owners/" .. encode_segment(id), nil)
end

-- ── Write ────────────────────────────────────────────────────────────────
function M.create_object(conn: types.Conn, object_type: string, properties: unknown): (types.Result?, error?)
    local payload = object_body(properties)
    if not payload then
        return ({ success = false, error = "properties must be a JSON object", status_code = 0 } :: types.Result)
    end
    return M.request_json(conn, "POST", "/crm/v3/objects/" .. object_type, { properties = payload }, nil, { [201] = true, [200] = true })
end

function M.update_object(conn: types.Conn, object_type: string, object_id: string, properties: unknown): (types.Result?, error?)
    local payload = object_body(properties)
    if not payload then
        return ({ success = false, error = "properties must be a JSON object", status_code = 0 } :: types.Result)
    end
    return M.patch(conn, "/crm/v3/objects/" .. object_type .. "/" .. encode_segment(object_id), { properties = payload })
end

function M.archive_object(conn: types.Conn, object_type: string, object_id: string): (types.Result?, error?)
    return M.delete(conn, "/crm/v3/objects/" .. object_type .. "/" .. encode_segment(object_id))
end

function M.create_association(conn: types.Conn, from_type: string, from_id: string, to_type: string, to_id: string): (types.Result?, error?)
    local path = "/crm/v4/objects/" .. from_type .. "/" .. encode_segment(from_id)
        .. "/associations/default/" .. to_type .. "/" .. encode_segment(to_id)
    return M.request_json(conn, "PUT", path, nil, nil, { [200] = true, [201] = true, [204] = true })
end


return M
