-- The generator's dataflow cycle node: the LLM-backed edge around the pure draft loop.
--
-- Each iteration resolves the SDK reference for the whitelist (once, cached in state),
-- drafts Lua via structured output, and validates it by a side-effect-free dry-run —
-- running the draft in the eval sandbox with the simulation sdk (run_code.dry_run via
-- funcs.call). generator.advance owns the accept/redraft decision; this node supplies the
-- draft_fn (the model) and validate_fn (the gate) and packages the cycle envelope.

local json = require("json")
local funcs = require("funcs")
local prompt = require("prompt")
local llm = require("llm")
local generator = require("generator")
local surface = require("surface")

local M = {}

type Map = { [string]: any }

local DRY_RUN = "kickside.code_execution:run_code_dry_run"
local DEFAULT_MODEL = "class:fast"

-- Structured-output schema: the model returns the drafted Lua source and, folded into the
-- same call, a suggested_trigger inferred from the intent so the UI can pre-fill whether the
-- automation is schedule- or event-based. The model reasons in this flat mode/source shape;
-- normalize_trigger folds it into trigger spec v1 ({ v, source?, config?, schedule?, backfill?,
-- filter? }) afterward. All trigger sub-fields are required (empty string when unused) so
-- strict structured-output providers accept the schema.
local CODE_SCHEMA = {
    type = "object",
    additionalProperties = false,
    required = { "code", "suggested_trigger" },
    properties = {
        code = { type = "string", description = "The Lua source to run in the sandbox." },
        suggested_trigger = {
            type = "object",
            additionalProperties = false,
            description = "How this automation should fire, inferred from the intent.",
            required = { "mode", "schedule_type", "schedule_expression", "source" },
            properties = {
                mode = {
                    type = "string",
                    enum = { "schedule", "event" },
                    description = "'schedule' for a cadence, 'event' for reacting to an incoming event.",
                },
                schedule_type = {
                    type = "string",
                    description = "For mode=schedule: 'interval' or 'cron'. Empty string otherwise.",
                },
                schedule_expression = {
                    type = "string",
                    description = "For mode=schedule: e.g. '30m' (interval) or '0 9 * * 1' (cron). Empty string otherwise.",
                },
                source = {
                    type = "string",
                    description = "For mode=event: a trigger source port entry id if one clearly matches, else empty string.",
                },
            },
        },
    },
}

local DEFAULT_TRIGGER: { [string]: any } = {
    schedule_type = "interval",
    schedule_expression = "1h",
}

local function trim(v: any): string
    if type(v) ~= "string" then return "" end
    return ((v :: string):gsub("^%s+", ""):gsub("%s+$", ""))
end

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

-- Strip markdown fences the model may wrap around the source.
local function unfence(text: any): string
    local t = trim(text)
    local body = t:match("^```[%w]*%s*(.-)%s*```$")
    if body then return trim(body) end
    return t
end

local SYSTEM = [[You write Lua that runs in an isolated sandbox.
Rules:
- The ONLY way to reach anything beyond plain Lua is the `sdk` import.
- Call a tool by copying its EXACT call string from AVAILABLE SDK SURFACE — the bracketed,
  id-keyed form `sdk.tools["<entry.id>"](args)`, returning `result, err`. NEVER invent a
  bare name like `sdk.tools.Foo`; only the exact bracketed id keys resolve.
- Use ONLY the tools listed under AVAILABLE SDK SURFACE. Nothing else is reachable.
- Do NOT require any module (no process, io, os, funcs, http). Plain Lua plus `sdk` only.
- Read the run's arguments from the global `__cx_args` when relevant.
- After each `sdk` call, check `err` before using `result`.
- ALWAYS `return` a value from the code.
- Write concise Lua — no comments or narration; emit only working code, don't spend tokens explaining it.
Return the Lua source in the `code` field.

Also infer `suggested_trigger` — how this automation should fire:
- For a cadence, use all four fields, for example:
  {"mode":"schedule","schedule_type":"interval","schedule_expression":"30m","source":""}.
  Use schedule_type "cron" with an expression such as "0 9 * * 1" for calendar schedules.
- For an incoming event, use all four fields, for example:
  {"mode":"event","schedule_type":"","schedule_expression":"","source":"matching trigger source port id"}.
  Use an empty source when no matching trigger port is obvious.
- If ambiguous, use {"mode":"schedule","schedule_type":"interval","schedule_expression":"1h","source":""}.
Always include mode, schedule_type, schedule_expression, and source. Use empty strings for unused fields.]]

-- normalize_trigger: fold the model's raw mode/source guess into trigger spec v1 ({ v = 1,
-- source?, schedule?, ... }), defaulting to a 1h interval timer when ambiguous, missing, or
-- an event guess names no source.
local function default_schedule_trigger(): { [string]: any }
    return {
        v = 1,
        schedule = { type = DEFAULT_TRIGGER.schedule_type, expression = DEFAULT_TRIGGER.schedule_expression },
    }
end

local function normalize_trigger(raw: any): { [string]: any }
    local t = (type(raw) == "table" and raw or {}) :: Map
    local mode = trim(t.mode)
    if mode == "event" then
        local source = trim(t.source)
        if source == "" then return default_schedule_trigger() end
        return { v = 1, source = source, config = {} }
    end
    if mode == "schedule" then
        local stype = trim(t.schedule_type)
        if stype ~= "cron" then stype = "interval" end
        local expr = trim(t.schedule_expression)
        if expr == "" then expr = stype == "cron" and "0 9 * * 1" or "1h" end
        return { v = 1, schedule = { type = stype, expression = expr } }
    end
    return default_schedule_trigger()
