local ctx = require("ctx")
local data_error = require("data_error")
local jira = require("jira")
local transport = require("transport")

local M = {}

type Deps = { transport: any?, jira: any? }

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s+", ""):gsub("%s+$", ""))
end

local function quote_jql(value: string): string
    return '"' .. value:gsub("\\", "\\\\"):gsub('"', '\\"') .. '"'
end

local function resolve_dest_ref(req: any): any
    if type(req.dest_ref) == "table" then return req.dest_ref end
    local refs = type(req.dest_refs) == "table" and req.dest_refs or nil
    local slot = trim(req.map_slot)
    if slot == "" then slot = "default" end
    local selected = refs and type((refs :: any)[slot]) == "table" and (refs :: any)[slot] or nil
    if selected and type((selected :: any).dest_ref) == "table" then return (selected :: any).dest_ref end
    return nil
end

local function issue_key_from(req: any, input: any): string
    local ref = resolve_dest_ref(req)
    if type(ref) == "table" then
        local key = trim((ref :: any).issue_key or (ref :: any).key)
        if key ~= "" then return key end
    end
    return trim(input.issue_key or input.key)
end

local function dest_ref(data: any, fallback_key: string?): any
    local key = trim(type(data) == "table" and ((data :: any).key or (data :: any).id) or fallback_key)
    local id = trim(type(data) == "table" and (data :: any).id or "")
    local out: any = { issue_key = key }
    if id ~= "" then out.id = id end
    return out
end

local function version_of(data: any): string?
    if type(data) ~= "table" then return nil end
    local fields = type((data :: any).fields) == "table" and (data :: any).fields or {}
    local updated = trim((fields :: any).updated or (data :: any).updated)
    if updated ~= "" then return updated end
    return nil
end

local function external_key(input: any, req: any): string
    local key = trim(input.external_key)
    if key == "" then key = trim(input.item_key) end
    if key == "" then key = trim(req.identity_key) end
    return key
end

local function extra_fields(input: any, config: any, req: any): any
    local out: any = {}
    if type(input.fields) == "table" then for k, v in pairs(input.fields) do out[k] = v end end
    if type(input.extra_fields) == "table" then for k, v in pairs(input.extra_fields) do out[k] = v end end
    local key_field = trim(input.external_key_field or config.external_key_field)
    local key = external_key(input, req)
    if key_field ~= "" and key ~= "" then out[key_field] = key end
    return out
end

local function find_by_external_key(api: any, conn: any, config: any, input: any, req: any): (string?, any?, any?, error?)
    local key_field = trim(input.external_key_field or config.external_key_field)
    local key = external_key(input, req)
    if key_field == "" or key == "" then return nil, nil, nil end
    local jql = quote_jql(key_field) .. " = " .. quote_jql(key)
    local project = trim(config.project_key)
    if project ~= "" then jql = "project = " .. project .. " AND " .. jql end
    local res, search_err = api.search_issues(conn, jql, 0, 1)
    if search_err then return nil, nil, nil, search_err end
    if type(res) ~= "table" or not res.success then return nil, nil, data_error.from_result(res, "search Jira external key") end
    local rows = type(res.data) == "table" and (res.data :: any).issues or nil
    local row = type(rows) == "table" and rows[1] or nil
    if type(row) == "table" then return trim(row.key or row.id), row, nil end
    return nil, nil, nil
end

local function ok(result: string, data: any, key: string?): any
    local out: any = { success = true, result = result }
    local ref = dest_ref(data, key)
    if trim(ref.issue_key) ~= "" then out.dest_ref = ref end
    local version = version_of(data)
    if version then out.dest_version = version end
    return out
end

local function add_side_effects(api: any, conn: any, key: string, input: any): (any?, error?)
    local comment = trim(input.comment)
    if comment ~= "" then
        local cr, comment_err = api.add_comment(conn, key, comment)
        if comment_err then return nil, comment_err end
        if type(cr) ~= "table" or not cr.success then return data_error.from_result(cr, "add Jira comment") end
    end
    local seconds = tonumber(input.time_spent_seconds)
    if seconds and seconds > 0 then
        local wr, worklog_err = api.add_worklog(conn, key, trim(input.worklog_comment or input.comment), seconds)
        if worklog_err then return nil, worklog_err end
        if type(wr) ~= "table" or not wr.success then return data_error.from_result(wr, "add Jira worklog") end
    end
    return nil
end

