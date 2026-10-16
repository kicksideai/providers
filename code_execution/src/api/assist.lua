-- POST /api/v1/code-execution/assist — generate sandbox Lua for an intent over a whitelist.
--
-- Body: { intent, tool_ids?, sample? }. Runs the code generator (via funcs.call, keeping
-- its flow/llm closure isolated) which drafts Lua against the SDK reference and validates
-- it by a side-effect-free dry-run (the simulation sdk). Returns
-- { validated = true, code, suggested_trigger } when a draft runs clean, or
-- { validated = false, errors }. suggested_trigger (inferred by the same draft call) lets
-- the config web component pre-fill whether the automation is schedule- or event-based; the
-- WC treats it as optional. The config web component's assist panel calls this.

local http = require("http")
local json = require("json")
local security = require("security")
local funcs = require("funcs")

local GENERATE = "kickside.code_execution:generate_code"

local function handler()
    local req = http.request()
    local res = http.response()
    if not req or not res then return end
    res:set_content_type(http.CONTENT.JSON)

    if not security.actor() then
        res:set_status(http.STATUS.UNAUTHORIZED)
        res:write_json({ success = false, error = "authentication required" })
        return
    end

    local body, berr = json.decode(req:body() or "")
    if berr or type(body) ~= "table" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "invalid json" })
        return
    end

    if type(body.intent) ~= "string" or body.intent == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "intent is required" })
        return
    end

    local proposal, err = funcs.call(GENERATE, {
        intent = body.intent,
        tool_ids = type(body.tool_ids) == "table" and body.tool_ids or {},
        sample = body.sample,
    })
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local out: any = { success = true }
    if type(proposal) == "table" then
        for k, v in pairs(proposal :: any) do out[k] = v end
    end
    res:set_status(http.STATUS.OK)
    res:write_json(out)
end

return { handler = handler }
