-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function define_tests()
    test.describe("capture history selection", function()

        test.it("bounds deactivation capture to the outgoing agent history", function()
            local user = fixture.user()
            local id = fixture.memory(user, { extraction_model = "test-bounded" })
            local session = "s-" .. user
            local events = {
                { id = "earlier", role = "user", author = { kind = "user", id = user }, content = "An earlier conversation." },
                { id = "outgoing", role = "user", author = { kind = "user", id = user }, content = "I live in Paris." },
                { id = "incoming", role = "user", author = { kind = "user", id = user }, content = "A different agent handles this." },
            }
            fixture.record_chat(user, session, events)
            fixture.extraction(id, {})
            local applied, err = fixture.apply(user, "deactivate", id, session, "agent-a", {
                refs = { deactivation_range = { from_id = events[1].id, to_id = events[2].id } },
            })
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.eq(#runs[1].input.span, 1)
            test.eq(runs[1].input.span[1].id, events[2].id)
            local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
            test.eq(cursor.last_event_id, events[2].id)
        end)

        for _, case in ipairs({
            { name = "first outgoing history", to = "b", expected = { "a", "b" } },
            { name = "explicit selector", to = "b", selector = { mode = "range", from = "b", to = "c" }, expected = { "c" } },
            { name = "cursor intersection", to = "b", cursor = "a", expected = { "b" } },
            { name = "captured outgoing range", to = "b", cursor = "c", expected = {} },
        }) do
            test.it("captures " .. case.name .. " without widening history", function()
                local user = fixture.user()
                local id = fixture.memory(user, { extraction_model = "test-bounded" })
                local session = "s-" .. user
                local events = {
                    { id = "a", role = "user", author = { kind = "user", id = user }, content = "The first message." },
                    { id = "b", role = "user", author = { kind = "user", id = user }, content = "The outgoing message." },
                    { id = "c", role = "user", author = { kind = "user", id = user }, content = "The incoming message." },
                }
                fixture.record_chat(user, session, events)
                local event_ids = { a = events[1].id, b = events[2].id, c = events[3].id }
                if case.cursor then
                    fixture.extraction(id, {})
                    local captured, capture_err = fixture.apply(user, "after_persist", id, session, "agent-a", { refs = { event_id = event_ids[case.cursor] } })
                    test.is_nil(capture_err, tostring(capture_err))
                    test.is_true(captured.metadata.capture.captured)
                    local count = case.cursor == "c" and 2 or 1
                    if count == 2 then fixture.extraction(id, {}) end
                    fixture.wait_runs(user, id, "derive", count)
                end
                local capacity = fixture.op(user, "extraction_capacity", { model = "test-bounded" })
                local count = math.ceil(#case.expected / capacity)
                for _ = 1, count do fixture.extraction(id, {}) end
                local selector
                if case.selector then
                    selector = {
                        mode = case.selector.mode,
                        from_id = event_ids[case.selector.from],
                        to_id = event_ids[case.selector.to],
                    }
                end
                local applied, err = fixture.apply(user, "deactivate", id, session, "agent-a", {
                    refs = { deactivation_range = { to_id = event_ids[case.to] } },
                    selector = selector,
                })
                test.is_nil(err, tostring(err))
                if #case.expected == 0 then
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
                    local expected = {}
                    for _, name in ipairs(case.expected) do expected[#expected + 1] = event_ids[name] end
                    test.is_true(capturing)
                    test.eq(table.concat(ids, ","), table.concat(expected, ","))
                end
            end)
        end

        for _, case in ipairs({
            { name = "a non-table selector", selector = false },
            { name = "a malformed selector range", selector = { mode = "range", from_id = false, to = "b" } },
            { name = "a malformed outgoing range", outgoing = { from_id = false, to = "b" } },
        }) do
            test.it("rejects " .. case.name .. " without enrolling or advancing capture", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local session = "s-" .. user
                local events = {
                    { id = "a", role = "user", author = { kind = "user", id = user }, content = "The earlier message." },
                    { id = "b", role = "user", author = { kind = "user", id = user }, content = "The outgoing message." },
                    { id = "c", role = "user", author = { kind = "user", id = user }, content = "The incoming message." },
                }
                fixture.record_chat(user, session, events)
                local event_ids = { a = events[1].id, b = events[2].id, c = events[3].id }
                local selector = case.selector
                if type(selector) == "table" then
                    selector = { mode = selector.mode, from_id = selector.from_id, to_id = event_ids[selector.to] }
                end
                local refs
                if case.outgoing then
                    refs = { deactivation_range = { from_id = case.outgoing.from_id, to_id = event_ids[case.outgoing.to] } }
                end
                local result, err = fixture.apply(user, "deactivate", id, session, "agent-a", {
                    refs = refs,
                    selector = selector,
                })
                test.is_nil(result)
                test.not_nil(err)
                local runs = fixture.op(user, "runs", { component_id = id, run_type = "derive" })
                test.eq(#runs, 0)
                local cursor = fixture.op(user, "cursor", { component_id = id, host_kind = "session", host_id = session })
                test.is_nil(cursor)
            end)
        end

    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
