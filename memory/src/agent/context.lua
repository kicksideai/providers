-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local ctx = require("ctx")
local component = require("component")
local types = require("types")
local config = require("memory_config")
local stores = require("memory_stores")

local M = {}

function M.setting(payload: any, name: string): any
    local value = ctx.get(name)
    if value ~= nil and value ~= "" then return value end
    if type(payload) == "table" and type(payload.context) == "table" then
        value = payload.context[name]
        if value ~= nil and value ~= "" then return value end
    end
    return nil
end

function M.memory(payload: any, access: integer): (string?, any?, error?)
    local id = types.trim(M.setting(payload, "memory_id"))
    if id == "" then return nil, nil, types.invalid("the Memory capability has no memory selected") end
    local _, access_err = component.validate_access(id, access)
    if access_err then return nil, nil, access_err end
    local store, err = stores.get(id)
    if err then
        if errors.is(err, errors.NOT_FOUND) then
            return nil, nil, types.invalid("knowledge base " .. id .. " is not a memory; select a Memory knowledge base")
        end
        return nil, nil, err
    end
    local cfg, cfg_err = config.effective((store :: any).config)
    if cfg_err then return nil, nil, cfg_err end
    (store :: any).effective = cfg
    return id, store, nil
end

function M.host_ref(host: any): (string, string)
    if type(host) ~= "table" then return "", "" end
    if host.kind == "session" then return "session", types.trim(host.session_id) end
    if host.kind == "dataflow" then
        return "dataflow", table.concat({ types.trim(host.dataflow_id), types.trim(host.node_id),
            types.trim(host.run_id), tostring(host.iteration or 0) }, ":")
    end
    return "", ""
end

function M.validate(payload: any): error?
    if type(payload) ~= "table" then return types.invalid("payload must be an object") end
    if type(payload.host) ~= "table" or types.trim(payload.host.kind) == "" then return types.invalid("host.kind is required") end
    return nil
end

return M
