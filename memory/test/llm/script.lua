-- Scripted model responses for the memory suites, kept in app_llm_script so
-- every function frame sees the same queue.

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
    local _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_script (seq INTEGER NOT NULL, method TEXT NOT NULL, response TEXT, failure TEXT)")
    if not err then
        _, err = conn:execute("CREATE TABLE IF NOT EXISTS app_llm_requests (seq INTEGER NOT NULL, method TEXT NOT NULL, schema TEXT)")
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

local function push(method: string, response: any, failure: string?)
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT COUNT(*) AS n FROM app_llm_script")
    local seq = (rows and rows[1] and tonumber(rows[1].n) or 0) + 1
    local _, err = conn:execute("INSERT INTO app_llm_script (seq, method, response, failure) VALUES ($1, $2, $3, $4)",
        { seq, method, response ~= nil and json.encode(response) or sql.NULL, failure or sql.NULL })
    conn:release()
    if err then error(tostring(err)) end
end

function M.respond(method: string, response: any) push(method, response, nil) end
function M.fail(method: string, failure: string) push(method, nil, failure) end

-- Next scripted answer for a method: (response, failure).
function M.take(method: string): (any, string?)
    M.ensure()
    local conn = db()
    local rows, err = conn:query("SELECT seq, response, failure FROM app_llm_script WHERE method = $1 ORDER BY seq LIMIT 1", { method })
    if err then conn:release(); return nil, tostring(err) end
    if not rows or #rows == 0 then conn:release(); return nil, "no scripted " .. method .. " response" end
    conn:execute("DELETE FROM app_llm_script WHERE method = $1 AND seq = $2", { method, rows[1].seq })
    conn:release()
    if rows[1].failure and rows[1].failure ~= "" then return nil, rows[1].failure end
    return json.decode(rows[1].response), nil
end

-- Records the schema a structured_output call asked for.
function M.record(method: string, schema: any)
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT COUNT(*) AS n FROM app_llm_requests")
    local seq = (rows and rows[1] and tonumber(rows[1].n) or 0) + 1
    conn:execute("INSERT INTO app_llm_requests (seq, method, schema) VALUES ($1, $2, $3)",
        { seq, method, schema ~= nil and json.encode(schema) or sql.NULL })
    conn:release()
end

-- Schemas of the recorded calls of a method, oldest first.
function M.requests(method: string): { any }
    M.ensure()
    local conn = db()
    local rows = conn:query("SELECT schema FROM app_llm_requests WHERE method = $1 ORDER BY seq", { method }) or {}
    conn:release()
    local out = {}
    for _, row in ipairs(rows) do out[#out + 1] = json.decode(row.schema) end
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
