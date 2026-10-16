-- kickside.connection:connection handlers for a single Atlassian connection.
-- One Atlassian account/site + one credential (OAuth token, Cloud API token, or
-- Server PAT) authorizes BOTH Jira and Confluence, so there is ONE connection;
-- the Jira/Confluence agent tools resolve it and the per-product split lives at
-- the tool/resource layer. component_id arrives via ctx (context_required); the
-- transport turns it into an authenticated handle for either auth mode.
--
-- Validation/discovery hit generic REST endpoints through the transport directly
-- (no dependency on the product api libs), keeping this slice at the same layer
-- as jira/ and confluence/. Durable source flows are automation-owned: source
-- state is stored on the automation/poller, timing is cron-owned, and emitted
-- content lands in threads.

local base = require("base")
local transport = require("transport")
local atlassian_types = require("types")

local M = {}

type StatusResult = { success: boolean, status: string?, details: any?, error: string? }
type SimpleResult = { success: boolean, error: string?, details: any? }
type ResourceRow = { type: string, id: any, key: any, name: any }
type DiscoverResult = { success: boolean, resources: { ResourceRow }?, error: string?, details: any? }

local component_id = base.component_id

local function open(): (atlassian_types.Conn?, error?)
    local id, err = component_id()
    if not id then return nil, err end
    return transport.connect(tostring(id))
end

function M.get_status(args: any): (StatusResult?, error?)
    return base.get_status(args)
end

-- A connection is valid if either product answers. A token may carry only one
-- product's scope, so we accept Jira OR Confluence; when neither answers, the
-- failure carries both failed Results.
function M.test_connection(args: any): (SimpleResult?, error?)
    local conn, err = open()
    if not conn then return nil, err end
    local jr, jira_err = transport.get(conn, conn.jira_base .. "/myself")
    if not jr then return nil, jira_err end
    if jr.success then return { success = true } end
    local cr, confluence_err = transport.get(conn, conn.confluence_base .. "/space?limit=1")
    if not cr then return nil, confluence_err end
    if cr.success then return { success = true } end
    return { success = false, error = tostring(jr.error or cr.error), details = { jira = jr, confluence = cr } }
end

-- List Jira projects and Confluence spaces the connection can reach; tolerate one
-- product being inaccessible. Resources are typed so automation/source UIs can
-- tell projects from spaces.
function M.discover_resources(args: any, deps: any?): (DiscoverResult?, error?)
    local d = type(deps) == "table" and deps or {}
    local connect = d.open or open
    local get = d.get or transport.get
    local conn, err = connect()
    if not conn then return nil, err end

    local resources: { ResourceRow } = {}
    local failures: { string } = {}
    local function note(product: string, result: any)
        local reason = tostring(result.error or "request failed")
        if result.status_code then reason = reason .. " (HTTP " .. tostring(result.status_code) .. ")" end
        failures[#failures + 1] = product .. ": " .. reason
    end

    local pj, jira_err = get(conn, conn.jira_base .. (conn.deployment == "server" and "/project" or "/project/search?maxResults=100"))
    if not pj then return nil, jira_err end
    if pj.success then
        local list: any = conn.deployment == "server" and pj.data or (pj.data and (pj.data :: any).values)
        for _, p in ipairs(list or {}) do
            local proj: any = p
            resources[#resources + 1] = { type = "jira_project", id = proj.id, key = proj.key, name = proj.name }
        end
    else
        note("Jira", pj)
    end

    local sp, confluence_err = get(conn, conn.confluence_base .. "/space?limit=100")
    if not sp then return nil, confluence_err end
    if sp.success then
        for _, s in ipairs((sp.data and (sp.data :: any).results) or {}) do
            local space: any = s
            resources[#resources + 1] = { type = "confluence_space", id = space.id, key = space.key, name = space.name }
        end
    end

    if not sp.success then note("Confluence", sp) end
    if #failures == 2 then return { success = false, error = table.concat(failures, "; "), details = { jira = pj, confluence = sp } } end
    return { success = true, resources = resources }
end

function M.delete(args: any): (SimpleResult?, error?)
    return base.delete()
end

return M
