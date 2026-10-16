local test = require("test")
local fixture = require("fixture")
local channel = require("channel")
local time = require("time")
local function define_tests()
    test.describe("Discord gateway supervision", function()
        test.it("retains a worker failure and starts its replacement without killing the hub", function()
            local registered, register_err = process.registry.register(fixture.PARENT_NAME, nil, process.registry.CONSISTENT)
            test.is_nil(register_err, tostring(register_err))
            test.is_true(registered)
            local pid, spawn_err = process.spawn_monitored("app.suites:hub_supervisor", "app:processes", {})
            test.is_nil(spawn_err, tostring(spawn_err))
            local inbox, events, timeout = process.inbox(), process.events(), time.after("3s")
            local ready, failure, exit_error = false, nil, nil
            while not ready do
                local selected = channel.select({ inbox:case_receive(), events:case_receive(), timeout:case_receive() })
                if selected.channel == timeout then break end
                if selected.channel == events and selected.value.from == pid then
                    exit_error = selected.value.error or "supervisor exits before replacing its worker"
                    break
                end
                if selected.channel == inbox then
                    local topic = selected.value:topic()
                    if topic == "worker-ready" then ready = true end
                    if topic == "health" then failure = selected.value:payload():data() end
                end
            end
            process.cancel(pid)
            local _, unregister_err = process.registry.unregister(fixture.PARENT_NAME, process.registry.CONSISTENT)
            test.is_nil(unregister_err, tostring(unregister_err))
            test.is_nil(exit_error, tostring(exit_error))
            test.is_true(ready, "gateway hub does not replace its failed worker within 3s")
            test.not_nil(failure, "worker failure has no retained connection health")
            test.eq(assert(failure).reason, "gateway_worker_failed")
            test.is_true(failure.message:find("gateway worker fixture failure", 1, true) ~= nil, failure.message)
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
