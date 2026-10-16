local test = require("test")
local hub = require("hub")

-- The hub spawns a worker per connection and caches the connection's bot token in
-- that worker at spawn. The pure planner decides, from the running workers and the
-- live connection list, what to start, restart, and stop. A rotated token must
-- become a restart so the worker picks it up; an unchanged token must be a no-op so
-- reconcile does not churn live workers.
local plan = (hub :: any)._plan_reconcile

local function only_id(list: { any }): string?
    if #list ~= 1 then return nil end
    local e = list[1]
    return (type(e) == "table" and (e :: any).id or e) :: string?
end

local function define_tests()
    test.describe("Discord gateway health supervision", function()
        test.it("retries a failed connection while admitting unrelated connections", function()
            local inbox, events = {}, {}
            inbox.case_receive = function() return inbox end
            events.case_receive = function() return events end
            local attempts, writes, selects, options = {}, {}, 0, nil
            local registrations = 0
            local fixture = hub.new({
                process = {
                    set_options = function(value) options = value; return true, nil end,
                    event = { CANCEL = "cancel" },
                    spawn_monitored = function(_, _, args)
                        local id = args.component_id
                        attempts[id] = (attempts[id] or 0) + 1
                        if id == "unavailable" and attempts[id] == 1 then
                            return nil, errors.new({ kind = errors.UNAVAILABLE, message = "worker host unavailable" })
                        end
                        return "pid:" .. id, nil
                    end,
                    link = function() return true, nil end,
                    cancel = function() return true, nil end,
                    inbox = function() return inbox end,
                    events = function() return events end,
                },
                notifier = { register = function()
                    registrations = registrations + 1
                    return true, nil
                end },
                channel = { select = function()
                    selects = selects + 1
                    if selects == 1 then return { channel = inbox } end
                    return { channel = events, value = { kind = "cancel" } }
                end },
                component = { list_system = function()
                    return {
                        { component_id = "unavailable", private_context = { bot_token = "token-a" } },
                        { component_id = "available", private_context = { bot_token = "token-b" } },
                    }, nil
                end },
                health = { report = function(id)
                    writes[#writes + 1] = id
                    return false, errors.new({ kind = errors.UNAVAILABLE, message = "metadata unavailable" })
                end },
                env = { get = function(key)
                    if key == "KICKSIDE_DISCORD_PROC_HOST" then return "app:processes" end
                    return nil
                end },
            })
            local ok, err = pcall(fixture.main, {})
            test.eq(ok, false)
            test.is_true(tostring(err):find("worker host unavailable", 1, true) ~= nil, tostring(err))
            test.eq(attempts.available, 1)
            fixture.main({})
            test.eq(attempts.available, 2)
            test.eq(attempts.unavailable, 2)
            test.eq(writes[1], "unavailable")
            test.not_nil(options)
            test.eq(assert(options).trap_links, true)
            test.eq(registrations, 2)
        end)
    end)
    test.describe("Discord gateway reconcile planner", function()
        test.it("starts a worker for a connection with no running worker", function()
            local p = plan({}, { { id = "c1", token = "t1" } })
            test.eq(only_id(p.start), "c1")
            test.eq(p.start[1].token, "t1")
            test.eq(#p.restart, 0)
            test.eq(#p.stop, 0)
        end)

        test.it("restarts the worker when the connection's token is rotated", function()
            local workers = { c1 = { pid = "p1", token = "old" } }
            local p = plan(workers, { { id = "c1", token = "new" } })
            test.eq(#p.start, 0)
            test.eq(only_id(p.restart), "c1")
            test.eq(p.restart[1].token, "new")
            test.eq(#p.stop, 0)
        end)

        test.it("does nothing when the running worker's token is unchanged", function()
            local workers = { c1 = { pid = "p1", token = "t1" } }
            local p = plan(workers, { { id = "c1", token = "t1" } })
            test.eq(#p.start, 0)
            test.eq(#p.restart, 0)
            test.eq(#p.stop, 0)
        end)

        test.it("stops a worker whose connection is gone", function()
            local workers = { c1 = { pid = "p1", token = "t1" } }
            local p = plan(workers, {})
            test.eq(#p.start, 0)
            test.eq(#p.restart, 0)
            test.eq(only_id(p.stop), "c1")
        end)

        test.it("plans a mix of start, restart, stop in one pass", function()
            local workers = {
                keep = { pid = "pk", token = "tk" },
                rotate = { pid = "pr", token = "old" },
                gone = { pid = "pg", token = "tg" },
            }
            local p = plan(workers, {
                { id = "keep", token = "tk" },
                { id = "rotate", token = "new" },
                { id = "fresh", token = "tf" },
            })
            test.eq(only_id(p.start), "fresh")
            test.eq(only_id(p.restart), "rotate")
            test.eq(only_id(p.stop), "gone")
        end)

        test.it("ignores a connection with a blank id or token", function()
            local p = plan({}, { { id = "", token = "t" }, { id = "c1", token = "" } })
            test.eq(#p.start, 0)
            test.eq(#p.restart, 0)
            test.eq(#p.stop, 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
