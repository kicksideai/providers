-- Code generation core: the draft -> sim-validate -> accept loop, with NO llm, flow, or
-- registry imports, so the whole safety spine runs in the standalone harness against
-- injected collaborators.
--
-- The invariant is the gate: a draft is accepted ONLY when it runs to completion in the
-- eval sandbox with the simulation sdk (sdk_sim) — it compiles, its `sdk` calls resolve,
-- and it returns without error. A draft that fails the gate is never returned as
-- validated. On failure the loop redrafts (up to max_attempts), feeding the previous gate
-- errors back so the next draft can correct.

local M = {}

type Map = { [string]: any }

local DEFAULT_MAX_ATTEMPTS = 3

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

local function error_list(value: any, default_message: string): { string }
    if type(value) ~= "table" then return { default_message } end
    local out: { string } = {}
    for _, v in ipairs(value :: { any }) do
        if type(v) == "string" and (v :: string) ~= "" then out[#out + 1] = v :: string end
    end
    if #out == 0 then out[#out + 1] = default_message end
    return out
end

-- carry: the serializable working fields threaded across a cycle boundary (everything
-- except the injected functions, which the node reattaches each iteration).
local function carry(s: Map): Map
    return {
        intent = s.intent,
        tool_ids = s.tool_ids,
        reference_text = s.reference_text,
        model = s.model,
        sample = s.sample,
        suggested_trigger = s.suggested_trigger,
        max_attempts = tonumber(s.max_attempts) or DEFAULT_MAX_ATTEMPTS,
    }
end

-- advance(state): one draft attempt. Calls draft_fn(ctx) for a code string, then
-- validate_fn(code) -> (ok, errors) as the gate. Returns the next state; state.continue
-- drives the cycle, state.validated marks an accepted draft. When attempts are exhausted
-- the failure carries the last gate errors and no code.
function M.advance(state: any): Map
    local s = (type(state) == "table" and state or {}) :: Map
    local max_attempts = tonumber(s.max_attempts) or DEFAULT_MAX_ATTEMPTS
    local attempt = (tonumber(s.attempt) or 0) + 1

    local next_state = carry(s)
    next_state.attempt = attempt

    local draft_fn = s.draft_fn
    if type(draft_fn) ~= "function" then
        next_state.ok = false
        next_state.validated = false
        next_state.continue = false
        next_state.errors = { "no draft_fn supplied" }
        return next_state
    end

    local code, suggested_trigger, draft_err = (draft_fn :: any)({
        attempt = attempt,
        last_errors = s.last_errors or {},
        intent = s.intent,
        reference_text = s.reference_text,
        sample = s.sample,
    })
    if suggested_trigger ~= nil then next_state.suggested_trigger = suggested_trigger end

    local function retry_or_fail(errors: { string }): Map
        next_state.ok = false
        next_state.validated = false
        next_state.last_errors = errors
        if attempt >= max_attempts then
            next_state.continue = false
            next_state.errors = errors
        else
            next_state.continue = true
        end
        return next_state
    end

    if not is_str(code) then
        return retry_or_fail({ draft_err and tostring(draft_err) or "the model returned no code" })
    end

    local validate_fn = s.validate_fn
    if type(validate_fn) ~= "function" then
        next_state.ok = false
        next_state.validated = false
        next_state.continue = false
        next_state.errors = { "no validate_fn supplied" }
        return next_state
    end

    local ok, errors = (validate_fn :: any)(code)
    if ok then
        next_state.ok = true
        next_state.validated = true
        next_state.continue = false
        next_state.code = code
        next_state.last_errors = {}
        return next_state
    end

    return retry_or_fail(error_list(errors, "draft did not validate"))
end

-- generate(opts): drive advance until a draft validates or attempts are exhausted. opts:
--   intent, tool_ids?, reference_text?, sample?, model?,
--   draft_fn(ctx) -> code, validate_fn(code) -> (ok, errors), max_attempts=3.
-- Returns { ok = true, validated = true, code, attempts } or
-- { ok = false, validated = false, errors }.
function M.generate(opts: any): Map
    local o = (type(opts) == "table" and opts or {}) :: Map
    local max_attempts = tonumber(o.max_attempts) or DEFAULT_MAX_ATTEMPTS

    local state: Map = {
        intent = o.intent,
        tool_ids = o.tool_ids,
        reference_text = o.reference_text,
        sample = o.sample,
        model = o.model,
        draft_fn = o.draft_fn,
        validate_fn = o.validate_fn,
        max_attempts = max_attempts,
        attempt = 0,
        last_errors = {},
        continue = true,
    }

    local guard = max_attempts + 2
    while state.continue and guard > 0 do
        local next_state = M.advance(state)
        next_state.draft_fn = state.draft_fn
        next_state.validate_fn = state.validate_fn
        state = next_state
        guard = guard - 1
    end

    if state.ok == true then
        return { ok = true, validated = true, code = state.code, suggested_trigger = state.suggested_trigger, attempts = state.attempt }
    end
    return {
        ok = false,
        validated = false,
        errors = state.errors or state.last_errors or { "code generation did not validate" },
    }
end

return M
