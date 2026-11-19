-- kb10 implementation of the kickside.knowledge:kb_store_lifecycle contract.
--
-- Lifecycle methods adapt a single DTO to the positional kb10_store API. Node,
-- edge, embedding, summary and graph operations are kb10-internal
-- (persist:node_store + injection:materializer_store) and never cross the
-- contract seam.

local store = require("store")
local security = require("security")
local kb10 = require("kb10")

local M = {}

local function arg_table(args: any): kb10.Map
    if type(args) == "table" then return args :: kb10.Map end
    return {}
end

function M.create_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.StoreCreateArgs
    return store.create_store(a.component_id, a.embedding_model, a.config, a.opts)
end

function M.get_store(args: any): (any, error?)
    local a = arg_table(args)
    if a.component_ids == nil and a.stats ~= true then
        return store.get_store(a.component_id)
    end
    if security.can("knowledge.store.stats", "kickside.knowledge:kb_store_lifecycle") ~= true then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "authorized Knowledge statistics read required"})
    end
    if a.component_ids ~= nil then
        local ids = a.component_ids
        if a.component_id ~= nil or type(ids) ~= "table" or #ids == 0 or #ids > 2000 then
            return nil, errors.new({kind = errors.INVALID, message = "statistics batch requires 1 to 2000 component IDs"})
        end
        local seen = {}
        for _, id in ipairs(ids) do
            if type(id) ~= "string" or id == "" or seen[id] then
                return nil, errors.new({kind = errors.INVALID, message = "statistics batch requires distinct component IDs"})
            end
            seen[id] = true
        end
        local rows, err = store.get_store_statistics(ids, false)
        if err then return nil, err end
        return {stores = rows}
    end
    if type(a.component_id) ~= "string" or a.component_id == "" then
        return nil, errors.new({kind = errors.INVALID, message = "component_id is required"})
    end
    local rows, err = store.get_store_statistics({a.component_id}, true)
    if err then return nil, err end
    if not rows[1] then return nil, errors.new({kind = errors.NOT_FOUND, message = "Knowledge store not found"}) end
    return rows[1]
end

function M.delete_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.delete_store(a.component_id)
end

function M.update_config(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.update_config(a.component_id, a.config)
end

return M
