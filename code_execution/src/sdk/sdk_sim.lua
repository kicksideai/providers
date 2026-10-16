-- sdk_sim: a simulation SDK that mirrors sdk's EXACT surface but performs NO real tool
-- dispatch. It is the side-effect-free stand-in the code generator injects for a dry-run:
-- the same sandboxed source that runs against `sdk` runs unchanged against this, so a draft
-- can be validated (it compiles, its calls resolve, it returns a value) without calling any
-- tool.
--
-- Instead of dispatching, each `sdk.tools["<entry.id>"](args)` returns schema-shaped MOCK
-- data derived from that tool's output_schema: strings -> "", numbers -> 0, booleans ->
-- false, arrays -> {}, objects -> a table shaped by their properties. With no output_schema
-- the mock is an empty table. It requires no `funcs` — the absence of any dispatch is
-- exactly what makes the dry-run safe.
--
-- The injection is identical to the real sdk (the SDK context's tools map, id ->
-- descriptor), and `sdk.list` / `sdk.schema` mirror the real ones, so reference-driven code
-- behaves the same on both surfaces.

local ctx = require("ctx")
local json = require("json")

local M: any = {}
local SDK_CONTEXT = "__kickside_code_execution_context"

local function specs(): any
    local value = (ctx :: any).get(SDK_CONTEXT)
    if type(value) ~= "table" or type(value.tools) ~= "table" then
        error("SDK run context is required")
    end
    return value.tools
end

-- mock: schema-shaped stub data for an output_schema. A typed scalar becomes its zero
-- value; an object is shaped recursively by its properties; anything without a usable type
-- (including an absent schema) becomes an empty table.
local function mock(schema: any): any
    if type(schema) == "string" then
        local decoded, err = json.decode(schema :: string)
        if err then return {} end
        schema = decoded
    end
    if type(schema) ~= "table" then return {} end

    local t: any = (schema :: any).type
    if type(t) == "table" then t = (t :: { any })[1] end

    if t == "string" then return "" end
    if t == "number" or t == "integer" then return 0 end
    if t == "boolean" then return false end
    if t == "array" then return {} end
    if t == "null" then return nil end

    if t == "object" or type((schema :: any).properties) == "table" then
        local out: { [string]: any } = {}
        local props = (schema :: any).properties
        if type(props) == "table" then
            for k, prop in pairs(props :: { [string]: any }) do
                out[k] = mock(prop)
            end
        end
        return out
    end

    return {}
end

-- tools: id -> callable(args) -> (mock, nil), keyed by the real registry entry id.
-- Non-whitelisted ids resolve to nil, exactly like the real sdk.
M.tools = setmetatable({}, {
    __index = function(_, id: any): any
        local spec = specs()[id]
        if not spec then return nil end
        return function(_args: any): (any, any?)
            return mock((spec :: any).output_schema), nil
        end
    end,
})

function M.list(): any
    local out: { any } = {}
    for id, _ in pairs(specs()) do out[#out + 1] = id end
    return out
end

function M.schema(id: any): any
    local spec = specs()[id]
    if not spec then return nil end
    return { input_schema = spec.input_schema, output_schema = spec.output_schema }
end

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

-- The most a single sdk.sleep call may pause in the real sdk. Mirrored here only to clamp
-- the returned duration identically; the sim never actually waits.
local SLEEP_CAP_SECONDS = 5

-- sleep: an instant no-op mirroring sdk.sleep's clamp — the dry-run must validate code that
-- paces itself WITHOUT actually waiting. Returns the same clamped duration the real sdk
-- would, so a draft reading the return value behaves identically.
function M.sleep(seconds: any): number
    local n = tonumber(seconds)
    if type(n) ~= "number" or (n :: number) ~= (n :: number) or (n :: number) < 0 then
        return 0
    end
    if (n :: number) > SLEEP_CAP_SECONDS then return SLEEP_CAP_SECONDS end
    return n :: number
end

return M
