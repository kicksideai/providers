-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0

local contract = require("contract")
local security = require("security")
local types = require("types")

local M = {}

local STORE_REGISTRY = "kickside.knowledge:knowledge_bases"

function M.list_targets(_input: any): any
    local def, def_err = contract.get(STORE_REGISTRY)
    if def_err or not def then return { success = false, error = "knowledge_bases contract unavailable: " .. tostring(def_err) } end
    local actor, scope = security.actor(), security.scope()
    if not actor or not scope then return { success = false, error = "security actor and scope are required" } end
    local registry_inst, open_err = (def :: any):with_actor(actor):with_scope(scope):open()
    if open_err or not registry_inst then return { success = false, error = "knowledge_bases open failed: " .. tostring(open_err) } end
    local rows, list_err = (registry_inst :: any):list({ kb_type = types.STORE_TYPE })
    if list_err then return { success = false, error = tostring(list_err) } end
    local out: { any } = {}
    for _, row in ipairs(rows or {}) do
        local meta = type(row.meta) == "table" and row.meta or {}
        local id = row.component_id
        if types.trim(id) ~= "" then
            out[#out + 1] = { id = id, title = meta.title, name = meta.title,
                description = meta.comment or "", kb_type = types.STORE_TYPE }
        end
    end
    return { success = true, items = out, count = #out }
end

return M
