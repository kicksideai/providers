local graph_fn = require("graph_fn")
local errors = require("errors")

local function run(args: any): (any, any)
    args = args or {}
    local store_id = (args.store_id :: string?)
    if type(store_id) ~= "string" or store_id == "" then
        return nil, errors.new({ message = "store_id required", kind = errors.INVALID_ARGUMENT })
    end
    local store_contract = (args.store_contract :: string?)
    if type(store_contract) ~= "string" then store_contract = nil end
    return graph_fn.fetch_concept_tree({
        store_id = store_id,
        store_contract = store_contract,
    })
end

return { run = run }
