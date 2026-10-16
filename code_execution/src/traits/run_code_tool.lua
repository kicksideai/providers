-- RunCode tool — the agent-facing surface over kickside.code_execution:run_code.
--
-- The LLM supplies `code` (Lua source) and, optionally, `args` (a data object the
-- code reads as __cx_args). The whitelist the code runs against is NOT chosen by the
-- model: `tool_ids` comes from the trait's per-agent config, seeded into this tool's
-- exec context by the agent resolver (ctx.get). This is the same whitelist run_code
-- enforces, so the model can only reach the tools the installer granted this capability
-- — it authors code, it does not widen its own reach.
--
-- run_code holds the sole eval grant and runs the source process-isolated under the
-- ambient actor, so dispatching through it needs no eval authority here.

local funcs = require("funcs")
local ctx = require("ctx")

local RUN_CODE = "kickside.code_execution:run_code"

-- string_list: dedup, drop non-strings/blanks. The whitelist arrives from trait
-- context as data, so normalize it the same way run_code does.
local function string_list(value: any): { string }
    local out: { string } = {}
    local seen: { [string]: boolean } = {}
    if type(value) ~= "table" then return out end
    for _, v in ipairs(value :: { any }) do
        if type(v) == "string" and (v :: string) ~= "" and not seen[v] then
            seen[v] = true
            out[#out + 1] = v :: string
        end
    end
    return out
end

local function handler(args: any): (any?, error?)
    args = (type(args) == "table") and args or {}
    local source = args.code
    if type(source) ~= "string" or (source :: string) == "" then
        return { success = false, error = "code is required — the Lua source to run." }
    end

    -- The whitelist is the trait's per-agent config, never model-supplied.
    local tool_ids = string_list(ctx.get("tool_ids"))

    local result, err = (funcs :: any).new():call(RUN_CODE, {
        input = type(args.args) == "table" and args.args or {},
        config = {
            code = source,
            tool_ids = tool_ids,
        },
    })
    if err then return nil, err end
    -- The runner answers { ok, result } or { ok = false, error = { kind, message } }
    -- for its other callers (transform strategy, Run Code block, dry-run validation).
    local run: any = result
    if run.ok == true then return { success = true, result = run.result } end
    return { success = false, error = tostring(run.error.message), error_kind = run.error.kind }
end

return { handler = handler }
