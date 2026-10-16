local test = require("test")
local hub = require("hub")
local registry = require("registry")

local function fixture(options)
    local inbox, events = {}, {}
    inbox.case_receive = function() return inbox end
    events.case_receive = function() return events end
    local selected, scans, inbox_ready, registered = 0, 0, false, false
    return hub.new({
        process = {
            event = {CANCEL = "cancel"},
            set_options = function() return true end,
            events = function() return events end,
            inbox = function() inbox_ready = true; return inbox end,
        },
        notifier = {register = function()
            if options.registration then test.is_true(inbox_ready, "hub publishes its name before opening its inbox") end
            registered = true
            return true
        end},
        component = {list_system = function()
            test.is_true(registered, "startup scan precedes wake registration")
            scans = scans + 1
            if scans == options.fail_scan then return nil, options.cause end
            return {}, nil
        end},
        channel = {select = function(cases)
            if options.no_timer then test.eq(#cases, 2, "hub still reconciles on a periodic timer") end
            selected = selected + 1
            if selected == 1 and options.wake then return {channel = inbox} end
            return {channel = events, value = {kind = "cancel"}}
        end},
        env = {get = function(key) if key == "KICKSIDE_DISCORD_PROC_HOST" then return "app:processes" end end},
    })
end

local function define_tests()
    test.describe("Discord hub readiness and wake delivery", function()
        test.it("opens its inbox before publishing its wake address", function()
            fixture({registration = true}).main({})
        end)
        test.it("waits for events without a reconcile timer", function()
            fixture({no_timer = true}).main({})
        end)
        test.it("returns startup store failures to the existing service supervisor", function()
            local cause = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "store not ready"})
            local ok, err = pcall(fixture({fail_scan = 1, cause = cause}).main, {})
            test.eq(ok, false)
            test.contains(tostring(err), cause:message())
        end)
        test.it("returns failed wake scans to the existing service supervisor", function()
            local cause = errors.new({kind = errors.UNAVAILABLE, retryable = true, message = "store read failed"})
            local ok, err = pcall(fixture({fail_scan = 2, cause = cause, wake = true}).main, {})
            test.eq(ok, false)
            test.contains(tostring(err), cause:message())
        end)
        test.it("orders the gateway service after migration boot", function()
            local service, err = registry.get("kickside.discord.gateway:gateway.service")
            test.is_nil(err, tostring(err))
            local boot = false
            for _, dependency in ipairs(service.data.lifecycle.depends_on) do
                if dependency == "wippy.bootloader:bootloader.service" then boot = true end
            end
            test.is_true(boot, "gateway store dependency does not wait for schema readiness")
        end)
    end)
end
return {run = test.run_cases(define_tests)}
