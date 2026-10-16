local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: unknown?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: unknown? }
type ResourceRow = { type: string, id: string, name: string }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, status_code: integer?, details: unknown? }

local function open(): (types.Conn?, error?)
    local id, err = base.component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

local function titleize(s: string): string
    if s == "" then return s end
    return s:sub(1, 1):upper() .. s:sub(2)
end

-- A failed HubSpot answer: its message, HTTP status and error body.
local function hubspot_failure(result: types.Result): SimpleResult
    return { success = false, error = result.error, status_code = result.status_code, details = result.data }
end

function M.test_connection(_args: unknown): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return hubspot_failure(result) end
    return { success = true }
end

function M.get_status(args: unknown): (StatusResult?, error?)
    return base.get_status(args)
end

-- All readable CRM objects are pickable source resources. Engagement objects
-- (meetings, notes, emails, calls) are pull-only but remain pickable as sources;
-- the writer validates its narrower object set separately before resolving a
-- connection.
function M.object_resources(): { ResourceRow }
    local resources: { ResourceRow } = {}
    for _, object_type in ipairs(transport.OBJECT_TYPES) do
        resources[#resources + 1] = { type = "hubspot_object", id = object_type, name = titleize(object_type) }
    end
    return resources
end

-- The supported CRM object types as pickable resources (resource pickers /
-- automations). The objects share the uniform /crm/v3/objects/{type} API.
function M.discover_resources(_args: unknown): (DiscoverResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    -- A read confirms the token works before listing the static object set.
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return hubspot_failure(result) :: DiscoverResult end
    return { success = true, resources = M.object_resources() }
end

-- A HubSpot connection owns no external resource beyond its stored token; the
-- component delete path removes the credential.
function M.delete(_args: unknown): (SimpleResult?, error?)
    return base.delete()
end

return M
