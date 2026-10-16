local M = {calls = 0, unreachable = false}
function M.request(): (any?, error?)
    M.calls = M.calls + 1
    if M.unreachable then return nil, errors.new({kind = errors.UNAVAILABLE, message = "dial tcp: lookup provider.test: no such host", retryable = true}) end
    return {status_code = 429, headers = {["Retry-After"] = "2"},
        body = '{"ok":false,"description":"paced","message":"paced","retry_after":2,"parameters":{"retry_after":2}}'}, nil
end
return M
