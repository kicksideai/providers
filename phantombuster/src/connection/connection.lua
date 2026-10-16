local base = require("base")
local transport = require("transport")
local phantombuster_types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, status_code: integer?, details: any? }
type ResourceRow = { type: string, id: string, name: string, script_name: string?, launch_type: string? }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, status_code: integer?, details: any? }

local component_id = base.component_id

local function open(): (phantombuster_types.Conn?, error?)
    local id, err = component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

-- A failed PhantomBuster answer: its message, HTTP status and error body.
local function phantombuster_failure(result: any): any
    return { success = false, error = result.error, status_code = result.status_code, details = result.data }
end

function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.test_connection(conn)
    if not result then return nil, request_err end
    if not result.success then return phantombuster_failure(result) end
    return { success = true }
end

function M.get_status(args: any): (StatusResult?, error?)
    return base.get_status(args)
end

function M.discover_resources(args: any): (DiscoverResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local result, request_err = transport.list_agents(conn)
    if not result then return nil, request_err end
    if not result.success then return phantombuster_failure(result) end

    local data: any = result.data
    local list: any = data
    if type(data) == "table" and data.agents then list = data.agents end
    local resources: { ResourceRow } = {}
    if type(list) == "table" then
        for _, agent in ipairs(list) do
            local a: any = agent
            resources[#resources + 1] = {
                type = "phantombuster_agent",
                id = tostring(a.id or ""),
                name = tostring(a.name or a.scriptName or a.id or ""),
                script_name = a.scriptName or a.script,
                launch_type = a.launchType,
            }
        end
    end
    return { success = true, resources = resources }
end

function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

return M
