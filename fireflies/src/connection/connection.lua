local base = require("base")
local transport = require("transport")
local types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: any? }
type ResourceRow = { type: string, id: string, name: string, date: any? }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, status_code: integer?, details: any? }

local function open(): (types.Conn?, error?)
    local id, err = base.component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

-- A failed Fireflies answer: its message, HTTP status and response body.
local function fireflies_failure(result: types.Result): any
    return { success = false, error = result.error, status_code = result.status_code, details = result.data }
end

function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return fireflies_failure(result) end
    return { success = true }
end

function M.get_status(args: any): (StatusResult?, error?)
    return base.get_status(args)
end

-- Recent transcripts as pickable resources (resource pickers / automations).
function M.discover_resources(args: any): (DiscoverResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.list_transcripts(conn, { limit = 25 })
    if not result then return nil, request_err end
    if not result.success then return fireflies_failure(result) end
    local list: any = type(result.data) == "table" and (result.data :: any).transcripts or {}
    local resources: { ResourceRow } = {}
    if type(list) == "table" then
        for _, t in ipairs(list :: { any }) do
            local tr: any = t
            local id = tostring(tr.id or "")
            if id ~= "" then
                resources[#resources + 1] = {
                    type = "fireflies_transcript",
                    id = id,
                    name = tostring(tr.title or id),
                    date = tr.date,
                }
            end
        end
    end
    return { success = true, resources = resources }
end

-- A Fireflies connection owns no external resource beyond its stored key; the
-- component delete path removes the credential.
function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

return M
