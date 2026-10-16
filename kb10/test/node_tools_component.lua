-- Component access seam for the node explorer tools: the actor cannot read
-- "denied-kb".
local M = { ACCESS = { READ = 1 } }
function M.validate_access(kb_id: string, _access: integer): (boolean?, error?)
    if kb_id == "denied-kb" then
        return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "knowledge base access denied" })
    end
    return true, nil
end

return M
