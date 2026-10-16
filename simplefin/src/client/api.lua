local capacity_http = require("capacity_http")
-- Low-level SimpleFIN Bridge HTTP client. Every bridge answer is a types.Result;
-- an HTTP failure carries a kickside.data error code so sources can classify
-- without re-parsing. A request that cannot be sent is a typed error.

local http_client = require("http_client")
local json = require("json")
local types = require("types")
local protocol = require("protocol")

local M = {}

local function failure(message: string, code: string, status_code: integer): types.Result
    return { success = false, error = message, code = code, status_code = status_code } :: types.Result
end

-- Exchange a claim URL for an access URL. The bridge accepts exactly one POST per
-- token; a second attempt answers 403.
function M.claim(claim_url: string): (types.Result?, error?)
    local response, err = http_client.request("POST", claim_url, {
        headers = { ["Content-Length"] = "0", ["Accept"] = "text/plain" },
        body = "",
    })
    if err then return nil, errors.wrap(err, "SimpleFIN claim request failed") end
    local status = (response and response.status_code or 0) :: integer
    local body = protocol.trim(response and response.body)
    if status == 403 then
        return failure("this setup token is invalid or was already claimed; create a new one at bridge.simplefin.org", "invalid_config", status)
    end
    if status < 200 or status >= 300 then
        local message, code = protocol.http_error(status, body)
        local result = failure(message, code, status)
        if status == 429 then result.retry_after_ms = capacity_http.retry_after(response, 60000) end
        return result
    end
    if not protocol.is_access_url(body) then
        return failure("SimpleFIN claim did not return an access URL", "provider_error", status)
    end
    return { success = true, data = body, status_code = status } :: types.Result
end

local get = capacity_http.wrap(function(conn: types.Conn, path: string): (types.Result?, error?)
    local response, err = http_client.request("GET", conn.base_url .. path, {
        headers = { ["Authorization"] = conn.authorization, ["Accept"] = "application/json" },
    })
    if err then return nil, errors.wrap(err, "SimpleFIN request failed") end
    local status = (response and response.status_code or 0) :: integer
    local body = (response and response.body or "") :: string
    if status < 200 or status >= 300 then
        local message, code = protocol.http_error(status, body)
        local result = failure(message, code, status)
        if status == 429 then result.retry_after_ms = capacity_http.retry_after(response, 60000) end
        return result
    end
    local decoded, decode_err = json.decode(body)
    if decode_err then
        return failure("SimpleFIN answer is not JSON: " .. tostring(decode_err), "provider_error", status)
    end
    return { success = true, data = decoded, status_code = status } :: types.Result
end)


-- GET /accounts with the protocol query. data is the normalized AccountSet.
function M.accounts(conn: types.Conn, opts: any?): (types.Result?, error?)
    local result, err = get(conn, "/accounts" .. protocol.accounts_query(opts))
    if not result then return nil, err end
    if not result.success then return result end
    local set, norm_err = protocol.normalize_accounts(result.data)
    if norm_err or not set then
        return failure(tostring(norm_err), "provider_error", result.status_code or 0)
    end
    return { success = true, data = set, status_code = result.status_code } :: types.Result
end

-- Balances and holdings without transaction history. `balances-only=1` makes the
-- bridge drop holdings along with transactions, so a snapshot asks for
-- transactions from `now` instead: an empty transaction list, full positions.
function M.snapshot(conn: types.Conn, now: number?): (types.Result?, error?)
    return M.accounts(conn, { start_date = now or os.time() })
end

-- GET /info: the protocol versions the bridge speaks.
function M.info(conn: types.Conn): (types.Result?, error?)
    return get(conn, "/info")
end

return M
