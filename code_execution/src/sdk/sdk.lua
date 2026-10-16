-- sdk: the curated, whitelist-bounded tool surface exposed to sandboxed agent code.
--
-- run_code injects a per-run SDK context containing the tool whitelist (id -> descriptor
-- { id, namespace, label, input_schema, ... }) and the run args. A tool's key is ALWAYS
-- its real registry entry id, so user source reaches a tool under the exact id that exists
-- in the registry.
-- This library is loaded into the sandbox as an eval IMPORT. run_code grants its private
-- module set (ctx, funcs, json, time) through the import table, NOT the sandbox's
-- user-facing module whitelist. That is the cage: user source cannot require("ctx") or
-- require("funcs"); it reaches tools only via `sdk.tools["<entry.id>"]`. Every dispatch
-- runs under the ambient actor, so the sandbox gains no authority beyond the caller's own
-- gates.

local ctx = require("ctx")
local funcs = require("funcs")
local json = require("json")
local time = require("time")

local M: any = {}
local SDK_CONTEXT = "__kickside_code_execution_context"

-- The most a single sdk.sleep call may pause. A cap is mandatory: user code must be able to
-- pace calls (rate-limit, poll, backoff) without holding the sandbox indefinitely on one
-- call. A loop of capped sleeps can still run long — the run's own bound governs that.
local SLEEP_CAP_SECONDS = 5

-- clamp_seconds: coerce any input to seconds in [0, SLEEP_CAP_SECONDS]. Non-numbers, NaN,
-- and negatives clamp to 0; anything over the cap clamps to the cap.
local function clamp_seconds(seconds: any): number
    local n = tonumber(seconds)
    if type(n) ~= "number" or (n :: number) ~= (n :: number) or (n :: number) < 0 then
        return 0
    end
    if (n :: number) > SLEEP_CAP_SECONDS then return SLEEP_CAP_SECONDS end
    return n :: number
end

local function sdk_context(): any
    local value = (ctx :: any).get(SDK_CONTEXT)
    if type(value) ~= "table" or type(value.tools) ~= "table" then
        error("SDK run context is required")
    end
    return value
end

-- specs: the per-run tool whitelist injected by run_code (id -> descriptor).
local function specs(): any
    return sdk_context().tools
end

-- validate_args: check args against a tool's input_schema via native json.validate.
-- An absent schema accepts any arguments.
local function validate_args(schema: any, args: any): (boolean, string?)
    if schema == nil then return true, nil end
    local ok, err = (json :: any).validate(schema, args or {})
    if ok then return true, nil end
    return false, tostring(err)
end

-- invoke: validate then call the real tool through funcs under the ambient actor.
local function invoke(spec: any, args: any): (any, any?)
    local ok, verr = validate_args(spec.input_schema_json, args)
    if not ok then
        return nil, "invalid arguments for tool '" .. tostring(spec.label or spec.id) .. "': " .. tostring(verr)
    end
    return (funcs :: any).new():call(spec.id, args or {})
end

-- tools: id -> callable(args) -> (result, err), keyed by the real registry entry id.
-- Unknown (non-whitelisted) ids resolve to nil, so a tool outside the whitelist is simply
-- absent.
M.tools = setmetatable({}, {
    __index = function(_, id: any): any
        local spec = specs()[id]
        if not spec then return nil end
        return function(args: any): (any, any?)
            return invoke(spec, args)
        end
    end,
})

-- list: the ids of the tools available to this run.
function M.list(): any
    local out: { any } = {}
    for id, _ in pairs(specs()) do out[#out + 1] = id end
    return out
end

-- schema: BOTH schemas a whitelisted tool declares, as { input_schema, output_schema },
-- or nil for an unknown id. Pure data — no dispatch, no LLM — so the sandbox can inspect a
-- tool's arguments AND its result shape before deciding how to call and consume it.
function M.schema(id: any): any
    local spec = specs()[id]
    if not spec then return nil end
    return { input_schema = spec.input_schema, output_schema = spec.output_schema }
end

-- schemas: the { input_schema, output_schema } pair for several tools in one call, keyed by
-- id (unknown ids are skipped). Lets the sandbox inspect a batch of tools without a call per
-- id. Pure data — no dispatch, no LLM.
function M.schemas(ids: any): any
    local out: { [string]: any } = {}
    if type(ids) ~= "table" then return out end
    local s = specs()
    for _, id in ipairs(ids :: { any }) do
        local spec = s[id]
        if spec then
            out[id] = { input_schema = spec.input_schema, output_schema = spec.output_schema }
        end
    end
    return out
end

-- sleep: pause the run for the requested seconds, clamped to [0, SLEEP_CAP_SECONDS] so a
-- single call can never hold the sandbox indefinitely. Backs pacing between tool calls
-- (rate-limit, poll, backoff). `time` is private to this import, so user code cannot sleep
-- except through here. Returns the clamped duration actually waited.
function M.sleep(seconds: any): number
    local n = clamp_seconds(seconds)
    if n > 0 then
        (time :: any).sleep(n * (time :: any).SECOND)
    end
    return n
end

return M
