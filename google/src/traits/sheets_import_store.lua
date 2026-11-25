local store = {
    _contract = require("contract"),
    _registry = require("registry"),
    _security = require("security"),
}

function store.open(role: string): (any?, error?)
    local entry, read_err = store._registry.get("kickside.google.traits:import_" .. role)
    if read_err then return nil, read_err end
    local binding = entry and entry.meta and entry.meta.binding
    if type(binding) ~= "string" or binding == "" then
        return nil, errors.new({kind = errors.INVALID, message = "Bind kickside.google:import_" .. role .. "_binding to the data store"})
    end
    local actor, scope = store._security.actor(), store._security.scope()
    if not actor or not scope then
        return nil, errors.new({kind = errors.PERMISSION_DENIED, message = "Google Sheets import requires the caller's actor and scope"})
    end
    local id = role == "administrator" and "kickside.data:definable" or "kickside.data:loadable"
    local definition, get_err = store._contract.get(id)
    if get_err then return nil, get_err end
    if not definition then return nil, errors.new({kind = errors.UNAVAILABLE, message = id .. " is unavailable"}) end
    return definition:with_actor(actor):with_scope(scope):open(binding)
end

return store
