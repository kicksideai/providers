-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local registry = require("registry")
local json = require("json")
local fixture = require("fixture")
local cases = require("cases")

local M = {}

M.ACTIONS = { "ADD", "DEDUPE", "SUPERSEDE", "CONFLICT", "IGNORE" }

local SEED_AT = "2026-10-01T10:00:00Z"
local FOLLOW_AT = "2026-10-08T10:00:00Z"

function M.target(): any
    local entry, err = registry.get("app.eval:target")
    if err or type(entry) ~= "table" then error("eval target missing: " .. tostring(err)) end
    local target = (entry :: any).meta
    target.scripted = target.answers == "scripted"
    return target
end

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

local function script_verdict(verdict: string?, candidate: any?, seeded: { any })
    if not verdict then return end
    if verdict == "ADD" then fixture.verdict("ADD", {}); return end
    local all, same = {}, {}
    for _, item in ipairs(seeded) do
        all[#all + 1] = item.id
        if candidate and item.key == candidate.key then same[#same + 1] = item.id end
    end
    fixture.verdict(verdict, #same > 0 and same or all)
end

local function held(user: string, memory: string): string
    local out = {}
    for _, item in ipairs(fixture.items(user, memory)) do
        out[#out + 1] = string.format("%s/%s=%s(%s)", item.kind, item.key, tostring(item.value), item.status)
    end
    return table.concat(out, "; ")
end

local function outcome(case: any, target: any, user: string, memory: string): (string, string)
    local session = "eval-" .. memory .. "-"
    local derived = 0
    if target.scripted then fixture.script.reset() end
    if case.seed then
        if target.scripted then fixture.extraction(case.ideal.seed) end
        derived = 1
        local _, seed_err = capture(user, memory, session .. "1", case.seed, SEED_AT, derived)
        if seed_err then return "ERROR", seed_err end
    end
    local stats: any
    if case.reflect then
        if target.scripted and #fixture.items(user, memory, { statuses = { "current" } }) >= 2 then
            fixture.script.respond("structured_output", { items = case.ideal.reflection })
            if #case.ideal.reflection > 0 then fixture.normalization(case.ideal.reflection) end
            script_verdict(case.ideal.verdict, nil, {})
        end
        local _, wake_err = fixture.op(user, "wake", { component_id = memory })
        if wake_err then return "ERROR", tostring(wake_err) end
        local run = fixture.wait_runs(user, memory, "consolidate", 1)[1]
        if run.status ~= "succeeded" then return "ERROR", "consolidation failed: " .. tostring(run.last_error) end
        stats = run.stats
    else
        if target.scripted then
            fixture.extraction(case.ideal.follow)
            script_verdict(case.ideal.verdict, case.ideal.follow[1], fixture.items(user, memory))
        end
        local run, err = capture(user, memory, session .. "2", case.follow, FOLLOW_AT, derived + 1)
        if err then return "ERROR", err end
        stats = run.stats
    end
    if target.scripted and fixture.script.pending("structured_output") > 0 then
        return "ERROR", "the pipeline left a scripted model answer unused"
    end
    fixture.settle(user, memory)
    local action = case.reflect and (((stats.added or 0) > 0) and "ADD" or "IGNORE") or M.classify(stats)
    return action, json.encode(stats) .. " " .. held(user, memory)
end

local function run_case(case: any, target: any): any
    local user = target.user_id or fixture.user("evaluser")
    local memory = fixture.memory(user, { extraction_model = target.extraction_model, judge_model = target.judge_model },
        target.embedding_model)
    local actual, detail = outcome(case, target, user, memory)
    fixture.delete_memory(user, memory)
    return { case = case.name, expected = case.expect, actual = actual, detail = detail }
end

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
