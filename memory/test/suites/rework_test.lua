-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

local function op(user: string, name: string, args: any): (any, any)
    args.op = name
    return fixture.call_as(user, "app.suites:rework_call", args)
end

local function upgrade_diagnostics(user: string, id: string)
    for i = 1, 2 do
        local result, err = op(user, "migrate_diagnostics", { id = "diagnostics:" .. id .. ":" .. tostring(i) })
        test.is_nil(err, tostring(err))
        test.eq(result.status, "complete", json.encode(result))
    end
end

local function count(table_name: string, id: string): number
    local db = fixture.db()
    local rows, err = db:query("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id = $1", { id })
    db:release()
    if err then error(tostring(err)) end
    return tonumber(rows[1].n) or 0
end

local function create(user: string, id: string, value: any, cardinality: string?): any
    local result, err = fixture.op(user, "create", { component_id = id, fields = {
        kind = "fact", scope_family = "owner", key = "home_city", value = value, content = "The current city is " .. tostring(value) .. ".",
        cardinality = cardinality or "single",
    } })
    if err then error(tostring(err)) end
    fixture.settle(user, id)
    return result
end

local function define_tests()
    test.describe("memory rework", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("requires owner topic keys, rejects rewritten content and preserves false claims", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local fields = { kind = "fact", scope_family = "owner", content = "The access code is Kestrel-42.", value = "Kestrel-42" }
            local _, missing = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(missing)
            fields.key = "the_access_code_is_kestrel_42"
            local _, rewritten = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(rewritten)
            fields.key = "access_code_kestrel_42"
            local _, encoded = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(encoded)
            fields.key = "access_code_kestrel42"
            local _, compact = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(compact)
            fields.key = "access_code_12345"
            fields.content = "The access code is 12345."
            fields.value = 12345
            local _, number_key = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(number_key)
            fields.key = "access_code_code_12345"
            fields.value = { code = 12345 }
            local _, object_key = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(object_key)
            fields.key = "notification_false"
            fields.content = "The user disables notifications."
            fields.value = false
            local _, boolean_key = fixture.op(user, "create", { component_id = id, fields = fields })
            test.not_nil(boolean_key)
            fields.key = "notification_setting"
            fields.content = "The user disables notifications."
            fields.value = false
            local added, err = fixture.op(user, "create", { component_id = id, fields = fields })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = added.item_id }).value, false)
        end)

        test.it("erases a large lineage with indexed source ownership and no retained run scan", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = op(user, "seed", { component_id = id, user = user, count = 201, same_value = true })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local db = fixture.db()
            for i = 1, 20 do
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs
                    (id, component_id, run_type, status, input, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, '2026-01-01T00:00:00Z')]],
                    { "cost:" .. id .. ":" .. tostring(i), id, json.encode({ span = { { id = tostring(i), text = "shared" } } }) })
                test.is_nil(insert_err, tostring(insert_err))
            end
            db:release()
            local result, err = op(user, "erase_cost", { component_id = id, item_id = seeded.item_ids[1], seq = 10000 })
            test.is_nil(err, tostring(err))
            test.eq(result.erased, 201)
            test.eq(result.lineage_queries, 1)
            test.eq(result.run_scans, 0)
            test.eq(result.run_rows, 0)
            if result.sqlite then
                test.is_true(result.plan:find("idx_kickside_memory_kb_items_claim", 1, true) ~= nil, result.plan)
                test.is_true(result.plan:find("idx_kickside_memory_kb_items_successor", 1, true) ~= nil, result.plan)
            end
        end)

        test.it("validates structured leaves and permits short topic values", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local _, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "access_code_kestrel42",
                value = { code = "Kestrel-42", enabled = true }, content = "The access code is configured.",
            } })
            test.not_nil(err)
            local added, short_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "rating", value = "A", content = "The rating is A.",
            } })
            test.is_nil(short_err, tostring(short_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = added.item_id }).value, "A")
            local team, team_err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "team", value = "tea", content = "The team serves tea.",
            } })
            test.is_nil(team_err, tostring(team_err))
            test.not_nil(team)
            for _, key in ipairs({ "a", "rating_a" }) do
                local _, copied = fixture.op(user, "create", { component_id = id, fields = {
                    kind = "fact", scope_family = "owner", key = key, value = "A", content = "The rating is A.",
                } })
                test.not_nil(copied)
            end
            fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
            fixture.settle(user, id)
            test.is_true(json.encode(fixture.op(user, "ledger", { component_id = id })):find("kestrel", 1, true) == nil)
            for _, stored in ipairs(fixture.op(user, "stored_text", { component_id = id })) do
                test.is_true(stored:lower():find("kestrel", 1, true) == nil)
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
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs
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
            local seeded, seed_err = op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local result, err = op(user, "erase_cost", { component_id = id, item_id = seeded.item_ids[1], seq = 10000 })
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
            local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, input, last_error, created_at)
                VALUES ($1, $2, 'derive', 'failed', $3, $4, '2026-01-01T00:00:00Z')]],
                { run_id, id, json.encode({ span = { { id = "source", role = "user", text = "A private setting." } } }), diagnostic })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            op(user, "backfill_sources", { id = "classified-sources:" .. id })
            local _, err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local run = fixture.op(user, "run", { run_id = run_id })
            test.is_nil(run.input.span)
            test.not_nil(run.last_error)
            test.eq(json.decode(run.last_error).kind, errors.TIMEOUT)
            test.eq(json.decode(run.last_error).explanation, "memory extraction failed")
        end)

        test.it("backfills pending source ownership idempotently without changing existing input", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "existing-pending:" .. id
            local input = { span = { { id = "current-source", role = "user", text = "An ongoing goal." } },
                context = { { id = "prior-source", role = "assistant", text = "What is the next step?" } } }
            local db = fixture.db()
            local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, input, created_at)
                VALUES ($1, $2, 'derive', 'scheduled', $3, '2026-01-01T00:00:00Z')]], { run_id, id, json.encode(input) })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            for i = 1, 2 do
                local result, err = op(user, "backfill_sources", { id = "source-migration:" .. id .. ":" .. tostring(i) })
                test.is_nil(err, tostring(err))
                test.eq(result.status, "complete", json.encode(result))
            end
            db = fixture.db()
            local sources, sources_err = db:query("SELECT event_id FROM kickside_memory_kb_run_sources WHERE component_id = $1 AND run_id = $2 ORDER BY event_id", { id, run_id })
            db:release()
            test.is_nil(sources_err, tostring(sources_err))
            test.eq(#sources, 2)
            test.eq(sources[1].event_id, "current-source")
            test.eq(sources[2].event_id, "prior-source")
            test.eq(json.encode(fixture.op(user, "run", { run_id = run_id }).input), (json.encode(input)))
        end)

        test.it("erases source-owned numeric boolean and structured input and diagnostics", function()
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
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs
                    (id, component_id, run_type, status, input, last_error, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, $4, '2026-01-01T00:00:00Z')]],
                    { "retained:" .. id, id, json.encode({ span = { { id = "uncited", text = "The setting is " .. case.mention } } }),
                        "Provider rejected " .. case.mention })
                db:release()
                test.is_nil(insert_err, tostring(insert_err))
                fixture.remember(user, id, { fixture.candidate("fact", "setting", case.value, "The setting is configured.", "uncited") }, "source-link")
                fixture.settle(user, id)
                local migrated, migrate_err = op(user, "backfill_sources", { id = "backfill:" .. id })
                test.is_nil(migrate_err, tostring(migrate_err))
                test.eq(migrated.status, "complete", json.encode(migrated))
                upgrade_diagnostics(user, id)
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                local run = fixture.op(user, "run", { run_id = "retained:" .. id })
                test.is_nil(run.input.span)
                test.not_nil(run.last_error)
                test.eq(json.decode(run.last_error).code, "legacy_failure")
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
                local _, insert_err = db:execute([[INSERT INTO kickside_memory_kb_runs
                    (id, component_id, run_type, status, input, last_error, created_at)
                    VALUES ($1, $2, 'derive', 'failed', $3, 'Repeated evidence failed', '2026-01-01T00:00:00Z')]],
                    { run_id, id, json.encode({ span = { { id = "repeat-message", text = "It stays unchanged." } } }) })
                db:release()
                test.is_nil(insert_err, tostring(insert_err))
                local repeated, repeat_err = fixture.remember(user, id, { {
                    kind = "fact", key = "setting", cardinality = "multi", value = value,
                    content = "The setting is configured.", event_id = "repeat-message",
                } }, "repeat", { run_id = run_id })
                test.is_nil(repeat_err, tostring(repeat_err))
                test.eq(repeated.stats.noop, 1)
                fixture.settle(user, id)
                local migrated, migrate_err = op(user, "backfill_sources", { id = "repeat-backfill:" .. id })
                test.is_nil(migrate_err, tostring(migrate_err))
                test.eq(migrated.status, "complete", json.encode(migrated))
                upgrade_diagnostics(user, id)
                local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
                test.is_nil(forget_err, tostring(forget_err))
                fixture.settle(user, id)
                local run = fixture.op(user, "run", { run_id = run_id })
                test.is_nil(run.input.span)
                test.not_nil(run.last_error)
                test.eq(json.decode(run.last_error).code, "legacy_failure")
            end
        end)

        test.it("publishes a staged revision vector only when its accepted item folds", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = create(user, id, "Paris")
            local result, err = op(user, "revision_race", { component_id = id, item_id = added.item_id })
            test.is_nil(err, tostring(err))
            test.eq(result.staged_hash, result.original_hash)
            test.eq(result.vector_hash, result.item.content_hash)
            test.eq(result.item.content, "Revised presentation.")
        end)

        test.it("backfills existing embeddings idempotently and preserves search and replay", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = create(user, id, "Paris")
            fixture.settle(user, id)
            local db = fixture.db()
            local _, clear_err = db:execute("UPDATE kickside_memory_kb_payloads SET embedding = NULL WHERE component_id = $1", { id })
            db:release()
            test.is_nil(clear_err, tostring(clear_err))
            for i = 1, 2 do
                local result, err = op(user, "backfill_embeddings", { id = "embedding-migration:" .. id .. ":" .. tostring(i) })
                test.is_nil(err, tostring(err))
                test.eq(result.status, "complete", json.encode(result))
            end
            db = fixture.db()
            local payloads, read_err = db:query("SELECT embedding, content_hash FROM kickside_memory_kb_payloads WHERE component_id = $1 AND item_id = $2", { id, added.item_id })
            db:release()
            test.is_nil(read_err, tostring(read_err))
            test.eq(#json.decode(payloads[1].embedding), 512)
            local replayed, replay_err = op(user, "replay", { component_id = id })
            test.is_nil(replay_err, tostring(replay_err))
            test.not_nil(replayed)
            local nearest, nearest_err = op(user, "nearest", { component_id = id, content = "The current city is Paris." })
            test.is_nil(nearest_err, tostring(nearest_err))
            test.eq(nearest[1].id, added.item_id)
            test.is_true(nearest[1].similarity > 0.99)
        end)

        test.it("keeps lexical search on the newest revision after older and repeated delivery", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = create(user, id, "Paris")
            local _, err = op(user, "revision_redelivery", { component_id = id, item_id = added.item_id })
            test.is_nil(err, tostring(err))
            local matches, match_err = op(user, "lexical", { component_id = id, query = "newestword" })
            test.is_nil(match_err, tostring(match_err))
            test.eq(#matches, 1)
            local stale = op(user, "lexical", { component_id = id, query = "olderword" })
            test.eq(#stale, 0)
        end)

        test.it("rolls back payloads and vectors when the ledger head moves during a decision", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local _, err = op(user, "append_race", { component_id = id, user = user })
            test.not_nil(err)
            test.eq(count("kickside_memory_kb_payloads", id), 0)
            test.eq(count("kickside_memory_kb_embeddings", id), 0)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 0)
        end)

        test.it("does not restage erased payloads when an accepted decision is delivered again", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            fixture.settle(user, id)
            local duplicate, duplicate_err = op(user, "seed", { component_id = id, user = user, count = 1 })
            test.is_nil(duplicate_err, tostring(duplicate_err))
            test.eq(duplicate.inserted, 0)
            test.eq(count("kickside_memory_kb_payloads", id), 0)
            test.eq(count("kickside_memory_kb_embeddings", id), 0)
            local extended, extended_err = op(user, "seed", { component_id = id, user = user, count = 2 })
            test.is_nil(extended_err, tostring(extended_err))
            test.eq(extended.inserted, 1)
            fixture.settle(user, id)
            test.eq(count("kickside_memory_kb_payloads", id), 1)
            test.eq(count("kickside_memory_kb_embeddings", id), 1)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = seeded.item_ids[1] }).status, "forgotten")
        end)

        test.it("replays revision text, hashes and priority identically", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = create(user, id, "Paris")
            local _, err = fixture.op(user, "edit", { component_id = id, item_id = added.item_id,
                fields = { content = "The user resides in Paris, France.", priority = 7 } })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local before = fixture.items(user, id)
            local _, replay_err = op(user, "replay", { component_id = id })
            test.is_nil(replay_err, tostring(replay_err))
            test.eq(json.encode(fixture.items(user, id)), (json.encode(before)))
            test.eq(count("kickside_memory_kb_payloads", id), 2)
            fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
            fixture.settle(user, id)
            local erased = fixture.items(user, id)
            local _, erased_replay_err = op(user, "replay", { component_id = id })
            test.is_nil(erased_replay_err, tostring(erased_replay_err))
            test.eq(json.encode(fixture.items(user, id)), (json.encode(erased)))
        end)

        test.it("searches revised text and value-only edits with the resulting embedding", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = create(user, id, "Paris", "multi")
            create(user, id, "Berlin", "multi")
            local revised_text = "Orchids grow beneath tropical waterfalls."
            local revised, err = fixture.op(user, "edit", { component_id = id, item_id = first.item_id, fields = { content = revised_text } })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local nearest = op(user, "nearest", { component_id = id, content = revised_text })
            test.eq(nearest[1].id, revised.item_id)
            test.is_true(nearest[1].similarity > 0.99)
            local changed, change_err = fixture.op(user, "edit", { component_id = id, item_id = revised.item_id, fields = { value = "Rome" } })
            test.is_nil(change_err, tostring(change_err))
            fixture.settle(user, id)
            nearest = op(user, "nearest", { component_id = id, content = revised_text })
            test.eq(nearest[1].id, changed.item_id)
            test.is_true(nearest[1].similarity > 0.99)
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
            local _, insert_err = db:execute("INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, input, last_error, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)", {
                "retained-" .. id, id, "derive", "failed", json.encode({ span = { { id = "uncited", text = "Another mention: Kestrel-42", role = "user" } } }),
                "Cannot extract Kestrel-42", "2026-01-01T00:00:00Z",
            })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.", "uncited") }, "source-link")
            fixture.settle(user, id)
            local migrated, migrate_err = op(user, "backfill_sources", { id = "backfill:" .. id })
            test.is_nil(migrate_err, tostring(migrate_err))
            test.eq(migrated.status, "complete", json.encode(migrated))
            upgrade_diagnostics(user, id)
            local _, err = fixture.op(user, "forget", { component_id = id, item_id = added.item_id })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local stored = fixture.op(user, "stored_text", { component_id = id })
            test.is_nil(json.encode(stored):find("Kestrel", 1, true), json.encode(stored))
            local found = fixture.op(user, "query", { request = { query = "Kestrel-42", limit = 10 } }, { component_id = id })
            test.eq(found.count, 0)
            test.eq(count("kickside_memory_kb_embeddings", id), 0)
            test.eq(count("kickside_memory_kb_payloads", id), 0)
            db = fixture.db()
            local rows, fts_err = db:query(db:type() == "sqlite" and
                "SELECT COUNT(*) AS n FROM kickside_memory_kb_fts WHERE item_id = $1" or
                "SELECT COUNT(*) AS n FROM kickside_memory_kb_items WHERE id = $1 AND search_vector <> ''::tsvector", { added.item_id })
            db:release()
            test.is_nil(fts_err, tostring(fts_err))
            test.eq(tonumber(rows[1].n), 0)
        end)

        test.it("erases the owning run input and error without depending on a cited event", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local run_id = "input-owner-" .. id
            local db = fixture.db()
            local _, insert_err = db:execute("INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, input, last_error, created_at) VALUES ($1, $2, $3, $4, $5, $6, $7)", {
                run_id, id, "derive", "failed", json.encode({ span = { { id = "uncited", role = "user", text = "Opaque input" } } }),
                "Opaque error", "2026-01-01T00:00:00Z",
            })
            db:release()
            test.is_nil(insert_err, tostring(insert_err))
            local added = fixture.remember(user, id, { fixture.candidate("fact", "access_code", "Kestrel-42", "The access code is Kestrel-42.") }, "owned-input", { run_id = run_id })
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = added.item_ids[1] })
            test.eq(item.run_id, run_id)
            upgrade_diagnostics(user, id)
            local _, err = fixture.op(user, "forget", { component_id = id, item_id = item.id })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local run = fixture.op(user, "run", { run_id = run_id })
            test.not_nil(run.last_error)
            test.eq(json.decode(run.last_error).code, "legacy_failure")
            test.is_nil(run.input.span)
        end)

        test.it("erases supersession lineage and revision payloads while preserving an independent multi value", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = create(user, id, "Paris", "multi")
            local independent = create(user, id, "Rome", "multi")
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
            test.eq(count("kickside_memory_kb_payloads", id), 1)
            test.eq(count("kickside_memory_kb_embeddings", id), 1)
        end)

        test.it("forgets more than 200 occurrences and expands conflicts past 200 members", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local seeded, seed_err = op(user, "seed", { component_id = id, user = user, count = 201, same_value = true })
            test.is_nil(seed_err, tostring(seed_err))
            fixture.settle(user, id)
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = seeded.item_ids[1] })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            test.eq(count("kickside_memory_kb_payloads", id), 0)
            test.eq(count("kickside_memory_kb_embeddings", id), 0)
            test.eq(#fixture.items(user, id, { statuses = { "forgotten" }, limit = 300 }), 201)

            local group_id = fixture.memory(user)
            local grouped, group_err = op(user, "seed", { component_id = group_id, user = user, count = 201, conflict = true })
            test.is_nil(group_err, tostring(group_err))
            fixture.settle(user, group_id)
            local _, expand_err = op(user, "expand", { component_id = group_id, user = user, item_id = grouped.item_ids[1] })
            test.is_nil(expand_err, tostring(expand_err))
            fixture.settle(user, group_id)
            test.eq(#fixture.items(user, group_id, { statuses = { "conflict" }, limit = 300 }), 202)
        end)

        test.it("preserves established cardinality after archive and rejects changing it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = create(user, id, "Paris")
            fixture.op(user, "archive", { component_id = id, item_id = first.item_id })
            fixture.settle(user, id)
            local _, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "fact", scope_family = "owner", key = "home_city", value = "Berlin", content = "The user lives in Berlin.", cardinality = "multi",
            } })
            test.not_nil(err)
            test.eq(count("kickside_memory_kb_keys", id), 1)
        end)

        test.it("restores an older archived single value with owner authority", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.remember(user, id, { fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "old-city", "2025-01-01T00:00:00Z") }, "old-city")
            fixture.settle(user, id)
            fixture.op(user, "archive", { component_id = id, item_id = first.item_ids[1] })
            fixture.settle(user, id)
            create(user, id, "Berlin")
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
            local first = create(user, id, "Paris", "multi")
            local destination = create(user, id, "Berlin", "multi")
            local result, err = fixture.op(user, "edit", { component_id = id, item_id = first.item_id, fields = { value = "Berlin" } })
            test.is_nil(err, tostring(err))
            test.eq(result.item_id, destination.item_id)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" } }), 1)
        end)

        test.it("judges same-key multi candidates inside one decision", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.verdict("ADD", {})
            local written = fixture.remember(user, id, {
                fixture.candidate("fact", "pets", "cat", "The user has a cat."),
                fixture.candidate("fact", "pets", "feline", "The user has a feline."),
            }, "same-key")
            test.eq(written.stats.judged, 1)
            test.eq(written.stats.added, 2)
        end)

        test.it("does not reinsert embeddings from an erased or revised snapshot", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = create(user, id, "Paris")
            local before = fixture.op(user, "get", { component_id = id, item_id = first.item_id })
            fixture.op(user, "edit", { component_id = id, item_id = first.item_id, fields = { content = "The user resides in Paris." } })
            fixture.settle(user, id)
            local revised, err = op(user, "reembed", { component_id = id, item_id = first.item_id, content = before.content, content_hash = before.content_hash })
            test.is_nil(err, tostring(err))
            test.eq(revised, false)
            fixture.op(user, "forget", { component_id = id, item_id = first.item_id })
            fixture.settle(user, id)
            local erased, erase_err = op(user, "reembed", { component_id = id, item_id = first.item_id, content = before.content, content_hash = before.content_hash })
            test.is_nil(erase_err, tostring(erase_err))
            test.eq(erased, false)
            test.eq(count("kickside_memory_kb_embeddings", id), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
