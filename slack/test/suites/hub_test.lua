local test = require("test")
local hub = require("hub")

-- The hub spawns a worker per connection and caches the connection's app token in
-- that worker at spawn. The pure planner decides, from the running workers and the
-- live connection list, what to start, restart, and stop. A rotated app token must
-- become a restart so the worker re-opens the socket with it; an unchanged token
-- must be a no-op so reconcile does not churn live workers.
local plan = (hub :: any)._plan_reconcile

local function only_id(list: { any }): string?
    if #list ~= 1 then return nil end
    local e = list[1]
    return (type(e) == "table" and (e :: any).id or e) :: string?
end

local function define_tests()
    test.describe("Slack socket reconcile planner", function()
        test.it("starts a worker for a connection with no running worker", function()
            local p = plan({}, { { id = "c1", token = "t1" } })
            test.eq(only_id(p.start), "c1")
            test.eq(p.start[1].token, "t1")
            test.eq(#p.restart, 0)
            test.eq(#p.stop, 0)
        end)

        test.it("restarts the worker when the connection's app token is rotated", function()
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
