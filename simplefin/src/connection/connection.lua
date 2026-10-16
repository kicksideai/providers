local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, details: any?, error: string?, code: string?, status_code: integer? }
type ResourceRow = { type: string, id: string, name: string, description: string?, selectable: boolean?, metadata: any?, capabilities: { string }? }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, code: string?, status_code: integer? }

local ACCOUNT_RESOURCE = "simplefin_account"

local function open(): (types.Conn?, error?)
    local id, err = base.component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

-- Verifying the connection is also where a fresh setup token is claimed:
-- transport.connect exchanges it and stores the access URL before the first
-- accounts read.
function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.accounts(conn, { balances_only = true })
    if not result then return nil, request_err end
    if not result.success then
        return { success = false, error = result.error, code = result.code, status_code = result.status_code }
    end
    local set: any = result.data
    return {
        success = true,
        details = {
            account_count = #(set.accounts :: { any }),
            warnings = set.errors,
        },
    }
end

function M.get_status(args: any): (StatusResult?, error?)
    return base.get_status(args)
end

-- Every account the bridge shares, as pickable resources.
function M.discover_resources(args: any): (DiscoverResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.snapshot(conn)
    if not result then return nil, request_err end
    if not result.success then
        return { success = false, error = result.error, code = result.code, status_code = result.status_code }
    end
    local set: any = result.data
    local resources: { ResourceRow } = {}
    for _, a in ipairs(set.accounts :: { any }) do
        local account: any = a
        local institution = account.institution and account.institution.name or nil
        local name = tostring(account.name or account.id)
        if institution and institution ~= "" then name = tostring(institution) .. " · " .. name end
        resources[#resources + 1] = {
            type = ACCOUNT_RESOURCE,
            id = tostring(account.id),
            name = name,
            description = tostring(account.balance or "") .. " " .. tostring(account.currency or ""),
            selectable = true,
            metadata = {
                institution = account.institution,
                account_name = account.name,
                currency = account.currency,
                balance = account.balance,
                balance_minor = account.balance_minor,
                balance_at = account.balance_at,
                holdings_count = #(account.holdings :: { any }),
            },
            capabilities = { "read", "source" },
        }
    end
    return { success = true, resources = resources }
end

-- A SimpleFIN connection owns nothing at the bridge beyond its credential; the
-- component delete path removes it.
function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

return M
