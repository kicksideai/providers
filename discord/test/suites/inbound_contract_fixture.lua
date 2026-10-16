local M = {}
function M.get(id)
    if id ~= "kickside.channel:receive" then return nil, "unknown contract" end
    return { open = function() return { receive = function(_, inbound)
        return { accepted = true, status = "routed", text = inbound.text }, nil
    end }, nil end }, nil
end
return M
