-- The request preamble every kb10 {id}-addressed endpoint shares: an HTTP
-- context, an authenticated actor, a knowledge base id, and the access the
-- action requires. One implementation means one refusal vocabulary across the
-- surface -- every {id}-addressed route answers a missing knowledge base with
-- the same status -- and the shaping of an access error into that status stays
-- in api_errors alone.
--
-- The access decision itself is validate_access, separate from the reply open()
-- writes it into: a contract binding reaches a knowledge base with no request
-- behind it and no response to refuse into, and takes the same decision in the
-- same vocabulary rather than keeping a second one.

local http = require("http")
local security = require("security")
local http_errors = require("http_errors")
local component = require("component")

local M = {}

-- Injection point for the suites: the access gate is swapped so a refusal is
-- provable without a live component service.
M._component = component :: any

-- The JSON answer every kb10 endpoint writes, success or refusal.
function M.reply(res: any, status: any, payload: any)
    res:set_content_type(http.CONTENT.JSON)
    res:set_status(status)
    res:write_json(payload)
end

-- open(access) -> (res, kb_id, context_err). The refusal is already written when
-- the request is answerable but refused, so a handler that gets no res simply
-- returns. context_err names a request that could not be answered at all.
function M.open(access: any): (any?, string?, string?)
    local res = http.response()
    local req = http.request()
    if not res or not req then return nil, nil, "no http context" end

    local actor = security.actor()
    if not actor then
        M.reply(res, http.STATUS.UNAUTHORIZED, { success = false, error = "authentication required" })
        return nil, nil
    end

    local kb_id = req:param("id")
    if not kb_id or kb_id == "" then
        M.reply(res, http.STATUS.BAD_REQUEST, { success = false, error = "knowledge base id is required" })
        return nil, nil
    end

    local allowed, refusal, status = M.validate_access(kb_id, access)
    if not allowed then
        M.reply(res, status or http.STATUS.FORBIDDEN, { success = false, error = refusal })
        return nil, nil
    end

    return res, kb_id
end

-- validate_access(kb_id, access) -> (allowed, refusal, status): may this caller
-- take this action on this knowledge base. The refusal carries both the sentence
-- to report and the status a response would be written with, so a caller with an
-- HTTP context and a caller without one refuse for the same reason.
function M.validate_access(kb_id: any, access: any): (boolean?, string?, number?)
    if type(kb_id) ~= "string" or kb_id == "" then
        return nil, "knowledge base id is required", http.STATUS.BAD_REQUEST
    end

    local _, access_err = M._component.validate_access(kb_id, access)
    if access_err then
        local status, classification = http_errors.classify(access_err)
        local message = classification.kind ~= nil and access_err:message() or tostring(access_err or "access denied")
        return nil, message, status
    end

    return true, nil, nil
end

return M
