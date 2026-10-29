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

function M.read_enabled(payload: any): boolean
    return M.setting(payload, "read_enabled") ~= false
end

function M.write_enabled(payload: any): boolean
    return M.setting(payload, "write_enabled") ~= false
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

function M.host_ref(host: any): (string?, string?)
    if type(host) ~= "table" then return nil, nil end
    local kind = type(host.kind) == "string" and types.trim(host.kind) or ""
    local id = type(host.id) == "string" and types.trim(host.id) or ""
    if kind == "" or id == "" then return nil, nil end
    return kind, id
end

function M.validate(payload: any): error?
    if type(payload) ~= "table" then return types.invalid("payload must be an object") end
    local host_kind, host_id = M.host_ref(payload.host)
    if host_kind == nil then return types.invalid("host.kind is required") end
    if host_id == nil then return types.invalid("host.id is required") end
    if type(payload.agent) ~= "table" or types.trim(payload.agent.id) == "" then return types.invalid("agent.id is required") end
    return nil
end

return M
