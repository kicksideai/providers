-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local sql = require("sql")
local json = require("json")

local M = {}
local BARRIER_PREFIX = "__barrier__:"
local BARRIER_WAIT_SECONDS = 60

local function db(): any
    local conn, err = sql.get("app:db")
    if err then error(tostring(err)) end
    return conn
end

function M.ensure()
    local conn = db()
    local _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_script (seq INTEGER NOT NULL, method TEXT NOT NULL, response TEXT, failure TEXT)")
    if not err then
        _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_requests (seq INTEGER NOT NULL, method TEXT NOT NULL, schema TEXT, messages TEXT)")
    end
    conn:release()
    if err then error(tostring(err)) end
end

function M.reset()
    M.ensure()
    local conn = db()
    conn:execute("DELETE FROM app_llm_script")
    conn:execute("DELETE FROM app_llm_requests")
    conn:release()
end

local function push(method: string, response: any, failure: string?, failure_kind: string?, retryable: boolean?, details: any?)
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT COUNT(*) AS n FROM app_llm_script")
    local seq = (rows and rows[1] and tonumber(rows[1].n) or 0) + 1
    local failure_details = failure_kind ~= nil and { kind = failure_kind, details = details } or {}
    if retryable ~= nil then failure_details.retryable = retryable end
    local encoded = response ~= nil and json.encode(response) or (next(failure_details) ~= nil and json.encode(failure_details) or sql.NULL)
    local _, err = conn:execute("INSERT INTO app_llm_script (seq, method, response, failure) VALUES ($1, $2, $3, $4)",
        { seq, method, encoded, failure or sql.NULL })
    conn:release()
    if err then error(tostring(err)) end
end

function M.respond(method: string, response: any, finish_reason: string?)
    push(method, { data = response, finish_reason = finish_reason or "stop" }, nil)
end
function M.fail(method: string, failure: string, kind: string?, retryable: boolean?, details: any?)
    push(method, nil, failure, kind, retryable, details)
end

function M.hold(method: string)
    push(BARRIER_PREFIX .. method, true, nil)
end

function M.release(method: string)
    M.ensure()
    local conn = db()
    local _, err = conn:execute("DELETE FROM app_llm_script WHERE method = $1", { BARRIER_PREFIX .. method })
    conn:release()
    if err then error(tostring(err)) end
end

function M.await_release(method: string): string?
    local deadline = time.now():add(BARRIER_WAIT_SECONDS * time.SECOND)
    while true do
        local conn = db()
        local rows, err = conn:query("SELECT seq FROM app_llm_script WHERE method = $1 LIMIT 1", { BARRIER_PREFIX .. method })
        conn:release()
        if err then return tostring(err) end
        if not rows or #rows == 0 then return nil end
        if time.now():after(deadline) then return "scripted " .. method .. " barrier was not released" end
        time.sleep(10 * time.MILLISECOND)
    end
end

function M.take(method: string): (any, string?, string?, boolean?, string?, any?)
    M.ensure()
    local conn = db()
    local rows, err = conn:query("SELECT seq, response, failure FROM app_llm_script WHERE method = $1 ORDER BY seq LIMIT 1", { method })
    if err then conn:release(); return nil, tostring(err), nil, nil end
    if not rows or #rows == 0 then conn:release(); return nil, "no scripted " .. method .. " response", nil, nil end
    conn:execute("DELETE FROM app_llm_script WHERE method = $1 AND seq = $2", { method, rows[1].seq })
    conn:release()
    if rows[1].failure and rows[1].failure ~= "" then
        local details = rows[1].response and json.decode(rows[1].response) or {}
        return nil, rows[1].failure, type(details) == "table" and details.kind or nil,
            type(details) == "table" and details.retryable or nil, nil, type(details) == "table" and details.details or nil
    end
    local response = json.decode(rows[1].response)
    return response.data, nil, nil, nil, response.finish_reason
end

function M.record(method: string, schema: any, messages: any)
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT COUNT(*) AS n FROM app_llm_requests")
    local seq = (rows and rows[1] and tonumber(rows[1].n) or 0) + 1
    conn:execute("INSERT INTO app_llm_requests (seq, method, schema, messages) VALUES ($1, $2, $3, $4)",
        { seq, method, schema ~= nil and json.encode(schema) or sql.NULL, json.encode(messages or {}) })
    conn:release()
end

function M.requests(method: string): { any }
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT schema FROM app_llm_requests WHERE method = $1 ORDER BY seq", { method }) or {}
    conn:release()
    local out = {}
    for _, row in ipairs(rows) do out[#out + 1] = json.decode(row.schema) end
    return out
end

function M.prompts(method: string): { any }
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT messages FROM app_llm_requests WHERE method = $1 ORDER BY seq", { method }) or {}
    conn:release()
    local out = {}
    for _, row in ipairs(rows) do
        local texts = {}
        for _, message in ipairs(json.decode(row.messages) or {}) do
            texts[message.role] = message.content and message.content[1] and message.content[1].text or ""
        end
        out[#out + 1] = texts
    end
    return out
end

function M.pending(method: string): integer
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT COUNT(*) AS n FROM app_llm_script WHERE method = $1", { method })
    conn:release()
    return rows and rows[1] and tonumber(rows[1].n) or 0
end

return M
