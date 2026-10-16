-- Actor-scoped SimpleFIN connection resolver. Reads the connection's private
-- context, exchanges a still-unclaimed setup token for the access URL on first
-- contact, and hands callers a ready Conn.

local component = require("component")
local api = require("api")
local protocol = require("protocol")
local types = require("types")

local M = {}

local SET_CONTEXT = "SET_CONTEXT"

-- The connection's private context: an explicit component_id, else the single
-- SimpleFIN connection in scope.
local function context(component_id: string?): (any?, error?)
    if component_id and component_id ~= "" then
        local ctx, err = component.get_context(component_id, component.ACCESS.READ)
        if err then return nil, err end
        return ctx, nil
    end
    local ctx, err = component.get_context_by_meta({
        class = types.CONNECTION_CLASS,
        provider = types.PROVIDER,
    }, component.ACCESS.READ)
    if err then
        return nil, errors.new({ kind = errors.INVALID, message = "no SimpleFIN connection selected; configure the trait connection when there is no single default" })
    end
    return ctx, nil
end

-- Turn what the user pasted into an access URL: a setup token is claimed at the
-- bridge, an access URL is validated as-is.
function M.exchange(credential: any): (string?, error?)
    local kind, value, kind_err = protocol.classify_credential(credential)
    if kind_err or not kind then return nil, kind_err end
    if kind == "access_url" then
        local parts, parse_err = protocol.parse_access_url(value)
        if parse_err or not parts then return nil, parse_err end
        return value, nil
    end
    local claim_url, decode_err = protocol.decode_setup_token(value)
    if decode_err or not claim_url then return nil, decode_err end
    local result, claim_err = api.claim(claim_url :: string)
    if not result then return nil, claim_err end
    if not result.success then return nil, errors.new({ kind = errors.UNAVAILABLE, message = tostring(result.error) }) end
    return result.data :: string, nil
end

-- The private context that replaces the setup token once it is claimed.
function M.claimed_context(access_url: string): { [string]: any }
    return { access_url = access_url, claimed_at = protocol.iso_utc(os.time()) }
end

-- Replace the connection's private context. Requires write access on the
-- component, which the connection owner and the sync installer both hold.
function M.persist_context(component_id: string, value: { [string]: any }): (boolean, string?)
    local service, svc_err = component.get_service()
    if svc_err or not service then
        return false, "component service unavailable: " .. tostring(svc_err)
    end
    local result, err = service:update({
        component_id = component_id,
        commands = { { type = SET_CONTEXT, payload = { private_context = value } } },
    })
    if err or not result or result.success == false then
        return false, tostring(err or (result and result.error) or "context update failed")
    end
    return true, nil
end

local function build(component_id: string?, access_url: string): (types.Conn?, error?)
    local parts, err = protocol.parse_access_url(access_url)
    if err or not parts then return nil, err end
    return ({
        component_id = component_id,
        access_url = access_url,
        base_url = parts.base_url,
        authorization = parts.authorization,
    } :: types.Conn), nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    local ctx, err = context(component_id)
    if err or not ctx then return nil, err end
    local cid = type(ctx.component_id) == "string" and (ctx.component_id :: string) or component_id
    if type(ctx.access_url) == "string" and ctx.access_url ~= "" then
        return build(cid, ctx.access_url :: string)
    end
    local token = ctx.setup_token
    if type(token) ~= "string" or protocol.trim(token) == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "SimpleFIN connection has no credential; connect it again with a setup token" })
    end
    if not cid or cid == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "SimpleFIN connection is not yet claimed and no component id is in scope to store the claim" })
    end
    local access_url, exchange_err = M.exchange(token)
    if exchange_err or not access_url then return nil, exchange_err end
    local stored, store_err = M.persist_context(cid :: string, M.claimed_context(access_url :: string))
    if not stored then
        return nil, errors.new({ kind = errors.UNAVAILABLE, message = "SimpleFIN setup token was claimed but the access URL could not be stored: " .. tostring(store_err) })
    end
    return build(cid, access_url :: string)
end

M.accounts = api.accounts
M.snapshot = api.snapshot
M.info = api.info

return M
