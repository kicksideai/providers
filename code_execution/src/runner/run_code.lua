-- run_code: execute agent-authored Lua over a tool SDK, process-isolated.
--
-- Input  { input = <object>, config = { code, tool_ids?, method? } }
-- Output { ok = true, result } | { ok = false, error = { kind, message } }
--
-- The whitelist is resolved by `surface`: an EMPTY (or absent) tool_ids means EVERY tool
-- the ambient actor can reach (allow-all is the default); a NON-EMPTY list restricts the
-- SDK to that exact subset and rejects any id that is not a tool. Allow-all only widens
-- what the SDK POPULATES: every dispatch still runs under the ambient actor with the tool's
-- own gates, so no new authority is granted.
--
-- The resolved descriptors are injected as SDK context data and the sandbox is offered
-- ONLY `json` and the safe stdlib, no host classes. `ctx`, `funcs`, and `time` are private
-- to the `sdk` import (granted through eval's per-import modules), so user source cannot
-- require() them — the SDK is the only surface.
--
-- `run` injects the real `sdk` (dispatches tools). `dry_run` injects `sdk_sim` (schema-
-- shaped mocks, no dispatch) for a side-effect-free validation of generated code: identical
-- resolution and sandbox, only the injected library differs. Only these functions hold the
-- eval.* grants (see security/_index.yaml).

local eval_runner = require("eval_runner")
local funcs = require("funcs")
local time = require("time")
local surface = require("surface")

local SDK_LIB = "kickside.code_execution:sdk"
local SDK_SIM_LIB = "kickside.code_execution:sdk_sim"
local SDK_CONTEXT = "__kickside_code_execution_context"
local SDK_IMPORT_MODULES = { "ctx", "funcs", "json", "time" }
local SDK_SIM_IMPORT_MODULES = { "ctx", "json" }

-- Modules offered inside the sandbox: `json` for data only. The base libraries (string,
-- table, math) are always present. No process, storage, network, funcs, or time module is
-- offered to user code.
local SANDBOX_MODULES = { "json" }

local EVAL_LIMITS = {
    max_steps = 1000000,
}

local EXECUTION_TIMEOUT = "5s"
local M = {}

local function is_str(v: any): boolean
    return type(v) == "string" and (v :: string) ~= ""
end

-- eval_error_kind: map a structured eval error to a stable kind string.
local function eval_error_kind(err: any): string
    if type(err) == "userdata" or type(err) == "table" then
        local ok, k = pcall(function(): any return (err :: any):kind() end)
        if ok and is_str(k) then return (k :: string):lower() end
    end
    return "internal"
end

local function fail(kind: string, message: string): any
    return { ok = false, error = { kind = kind, message = message } }
end

-- resolve_whitelist: shared by run and dry_run. Returns the descriptor map, or a typed
-- failure ({ ok = false, error }) on a bad whitelist.
local function resolve_whitelist(input: any): (any?, any?)
    if not is_str(input.source) then
        return nil, fail("invalid", "source is required")
    end
    if input.tool_ids ~= nil and type(input.tool_ids) ~= "table" then
        return nil, fail("invalid", "tool_ids must be an array")
    end
    local tools, terr = surface.resolve_tools(input.tool_ids)
    if terr then return nil, fail("invalid_tool", terr :: string) end
    return tools, nil
end

-- eval_with: resolve the whitelist and run the source with the chosen sdk import.
local function eval_with(input: any, sdk_id: string): any
    input = input or {}
    local tools, ferr = resolve_whitelist(input)
    if ferr then return ferr end

    local result, err = eval_runner.run({
        source = input.source,
        method = is_str(input.method) and input.method or nil,
        modules = SANDBOX_MODULES,
        imports = {
            sdk = {
                id = sdk_id,
                modules = sdk_id == SDK_LIB and SDK_IMPORT_MODULES or SDK_SIM_IMPORT_MODULES,
            },
        },
        context = {
            [SDK_CONTEXT] = {
                tools = tools,
                args = input.args,
            },
        },
        custom_modules = {
            -- Public convenience for user code; SDK internals read SDK_CONTEXT above.
            __cx_args = input.args,
        },
        limits = EVAL_LIMITS,
        -- allow_classes intentionally empty: process/storage/network stay blocked.
    })

    if err then
        return fail(eval_error_kind(err), tostring(err))
    end
    return { ok = true, result = result }
end

local function bounded_eval(input: any, simulation: boolean): any
    local future, start_err = funcs.async("kickside.code_execution:run_code_worker", {
        input = input,
        simulation = simulation,
    })
    if start_err or not future then return fail(eval_error_kind(start_err), tostring(start_err)) end
    local response = future:response()
    local deadline = time.after(EXECUTION_TIMEOUT)
    local selected = channel.select({ response:case_receive(), deadline:case_receive() })
    if selected.channel == deadline then
        local cancelled, cancel_err = future:cancel()
        if cancel_err or cancelled == false then
            return fail(eval_error_kind(cancel_err), "Execution cancellation failed: " .. tostring(cancel_err))
        end
        return fail("timeout", "Code execution exceeds the 5-second limit.")
    end
    local result, result_err = future:result()
    if result_err then return fail(eval_error_kind(result_err), tostring(result_err)) end
    if not result then return fail("internal", "Code execution returns no result.") end
    local value, decode_err = result:data()
    if decode_err then return fail(eval_error_kind(decode_err), tostring(decode_err)) end
    return value
end

function M.execute(request: any): any
    return eval_with(request.input, request.simulation == true and SDK_SIM_LIB or SDK_LIB)
end

-- block_input: enforce the canonical function Block ABI. The incoming Flow value is the
-- sandbox argument object; executable settings belong exclusively to Block config.
local function block_input(request: any): (any?, any?)
    if type(request) ~= "table" then
        return nil, fail("invalid", "request must contain input and config objects")
    end
    local request_fields = { input = true, config = true }
    for key, _ in pairs(request) do
        if request_fields[key] ~= true then
            return nil, fail("invalid", "unsupported request field: " .. tostring(key))
        end
    end
    local config = request.config
    if type(config) ~= "table" then
        return nil, fail("invalid", "config must be an object")
    end
    local allowed = { code = true, tool_ids = true, method = true }
    for key, _ in pairs(config) do
        if allowed[key] ~= true then
            return nil, fail("invalid", "unsupported config field: " .. tostring(key))
        end
    end
    local input = request.input
    if type(input) ~= "table" then
        return nil, fail("invalid", "input must be an object")
    end
    return {
        source = config.code,
        tool_ids = config.tool_ids,
        method = config.method,
        args = input,
    }, nil
end

-- run: execute one canonical function Block invocation against the real SDK. The function
-- entry remains directly callable by agents and other native callers using the same ABI.
function M.run(request: any): any
    local input, err = block_input(request)
    if err then return err end
    return bounded_eval(input, false)
end

-- dry_run: execute the source against the SIMULATION sdk (sdk_sim) — identical resolution
-- and sandbox, but every tool call returns schema-shaped mock data and dispatches nothing.
-- Side-effect-free; the generator uses it to validate a draft.
function M.dry_run(input: any): any
    return bounded_eval(input, true)
end

return M
