-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")
local measured_db = require("measured_db")

local DIAGNOSTIC = json.encode({ kind = errors.INTERNAL, code = errors.INTERNAL, explanation = "memory extraction failed", retryable = false })

local function define_tests()
    test.describe("memory erasure", function()

        test.it("selects one eligible claim without reading unrelated values or forgotten versions", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local _, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 301 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            fixture.insert_cost_versions(id, 3)
            test.eq(fixture.count_rows("kickside_memory_items", id), 1204)
            local result, err = fixture.persistence_op(user, "forget_cost", { component_id = id, key = "interests", value = "299" })
            test.is_nil(err, tostring(err))
            test.is_nil(result.error, result.error)
            test.eq(result.result.forgotten, 3)
            test.is_true(result.selection_reads <= 2, "Selection reads: " .. result.selection_reads)
            test.is_true(result.selection_rows <= 2, "Selection rows: " .. result.selection_rows)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" }, key = "interests", limit = 500 }), 300)
        end)

        test.it("suggests distinct keys even when one key has many values", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local _, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 201, key = "aaa_topic" })
            test.is_nil(seed_err, tostring(seed_err))
            local _, create_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "travel_mode", value = "rail", content = "Uses rail travel.",
            } })
            test.is_nil(create_err, tostring(create_err))
            fixture.settle(user, id)
            local result, err = fixture.persistence_op(user, "forget_cost", { component_id = id, key = "travel_modes" })
            test.is_nil(err, tostring(err))
            test.is_true(result.error:find("closest first: travel_mode", 1, true) ~= nil, result.error)
            test.is_true(result.selection_rows <= 2, "Suggestion rows: " .. result.selection_rows)
        end)

        for _, count in ipairs({ 1, 201 }) do
            test.it("resolves erasure once for " .. count .. " historical items and dependent lessons with cycles", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local seeded, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = count, same_value = true })
                test.is_nil(seed_err, tostring(seed_err))
                fixture.settle(user, id)
                local first = seeded.item_ids[1]
                local lessons, lesson_err = fixture.persistence_op(user, "seed", { component_id = id, user = user,
                    count = count, kind = "lesson", distinct_keys = true, idempotency = "lessons" })
                test.is_nil(lesson_err, tostring(lesson_err))
                fixture.settle(user, id)
                local db = fixture.db()
                local _, err = db:execute([[INSERT INTO kickside_memory_provenance (component_id, item_id, host_kind, host_id, event_id, recorded_at)
                    SELECT $1, id, 'item', $2, '', '2026-01-01T00:00:00Z' FROM kickside_memory_items WHERE component_id = $1 AND kind = 'lesson']], { id, first })
                test.is_nil(err, tostring(err))
                local _, cycle_err = db:execute([[INSERT INTO kickside_memory_provenance (component_id, item_id, host_kind, host_id, event_id, recorded_at)
                    VALUES ($1, $2, 'item', $3, '', '2026-01-01T00:00:00Z')]], { id, first, lessons.item_ids[1] })
                db:release()
                test.is_nil(cycle_err, tostring(cycle_err))
                local result, read_err = fixture.persistence_op(user, "forget_cost", { component_id = id, key = "interests", value = "shared" })
                test.is_nil(read_err, tostring(read_err))
                test.is_nil(result.error, result.error)
                test.eq(result.result.forgotten, 2 * count)
                test.is_true(result.queries <= 3 + 3 * math.ceil(count / 100), "Forget performs " .. result.queries .. " queries")
                fixture.settle(user, id)
                for _, item_id in ipairs(lessons.item_ids) do
                    test.eq(fixture.op(user, "get", { component_id = id, item_id = item_id }).status, "forgotten")
                end
            end)
        end

        test.it("detects retained run reads independently of their projection", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local measured, err = fixture.persistence_op(user, "measure_run_reads", { component_id = id })
            test.is_nil(err, tostring(err))
            test.eq(measured.queries, 1)
            test.is_true(measured.rows >= 1)
        end)

        test.it("scopes query measurements to the calling coroutine", function()
            measured_db.reset()
            local _, read_err = measured_db.read(function(db: any): (any?, error?) return db:query("SELECT 1") end)
            test.is_nil(read_err, tostring(read_err))
            local worker = coroutine.create(function()
                local _, worker_err = measured_db.read(function(db: any): (any?, error?) return db:query("SELECT 1") end)
                if worker_err then error(tostring(worker_err)) end
            end)
            local resumed, resume_err = coroutine.resume(worker)
            test.is_true(resumed, tostring(resume_err))
            test.eq(#measured_db.statements(), 1)
        end)

        test.it("erases a large lineage with indexed source ownership and no retained run scan", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 201, same_value = true })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local other = fixture.memory(user)
            local unrelated = fixture.create_claim(user, other, "Bergen")
            local db = fixture.db()
            for _, seed in ipairs({
                { [[WITH RECURSIVE sequence(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM sequence WHERE n < 10000)
                    INSERT INTO kickside_memory_run_sources (component_id, run_id, event_id)
                    SELECT $1, $2, 'other-event-' || CAST(n AS TEXT) FROM sequence]], "consolidate:" .. other },
                { [[WITH RECURSIVE sequence(n) AS (SELECT 1 UNION ALL SELECT n + 1 FROM sequence WHERE n < 10000)
                    INSERT INTO kickside_memory_provenance (component_id, item_id, host_kind, host_id, event_id, recorded_at)
                    SELECT $1, $2, 'session', 'other-session', 'other-event-' || CAST(n AS TEXT), '2026-01-01T00:00:00Z' FROM sequence]], unrelated.item_id },
            }) do
                local _, seed_err = db:execute(seed[1], { other, seed[2] })
                test.is_nil(seed_err, tostring(seed_err))
            end
            for _, statement in ipairs({ "ANALYZE kickside_memory_run_sources", "ANALYZE kickside_memory_provenance" }) do
                local _, analyze_err = db:execute(statement)
                test.is_nil(analyze_err, tostring(analyze_err))
            end
            db:release()
            for i = 1, 20 do
                local insert_err = fixture.insert_run(id, "cost:" .. id .. ":" .. tostring(i), "failed", { span = { { id = tostring(i), text = "shared" } } })
                test.is_nil(insert_err, tostring(insert_err))
            end
            local result, err = fixture.persistence_op(user, "erase_cost", { component_id = id, item_id = seeded.item_ids[1], seq = 10000 })
            test.is_nil(err, tostring(err))
            test.eq(result.erased, 201)
            test.eq(result.lineage_queries, 1)
            test.eq(result.run_scans, 0)
            test.eq(result.run_rows, 0)
            test.is_true(result.source_plan:find("idx_kickside_memory_run_sources_event", 1, true) ~= nil, result.source_plan)
            if result.sqlite then
                test.is_true(result.plan:find("idx_kickside_memory_items_claim", 1, true) ~= nil, result.plan)
                test.is_true(result.plan:find("idx_kickside_memory_items_successor", 1, true) ~= nil, result.plan)
            end
        end)

        for _, case in ipairs({
            { name = "numeric", value = 1, text = "I need 10 tickets for the museum." },
            { name = "boolean", value = false, text = "The guide explains false positives in medical tests." },
        }) do
            test.it("preserves unrelated pending input when forgetting a " .. case.name .. " value", function()
                local user = fixture.user()
                local id = fixture.memory(user)
                local added, create_err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = "setting", value = case.value,
                    content = "The setting is configured.",
                } })
                test.is_nil(create_err, tostring(create_err))
                fixture.settle(user, id)
                local run_id = "unrelated:" .. id
                local input = { owner_id = user, span = { { id = "independent-message", role = "user", text = case.text } } }
                local insert_err = fixture.insert_run(id, run_id, "scheduled", input)
                test.is_nil(insert_err, tostring(insert_err))
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                local run, read_err = fixture.op(user, "run", { run_id = run_id })
                test.is_nil(read_err, tostring(read_err))
                test.eq(run.status, "scheduled")
                test.eq(json.encode(run.input), (json.encode(input)))
            end)
        end

        test.it("erases through source ownership without reading retained run text", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local result, err = fixture.persistence_op(user, "erase_cost", { component_id = id, item_id = seeded.item_ids[1], seq = 10000 })
            test.is_nil(err, tostring(err))
            test.eq(result.erased, 1)
            test.eq(result.run_scans, 0)
            test.eq(result.run_rows, 0)
        end)

        test.it("retains a classified failure after its source input is erased", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded = fixture.remember(user, id, { fixture.candidate("fact", "setting", "private", "A private setting.", "source") }, "diagnostic-source")
            fixture.settle(user, id)
            local run_id = "classified:" .. id
            local diagnostic = json.encode({ kind = errors.TIMEOUT, code = errors.TIMEOUT, explanation = "memory extraction failed", retryable = true })
            local insert_err = fixture.insert_run(id, run_id, "failed", { span = { { id = "source", role = "user", text = "A private setting." } } }, diagnostic)
            test.is_nil(insert_err, tostring(insert_err))
            local _, enrollment_err = fixture.persistence_op(user, "enroll_sources", { run_id = run_id })
            test.is_nil(enrollment_err, tostring(enrollment_err))
            local _, err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local run = fixture.op(user, "run", { run_id = run_id })
            test.is_nil(run.input.span)
            test.not_nil(run.last_error)
            test.eq(json.decode(run.last_error).kind, errors.TIMEOUT)
            test.eq(json.decode(run.last_error).explanation, "memory extraction failed")
        end)

        test.it("enrolls span and context source ownership without changing run input", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "pending:" .. id
            local input = { span = { { id = "current-source", role = "user", text = "An ongoing goal." } },
                context = { { id = "prior-source", role = "assistant", text = "What is the next step?" } } }
            local insert_err = fixture.insert_run(id, run_id, "scheduled", input)
            test.is_nil(insert_err, tostring(insert_err))
            for i = 1, 2 do
                local result, err = fixture.persistence_op(user, "enroll_sources", { run_id = run_id })
                test.is_nil(err, tostring(err))
                test.is_true(result)
            end
            local db = fixture.db()
            local sources, sources_err = db:query("SELECT event_id FROM kickside_memory_run_sources WHERE component_id = $1 AND run_id = $2 ORDER BY event_id", { id, run_id })
            db:release()
            test.is_nil(sources_err, tostring(sources_err))
            test.eq(#sources, 2)
            test.eq(sources[1].event_id, "current-source")
            test.eq(sources[2].event_id, "prior-source")
            test.eq(json.encode(fixture.op(user, "run", { run_id = run_id }).input), (json.encode(input)))
        end)

        test.it("erases source-owned numeric boolean and structured input while retaining diagnostics", function()
            local user = fixture.user()
            for _, case in ipairs({
                { value = 12345, mention = "12345" },
                { value = false, mention = "false" },
                { value = { nested = { code = "Kestrel-42" }, enabled = true }, mention = "Kestrel-42" },
            }) do
                local id = fixture.memory(user)
                local added, err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = "setting", value = case.value, content = "The setting is configured.",
                } })
                test.is_nil(err, tostring(err))
                fixture.settle(user, id)
                local insert_err = fixture.insert_run(id, "retained:" .. id, "failed", { span = { { id = "uncited", text = "The setting is " .. case.mention } } }, DIAGNOSTIC)
                test.is_nil(insert_err, tostring(insert_err))
                fixture.remember(user, id, { fixture.candidate("fact", "setting", case.value, "The setting is configured.", "uncited") }, "source-link")
                fixture.settle(user, id)
                local _, sources_err = fixture.persistence_op(user, "enroll_sources", { run_id = "retained:" .. id })
                test.is_nil(sources_err, tostring(sources_err))

                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                local run = fixture.op(user, "run", { run_id = "retained:" .. id })
                test.is_nil(run.input.span)
                test.not_nil(run.last_error)
                test.eq(json.decode(run.last_error).code, errors.INTERNAL)
            end
        end)

        test.it("erases typed repeated evidence through provenance when reconciliation is a no-op", function()
            local user = fixture.user()
            for _, value in ipairs({ 12345, false, { enabled = true, nested = { setting = "configured" } } }) do
                local id = fixture.memory(user)
                local added, create_err = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = "setting", value = value, content = "The setting is configured.",
                } })
                test.is_nil(create_err, tostring(create_err))
                fixture.settle(user, id)
                local run_id = "repeat:" .. id
                local insert_err = fixture.insert_run(id, run_id, "failed", { span = { { id = "repeat-message", text = "It stays unchanged." } } }, DIAGNOSTIC)
                test.is_nil(insert_err, tostring(insert_err))
                local repeated, repeat_err = fixture.remember(user, id, { {
                    kind = "fact", key = "setting", cardinality = "multi", value = value,
                    content = "The setting is configured.", event_id = "repeat-message",
                } }, "repeat", { run_id = run_id })
                test.is_nil(repeat_err, tostring(repeat_err))
                test.eq(repeated.stats.noop, 1)
                fixture.settle(user, id)
                local _, sources_err = fixture.persistence_op(user, "enroll_sources", { run_id = run_id })
                test.is_nil(sources_err, tostring(sources_err))

                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                local run = fixture.op(user, "run", { run_id = run_id })
                test.is_nil(run.input.span)
                test.not_nil(run.last_error)
                test.eq(json.decode(run.last_error).code, errors.INTERNAL)
            end
        end)

        test.it("does not restage erased payloads when an accepted decision is delivered again", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            local duplicate, duplicate_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(duplicate_err, tostring(duplicate_err))
            test.eq(duplicate.inserted, 0)
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 0)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 0)
            local extended, extended_err = fixture.persistence_op(user, "seed", { component_id = id, user = user, count = 2 })
            test.is_nil(extended_err, tostring(extended_err))
            test.eq(extended.inserted, 1)
            fixture.settle(user, id)
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 1)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 1)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = seeded.item_ids[1] }).status, "forgotten")
        end)

        test.it("erases source-owned run input and errors and removes forgotten text from search", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added, add_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "access_code", value = "Kestrel-42", content = "The access code is Kestrel-42.",
            } })
            test.is_nil(add_err, tostring(add_err))
            fixture.settle(user, id)
            local insert_err = fixture.insert_run(id, "retained-" .. id, "failed", { span = { { id = "uncited", text = "Another mention: Kestrel-42", role = "user" } } }, DIAGNOSTIC)
            test.is_nil(insert_err, tostring(insert_err))
            fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.", "uncited") }, "source-link")
            fixture.settle(user, id)
            local _, sources_err = fixture.persistence_op(user, "enroll_sources", { run_id = "retained-" .. id })
            test.is_nil(sources_err, tostring(sources_err))

            local _, err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local stored = fixture.op(user, "stored_text", { component_id = id })
            test.is_nil(json.encode(stored):find("Kestrel", 1, true), json.encode(stored))
            local found = fixture.op(user, "query", { request = { query = "Kestrel-42", limit = 10 } }, { component_id = id })
            test.eq(found.count, 0)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 0)
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 0)
            local db = fixture.db()
            local rows, fts_err = db:query(db:type() == "sqlite" and
                "SELECT COUNT(*) AS n FROM kickside_memory_fts WHERE item_id = $1" or
                "SELECT COUNT(*) AS n FROM kickside_memory_items WHERE id = $1 AND search_vector <> ''::tsvector", { added.item_id })
            db:release()
            test.is_nil(fts_err, tostring(fts_err))
            test.eq(tonumber(rows[1].n), 0)
        end)

        test.it("erases the owning run input without depending on a cited event", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "input-owner-" .. id
            local insert_err = fixture.insert_run(id, run_id, "failed", { span = { { id = "uncited", role = "user", text = "Opaque input" } } }, DIAGNOSTIC)
            test.is_nil(insert_err, tostring(insert_err))
            local added = fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.") }, "owned-input", { run_id = run_id })
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = added.item_ids[1] })
            test.eq(item.run_id, run_id)

            local _, err = fixture.op(user, "forget", { component_id = id, item_id = item.id })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local run = fixture.op(user, "run", { run_id = run_id })
            test.not_nil(run.last_error)
            test.eq(json.decode(run.last_error).code, errors.INTERNAL)
            test.is_nil(run.input.span)
        end)

        test.it("erases supersession lineage and revision payloads while preserving an independent multi value", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.create_claim(user, id, "Paris", "multi")
            local independent = fixture.create_claim(user, id, "Rome", "multi")
            local revised, revision_err = fixture.op(user, "edit", { component_id = id, item_id = first.item_id,
                fields = { content = "The user resides in Paris." } })
            test.is_nil(revision_err, tostring(revision_err))
            test.not_nil(revised)
            fixture.settle(user, id)
            local changed, edit_err = fixture.op(user, "edit", { component_id = id, item_id = first.item_id, fields = { value = "Berlin" } })
            test.is_nil(edit_err, tostring(edit_err))
            fixture.settle(user, id)
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = changed.item_id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = first.item_id }).status, "forgotten")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = independent.item_id }).status, "current")
            test.eq(fixture.count_rows("kickside_memory_payloads", id), 1)
            test.eq(fixture.count_rows("kickside_memory_embeddings", id), 1)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
