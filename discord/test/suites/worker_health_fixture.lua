local M = {}
function M.report(_id: string, _reason: string, message: any, _state: string?): (boolean, error?)
    M.message = message
    return true, nil
end
return M
