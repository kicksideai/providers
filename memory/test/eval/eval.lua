-- Capture and reconcile eval: runs each case through two captures of an agent
-- session on a fresh memory, classifies what the second capture did from its
-- derive run, and scores precision and recall per action. A scripted target
-- answers every model call with the case's ideal answers; a live target names
-- real models and leaves the answers to them.

local registry = require("registry")
local json = require("json")
local fixture = require("fixture")
local cases = require("cases")

local M = {}

M.ACTIONS = { "ADD", "DEDUPE", "SUPERSEDE", "CONFLICT", "IGNORE" }

local SEED_AT = "2026-10-01T10:00:00Z"
local FOLLOW_AT = "2026-10-08T10:00:00Z"

-- Target of a run, from the meta of app.eval:target: extraction_model,
-- judge_model, embedding_model, answers ("scripted" or "live"), and user_id
-- to run as an existing user.
function M.target(): any
    local entry, err = registry.get("app.eval:target")
    if err or type(entry) ~= "table" then error("eval target missing: " .. tostring(err)) end
    local target = (entry :: any).meta
    target.scripted = target.answers == "scripted"
    return target
end

-- The action a derive run took, from its stats.
function M.classify(stats: any): string
    if (stats.conflicted or 0) > 0 then return "CONFLICT" end
    if (stats.superseded or 0) > 0 then return "SUPERSEDE" end
    if (stats.merged or 0) > 0 then return "DEDUPE" end
    if (stats.added or 0) > 0 or (stats.restored or 0) > 0 then return "ADD" end
    if (stats.noop or 0) > 0 then return "DEDUPE" end
    return "IGNORE"
end

local function stamp(messages: { any }, at: string): { any }
    local out = {}
    for i, message in ipairs(messages) do
        local copy = {}
        for k, v in pairs(message) do copy[k] = v end
        copy.created_at = at
        out[i] = copy
    end
    return out
end

-- Captures messages in a session and returns the derive run of that session.
local function capture(user: string, memory: string, session: string, messages: { any }, at: string, count: integer): (any?, string?)
    fixture.history.record(session, stamp(messages, at))
    local _, err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session, "eval-agent") },
        fixture.agent_context(memory, session, "eval-agent"))
    if err then return nil, "capture failed: " .. tostring(err) end
    for _, run in ipairs(fixture.wait_runs(user, memory, "derive", count)) do
        if run.host_id == session then
            if run.status ~= "succeeded" then return nil, "derive failed: " .. tostring(run.last_error) end
            fixture.settle(user, memory)
            return run, nil
        end
    end
    return nil, "no derive run for session " .. session
end

-- Scripts the ideal follow-up answers; a verdict targets the seeded items.
local function script_follow(case: any, seeded: { any })
    fixture.extraction(case.ideal.follow)
    if case.ideal.verdict then
        local ids = {}
        for _, item in ipairs(seeded) do ids[#ids + 1] = item.id end
        fixture.verdict(case.ideal.verdict, case.ideal.verdict == "ADD" and {} or ids)
    end
end

-- Runs both captures of a case; a failed capture is the case's outcome.
local function outcome(case: any, target: any, user: string, memory: string): (string, string)
    local session = "eval-" .. memory .. "-"
    if target.scripted then fixture.script.reset(); fixture.extraction(case.ideal.seed) end
    local _, seed_err = capture(user, memory, session .. "1", case.seed, SEED_AT, 1)
    if seed_err then return "ERROR", seed_err end
    if target.scripted then script_follow(case, fixture.items(user, memory)) end
    local run, err = capture(user, memory, session .. "2", case.follow, FOLLOW_AT, 2)
    if err then return "ERROR", err end
    if target.scripted and fixture.script.pending("structured_output") > 0 then
        return "ERROR", "the pipeline left a scripted model answer unused"
    end
    local held = {}
    for _, item in ipairs(fixture.items(user, memory)) do
        held[#held + 1] = string.format("%s/%s=%s(%s)", item.kind, item.key, tostring(item.value), item.status)
    end
    return M.classify(run.stats), json.encode(run.stats) .. " " .. table.concat(held, "; ")
end

local function run_case(case: any, target: any): any
    local user = target.user_id or fixture.user("evaluser")
    local memory = fixture.memory(user, { extraction_model = target.extraction_model, judge_model = target.judge_model },
        target.embedding_model)
    local actual, detail = outcome(case, target, user, memory)
    fixture.delete_memory(user, memory)
    return { case = case.name, expected = case.expect, actual = actual, detail = detail }
end

-- Precision and recall per action over case rows.
function M.score(rows: { any }): { [string]: any }
    local out = {}
    for _, action in ipairs(M.ACTIONS) do
        local tp, fp, fn = 0, 0, 0
        for _, row in ipairs(rows) do
            if row.actual == action and row.expected == action then tp = tp + 1
            elseif row.actual == action then fp = fp + 1
            elseif row.expected == action then fn = fn + 1 end
        end
        out[action] = {
            precision = tp + fp > 0 and tp / (tp + fp) or nil,
            recall = tp + fn > 0 and tp / (tp + fn) or nil,
            support = tp + fn,
        }
    end
    return out
end

local function pct(value: number?): string
    if value == nil then return "  -" end
    return string.format("%3d", math.floor(value * 100 + 0.5))
end

function M.report(target: any, rows: { any }, scores: { [string]: any }): string
    local lines = { string.format("memory eval: extraction=%s judge=%s embedding=%s", target.extraction_model, target.judge_model, target.embedding_model),
        "action     precision recall support" }
    for _, action in ipairs(M.ACTIONS) do
        local s = scores[action]
        lines[#lines + 1] = string.format("%-10s %9s %6s %7d", action, pct(s.precision), pct(s.recall), s.support)
    end
    for _, row in ipairs(rows) do
        lines[#lines + 1] = string.format("%s %-34s expected %-9s got %-9s %s", row.expected == row.actual and "ok  " or "MISS",
            row.case, row.expected, row.actual, row.detail)
    end
    return table.concat(lines, "\n")
end

function M.run(target: any): ({ any }, { [string]: any })
    local rows = {}
    for _, case in ipairs(cases) do rows[#rows + 1] = run_case(case, target) end
    return rows, M.score(rows)
end

return M
