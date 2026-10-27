-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local DIAGNOSTIC = json.encode({ kind = errors.INTERNAL, code = errors.INTERNAL, explanation = "memory extraction failed", retryable = false })

local function define_tests()
    test.describe("memory erasure", function()

        test.it("detects retained run reads independently of their projection", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local measured, err = fixture.persistence_op(user, "measure_run_reads", { component_id = id })
            test.is_nil(err, tostring(err))
            test.eq(measured.queries, 1)
            test.is_true(measured.rows >= 1)
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
            for i = 1, 20 do
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs
                    (id, component_id, run_type, status, input, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, '2026-01-01T00:00:00Z')]],
                    { "cost:" .. id .. ":" .. tostring(i), id, json.encode({ span = { { id = tostring(i), text = "shared" } } }) })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
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
                local db = fixture.db()
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs
                    (id, component_id, run_type, status, input, created_at)
                    VALUES ($1, $2, 'derive', 'scheduled', $3, '2026-01-01T00:00:00Z')]],
                    { run_id, id, json.encode(input) })
                db:release()
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
            local db = fixture.db()
            local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs (id, component_id, run_type, status, input, last_error, created_at)
                VALUES ($1, $2, 'derive', 'failed', $3, $4, '2026-01-01T00:00:00Z')]],
                { run_id, id, json.encode({ span = { { id = "source", role = "user", text = "A private setting." } } }), diagnostic })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            fixture.persistence_op(user, "enroll_sources", { run_id = run_id })
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
            local db = fixture.db()
            local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs (id, component_id, run_type, status, input, created_at)
                VALUES ($1, $2, 'derive', 'scheduled', $3, '2026-01-01T00:00:00Z')]], { run_id, id, json.encode(input) })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            for i = 1, 2 do
                local result, err = fixture.persistence_op(user, "enroll_sources", { run_id = run_id })
                test.is_nil(err, tostring(err))
                test.is_true(result)
            end
            db = fixture.db()
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
                local db = fixture.db()
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs
                    (id, component_id, run_type, status, input, last_error, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, $4, '2026-01-01T00:00:00Z')]],
                    { "retained:" .. id, id, json.encode({ span = { { id = "uncited", text = "The setting is " .. case.mention } } }),
                        DIAGNOSTIC })
                db:release()
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
                local db = fixture.db()
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_runs
                    (id, component_id, run_type, status, input, last_error, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, $4, '2026-01-01T00:00:00Z')]],
                    { run_id, id, json.encode({ span = { { id = "repeat-message", text = "It stays unchanged." } } }), DIAGNOSTIC })
                db:release()
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
            fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
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
            local db = fixture.db()
            local _, insert_err = db:execute("INSERT INTO kickside_memory_runs (id, component_id, run_type, status, input, last_error, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)", {
                "retained-" .. id, id, "derive", "failed", json.encode({ span = { { id = "uncited", text = "Another mention: Kestrel-42", role = "user" } } }),
                DIAGNOSTIC, "2026-01-01T00:00:00Z",
            })
            db:release()
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
            db = fixture.db()
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
            local db = fixture.db()
            local _, insert_err = db:execute("INSERT INTO kickside_memory_runs (id, component_id, run_type, status, input, last_error, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)", {
                run_id, id, "derive", "failed", json.encode({ span = { { id = "uncited", role = "user", text = "Opaque input" } } }),
                DIAGNOSTIC, "2026-01-01T00:00:00Z",
            })
            db:release()
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