end

-- Test seam: exercise the mode/source -> trigger spec v1 mapping directly.
M._normalize_trigger = normalize_trigger

-- llm_draft(ctx, model, reference_text, intent, sample): draft the source for one attempt,
-- feeding the previous attempt's gate errors back so the model corrects. Returns
-- (code, suggested_trigger) — the trigger is inferred by the same structured-output call.
local function llm_draft(ctx: any, model: string, reference_text: string, intent: string, sample: any, deps: any): (any, { [string]: any }?, any?)
    local c = (type(ctx) == "table" and ctx or {}) :: Map
    local errors = ""
    if type(c.last_errors) == "table" and #(c.last_errors :: { any }) > 0 then
        errors = "\n\nThe previous attempt failed the sandbox dry-run with:\n"
            .. json.encode(c.last_errors) .. "\nFix these."
    end

    local p = ((deps and deps.prompt or prompt) :: any).new()
    p:add_system(SYSTEM .. errors)
    local user = "INTENT:\n" .. intent .. "\n\nAVAILABLE SDK SURFACE:\n" .. reference_text
    if sample ~= nil then
        user = user .. "\n\nSAMPLE ARGUMENTS (__cx_args):\n" .. json.encode(sample)
    end
    p:add_user(user)

    local resp, err = ((deps and deps.llm or llm) :: any).structured_output(CODE_SCHEMA, p, { model = model, temperature = 0, timeout = 15, max_tokens = 1536 })
    if err then return nil, nil, err end
    if type(resp) ~= "table" then return nil, nil, "model returns no structured response" end
    local data = (resp :: Map).result
    if type(data) ~= "table" then return nil, nil, "model returns no structured result" end
    local code = (data :: Map).code
    if not is_str(code) then return nil, nil, "model returns no code" end
    return unfence(code), normalize_trigger((data :: Map).suggested_trigger)
end

M._llm_draft = llm_draft

-- make_validate(tool_ids): the gate — a side-effect-free dry-run of the draft against the
-- simulation sdk. run_code.dry_run holds the eval grant and dispatches nothing.
local function make_validate(tool_ids: any, sample: any): any
    return function(code: any): (boolean, any)
        local out, err = (funcs :: any).new():call(DRY_RUN, {
            source = code,
            args = sample,
            tool_ids = tool_ids,
        })
        if err then return false, { tostring(err) } end
        if type(out) == "table" and (out :: Map).ok == true then return true, {} end
        local message = "dry-run failed"
        if type(out) == "table" and type((out :: Map).error) == "table" then
            message = tostring(((out :: Map).error :: Map).message or "dry-run failed")
        end
        return false, { message }
    end
end

M._make_validate = make_validate

-- build_envelope(state): package one attempt into the cycle envelope. `state` carries into
-- the next iteration; `result` is emitted when the cycle stops (this is the terminal node),
-- so the accept/fail verdict lives in a compact result, not the fat working state.
function M.build_envelope(s: any): Map
    local st = (type(s) == "table" and s or {}) :: Map
    local out: Map = {}
    for k, v in pairs(st) do
        if k ~= "draft_fn" and k ~= "validate_fn" and type(v) ~= "function" then out[k] = v end
    end
    local outcome: Map = {
        ok = st.ok == true,
        validated = st.validated == true,
        code = st.code,
        suggested_trigger = st.suggested_trigger,
        errors = st.errors or st.last_errors or {},
        continue = st.continue == true,
    }
    return { state = out, result = outcome, continue = outcome.continue }
end

-- iterate(context): one durable regenerate step. Reads the working state from the cycle
-- envelope (or the flow input on the first pass), resolves the SDK reference once, attaches
-- the model draft_fn and the dry-run validate_fn, and delegates to generator.advance.
function M.iterate(context: any): Map
    local ctx = (type(context) == "table" and context or {}) :: Map
    local state: Map
    if type(ctx.state) == "table" and next(ctx.state :: Map) ~= nil then
        state = ctx.state :: Map
    elseif type(ctx.input) == "table" then
        state = ctx.input :: Map
    else
        state = ctx
    end

    if not is_str(state.reference_text) then
        local tools, terr = surface.resolve_tools(state.tool_ids)
        if terr then
            return M.build_envelope({ ok = false, validated = false, continue = false, errors = { terr } })
        end
        local rows, cursor = {}, nil
        repeat
            local page = surface.build_reference(tools, {limit = 100, cursor = cursor, fields = {"*"}})
            for _, row in ipairs(page.tools) do rows[#rows + 1] = row end
            cursor = page.next_cursor
        until not cursor
        state.reference_text = surface.reference_prompt({tools = rows})
    end

    local model = trim(state.model) ~= "" and tostring(state.model) or DEFAULT_MODEL
    local intent = tostring(state.intent or "")
    local reference_text = tostring(state.reference_text)
    local sample = state.sample

    state.draft_fn = function(dctx: any): (any, { [string]: any }?, any?)
        return llm_draft(dctx, model, reference_text, intent, sample, nil)
    end
    state.validate_fn = make_validate(state.tool_ids, sample)

    return M.build_envelope(generator.advance(state))
end

return M
