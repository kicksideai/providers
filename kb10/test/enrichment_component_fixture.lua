local state: any = {}
local M: any = {}
function M.set(value: any) state = value end
function M.get_service(): (any, any?)
    if state.service_error then return nil, state.service_error end
    return { get = function(_self: any, _args: any): (any, any?) return state.component, state.read_error end }, nil
end
function M.set_meta(_id: string, fields: any): (any, any?)
    state.writes = (state.writes or 0) + 1
    state.fields = fields
    if state.write_error then return nil, state.write_error end
    return true, nil
end
return M
