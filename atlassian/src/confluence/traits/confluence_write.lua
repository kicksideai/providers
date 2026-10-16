-- ConfluenceWrite — create/update/delete Confluence pages for agents. Connection
-- is bound on the trait (ctx.connection_id); an optional pinned space
-- (ctx.space_key) defaults create_page's space. Bodies are Confluence storage
-- format (XHTML). update_page fetches the current version first.

local ctx = require("ctx")
local transport = require("transport")
local confluence = require("confluence")
local tool_result = require("tool_result")

type WriteArgs = {
    action: string?,
    space_key: string?,
    title: string?,
    body: string?,
    parent_id: string?,
    page_id: string?,
}

-- A failed Confluence answer is the tool's domain error carrying the failed
-- Result: Confluence's message, HTTP status and error body.
local function confluence_error(r: any): any
    return tool_result.domain_error(r.error, r)
end

local function handler(args: any): (any?, error?)
    local a = (args or {}) :: WriteArgs
    local conn, err = transport.connect(ctx.get("connection_id") :: string?)
    if not conn then return nil, err end

    local action = a.action

    if action == "create_page" then
        local space = a.space_key or (ctx.get("space_key") :: string?)
        local r, r_err = confluence.create_page(conn, space, a.title, a.body, a.parent_id)
        if not r then return nil, r_err end
        if not r.success then return confluence_error(r) end
        return { success = true, action = action, result = "created", page_id = r.data.id, title = r.data.title, page = r.data }

    elseif action == "update_page" then
        if not a.page_id or a.page_id == "" then return tool_result.domain_error("page_id required") end
        local cur, cur_err = confluence.get_page(conn, a.page_id)
        if not cur then return nil, cur_err end
        if not cur.success then return confluence_error(cur) end
        local p: any = cur.data or {}
        local version = (type(p.version) == "table" and p.version.number or 0) :: integer
        local title = a.title or (p.title :: string?)
        local r, r_err = confluence.update_page(conn, a.page_id, title, a.body, version)
        if not r then return nil, r_err end
        if not r.success then return confluence_error(r) end
        return { success = true, action = action, result = "updated", page_id = tostring(a.page_id), version = version + 1, page = r.data }

    elseif action == "delete_page" then
        local r, r_err = confluence.delete_page(conn, a.page_id)
        if not r then return nil, r_err end
        if not r.success then return confluence_error(r) end
        return { success = true, action = action, result = "deleted", page_id = tostring(a.page_id or "") }
    end

    return tool_result.domain_error("unknown action '" .. tostring(action) .. "'")
end

return { handler = handler }
