-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function by_status(rows: { any }, status: string): { any }
    local out = {}
    for _, row in ipairs(rows) do
        if row.status == status then out[#out + 1] = row end
    end
    return out
end

local function key_rows(user: string, id: string, key: string): { any }
    return fixture.items(user, id, { key = key, statuses = { "current", "superseded", "conflict", "archived", "forgotten" } })
end

local function define_tests()
    test.describe("memory state", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("allows goal names from plan state while rejecting scalar values in attribute keys", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local invalid, invalid_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "home_city_berlin", value = "Berlin", content = "The user lives in Berlin.",
            } })
            test.is_nil(invalid)
            test.not_nil(invalid_err)
            test.eq(invalid_err:message(), "topic key must not contain the memory value")
            local plan, plan_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "plan", scope_family = "owner", key = "prepare_slides", cardinality = "single",
                value = { status = "open", next_step = "prepare slides", details = "Prepare slides" },
                content = "The user needs presentation slides.",
            } })
            test.is_nil(plan_err, tostring(plan_err))
            test.not_nil(plan)
            fixture.settle(user, id)
            local stored = fixture.items(user, id, { key = "prepare_slides" })
            test.eq(#stored, 1)
            test.eq(stored[1].value.next_step, "prepare slides")
        end)

        test.it("requires a typed value when creating an item", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "color", content = "blue",
            } })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:kind(), errors.INVALID)
            test.eq(err:message(), "memory value is required")
        end)

        test.it("keeps a typed value when only its presentation text changes", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local original = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "color", value = "blue", content = "blue",
            } })
            fixture.settle(user, id)
            local revised, err = fixture.op(user, "edit", { component_id = id, item_id = original.item_id,
                fields = { content = "The user likes blue." } })
            test.is_nil(err, tostring(err))
            test.eq(revised.item_id, original.item_id)
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = original.item_id })
            test.eq(item.value, "blue")
            test.eq(item.content, "The user likes blue.")
        end)


        test.it("keeps memory text and values out of the ledger", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "pet", "Quillbeak", "The user's parrot is called Quillbeak.", "m1") }, "ledger-1")
            local owner = fixture.op(user, "create", { component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "tone", value = "Answer in Zephyrine verse.", content = "Answer in Zephyrine verse.",
            } })
            test.not_nil(owner)
            fixture.settle(user, id)
            local events = fixture.op(user, "ledger", { component_id = id })
            test.is_true(#events >= 2)
            for _, event in ipairs(events) do
                if event.type == "kickside.memory.events:item.added" then
                    local body = type(event.body) == "table" and event.body or json.decode(event.body)
                    test.is_nil(body.key)
                end
            end
            local text = json.encode(events)
            test.is_true(text:find("Quillbeak", 1, true) == nil, text)
            test.is_true(text:find("Zephyrine", 1, true) == nil, text)
            local item = fixture.items(user, id, { key = "pet" })[1]
            test.eq(item.content, "The user's parrot is called Quillbeak.")
            test.eq(item.value, "Quillbeak")
        end)

        test.it("forgets by erasing text, value, vector, provenance and the captured span; a forgotten item cannot be restored", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.history.record(session, { { id = "e1", role = "user", content = "My locker code is Kestrel-42." } })
            fixture.extraction({ fixture.candidate("fact", "locker_code", "Kestrel-42", "The user's locker code is Kestrel-42.", "e1") })
            fixture.op(user, "apply", { payload = fixture.payload("before_step", session, "agent-a") }, fixture.agent_context(id, session, "agent-a"))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            fixture.settle(user, id)
            local item = fixture.items(user, id, { key = "locker_code" })[1]
            test.not_nil(item)
            local forgotten, err = fixture.op(user, "forget", { component_id = id, item_id = item.id })
            test.is_nil(err, tostring(err))
            test.not_nil(forgotten)
            fixture.settle(user, id)
            local erased = fixture.op(user, "get", { component_id = id, item_id = item.id })
            test.eq(erased.status, "forgotten")
            test.eq(erased.content, "")
            test.is_nil(erased.value)
            test.eq(#fixture.op(user, "provenance", { component_id = id, item_id = item.id }), 0)
            local stored = fixture.op(user, "stored_text", { component_id = id })
            test.is_true(json.encode(stored):find("Kestrel", 1, true) == nil, json.encode(stored))
            local _, restore_err = fixture.op(user, "restore", { component_id = id, item_id = item.id })
            test.not_nil(restore_err)
        end)

        test.it("re-renders the pinned slice when an item in it is forgotten", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            fixture.remember(user, id, { fixture.candidate("preference", "drink", "matcha", "The user drinks matcha.", "p1") }, "pin-1")
            fixture.settle(user, id)
            local context = fixture.agent_context(id, session, "agent-a")
            fixture.op(user, "apply", { payload = fixture.payload("activate", session, "agent-a") }, context)
            local before = fixture.op(user, "prompt", {}, context)
            test.is_true(before:find("matcha", 1, true) ~= nil, before)
            local item = fixture.items(user, id, { key = "drink" })[1]
            fixture.op(user, "forget", { component_id = id, item_id = item.id })
            fixture.settle(user, id)
            local after = fixture.op(user, "prompt", {}, context)
            test.is_true(after:find("matcha", 1, true) == nil, after)
        end)

        test.it("archives an item out of recall until a person restores it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "gym", "Tuesdays", "The user goes to the gym on Tuesdays.", "a1") }, "arch-1")
            fixture.settle(user, id)
            local item = fixture.items(user, id, { key = "gym" })[1]
            fixture.op(user, "archive", { component_id = id, item_id = item.id })
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = item.id }).status, "archived")
            test.eq(#fixture.items(user, id, { key = "gym", statuses = { "current" } }), 0)
            local _, restore_err = fixture.op(user, "restore", { component_id = id, item_id = item.id })
            test.is_nil(restore_err, tostring(restore_err))
            fixture.settle(user, id)
            local restored = fixture.op(user, "get", { component_id = id, item_id = item.id })
            test.eq(restored.status, "current")
            test.eq(restored.content, "The user goes to the gym on Tuesdays.")
        end)

        test.it("records a recurring claim as a new occurrence, so a late older statement stays history", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local function say(city: string, at: string, idem: string, verdict: boolean)
                if verdict then
                    local held = by_status(key_rows(user, id, "home_city"), "current")
                    local ids = {}
                    for _, item in ipairs(held) do ids[#ids + 1] = item.id end
                    fixture.verdict("SUPERSEDE", ids)
                end
                fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", city, "The user lives in " .. city .. ".", idem, at) }, idem)
                fixture.settle(user, id)
            end
            say("Paris", "2026-01-10T00:00:00Z", "r1", false)
            say("Berlin", "2026-02-10T00:00:00Z", "r2", true)
            say("Paris", "2026-03-10T00:00:00Z", "r3", true)
            say("Rome", "2026-02-20T00:00:00Z", "r4", true)
            local rows = key_rows(user, id, "home_city")
            local current = by_status(rows, "current")
            test.eq(#current, 1)
            test.eq(current[1].value, "Paris")
            test.eq(current[1].valid_at, "2026-03-10T00:00:00Z")
            local paris = 0
            for _, row in ipairs(rows) do
                if row.value == "Paris" then paris = paris + 1 end
            end
            test.eq(paris, 2)
            local versions = {}
            for _, row in ipairs(rows) do versions[#versions + 1] = row.version end
            table.sort(versions)
            test.eq(table.concat(versions, ","), "1,2,3,4")
        end)

        test.it("hashes typed values, so true and \"true\" are different claims", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local flag = fixture.candidate("fact", "subscribed", "true", "The user is subscribed.", "t1")
            fixture.remember(user, id, { flag }, "string-claim")
            local boolean_claim = fixture.candidate("fact", "subscribed", "true", "The user is subscribed (flag).", "t2")
            boolean_claim.value = true
            fixture.verdict("ADD", {})
            fixture.remember(user, id, { boolean_claim }, "boolean-claim")
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { key = "subscribed" }), 2)
        end)

        test.it("holds one current value of a single-valued key across kinds and writers, versioned by key", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local session = "s-" .. user
            local created = fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "diet", value = "vegetarian", content = "The user is vegetarian.",
                cardinality = "single",
            } })
            test.not_nil(created)
            fixture.settle(user, id)
            fixture.normalization({ { key = "diet", value = "vegan" } })
            local stored = fixture.op(user, "tool_remember", { input = {
                content = "The user is vegan.", kind = "preference", key = "dietary_preference", value = "The user is vegan.",
            } }, fixture.agent_context(id, session, "agent-a"))
            test.is_true(stored.success, json.encode(stored))
            fixture.settle(user, id)
            local rows = key_rows(user, id, "diet")
            local current = by_status(rows, "current")
            test.eq(#current, 1)
            test.eq(current[1].value, "vegan")
            test.eq(current[1].version, 2)
            test.eq(current[1].cardinality, "single")
        end)

        test.it("edits identity and rules through the settled writer: A to B to A leaves A current", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local a = fixture.op(user, "create", { component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "tone", value = "Be brief.", content = "Be brief.",
            } })
            fixture.settle(user, id)
            local b = fixture.op(user, "edit", { component_id = id, item_id = a.item_id, fields = { content = "Be thorough." } })
            fixture.settle(user, id)
            local back, err = fixture.op(user, "edit", { component_id = id, item_id = b.item_id, fields = { content = "Be brief." } })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local current = by_status(key_rows(user, id, "tone"), "current")
            test.eq(#current, 1)
            test.eq(current[1].content, "Be brief.")
            test.eq(current[1].id, back.item_id)
        end)

        test.it("revises an item's text without changing its claim", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created = fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "home_city", value = "Berlin", content = "The user lives in Berlin.",
                cardinality = "single",
            } })
            fixture.settle(user, id)
            local revised, err = fixture.op(user, "edit", { component_id = id, item_id = created.item_id,
                fields = { content = "The user lives in Berlin, Germany.", priority = 3 } })
            test.is_nil(err, tostring(err))
            test.is_true(revised.revised)
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = created.item_id })
            test.eq(item.content, "The user lives in Berlin, Germany.")
            test.eq(item.priority, 3)
            test.eq(item.status, "current")
        end)

        test.it("keeps conflict groups complete and resolves the whole group", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local function claim(value: string, idem: string)
                local held = by_status(key_rows(user, id, "birth_date"), "current")
                for _, row in ipairs(by_status(key_rows(user, id, "birth_date"), "conflict")) do held[#held + 1] = row end
                if #held > 0 then
                    local ids = {}
                    for _, item in ipairs(held) do ids[#ids + 1] = item.id end
                    fixture.verdict("CONFLICT", ids)
                end
                fixture.remember(user, id, { fixture.candidate("profile_slot", "birth_date", value, "The user was born on " .. value .. ".", idem) }, idem)
                fixture.settle(user, id)
            end
            claim("1990-03-03", "c1")
            claim("1990-03-05", "c2")
            claim("1990-03-07", "c3")
            local contested = by_status(key_rows(user, id, "birth_date"), "conflict")
            test.eq(#contested, 3)
            test.eq(contested[1].conflict_group, contested[2].conflict_group)
            test.eq(contested[2].conflict_group, contested[3].conflict_group)
            local resolved, err = fixture.op(user, "resolve", {
                component_id = id, group_id = contested[1].conflict_group, winner_id = contested[2].id,
            })
            test.is_nil(err, tostring(err))
            test.eq(resolved.superseded, 2)
            fixture.settle(user, id)
            local rows = key_rows(user, id, "birth_date")
            test.eq(#by_status(rows, "conflict"), 0)
            local current = by_status(rows, "current")
            test.eq(#current, 1)
            test.eq(current[1].id, contested[2].id)
        end)

        test.it("shows the agent unresolved conflicts as alternatives, never as facts", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "cat_name", "Biscuit", "The user's cat is called Biscuit.", "k1") }, "alt-1")
            fixture.settle(user, id)
            local first = fixture.items(user, id, { key = "cat_name" })[1]
            fixture.verdict("CONFLICT", { first.id })
            fixture.remember(user, id, { fixture.candidate("fact", "cat_name", "Pepper", "The user's cat is called Pepper.", "k2") }, "alt-2")
            fixture.settle(user, id)
            local found = fixture.op(user, "tool_search", { input = { query = "cat called" } }, fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.is_true(found.success)
            test.eq(found.count, 0)
            test.eq(#found.alternatives, 1)
            test.eq(found.alternatives[1].status, "unresolved")
            test.eq(#found.alternatives[1].options, 2)
        end)

        test.it("refuses Remember and ForgetMemory when the agent's memory is read-only", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("fact", "plant", "fern", "The user keeps a fern.", "w1") }, "ro-1")
            fixture.settle(user, id)
            local item = fixture.items(user, id, { key = "plant" })[1]
            local context = fixture.agent_context(id, "s-" .. user, "agent-a", { write_enabled = false })
            local stored = fixture.op(user, "tool_remember", { input = { content = "The user likes tea.", key = "drink", value = "tea" } }, context)
            test.eq(stored.success, false)
            local forgotten = fixture.op(user, "tool_forget", { input = { key = item.key, value = item.value } }, context)
            test.eq(forgotten.success, false)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { key = "drink" }), 0)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = item.id }).status, "current")
        end)

        test.it("never lets the agent's tools forget its identity or rules", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local rule = fixture.op(user, "create", { component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "tone", value = "Be brief.", content = "Be brief.",
            } })
            fixture.settle(user, id)
            local refused = fixture.op(user, "tool_forget", { input = { key = "tone", value = "Be brief." } }, fixture.agent_context(id, "s-" .. user, "agent-a"))
            test.eq(refused.success, false)
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = rule.item_id }).status, "current")
        end)

        test.it("learns an explicitly remembered claim again after it was forgotten", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local context = fixture.agent_context(id, "s-" .. user, "agent-a")
            local input = { content = "The user's bike is red.", key = "bike_color", value = "red" }
            fixture.normalization({ input })
            local first = fixture.op(user, "tool_remember", { input = input }, context)
            fixture.settle(user, id)
            fixture.history.record("s-" .. user, { { id = "forget-bike", role = "user", content = "Forget my bike color." } })
            local forgotten = fixture.op(user, "tool_forget", { input = { key = input.key, value = input.value } }, context)
            test.is_true(forgotten.success, forgotten.error)
            fixture.settle(user, id)
            fixture.normalization({ input })
            local again = fixture.op(user, "tool_remember", { input = input }, context)
            test.is_true(again.success, json.encode(again))
            fixture.settle(user, id)
            local current = fixture.items(user, id, { key = "bike_color", statuses = { "current" } })
            test.eq(#current, 1)
            test.eq(current[1].content, "The user's bike is red.")
        end)

        test.it("keeps a dependency error's own kind and retry flag", function()
            local classified = fixture.op(fixture.user(), "classify", { classified = true })
            test.eq(classified.kind, classified.invalid)
            test.eq(classified.retryable, false)
            local plain = fixture.op(fixture.user(), "classify", {})
            test.eq(plain.kind, plain.internal)
            test.eq(plain.retryable, false)
        end)
        test.it("forgets more than 200 occurrences and expands conflicts past 200 members", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 201, same_value = true })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 0)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 0)
            test.eq(#fixture.items(user, id, { statuses = { "forgotten" }, limit = 300 }), 201)

            local group_id = fixture.memory(user)
            local grouped, group_err = fixture.persistence_op(user, "seed", { component_id = group_id, user = user, count = 201, conflict = true })
            test.is_nil(group_err, tostring(group_err))
            fixture.settle(user, group_id)
            local _, expand_err = fixture.persistence_op(user, "expand", { component_id = group_id, user = user, item_id = grouped.item_ids[1] })
            test.is_nil(expand_err, tostring(expand_err))
            fixture.settle(user, group_id)
            test.eq(#fixture.items(user, group_id, { statuses = { "conflict" }, limit = 300 }), 202)
        end)

        test.it("preserves established cardinality after archive and rejects changing it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.create_claim(user, id, "Paris")
            fixture.op(user, "archive", { component_id = id, item_id = first.item_id })
            fixture.settle(user, id)
            local _, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "home_city", value = "Berlin", content = "The user lives in Berlin.", cardinality = "multi",
            } })
            test.not_nil(err)
            test.eq(fixture.count_rows("kickside_memory_keys", id), 1)
        end)

        test.it("restores an older archived single value with owner authority", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "old-city", "2025-01-01T00:00:00Z") }, "old-city")
            fixture.settle(user, id)
            fixture.op(user, "archive", { component_id = id, item_id = first.item_ids[1] })
            fixture.settle(user, id)
            fixture.create_claim(user, id, "Berlin")
            local berlin = fixture.items(user, id, { statuses = { "current" }, key = "home_city" })[1]
            fixture.verdict("CONFLICT", { berlin.id })
            fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Oslo", "The user lives in Oslo.", "contested-city") }, "contested-city")
            fixture.settle(user, id)
            local _, err = fixture.op(user, "restore", { component_id = id, item_id = first.item_ids[1] })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local current = fixture.items(user, id, { statuses = { "current" } })
            test.eq(#current, 1)
            test.eq(current[1].id, first.item_ids[1])
            test.eq(#fixture.items(user, id, { statuses = { "conflict" } }), 0)
        end)

        test.it("merges an edit into an already current claim", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.create_claim(user, id, "Paris", "multi")
            local destination = fixture.create_claim(user, id, "Berlin", "multi")
            local result, err = fixture.op(user, "edit", { component_id = id, item_id = first.item_id, fields = { value = "Berlin" } })
            test.is_nil(err, tostring(err))
            test.eq(result.item_id, destination.item_id)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" } }), 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
