-- The code generator: a durable dataflow that drafts sandbox Lua for an intent over a
-- whitelist and accepts it only after a side-effect-free dry-run validates it.
--
-- Node graph (one terminal cycle):
--   with_input -> cycle(iterate)
--
--   cycle(iterate) drafts Lua via the model and runs the HARD gate (run_code.dry_run with
--                  the simulation sdk); generator.advance owns the accept/redraft-on-failure
--                  decision and the attempt cap. continue drives the cycle; when it stops it
--                  emits its last iteration's compact `result` as the flow output. The
--                  accept-vs-failure shaping runs here over that durable outcome.
--
-- Invoked via funcs.call so its flow/llm import closure stays isolated in its own pool.

local flow = require("flow")
local funcs = require("funcs")
local time = require("time")

local M = {}

type Map = { [string]: any }

local NODE_ITERATE = "kickside.code_execution:node_generate"
local DEFAULT_MAX_ATTEMPTS = 3

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

-- shape_proposal: the gate is the sole authority. A draft is accepted (validated = true)
-- ONLY when the cycle produced code that passed the dry-run. Every other case is a failure
-- carrying the gate errors and no code.
function M.shape_proposal(outcome: any): Map
    local o = (type(outcome) == "table" and outcome or {}) :: Map
    if o.validated == true and is_str(o.code) then
        return { ok = true, validated = true, code = o.code, suggested_trigger = o.suggested_trigger }
    end
    return {
        ok = false,
        validated = false,
        errors = o.errors or { "code generation did not validate" },
    }
end

-- generate_code(args) -> (proposal, err?). args:
--   intent          : what the code should do (required),
--   tool_ids?       : tool whitelist (empty/absent = all tools),
--   sample?         : example run arguments (__cx_args) to steer the draft,
--   model?          : generator model (default class:fast),
--   max_attempts?   : redraft cap (default 3).
-- proposal: { validated = true, code, suggested_trigger } or { validated = false, errors }.
function M.execute(args: any): (Map?, string?)
    local a = (type(args) == "table" and args or {}) :: Map
    if not is_str(a.intent) then return nil, "intent is required" end

    local max_attempts = math.max(1, math.min(DEFAULT_MAX_ATTEMPTS, math.floor(tonumber(a.max_attempts) or DEFAULT_MAX_ATTEMPTS)))

    local input: Map = {
        intent = a.intent,
        tool_ids = type(a.tool_ids) == "table" and a.tool_ids or {},
        sample = a.sample,
        model = a.model,
        max_attempts = max_attempts,
    }

    local result, err = flow.create()
        :with_title("Generate Code")
        :with_input(input)
        :cycle({
            func_id = NODE_ITERATE,
            max_iterations = max_attempts + 2,
            continue_condition = "result.continue == true",
        })
        :run()

    if err then return nil, "code generation failed: " .. tostring(err) end
    return M.shape_proposal(result), nil
end

local function await_generation(future: any, deadline: any, select: any): (Map?, string?)
    local response = future:response()
    local selected = select({ response:case_receive(), deadline:case_receive() })
    if selected.channel == deadline then
        local cancelled, cancel_err = future:cancel()
        if cancel_err or cancelled == false then return nil, "Code generation cancellation failed: " .. tostring(cancel_err) end
        return nil, "Code generation exceeds the 60-second limit."
    end
    local result, result_err = future:result()
    if result_err then return nil, tostring(result_err) end
    if not result then return nil, "Code generation returns no result." end
    local value, decode_err = result:data()
    if decode_err then return nil, tostring(decode_err) end
    return value, nil
end
M._await_generation = await_generation

function M.generate_code(args: any): (Map?, string?)
    if type(args) ~= "table" or not is_str(args.intent) then return nil, "intent is required" end
    local future, start_err = funcs.async("kickside.code_execution:generate_code_worker", args)
    if start_err or not future then return nil, "Code generation start failed: " .. tostring(start_err) end
    return await_generation(future, time.after("60s"), channel.select)
end

return M
