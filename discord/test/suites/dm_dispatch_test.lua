local test = require("test")
local dm_dispatch = require("dm_dispatch")

-- A chainable fake funcs executor recording the call it received. The DM dispatch
-- runs as the system gateway process: it neither sets an actor nor a scope, so the
-- fake only records the call id + args.
local function fake_funcs(captured: any): any
    local exec: any = {}
    function exec:call(id: any, args: any): (any, any)
        captured.id = id; captured.args = args; return { status = "accepted" }, nil
    end
    return { new = function(): any return exec end }
end

local function failing_funcs(message: string): any
    local exec: any = {}
    function exec:call(_id: any, _args: any): (any, any)
        return nil, message
    end
    return { new = function(): any return exec end }
end

local function define_tests()
    test.describe("Discord DM dispatch", function()
        test.it("runs the inbound receiver as the gateway process with the connection as the reply route", function()
            local captured: any = {}
            dm_dispatch._funcs = fake_funcs(captured)
            local r = dm_dispatch.run("cmp-1", { channel_id = "C1", id = "m1" })
            test.eq(r.ok, true)
            test.eq(captured.id, "kickside.discord.inbound:receive_message")
            test.eq(captured.args.component_id, "cmp-1")
            test.eq(captured.args.event.id, "m1")
            test.is_nil(captured.args.automation_id)
            test.is_nil(captured.args.agent_id)
            test.is_nil(captured.args.execution_identity)
        end)

        test.it("surfaces a receiver call failure as an error result", function()
            dm_dispatch._funcs = failing_funcs("inbound exploded")
            local r = dm_dispatch.run("cmp", { channel_id = "C1" })
            test.is_nil(r.ok)
            test.is_true(tostring(r.error):find("inbound exploded", 1, true) ~= nil, tostring(r.error))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
