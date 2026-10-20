-- HTTP-boundary fixtures shared by the standalone provider harnesses.
local test = require("test")
local json = require("json")
local M = {}

function M.new(provider, steps)
    local state = {requests = 0, reads = 0, writes = 0}
    local deps = {
        component = {
            ACCESS = {READ = 1, WRITE = 2},
            query = function(filter)
                test.eq(filter.meta.provider, provider)
                test.eq(filter.meta.class, "connection")
                return {{component_id = "selected-account", meta = {provider = provider, connection_state = "connected"}}}
            end,
            get_context = function(id, mask)
                test.eq(id, "selected-account")
                if mask == 2 then state.writes = state.writes + 1 else state.reads = state.reads + 1 end
                return {api_key = "fixture-token"}
            end,
        },
        capacity = {new = function() return {invoke = function(id, callback)
            test.eq(id, "selected-account")
            return callback()
        end} end, retry_after = function() return 2000 end},
        http = {request = function(method, url, options)
            state.requests = state.requests + 1
            local step = steps[state.requests]
            test.not_nil(step)
            test.eq(method, step.method)
            test.eq(url, step.url)
            test.eq(options.headers.Authorization, provider == "linear" and "fixture-token" or "Bearer fixture-token")
            test.eq(options.timeout, "30s")
            test.eq(options.max_response_body, 10485760)
            if step.body then test.eq(json.encode(json.decode(options.body)), json.encode(step.body)) end
            if step.check then step.check(options) end
            return {status_code = step.status or 200, headers = step.headers or {},
                body = step.raw or json.encode(step.reply or {})}
        end},
    }
    function state.done()
        test.eq(state.requests, #steps)
    end
    return deps, state
end
return M
