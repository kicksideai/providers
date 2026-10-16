-- POST /api/v1/code-execution/recommend-tools — the tools most relevant to a stated need.
--
-- Body: { need, tool_ids?, fields? }. An EMPTY/absent tool_ids means ALL tools the ambient
-- actor can reach (allow-all), matching run_code; a non-empty list restricts the search to
-- that subset. Runs the recommendation (via funcs.call, keeping its llm closure isolated) and
-- returns ranked compact rows; fields adds description, input_schema and output_schema:
--   { success, tools: [{ id, label, <requested fields> }] }

local http = require("http")
local json = require("json")
local security = require("security")
local funcs = require("funcs")

local RECOMMEND = "kickside.code_execution:recommend_tools"

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

    if type(body.need) ~= "string" or body.need == "" then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = "need is required" })
        return
    end

    local result, err = funcs.call(RECOMMEND, {
        need = body.need,
        fields = body.fields,
        tool_ids = type(body.tool_ids) == "table" and body.tool_ids or {},
    })
    if err then
        res:set_status(http.STATUS.BAD_REQUEST)
        res:write_json({ success = false, error = tostring(err) })
        return
    end

    local tools: any = {}
    if type(result) == "table" and type((result :: any).tools) == "table" then
        tools = (result :: any).tools
    end
    res:set_status(http.STATUS.OK)
    res:write_json({ success = true, tools = tools })
end

return { handler = handler }
