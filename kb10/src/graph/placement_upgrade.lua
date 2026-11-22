-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local component = require("component")
local execution_identity = require("execution_identity")
local json = require("json")
local log = require("logger"):named("kb10.placement.upgrade")
local ops = require("ops")

local PRODUCER = "kickside.kb10.graph:enroll_placement"
local OWNER = "kickside.kb10.graph:placement_upgrade"
local ELIGIBLE = "kb_type = 'wiki' AND COALESCE(enrichment_agent_id, '') = ''"
local PAGE_SIZE = 32
local SAMPLE_SIZE = 12

local function query(statement: string, args: any?): (any?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local rows, query_err = db:query(statement, args or {})
    local _, release_err = db:release()
    if query_err or release_err then return nil, query_err or release_err end
    return rows, nil
end

local function execute(statement: string, args: any?): (any?, error?)
    local db, open_err = ops.get_db()
    if not db then return nil, open_err end
    local result, execute_err = db:execute(statement, args or {})
    local _, release_err = db:release()
    if execute_err or release_err then return nil, execute_err or release_err end
    return result, nil
end

local function state(): (any?, error?)
    local rows, err = query("SELECT upper_id, after_id, enrolled, skipped, unresolved, issues, done FROM kb10_placement_enrollment WHERE id = 1")
    if err then return nil, err end
    if rows and rows[1] then return rows[1], nil end
    local _, init_err = execute([[INSERT INTO kb10_placement_enrollment
        (id, upper_id, after_id, enrolled, skipped, unresolved, issues, done)
        VALUES (1, COALESCE((SELECT id FROM kb10_stores WHERE ]] .. ELIGIBLE .. [[ ORDER BY id DESC LIMIT 1), ''),
            '', 0, 0, 0, '[]', 0)
        ON CONFLICT (id) DO NOTHING]])
    if init_err then return nil, init_err end
    rows, err = query("SELECT upper_id, after_id, enrolled, skipped, unresolved, issues, done FROM kb10_placement_enrollment WHERE id = 1")
    return rows and rows[1] or nil, err
end

local function enroll(component_id: string): (any?, error?)
    local receipt, err = component.get_identity_receipt(component_id)
    if err then return nil, err end
    if not receipt or not receipt.component_incarnation then
        return {status = "unresolved", code = "component_incarnation_missing",
            reason = "component has no immutable incarnation"}, nil
    end
    return execution_identity.run_as(receipt.execution_identity, PRODUCER, { component_id = component_id },
        {deferred_owner = OWNER})
end

local function describe(state: any, issues: any): any
    local unresolved = tonumber(state.unresolved) or 0
    local enrolled = tonumber(state.enrolled) or 0
    local skipped = tonumber(state.skipped) or 0
    local message = "Wiki placement enrollment: " .. enrolled .. " enrolled, " .. unresolved .. " unresolved, " .. skipped .. " skipped"
    if unresolved > 0 then log:warn(message, {issues = issues}) end
    return {status = "success", message = message, details = {
        outcome = unresolved == 0 and "enrolled" or "unresolved",
        enrolled = enrolled, unresolved = unresolved, skipped = skipped, issues = issues,
    }}
end

local function record(state: any, row: any, result: any, issue: any, issues: any): (boolean?, error?)
    local enrolled = result.status == "enrolled" and 1 or 0
    local skipped = result.status == "ineligible" and 1 or 0
    local unresolved = issue and 1 or 0
    if issue and #issues < SAMPLE_SIZE then issues[#issues + 1] = issue end
    local encoded, encode_err = json.encode(issues)
    if encode_err then return nil, encode_err end
    local changed, err = execute([[UPDATE kb10_placement_enrollment
        SET after_id = $1, enrolled = enrolled + $2, skipped = skipped + $3,
            unresolved = unresolved + $4, issues = $5
        WHERE id = 1 AND after_id = $6 AND done = 0]],
        {row.id, enrolled, skipped, unresolved, encoded, state.after_id})
    if err then return nil, err end
    if not changed or tonumber(changed.rows_affected) ~= 1 then return false, nil end
    state.after_id, state.issues = row.id, encoded
    state.enrolled = (tonumber(state.enrolled) or 0) + enrolled
    state.skipped = (tonumber(state.skipped) or 0) + skipped
    state.unresolved = (tonumber(state.unresolved) or 0) + unresolved
    return true, nil
end

local function sweep(): (any?, error?)
    while true do
        local progress, state_err = state()
        if not progress then return nil, state_err end
        local issues, decode_err = json.decode(progress.issues)
        if decode_err then return nil, decode_err end
        if tonumber(progress.done) == 1 then return describe(progress, issues), nil end
        local rows, scan_err = query("SELECT id, component_id FROM kb10_stores WHERE " .. ELIGIBLE
            .. " AND id > $1 AND id <= $2 ORDER BY id LIMIT $3", {progress.after_id, progress.upper_id, PAGE_SIZE})
        if scan_err then return nil, scan_err end
        if #rows == 0 then
            local finished, finish_err = execute("UPDATE kb10_placement_enrollment SET done = 1 WHERE id = 1 AND after_id = $1 AND done = 0",
                {progress.after_id})
            if finish_err then return nil, finish_err end
            if finished and tonumber(finished.rows_affected) == 1 then return describe(progress, issues), nil end
        end
        for _, row in ipairs(rows) do
            local result, err = enroll(row.component_id)
            if err and (err:retryable() or errors.is(err, errors.UNAVAILABLE) or errors.is(err, errors.TIMEOUT)) then
                return nil, errors.wrap(err, "Wiki placement enrollment for " .. row.component_id)
            end
            local issue
            if err or not result or result.status == "unresolved" then
                local details = err and err:details()
                issue = {component_id = row.component_id, code = (details and details.code)
                    or (result and result.code) or "enrollment_refused",
                    reason = tostring(err or (result and result.reason) or "no enrollment result"):sub(1, 512)}
            end
            local advanced, advance_err = record(progress, row, result or {}, issue, issues)
            if advance_err then return nil, advance_err end
            if not advanced then break end
        end
    end
end

local function run(): any
    local report, err = sweep()
    if report then return report end
    return {status = "error", message = "Wiki placement enrollment stopped: " .. tostring(err)}
end

return {run = run}
