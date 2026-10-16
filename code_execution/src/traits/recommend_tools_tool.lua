-- RecommendTools tool — the agent-facing surface over kickside.code_execution:recommend_tools.
--
-- The LLM supplies `need` (a plain-language description of the task). The tool set searched
-- is NOT chosen by the model: `tool_ids` comes from the trait's per-agent config, seeded
-- into this tool's exec context by the agent resolver (ctx.get) — the same whitelist RunCode
-- enforces. An empty config is allow-all (every tool the actor can reach). So discovery is
-- bounded to exactly the tools the installer granted this capability.
--
-- recommend_tools holds the llm import closure in its own pool; dispatching through it via
-- funcs keeps that closure isolated here, mirroring RunCode over run_code.

local funcs = require("funcs")
local ctx = require("ctx")

local RECOMMEND = "kickside.code_execution:recommend_tools"

-- string_list: dedup, drop non-strings/blanks. The whitelist arrives from trait context as
-- data, so normalize it the same way run_code does.
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
    local need = args.need
    if type(need) ~= "string" or (need :: string) == "" then
        return { success = false, error = "need is required — describe what you want to do." }
    end

    -- The tool set searched is the trait's per-agent config, never model-supplied.
    local tool_ids = string_list(ctx.get("tool_ids"))

    local result, err = (funcs :: any).new():call(RECOMMEND, { need = need, tool_ids = tool_ids, fields = args.fields })
    if err then return nil, err end
    return { success = true, tools = (result :: any).tools }
end

return { handler = handler }
