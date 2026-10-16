local state: any = {}
local M: any = {}
function M.set(value: any) state = value end
function M.structured_output(_schema: any, _prompt: any, _options: any): (any, any?)
    state.calls = (state.calls or 0) + 1
    return state.response, state.error
end
return M
