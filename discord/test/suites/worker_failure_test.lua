local test = require("test")
local channel = require("channel")
local worker = require("worker")
local fixture = require("fixture")
local health = require("health")
return {run = test.run_cases(function()
    test.describe("Discord gateway application error", function()
        test.it("reports the typed application error at the existing health boundary", function()
            local events = channel.new(1)
            events:send({kind = "cancel"})
            local driver = worker.new({process = {events = function() return events end, event = {CANCEL = "cancel"}},
                component = {get_private_context = function() return {bot_token = "fixture-token"}, nil end}})
            driver.main({token = "fixture-token", component_id = "fixture-connection"})
            test.eq(health.message, fixture.failure)
        end)
        test.it("normalizes stored credentials before authenticating", function()
            for _, context in ipairs({{bot_token = "\n valid-token \t"}, {token = "\t valid-token \n"}}) do
                local events = channel.new(1)
                events:send({kind = "cancel"})
                local driver = worker.new({process = {events = function() return events end, event = {CANCEL = "cancel"}},
                    component = {get_private_context = function() return context, nil end}})
                driver.main({component_id = "fixture-connection"})
                test.eq(fixture.token, "valid-token")
            end
        end)
    end)
end)}
