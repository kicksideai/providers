local M = { pid = "gateway-hub", lookup_error = nil, send_error = nil, sent = {} }
M.registry = { CONSISTENT = "consistent", lookup = function(name, mode)
    M.name, M.mode = name, mode
    return M.pid, M.lookup_error
end }
function M.send(pid, topic, body)
    M.sent[#M.sent + 1] = { pid = pid, topic = topic, body = body }
    return nil, M.send_error
end
return M
