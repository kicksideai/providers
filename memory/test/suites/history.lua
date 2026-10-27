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
    conn:release()
    if err then error(tostring(err)) end
end

function M.record(host_id: string, messages: { any })
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT COUNT(*) AS n FROM app_history WHERE host_id = $1", { host_id })
    if read_err then conn:release(); error(tostring(read_err)) end
    local seq = tonumber(rows[1].n)
    for _, message in ipairs(messages) do
        seq = seq + 1
        local _, write_err = conn:execute("INSERT INTO app_history (host_id, seq, id, role, content, metadata, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)",
            { host_id, seq, message.id, message.role, message.content, json.encode(message.metadata or {}),
                message.created_at or "2026-10-01T10:00:00Z" })
        if write_err then conn:release(); error(tostring(write_err)) end
    end
    conn:release()
end

local function all(host_id: string): { any }
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT id, role, content, metadata, created_at FROM app_history WHERE host_id = $1 ORDER BY seq", { host_id })
    conn:release()
    if read_err then error(tostring(read_err)) end
    local out = {}
    for _, row in ipairs(rows) do
        out[#out + 1] = { id = row.id, role = row.role, content = row.content, raw_content = row.content,
            metadata = assert(json.decode(row.metadata)), created_at = row.created_at }
    end
    return out
end

local function select_events(args: any): ({ any }?, string?)
    local host = args.host or {}
    local events = all(tostring(host.session_id or ""))
    local sel = args.selector or { mode = "since_checkpoint" }
    if sel.mode == "window" then
        local first = math.max(1, #events - (sel.last or 20) + 1)
        local out = {}
        for i = first, #events do out[#out + 1] = events[i] end
        return out, nil
    elseif sel.mode == "since_id" then
        local out, after = {}, false
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == sel.from_id then after = true end
        end
        if not after then return nil, "since_id anchor not found: " .. tostring(sel.from_id) end
        return out, nil
    elseif sel.mode == "range" then
        local out, after = {}, sel.from_id == nil
        for _, event in ipairs(events) do
            if after then out[#out + 1] = event end
            if event.id == sel.to_id then return out, nil end
            if event.id == sel.from_id then after = true end
        end
        return nil, "range end not found: " .. tostring(sel.to_id)
    elseif sel.mode == "since_checkpoint" or sel.mode == "all" then
        return events, nil
    end
    return nil, "unsupported selector " .. tostring(sel.mode)
end

function M.get_history(args: any): (any, string?)
    local events, err = select_events(args)
    if err then return nil, err end
    return { events = events, count = #events, range = { from_id = events[1] and events[1].id, to_id = events[#events] and events[#events].id } }, nil
end

function M.get_prompt(args: any): (any, string?)
    local events, err = select_events(args)
    if err then return nil, err end
    local lines = {}
    for _, event in ipairs(events) do lines[#lines + 1] = "[" .. event.role .. "] " .. event.content end
    return { text = table.concat(lines, "\n"), range = { from_id = events[1] and events[1].id, to_id = events[#events] and events[#events].id } }, nil
end

function M.get_context(args: any): (any, string?)
    return { context = {}, host = args and args.host, agent = args and args.agent }, nil
end

return M
