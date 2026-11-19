-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Reactivates KB source projections that an earlier kb10 release invalidated
-- because the embedding provider rejected a call. Those releases returned the
-- provider error with its own kind, so Core recorded a deterministic failure
-- and the KB stopped indexing for good. Current releases report the same case
-- as a retryable outage. Every other invalid source projection stays invalid.

local sql = require("sql")
local core_db = require("core_db")
local projection_writer = require("projection_writer")

local M = {}

local SOURCE_KIND = "knowledge.injection.source"
local PAGE_SIZE = 100

local PROVIDER_REJECTIONS: {string} = {
    "api key",
    "apikey",
    "api_key",
    "unauthorized",
    "unauthenticated",
    "authentication",
    "permission denied",
    "permission_denied",
    "forbidden",
    "invalid_request_error",
    "model_not_found",
    "model not found",
    "no models found",
    "no model",
    "does not exist",
    "quota",
    "rate limit",
    "billing",
    "insufficient",
    "provider",
}

function M.is_provider_rejection(message: any): boolean
    if type(message) ~= "string" or message == "" then return false end
    local lowered = (message :: string):lower()
    for _, pattern in ipairs(PROVIDER_REJECTIONS) do
        if lowered:find(pattern, 1, true) then return true end
    end
    return false
end

-- repair pages the invalid source projections through the projection state
-- index and resumes each matching cursor through Core's own pause and resume,
-- which release the retention pin, advance the generation and wake the slot.
function M.repair(db: any): (table?, error?)
    local report = {repaired = {}, kept = 0, failed = {}}
    local after = ""
    while true do
        local rows, err = db:query([[SELECT p.id AS projection_id, c.id AS cursor_id, c.thread_id, c.last_error
            FROM kickside_projection p JOIN kickside_projection_cursor c ON c.projection_id = p.id
            WHERE p.state = 'invalid' AND p.kind = $1 AND c.status = 'invalid' AND p.id > $2
            ORDER BY p.id LIMIT $3]], {SOURCE_KIND, after, PAGE_SIZE})
        if err then return nil, err end
        if type(rows) ~= "table" or #rows == 0 then break end
        for _, row in ipairs(rows) do
            after = tostring(row.projection_id)
            if M.is_provider_rejection(row.last_error) then
                local params = {cursor_id = tostring(row.cursor_id)}
                local _, pause_err = projection_writer.pause(db, tostring(row.thread_id), params)
                local resume_err = nil
                if not pause_err then
                    _, resume_err = projection_writer.resume(db, tostring(row.thread_id), params)
                end
                local step_err = pause_err or resume_err
                if step_err then
                    report.failed[#report.failed + 1] = {cursor_id = row.cursor_id, error = tostring(step_err)}
                else
                    report.repaired[#report.repaired + 1] = row.cursor_id
                end
            else
                report.kept = report.kept + 1
            end
        end
        if #rows < PAGE_SIZE then break end
    end
    return report, nil
end

local function run(_: any?): any
    local db, db_err = sql.get(core_db.id())
    if db_err or not db then
        return {status = "error", message = "kb10 source repair: database unavailable: " .. tostring(db_err)}
    end
    local report, err = M.repair(db)
    db:release()
    if err or not report then
        return {status = "error", message = "kb10 source repair failed: " .. tostring(err)}
    end
    return {
        status = #report.failed > 0 and "error" or "success",
        message = "kb10 source projections: " .. #report.repaired .. " resumed, " .. report.kept
            .. " kept invalid, " .. #report.failed .. " failed",
        details = report,
    }
end

M.run = run
return M
