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
    local _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_script (scope TEXT NOT NULL, seq INTEGER NOT NULL, method TEXT NOT NULL, response TEXT, failure TEXT)")
    if not err then
        _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_requests (scope TEXT NOT NULL, seq INTEGER NOT NULL, method TEXT NOT NULL, schema TEXT, messages TEXT)")
    end
    conn:release()
    if err then error(tostring(err)) end
end

function M.reset(scope: string)
    M.ensure()
    local conn = db()
    local _, script_err = conn:execute("DELETE FROM app_llm_script WHERE scope = $1", { scope })
    if script_err then conn:release(); error(tostring(script_err)) end
    local _, requests_err = conn:execute("DELETE FROM app_llm_requests WHERE scope = $1", { scope })
    if requests_err then conn:release(); error(tostring(requests_err)) end
    conn:release()
end

local function push(scope: string, method: string, response: any, failure: string?, failure_kind: string?, retryable: boolean?, details: any?)
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT COUNT(*) AS n FROM app_llm_script WHERE scope = $1", { scope })
    if read_err then conn:release(); error(tostring(read_err)) end
    local seq = assert(tonumber(rows[1].n)) + 1
    local failure_details = failure_kind ~= nil and { kind = failure_kind, details = details } or {}
    if retryable ~= nil then failure_details.retryable = retryable end
    local encoded = response ~= nil and json.encode(response) or (next(failure_details) ~= nil and json.encode(failure_details) or sql.NULL)
    local _, err = conn:execute("INSERT INTO app_llm_script (scope, seq, method, response, failure) VALUES ($1, $2, $3, $4, $5)",
        { scope, seq, method, encoded, failure or sql.NULL })
    conn:release()
    if err then error(tostring(err)) end
end

function M.respond(scope: string, method: string, response: any, finish_reason: string?)
    push(scope, method, { data = response, finish_reason = finish_reason or "stop" }, nil)
end
function M.fail(scope: string, method: string, failure: string, kind: string?, retryable: boolean?, details: any?)
    push(scope, method, nil, failure, kind, retryable, details)
end

function M.hold(scope: string, method: string)
    push(scope, BARRIER_PREFIX .. method, true, nil)
end

function M.release(scope: string, method: string)
    M.ensure()
    local conn = db()
    local _, err = conn:execute("DELETE FROM app_llm_script WHERE scope = $1 AND method = $2", { scope, BARRIER_PREFIX .. method })
    conn:release()
    if err then error(tostring(err)) end
end

function M.await_release(scope: string, method: string): string?
    local deadline = time.now():add(BARRIER_WAIT_SECONDS * time.SECOND)
    while true do
        local conn = db()
        local rows, err = conn:query("SELECT seq FROM app_llm_script WHERE scope = $1 AND method = $2 LIMIT 1", { scope, BARRIER_PREFIX .. method })
        conn:release()
        if err then return tostring(err) end
        if not rows or #rows == 0 then return nil end
        if time.now():after(deadline) then return "scripted " .. method .. " barrier was not released" end
        time.sleep(10 * time.MILLISECOND)
    end
end

function M.take(scope: string, method: string): (any, string?, string?, boolean?, string?, any?)
    M.ensure()
    local conn = db()
    local rows, err = conn:query("SELECT seq, response, failure FROM app_llm_script WHERE scope = $1 AND method = $2 ORDER BY seq LIMIT 1", { scope, method })
    if err then conn:release(); error(tostring(err)) end
    if not rows or #rows == 0 then conn:release(); return nil, "no scripted " .. method .. " response in scope " .. scope, nil, nil end
    local _, delete_err = conn:execute("DELETE FROM app_llm_script WHERE scope = $1 AND method = $2 AND seq = $3", { scope, method, rows[1].seq })
    conn:release()
    if delete_err then error(tostring(delete_err)) end
    if rows[1].failure and rows[1].failure ~= "" then
        local details = rows[1].response and json.decode(rows[1].response) or {}
        return nil, rows[1].failure, type(details) == "table" and details.kind or nil,
            type(details) == "table" and details.retryable or nil, nil, type(details) == "table" and details.details or nil
    end
    local response = assert(json.decode(rows[1].response))
    return response.data, nil, nil, nil, response.finish_reason
end

function M.record(scope: string, method: string, schema: any, messages: any)
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT COUNT(*) AS n FROM app_llm_requests WHERE scope = $1", { scope })
    if read_err then conn:release(); error(tostring(read_err)) end
    local seq = assert(tonumber(rows[1].n)) + 1
    local _, write_err = conn:execute("INSERT INTO app_llm_requests (scope, seq, method, schema, messages) VALUES ($1, $2, $3, $4, $5)",
        { scope, seq, method, schema ~= nil and json.encode(schema) or sql.NULL, json.encode(messages or {}) })
    conn:release()
    if write_err then error(tostring(write_err)) end
end

function M.requests(scope: string, method: string): { any }
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT schema FROM app_llm_requests WHERE scope = $1 AND method = $2 ORDER BY seq", { scope, method })
    conn:release()
    if read_err then error(tostring(read_err)) end
    local out = {}
    for _, row in ipairs(rows) do out[#out + 1] = assert(json.decode(row.schema)) end
    return out
end

function M.prompts(scope: string, method: string): { any }
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT messages FROM app_llm_requests WHERE scope = $1 AND method = $2 ORDER BY seq", { scope, method })
    conn:release()
    if read_err then error(tostring(read_err)) end
    local out = {}
    for _, row in ipairs(rows) do
        local texts = {}
        for _, message in ipairs(assert(json.decode(row.messages))) do
            texts[message.role] = message.content and message.content[1] and message.content[1].text or ""
        end
        out[#out + 1] = texts
    end
    return out
end

function M.pending(scope: string, method: string): integer
    M.ensure()
    local conn = db()
    local rows, read_err = conn:query("SELECT COUNT(*) AS n FROM app_llm_script WHERE scope = $1 AND method = $2", { scope, method })
    conn:release()
    if read_err then error(tostring(read_err)) end
    return math.floor(assert(tonumber(rows[1].n)))
end

return M
