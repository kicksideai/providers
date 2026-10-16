local test = require("test")
local core = require("pull_core")

local NOW = 1783677600 -- 2026-07-10T10:00:00Z

local function fake_transport(events)
    local fake: any = { calls = {} }
    function fake.connect(id) fake.connection_id = id; return { component_id = id }, nil end
    function fake.list_events(_conn, calendar_id, opts)
        fake.calls[#fake.calls + 1] = { calendar_id = calendar_id, opts = opts }
        return { success = true, data = { items = events } }
    end
    return fake
end

local function event(id, start, attendees)
    return { id = id, summary = "Planning", htmlLink = "https://calendar.example/" .. id, start = { dateTime = start }, attendees = attendees }
end

local function pull(fake, config)
    return core.pull({ config = config or { connection = "google-1" } }, nil, { transport = fake, now = NOW })
end

local function define_tests()
    test.describe("Google Calendar pull capability", function()
        test.it("passes a typed Calendar failure through pull and pull_keys", function()
            local fake = fake_transport({})
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "calendar transport unavailable" })
            fake.list_events = function(): (any?, error?) return nil, failure end

            local pulled, pull_err = core.pull({ config = { connection = "google-1" } }, nil,
                { transport = fake, now = NOW })
            local keys, keys_err = core.pull_keys({ config = { connection = "google-1" } }, nil,
                { transport = fake, now = NOW })

            test.is_nil(pulled)
            test.eq(pull_err, failure)
            test.is_nil(keys)
            test.eq(keys_err, failure)
        end)

        test.it("retains the shared capacity floor while preserving published provider errors", function()
            local fake = fake_transport({})
            fake.list_events = function() return {success = false, error = "paced", status_code = 429,
                kind = errors.RATE_LIMITED, retryable = true, details = {code = "provider_capacity", scope = "capacity", retry_at_ms = 1893456000123}} end
            local result = pull(fake)
            test.eq(result.error.code, "provider_error")
            test.eq(result.error.kind, errors.RATE_LIMITED)
            test.eq(result.error.details.retry_at_ms, 1893456000123)
        end)

        test.it("lists every attendee in the configured connection window without making composition decisions", function()
            local fake = fake_transport({
                event("upcoming", "2026-07-10T10:30:00Z", {
                    { email = "owner@calendar.test", displayName = "Owner" },
                    { email = "client@customer.test", displayName = "Client Person" },
                }),
                event("later", "2026-07-10T11:00:00Z", { { email = "grace@customer.test" } }),
            })
            local result = pull(fake, { connection = "google-1", lookahead_hours = 24 })

            test.eq(result.success, true)
            test.eq(#result.items, 3)
            test.eq(result.items[1].payload.event_id, "upcoming")
            test.eq(result.items[1].payload.attendee.email, "owner@calendar.test")
            test.eq(result.items[1].payload.source, "google_calendar")
            test.eq(result.items[2].dedup_key, "google:calendar:upcoming:client@customer.test")
            local call: any = fake.calls[1]
            test.eq(call.calendar_id, "primary")
            test.eq(call.opts.time_min, "2026-07-10T10:00:00Z")
            test.eq(call.opts.time_max, "2026-07-11T10:00:00Z")
            test.eq(call.opts.single_events, true)
            test.eq(call.opts.fields, "*")
        end)

        test.it("skips cancelled events but leaves attendee, timing, and domain decisions to consumers", function()
            local cancelled = event("cancelled", "2026-07-10T10:30:00Z", { { email = "cancelled@customer.test" } })
            cancelled.status = "cancelled"
            local fake = fake_transport({ cancelled, event("active", "2026-07-10T09:45:00Z", { { email = "past@customer.test" } }) })
            local result = pull(fake)
            test.eq(#result.items, 1)
            test.eq(result.items[1].payload.event_id, "active")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
