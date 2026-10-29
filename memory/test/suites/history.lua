-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local json = require("json")

local M = {}

local function db(): any
    local conn, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return conn
end

function M.ensure()
    local conn = db()
    local _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_history (host_id TEXT NOT NULL, seq INTEGER NOT NULL, id TEXT NOT NULL, role TEXT NOT NULL, content TEXT NOT NULL, metadata TEXT NOT NULL, created_at TEXT NOT NULL)")
    if not err then
        _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_history_context (host_id TEXT PRIMARY KEY NOT NULL, checkpoint_id TEXT)")
    end
    conn:release()
    if err then error(tostring(err)) end
end

function M.set_checkpoint(host_id: string, checkpoint_id: string?)
    M.ensure()
    local conn = db()
    local _, err = conn:execute("INSERT INTO app_history_context (host_id, checkpoint_id) VALUES ($1, $2) ON CONFLICT(host_id) DO UPDATE SET checkpoint_id = excluded.checkpoint_id",
        { host_id, checkpoint_id })
    conn:release()
    if err then error(tostring(err)) end
end

local function checkpoint(conn: any, host_id: string): (string?, any?)
    local rows, err = conn:query("SELECT checkpoint_id FROM app_history_context WHERE host_id = $1", { host_id })
    if err then return nil, err end
    return rows[1] and rows[1].checkpoint_id or nil, nil
end

function M.record(host_id: string, messages: { any })
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT COUNT(*) AS n FROM app_history WHERE host_id = $1", { host_id })
    if read_err then conn:release(); error(tostring(read_err)) end
    local seq = assert(tonumber(rows[1].n))
    for _, message in ipairs(messages) do
        local metadata = {}
        for key, value in pairs(message.metadata or {}) do metadata[key] = value end
        metadata.author = message.author
        seq = seq + 1
        local _, write_err = conn:execute("INSERT INTO app_history (host_id, seq, id, role, content, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            { host_id, seq, message.id, message.role, message.content, json.encode(metadata),
                message.created_at or "2026-10-01T10:00:00Z" })
        if write_err then conn:release(); error(tostring(write_err)) end
    end
    conn:release()
end

local function all(conn: any, host_id: string): ({ any }?, any?)
    local rows, read_err = conn:query("SELECT id, role, content, metadata, created_at FROM app_history WHERE host_id = $1 ORDER BY seq", { host_id })
    if read_err then return nil, read_err end
    local out = {}
    for _, row in ipairs(rows) do
        out[#out + 1] = { id = row.id, role = row.role, content = row.content, raw_content = row.content,
            author = assert(json.decode(row.metadata)).author, metadata = assert(json.decode(row.metadata)), created_at = row.created_at }
    end
    return out, nil
end

local function without_anchor(events: { any }, anchor_id: any): { any }
    if type(anchor_id) ~= "string" or anchor_id == "" then return events end
    local out = {}
    for _, event in ipairs(events) do
        if event.id ~= anchor_id then out[#out + 1] = event end
    end
    return out
end

local function clamp_events(events: { any }, max_chars: any): ({ any }, boolean)
    local limit = tonumber(max_chars)
    if not limit or limit <= 0 then return events, false end
    local total, out = 0, {}
    for _, event in ipairs(events) do
        local content = event.raw_content
        if total + #content > limit then return out, true end
        total = total + #content
        out[#out + 1] = event
    end
    return out, false
end

local function select_events(conn: any, args: any): ({ any }?, string?)
    local host = args.host or {}
    local host_id = host.kind == "dataflow" and (host.dataflow_id .. ":" .. host.node_id) or tostring(host.session_id or "")
    local events, all_err = all(conn, host_id)
    if all_err then return nil, tostring(all_err) end
    local sel = args.selector or { mode = "since_checkpoint" }
    if sel.mode == "window" then
        local last = sel.last == nil and 20 or tonumber(sel.last)
        if not last or last <= 0 then return nil, "selector.last must be positive for window" end
        local first = math.max(1, #events - last + 1)
        local out = {}
        for i = first, #events do out[#out + 1] = events[i] end
        return out, nil
    elseif sel.mode == "since_id" then
        if type(sel.from_id) ~= "string" or sel.from_id == "" then return nil, "selector.from_id is required for since_id" end
        local out, after = {}, false
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == sel.from_id then after = true end
        end
        return without_anchor(out, sel.from_id), nil
    elseif sel.mode == "range" then
        if sel.from_id ~= nil and (type(sel.from_id) ~= "string" or sel.from_id == "") then return nil, "selector.from_id must be a message id" end
        if sel.to_id ~= nil and (type(sel.to_id) ~= "string" or sel.to_id == "") then return nil, "selector.to_id must be a message id" end
        if sel.from_id ~= nil and sel.from_id == sel.to_id then return {}, nil end
        local out, after = {}, sel.from_id == nil
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == sel.to_id then return out, nil end
            if event.id == sel.from_id then after = true end
        end
        if sel.to_id == nil or sel.to_id == "" then return without_anchor(out, sel.from_id), nil end
        return nil, "Range end message not found: " .. tostring(sel.to_id)
    elseif sel.mode == "checkpoint" then
        if type(sel.checkpoint_id) ~= "string" or sel.checkpoint_id == "" then return nil, "selector.checkpoint_id is required for checkpoint" end
        local out, after = {}, false
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == sel.checkpoint_id then after = true end
        end
        return without_anchor(out, sel.checkpoint_id), nil
    elseif sel.mode == "since_checkpoint" then
        local checkpoint_id, checkpoint_err = checkpoint(conn, host_id)
        if checkpoint_err then return nil, tostring(checkpoint_err) end
        if not checkpoint_id or checkpoint_id == "" then return events, nil end
        local out, after = {}, false
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == checkpoint_id then after = true end
        end
        return out, nil
    elseif sel.mode == "all" then
        return events, nil
    end
    return nil, "unknown selector mode: " .. tostring(sel.mode)
end

function M.get_history_from(conn: any, args: any): (any?, string?)
    local events, err = select_events(conn, args)
    if err then return nil, err end
    local selector = args.selector or {}
    local truncated
    local selected = events :: { any }
    selected, truncated = clamp_events(selected, selector.max_chars)
    return { events = selected, count = #selected, truncated = truncated,
        range = { from_id = selected[1] and selected[1].id, to_id = selected[#selected] and selected[#selected].id, checkpoint_id = selector.checkpoint_id } }, nil
end

function M.get_history(args: any): (any?, string?)
    M.ensure()
    local conn = db()
    local history, err = M.get_history_from(conn, args)
    conn:release()
    return history, err
end

function M.get_prompt(args: any): (any, string?)
    local history, err = M.get_history(args)
    if err then return nil, err end
    local lines = {}
    for _, event in ipairs(history.events) do lines[#lines + 1] = "[" .. event.role .. "] " .. event.content end
    return { text = table.concat(lines, "\n"), range = history.range, truncated = history.truncated }, nil
end

function M.get_context(args: any): (any, string?)
    return { context = {}, host = args and args.host, agent = args and args.agent }, nil
end

return M
