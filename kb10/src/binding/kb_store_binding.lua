-- kb10 implementation of the kickside.knowledge:kb_store_lifecycle contract.
--
-- Lifecycle methods adapt a single DTO to the positional kb10_store API. Node,
-- edge, embedding, summary and graph operations are kb10-internal
-- (persist:node_store + injection:materializer_store) and never cross the
-- contract seam.

local store = require("store")
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

function M.get_store(args: any): (any, string?)
    local a = (arg_table(args) :: any) :: kb10.ComponentStoreArgs
    return store.get_store(a.component_id)
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
