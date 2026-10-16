local component = require("component")
local api = require("api")
local types = require("types")

local M = {}

-- Resolve the connection's stored context: an explicit component_id, else the
-- single Fireflies connection in scope (trusted read of its private context).
local function context(component_id: string?): (any?, error?)
    if component_id and component_id ~= "" then
        local ctx, err = component.get_context(component_id, component.ACCESS.READ)
        if err then return nil, err end
        return ctx, nil
    end
    local ctx, err = component.get_context_by_meta({
        class = types.CONNECTION_CLASS,
        provider = types.PROVIDER,
    }, component.ACCESS.READ)
    if err then
        return nil, errors.new({ kind = errors.INVALID, message = "no Fireflies connection selected; configure the trait connection when there is no single default" })
    end
    return ctx, nil
end

function M.connect(component_id: string?): (types.Conn?, error?)
    local ctx, err = context(component_id)
    if err or not ctx then return nil, err end
    local api_key = ctx.api_key
    if type(api_key) ~= "string" or api_key == "" then
        return nil, errors.new({ kind = errors.INVALID, message = "Fireflies connection is missing api_key" })
    end
    local cid = type(ctx.component_id) == "string" and (ctx.component_id :: string) or nil
    return ({ component_id = cid, api_key = api_key } :: types.Conn), nil
end

M.test_connection = api.test_connection
M.get_user = api.get_user
M.list_transcripts = api.list_transcripts
M.get_transcript = api.get_transcript
M.get_transcript_sentences = api.get_transcript_sentences
M.update_meeting_title = api.update_meeting_title

return M
