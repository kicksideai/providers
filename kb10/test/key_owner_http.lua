-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local ctx = require("ctx")
local env = require("env")
local store = require("store")
local json = require("json")
local http = require("http")
local M = { CONTENT = http.CONTENT, STATUS = http.STATUS }
local function key_denied()
    local key, err = env.get("ENCRYPTION_KEY")
    return key == nil and err ~= nil
end
function M.request()
    return { param = function(_, name) return ctx.get(name == "id" and "component_id" or "node_id") end }
end
function M.response()
    local response = { before_denied = key_denied() }
    return {
        set_content_type = function() end,
        set_status = function(_, status) response.status = status end,
        write_json = function(_, body)
            response.body, response.after_denied = body, key_denied()
            local output = assert(store.get("app:key_owner_responses"))
            local _, err = output:set(ctx.get("component_id"), assert(json.encode(response)), 0)
            assert(err == nil, tostring(err))
            output:release()
        end,
    }
end
return M
