local test = require("test")
local process = require("process")
local channel = require("channel")
local time = require("time")
local function define_tests()
    test.describe("MCP worker failure boundary", function()
        local pid
        test.after_each(function()
            if pid then
                local ok, err = process.cancel(pid)
                test.is_nil(err)
                pid = nil
            end
        end)
        test.it("retains the session after a remote tool failure and replaces a broken transport", function()
            local spawn_err
            pid, spawn_err = process.spawn_monitored("app:worker_boundary", "app:processes", { component_id = "fixture" })
            test.is_nil(spawn_err)
            test.not_nil(pid)
            local replies = process.listen("worker-boundary-reply")
            local function call(name)
                local ok, err = process.send(pid, "request", { operation = "call_tool", args = { name = name },
                    reply_pid = process.pid(), reply_topic = "worker-boundary-reply" })
                test.is_nil(err)
                test.is_true(ok)
                local timeout = time.after("30s")
                local selected = channel.select({ replies:case_receive(), timeout:case_receive() })
                test.eq(selected.channel, replies, "worker replies within its request deadline")
                return selected.value
            end
            local remote = call("tool_failure")
            test.is_nil(remote.error)
            test.is_false(remote.result.success)
            test.eq(remote.result.error, "remote MCP tool returned an error")
            local continued = call("success")
            test.is_nil(continued.error)
            test.eq(continued.result.generation, 1)
            test.is_false(continued.result.closed)
            local broken = call("transport_failure")
            test.eq(broken.error.kind, errors.UNAVAILABLE)
            local reopened = call("success")
            test.is_nil(reopened.error)
            test.eq(reopened.result.generation, 2)
            test.is_false(reopened.result.closed)
        end)
    end)
end
return { run = test.run_cases(define_tests) }