local function create_or_update(api: any, conn: any, req: any, input: any, config: any): (any?, error?)
    local key = issue_key_from(req, input)
    if key == "" then
        local ferr, typed_err
        key, _, ferr, typed_err = find_by_external_key(api, conn, config, input, req)
        if typed_err then return nil, typed_err end
        if ferr then return ferr end
        if key == nil then key = "" end
    end
    if key ~= "" then
        local res, update_err = api.update_issue(conn, key, extra_fields(input, config, req))
        if update_err then return nil, update_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "update Jira issue") end
        local serr, side_effect_err = add_side_effects(api, conn, key, input)
        if side_effect_err then return nil, side_effect_err end
        if serr then return serr end
        return ok("updated", res.data, key)
    end
    local project = trim(input.project_key or config.project_key)
    local res, create_err = api.create_issue(conn, project, input.summary or input.title, input.issue_type, input.description or input.content, extra_fields(input, config, req))
    if create_err then return nil, create_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "create Jira issue") end
    local created_key = trim(type(res.data) == "table" and (res.data :: any).key or "")
    local serr, side_effect_err = add_side_effects(api, conn, created_key, input)
    if side_effect_err then return nil, side_effect_err end
    if serr then return serr end
    return ok("created", res.data, created_key)
end

local function update(api: any, conn: any, req: any, input: any, config: any): (any?, error?)
    local key = issue_key_from(req, input)
    if key == "" then return data_error.invalid_request("update requires dest_ref.issue_key or input.issue_key") end
    local res, update_err = api.update_issue(conn, key, extra_fields(input, config, req))
    if update_err then return nil, update_err end
    if type(res) ~= "table" or not res.success then return data_error.from_result(res, "update Jira issue") end
    local serr, side_effect_err = add_side_effects(api, conn, key, input)
    if side_effect_err then return nil, side_effect_err end
    if serr then return serr end
    return ok("updated", res.data, key)
end

local function delete(api: any, conn: any, req: any, input: any): (any?, error?)
    local key = issue_key_from(req, input)
    if key == "" then return data_error.invalid_request("delete requires dest_ref.issue_key or input.issue_key") end
    local res, delete_err = api.delete_issue(conn, key, input.delete_subtasks == true)
    if delete_err then return nil, delete_err end
    if type(res) == "table" and res.success then return { success = true, result = "deleted" } end
    if type(res) == "table" and tonumber(res.status_code) == 404 then return { success = true, result = "deleted" } end
    return data_error.from_result(res, "delete Jira issue")
end

function M.write(req: any, deps: Deps?): (any?, error?)
    req = type(req) == "table" and req or {}
    if trim(req.identity_key) == "" or trim(req.idempotency_key) == "" then
        return data_error.invalid_request("identity_key and idempotency_key are required")
    end
    if type(req.input) ~= "table" then return data_error.invalid_request("write input must be a record") end
    deps = type(deps) == "table" and deps or {}
    local tp = deps.transport or transport
    local api = deps.jira or jira
    local config = type(req.config) == "table" and req.config or {}
    local input = type(req.input) == "table" and req.input or {}
    local connection_id = trim(config.connection_id)
    if connection_id == "" then connection_id = trim(ctx.get("connection_id")) end
    local conn, cerr = tp.connect(connection_id ~= "" and connection_id or nil)
    if cerr or not conn then return data_error.connection(tostring(cerr or "no connection")) end

    local op = trim(req.sink_op)
    if op == "" then op = "upsert" end
    if op == "upsert" or op == "create" then return create_or_update(api, conn, req, input, config) end
    if op == "update" then return update(api, conn, req, input, config) end
    if op == "delete" then return delete(api, conn, req, input) end
    local key = issue_key_from(req, input)
    if op == "add_comment" then
        if key == "" then return data_error.invalid_request("add_comment requires an issue key") end
        local res, comment_err = api.add_comment(conn, key, trim(input.comment or input.body))
        if comment_err then return nil, comment_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "add Jira comment") end
        return ok("updated", res.data, key)
    end
    if op == "add_worklog" then
        if key == "" then return data_error.invalid_request("add_worklog requires an issue key") end
        local seconds: integer? = nil
        local n = tonumber(input.time_spent_seconds)
        if n then seconds = n :: integer end
        local res, worklog_err = api.add_worklog(conn, key, trim(input.comment or input.body), seconds)
        if worklog_err then return nil, worklog_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "add Jira worklog") end
        return ok("updated", res.data, key)
    end
    if op == "transition" then
        if key == "" then return data_error.invalid_request("transition requires an issue key") end
        local res, transition_err = api.transition_issue(conn, key, trim(input.transition_id))
        if transition_err then return nil, transition_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "transition Jira issue") end
        return { success = true, result = "updated", dest_ref = { issue_key = key } }
    end
    if op == "assign" then
        if key == "" then return data_error.invalid_request("assign requires an issue key") end
        local res, assign_err = api.assign_issue(conn, key, trim(input.account_id))
        if assign_err then return nil, assign_err end
        if type(res) ~= "table" or not res.success then return data_error.from_result(res, "assign Jira issue") end
        return { success = true, result = "updated", dest_ref = { issue_key = key } }
    end
    return data_error.invalid_request("unsupported sink operation: " .. op)
end

return M
