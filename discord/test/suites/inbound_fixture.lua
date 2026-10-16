local M = {}
function M.connect(_id) return nil, "No authenticated actor found" end
function M.inbound_context(id) return { component_id = id, allow_bot_messages = false }, nil end
function M.get(id)
    if id ~= "kickside.channel:receive" then return nil, "unknown contract" end
    return { open = function() return { receive = function(_, inbound)
        return { accepted = true, status = "routed", text = inbound.text }, nil
    end }, nil end }, nil
end
return M
