-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function define_tests()
    test.describe("capture history selection", function()

        test.it("bounds deactivation capture to the outgoing agent history", function()
            local user = fixture.user()
            local id = fixture.memory(user, { extraction_model = "test-bounded" })
            local session = "s-" .. user
            fixture.history.record(session, {
                { id = "earlier", role = "user", content = "An earlier conversation." },
                { id = "outgoing", role = "user", content = "I live in Paris." },
                { id = "incoming", role = "user", content = "A different agent handles this." },
            })
            fixture.extraction(id, {})
            local applied, err = fixture.apply(user, "deactivate", id, session, "agent-a", {
                refs = { deactivation_range = { from_id = "earlier", to_id = "outgoing" } },
            })
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#runs[1].input.span, 1)
            test.eq(runs[1].input.span[1].id, "outgoing")
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, "outgoing")
        end)

        for _, case in ipairs({
            { name = "first outgoing history", refs = { deactivation_range = { to_id = "b" } }, expected = "a,b" },
            { name = "explicit selector", refs = { deactivation_range = { to_id = "b" } }, selector = { mode = "range", from_id = "b", to_id = "c" }, expected = "c" },
            { name = "false selector", refs = { deactivation_range = { to_id = "b" } }, selector = false, expected = "a,b,c" },
            { name = "invalid outgoing bound", refs = { deactivation_range = { from_id = false, to_id = "b" } }, expected = "a,b,c" },
            { name = "cursor intersection", refs = { deactivation_range = { to_id = "b" } }, cursor = "a", expected = "b" },
            { name = "captured outgoing range", refs = { deactivation_range = { to_id = "b" } }, cursor = "c", expected = "" },
        }) do
            test.it("captures " .. case.name .. " without widening history", function()
                local user = fixture.user()
                local id = fixture.memory(user, { extraction_model = "test-bounded" })
                local session = "s-" .. user
                fixture.history.record(session, {
                    { id = "a", role = "user", content = "The first message." },
                    { id = "b", role = "user", content = "The outgoing message." },
                    { id = "c", role = "user", content = "The incoming message." },
                })
                if case.cursor then
                    fixture.extraction(id, {})
                    fixture.apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = case.cursor } })
                    local count = case.cursor == "c" and 2 or 1
                    if count == 2 then fixture.extraction(id, {}) end
                    fixture.wait_runs(user, id, "derive", count)
                end
                local capacity = fixture.op(user, "extraction_capacity", { model = "test-bounded" })
                local selected_count = case.expected == "" and 0 or #case.expected:gsub(",", "")
                local count = math.ceil(selected_count / capacity)
                for _ = 1, count do fixture.extraction(id, {}) end
                local applied, err = fixture.apply(user, "deactivate", id, session, "agent-a", { refs = case.refs, selector = case.selector })
                test.is_nil(err, tostring(err))
                if case.expected == "" then
                    test.is_false(applied.metadata.capture.captured)
                else
                    local runs = fixture.wait_runs(user, id, "derive", count + (case.cursor and 1 or 0))
                    table.sort(runs, function(a, b) return a.id < b.id end)
                    local ids, capturing = {}, false
                    for _, run in ipairs(runs) do
                        if run.id == applied.metadata.capture.run_id then capturing = true end
                        if capturing then
                            test.eq(run.status, "succeeded", tostring(run.last_error))
                            for _, event in ipairs(run.input.span) do ids[#ids + 1] = event.id end
                        end
                    end
                    test.is_true(capturing)
                    test.eq(table.concat(ids, ","), case.expected)
                end
            end)
        end

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
