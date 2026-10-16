-- PUT /simplefin/connections/{id}: replace a connection's credential with a new
-- setup token (or access URL). The new credential is claimed and probed before
-- the old one is discarded; a failed probe restores the previous context so the
-- caller never ends up with a half-rotated connection.

local http = require("http")
local json = require("json")
local component = require("component")
local transport = require("transport")

local CONNECTION_CONTRACT = "kickside.connection:connection"

local function write(res: any, status: any, payload: any)
    res:set_status(status)
    res:write_json(payload)
end

local function probe(component_id: string): (number?, error?)
    local conn, connect_err = transport.connect(component_id)
    if connect_err or not conn then return nil, connect_err end
    local result, request_err = transport.accounts(conn, { balances_only = true })
    if not result then return nil, request_err end
    if not result.success then return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(result.error) }) end
    local set: any = result.data
    return #(set.accounts :: { any }), nil
end

-- Exchange, store, probe, and roll back on failure. Returns the account count
-- on success, else an error message and the HTTP status that describes it.
local function rotate(component_id: string, credential: any, name: any): (number?, string?, any?)
    local access_url, exchange_err = transport.exchange(credential)
    if exchange_err or not access_url then
        return nil, tostring(exchange_err), http.STATUS.BAD_REQUEST
    end
    local old_context, old_err = component.get_private_context(component_id)
    if old_err then
        return nil, tostring(old_err), http.STATUS.INTERNAL_ERROR
    end
    local stored, store_err = transport.persist_context(component_id, transport.claimed_context(access_url :: string))
    if not stored then
        return nil, tostring(store_err), http.STATUS.INTERNAL_ERROR
    end
    local count, probe_err = probe(component_id)
    if probe_err then
        local restored, restore_err = transport.persist_context(component_id, old_context or {})
        if not restored then
            return nil,
                "The new credential failed and the previous one could not be restored: "
                    .. tostring(restore_err) .. ". New credential error: " .. tostring(probe_err),
                http.STATUS.INTERNAL_ERROR
        end
        return nil,
            "The new credential failed; the previous connection was kept. " .. tostring(probe_err),
            http.STATUS.BAD_REQUEST
    end
    if type(name) == "string" and name ~= "" then
        local meta_ok, meta_err = component.set_meta(component_id, { title = name })
        if not meta_ok then
            return nil, "Credential rotated but the connection name could not be updated: " .. tostring(meta_err), http.STATUS.INTERNAL_ERROR
        end
    end
    return count, nil, nil
end

local function handler()
    local req, res = http.request(), http.response()
    if not req or not res then return nil, "no HTTP context" end
    res:set_content_type(http.CONTENT.JSON)
    local component_id = req:param("id")
    if type(component_id) ~= "string" or component_id == "" then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = "component id is required" })
        return
    end
    component_id = component_id :: string
    local raw_body, body_err = req:body()
    if body_err then write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid JSON" }); return end
    local body, decode_err = json.decode(raw_body)
    if decode_err or type(body) ~= "table" then
        write(res, http.STATUS.BAD_REQUEST, { success = false, error = "invalid JSON" })
        return
    end
    local instance, open_err = component.open(component_id, component.ACCESS.WRITE, CONNECTION_CONTRACT)
    if open_err or not instance then
        write(res, http.STATUS.FORBIDDEN, { success = false, error = "connection unavailable: " .. tostring(open_err) })
        return
    end
    local count, rotate_err, status = rotate(component_id, body.setup_token, body.name)
    if rotate_err then
        write(res, status or http.STATUS.INTERNAL_ERROR, { success = false, error = rotate_err })
        return
    end
    write(res, http.STATUS.OK, { success = true, component_id = component_id, account_count = count })
end

return { handler = handler, rotate = rotate }
