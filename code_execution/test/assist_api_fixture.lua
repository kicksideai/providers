-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
-- Test-only aliases for the production assist endpoint's HTTP, security, and
-- function dependencies. The endpoint source itself is loaded unchanged.

local M = {
    CONTENT = { JSON = "application/json" },
    STATUS = { OK = 200, BAD_REQUEST = 400, UNAUTHORIZED = 401 },
}

local state = {}

function M.reset(body: string)
    state = { body = body, calls = {} }
end

function M.captured(): any
    return state
end

function M.request(): any
    return { body = function() return state.body end }
end

function M.response(): any
    return {
        set_content_type = function() end,
        set_status = function(_, status) state.status = status end,
        write_json = function(_, value) state.response = value end,
    }
end

function M.actor(): any
    return { id = function() return "author" end }
end

function M.call(id: string, args: any): (any, any?)
    state.calls[#state.calls + 1] = { id = id, args = args }
    return { ok = true, validated = true, code = "return {}" }, nil
end

return M
