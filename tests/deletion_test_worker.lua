-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local funcs = require("funcs")
local sql = require("sql")
local time = require("time")
local uuid = require("uuid")
local process = require("process")
local claim = require("claim")
local lifecycle = require("lifecycle")
local completion = require("completion")
local M = {}

function M.run(id: string): (any?, error?)
    local db = assert(sql.get("app:db"))
    local dialect = assert(db:type())
    local rows = assert(db:query("SELECT * FROM kickside_job WHERE owner_kind='component' AND owner_id=$1 AND status='pending'", {id}))
    local job = assert(rows[1], "deletion request has no pending job")
    local tx = assert(db:begin())
    local token, stamp = uuid.v7(), time.now():utc():format_rfc3339()
    local leased = assert(claim.lease_row(tx, dialect, job.id, token, time.now():add("45s"):utc():format_rfc3339(), stamp))
    job.lease_token, job.execution_seq, job.attempts = token, leased.execution_seq, leased.attempts
    local run = assert(lifecycle.start_job_run(tx, dialect, job, tostring(process.pid()), leased.attempts))
    assert(tx:commit())
    assert(db:release())
    local result, err = funcs.new():with_options({retry = {max_attempts = 1}}):call("kickside.component:delete_worker", {payload = {component_id = id}})
    db = assert(sql.get("app:db"))
    local settle_err: error?
    if err then
        settle_err = completion.fail_job(db, dialect, job, {}, tostring(err), completion.failure_class_for(err), run)
    else
        settle_err = completion.complete_job(db, dialect, job, result, run)
    end
    assert(db:release())
    if settle_err then error(settle_err) end
    return result, err
end

function M.await(id: string): (boolean, error?)
    for _ = 1, 1000 do
        local db = assert(sql.get("app:db"))
        local rows, read_err = db:query([[SELECT c.component_id,j.status FROM kickside_job j
            LEFT JOIN kickside_components c ON CAST(c.component_id AS TEXT)=j.owner_id
            WHERE j.owner_kind='component' AND j.owner_id=$1 AND j.job_type='kickside.component:delete_worker']], {id})
        assert(db:release())
        if read_err then return false, read_err end
        if rows[1] and rows[1].component_id == nil and rows[1].status == "done" then return true, nil end
        time.sleep("10ms")
    end
    return false, errors.new({kind = errors.TIMEOUT, message = "component deletion does not finish"})
end

return M
