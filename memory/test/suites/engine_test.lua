-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")
local registry = require("registry")

local function rows(statement: string, params: { any }): { any }
    local db = fixture.db()
    local result, err = db:query(statement, params)
    db:release()
    if err then error(tostring(err)) end
    return result or {}
end

local function by_key(items: { any }): { [string]: any }
    local out = {}
    for _, item in ipairs(items) do out[item.value .. ""] = item end
    return out
end

local function count(statement: string, params: { any }): integer
    local result = rows(statement, params)
    return math.floor(tonumber(result[1] and result[1].n) or 0)
end

local function define_tests()
    test.describe("memory knowledge base engine", function()
        test.before_each(function() fixture.script.reset() end)

        test.it("supersedes exact single keys without a judge and retains both clocks", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.remember(user, id, { fixture.candidate("profile_slot", "employer", "Northstar", "Works at Northstar.", "first", "2026-01-01T00:00:00Z") }, "single-first")
            fixture.settle(user, id)
            local second = fixture.remember(user, id, { fixture.candidate("profile_slot", "employer", "Harbor", "Joined Harbor.", "second", "2026-02-01T00:00:00Z") }, "single-second")
            test.eq(second.stats.superseded, 1)
            test.eq(second.stats.judged, 0)
            test.eq(#fixture.script.requests("structured_output"), 0)
            fixture.settle(user, id)
            local old = fixture.op(user, "get", { component_id = id, item_id = first.item_ids[1] })
            local current = fixture.op(user, "get", { component_id = id, item_id = second.item_ids[1] })
            test.eq(old.status, "superseded")
            test.eq(old.invalid_at, "2026-02-01T00:00:00Z")
            test.eq(old.valid_at, "2026-01-01T00:00:00Z")
            test.eq(current.status, "current")
            test.not_nil(old.recorded_at)
            test.not_nil(current.recorded_at)
        end)

        test.it("adds without judging unrelated or incompatible nearest memories", function()
            local user = fixture.user()
            for _, example in ipairs({
                { kind = "fact", value = "Rust", content = "Compiles Rust software." },
                { kind = "plan", value = { status = "open", next_step = "", details = "Study music" }, content = "Studies music." },
            }) do
                local id = fixture.memory(user)
                fixture.remember(user, id, { fixture.candidate(example.kind, "existing_topic", example.value, example.content) }, "near-seed")
                fixture.settle(user, id)
                local result = fixture.remember(user, id, { fixture.candidate("fact", "music_study", "piano", "Studies music.") }, "near-candidate")
                test.eq(result.stats.added, 1)
                test.eq(result.stats.judged, 0)
                test.eq(#fixture.script.requests("structured_output"), 0)
            end
        end)

        test.it("judges only compatible neighbours meeting the configured similarity floor inclusively", function()
            local user = fixture.user()
            local id = fixture.memory(user, { judge_min_similarity = 1 })
            fixture.remember(user, id, { fixture.candidate("fact", "music_study", "piano", "Studies music.") }, "threshold-seed")
            fixture.settle(user, id)
            fixture.relations({ "same" })
            local result = fixture.remember(user, id, { fixture.candidate("skill", "music_skill", "keyboard", "Studies music.") }, "threshold-match")
            test.eq(result.stats.judged, 1)
            test.eq(result.stats.noop, 1)
            local memories = json.decode(fixture.script.prompts("structured_output")[1].user).existing_memories
            test.eq(memories["1"].key, "music_study")
            test.is_nil(memories["2"])
        end)

        test.it("rejects reverse and self item provenance at both decision recording paths", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "work_hours", "night", "The user works at night.", "work"),
                fixture.candidate("preference", "rest_hours", "day", "The user rests during the day.", "rest"),
            }, "provenance-seed")
            fixture.settle(user, id)
            local sources = fixture.items(user, id)
            local lesson = fixture.candidate("lesson", "contact_window", "evening", "Contact outside work and rest hours.", "")
            lesson.source_ids = { sources[1].id, sources[2].id }
            fixture.relations({ "unrelated", "unrelated" })
            local derived = fixture.remember(user, id, { lesson }, "valid-derivation", { source = "reflection" })
            fixture.settle(user, id)
            for _, entry in ipairs({
                { item_id = sources[1].id, source_id = sources[2].id },
                { item_id = derived.item_ids[1], source_id = derived.item_ids[1] },
            }) do
                local result, err = fixture.persistence_op(user, "record_provenance", {
                    component_id = id, item_id = entry.item_id, source_id = entry.source_id,
                })
                test.is_nil(result)
                test.not_nil(err)
                test.eq(err:message(), "item provenance requires a lesson and a distinct source item")
            end
            local result, err = fixture.persistence_op(user, "record_provenance", {
                component_id = id, user = user, source_id = sources[1].id,
            })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:message(), "item provenance requires a lesson and a distinct source item")
            local _, forget_err = fixture.op(user, "forget", { component_id = id, item_id = sources[1].id })
            test.is_nil(forget_err, tostring(forget_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = derived.item_ids[1] }).status, "forgotten")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = sources[2].id }).status, "current")
        end)

        test.it("rejects cross-kind keys before claim reuse explicit updates and historical reuse", function()
            local user = fixture.user()
            for _, status in ipairs({ "current", "archived", "forgotten" }) do
                for _, same in ipairs({ true, false }) do
                    local id = fixture.memory(user)
                    local seeded = fixture.remember(user, id, {
                        fixture.candidate("profile_slot", "contact_time", "evening", "Contact in the evening.", "seed"),
                    }, "boundary-seed")
                    fixture.settle(user, id)
                    if status ~= "current" then
                        local _, err = fixture.op(user, status == "archived" and "archive" or "forget", { component_id = id, item_id = seeded.item_ids[1] })
                        test.is_nil(err, tostring(err))
                        fixture.settle(user, id)
                    end
                    local lesson = fixture.candidate("lesson", "contact_time", same and "evening" or "morning", "A contact lesson.", "")
                    lesson.source_ids = { seeded.item_ids[1] }
                    for _, source in ipairs({ "capture", "reflection", "tool" }) do
                        local result, err = fixture.op(user, "remember", { candidates = { lesson }, idempotency = "boundary-" .. source,
                            opts = { component_id = id, embedding_model = "test-embed", judge_model = "test-fast",
                                scope_family = "owner", scope_id = user, source = source, explicit = true } })
                        test.is_nil(result)
                        test.not_nil(err)
                    end
                    local result, err = fixture.op(user, "create", { component_id = id, fields = {
                        kind = "lesson", scope_family = "owner", key = "contact_time", cardinality = "single",
                        value = lesson.value, content = lesson.content,
                    } })
                    test.is_nil(result)
                    test.not_nil(err)
                    fixture.settle(user, id)
                    test.eq(#fixture.items(user, id), 1)
                    local refs = fixture.op(user, "provenance", { component_id = id, item_id = seeded.item_ids[1] })
                    for _, ref in ipairs(refs) do test.is_true(ref.host_kind ~= "item") end
                end
            end
        end)

        test.it("keeps a date fact separate from a typed plan beside it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local state = { status = "open", next_step = "Prepare materials", details = "Community workshop" }
            local seeded = fixture.remember(user, id, { fixture.candidate("plan", "workshop", state, "Organize a workshop.", "seed") }, "plan-seed")
            fixture.settle(user, id)
            fixture.remember(user, id, { fixture.candidate("fact", "workshop_date", "March 14", "The workshop date is March 14.", "date") }, "date-fact")
            fixture.settle(user, id)
            local plan = fixture.op(user, "get", { component_id = id, item_id = seeded.item_ids[1] })
            test.eq(plan.status, "current")
            test.eq(plan.kind, "plan")
            test.eq(plan.value.details, state.details)
            test.eq(fixture.items(user, id, { key = "workshop_date" })[1].value, "March 14")
            local requests = fixture.script.requests("structured_output")
            test.eq(#requests, 0)
        end)

        for _, source in ipairs({ "tool", "owner" }) do
            for _, inferred in ipairs({ "capture", "reflection" }) do
                for _, cardinality in ipairs({ "single", "multi" }) do
                    test.it(source .. " interpretation precedes " .. inferred .. " of the same event for a " .. cardinality .. " key", function()
                        local user = fixture.user()
                        local id = fixture.memory(user)
                        fixture.remember(user, id, {
                            fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "statement", nil, cardinality),
                        }, "explicit", { source = source, explicit = true })
                        fixture.settle(user, id)
                        local before = #fixture.script.requests("structured_output")
                        local result = fixture.remember(user, id, {
                            fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "statement", nil, cardinality),
                        }, "inferred", { source = inferred })
                        test.eq(result.stats.noop, 1)
                        test.eq(result.stats.added, 0)
                        test.eq(result.stats.judged, 0)
                        test.eq(#fixture.script.requests("structured_output"), before)
                        fixture.settle(user, id)
                        local current = fixture.items(user, id, { statuses = { "current" } })
                        test.eq(#current, 1)
                        test.eq(current[1].value, "Berlin")
                        test.eq(current[1].source, source)
                        test.eq(#fixture.items(user, id), 1)
                    end)
                end
            end
        end

        test.it("reconciles other keys and later events after an explicit interpretation", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "statement"),
            }, "explicit", { source = "tool", explicit = true })
            fixture.settle(user, id)
            local other = fixture.remember(user, id, {
                fixture.candidate("preference", "diet", "vegan", "The user is vegan.", "statement"),
            }, "other-key")
            test.eq(other.stats.added, 1)
            test.eq(other.stats.noop, 0)
            fixture.settle(user, id)
            local first = fixture.values(fixture.items(user, id, { statuses = { "current" } }))["Berlin"]
            local later = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "home_city", "Oslo", "The user moves to Oslo.", "later-statement"),
            }, "later-event")
            test.eq(later.stats.superseded, 1)
            test.eq(later.stats.judged, 0)
            test.eq(later.stats.noop, 0)
            fixture.settle(user, id)
            local current = fixture.values(fixture.items(user, id, { statuses = { "current" } }))
            test.not_nil(current["Oslo"])
            test.not_nil(current["vegan"])
            test.is_nil(current["Berlin"])
        end)

        test.it("supersedes a single attribute under its canonical target key and forgets every version", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.create_claim(user, id, "Oslo")
            fixture.relations({ "updates" })
            local changed = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "residence", "Bergen", "The current city is Bergen.", "move", nil, "multi"),
            }, "cross-topic")
            test.eq(changed.stats.superseded, 1)
            fixture.settle(user, id)
            local current = fixture.items(user, id, { statuses = { "current" } })
            test.eq(#current, 1)
            test.eq(current[1].key, "home_city")
            test.eq(current[1].cardinality, "single")
            local erased, err = fixture.op(user, "tool_forget", { input = { key = "home_city" } }, { memory_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(erased.success)
            fixture.settle(user, id)
            local versions = fixture.items(user, id)
            test.eq(#versions, 2)
            for _, version in ipairs(versions) do
                test.eq(version.status, "forgotten")
                test.eq(version.content, "")
                test.is_nil(version.value)
            end
        end)

        test.it("rolls back the whole decision when a neighbour relation is missing", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.create_claim(user, id, "Oslo")
            fixture.relations({ "unrelated" })
            fixture.script.respond("structured_output", { relations = {}, reason = "test" })
            local result, err = fixture.op(user, "remember", {
                candidates = {
                    fixture.candidate("fact", "first_attribute", "recorded", "The current city is recorded."),
                    fixture.candidate("fact", "second_attribute", "recorded", "The current city is recorded."),
                },
                opts = { component_id = id, embedding_model = "test-embed", judge_model = "test-fast",
                    scope_family = "owner", scope_id = user, source = "capture" },
                idempotency = "missing-relation",
            })
            test.is_nil(result)
            test.not_nil(err)
            test.eq(err:details().code, "model_output_malformed")
            test.is_true(err:retryable())
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { statuses = { "current" } }), 1)
        end)

        test.it("reports corrupt stored configuration and retained run JSON instead of empty defaults", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            local corrupt = db:type() == "sqlite" and "{" or '"invalid object"'
            local _, write_err = db:execute("UPDATE kickside_memory_stores SET config = $1 WHERE component_id = $2", { corrupt, id })
            db:release()
            test.is_nil(write_err, tostring(write_err))
            local store, store_err = fixture.op(user, "store", { component_id = id })
            test.is_nil(store)
            test.not_nil(store_err)
            for _, column in ipairs({ "input", "stats" }) do
                db = fixture.db()
                local _, corrupt_err = db:execute("UPDATE kickside_memory_runs SET " .. column .. " = $1 WHERE id = $2", { corrupt, "consolidate:" .. id })
                db:release()
                test.is_nil(corrupt_err, tostring(corrupt_err))
                local run, run_err = fixture.op(user, "run", { run_id = "consolidate:" .. id })
                test.is_nil(run)
                test.not_nil(run_err)
                local runs, list_err = fixture.op(user, "runs", { component_id = id })
                test.is_nil(runs)
                test.not_nil(list_err)
                db = fixture.db()
                local _, reset_err = db:execute("UPDATE kickside_memory_runs SET " .. column .. " = '{}' WHERE id = $1", { "consolidate:" .. id })
                db:release()
                test.is_nil(reset_err, tostring(reset_err))
            end
        end)

        test.it("validates required engine descriptor wiring before applying stored overrides", function()
            local user = fixture.user()
            for _, meta in ipairs({ {}, { default_config = {} },
                { default_config = {}, config_schema = {} },
                { default_config = {}, config_schema = { type = "object", properties = { bad = false } } },
                { default_config = {}, config_schema = { type = "object", properties = { capture = { type = "boolean" } } } },
            }) do
                local valid, err = fixture.op(user, "descriptor", { meta = meta })
                test.is_nil(valid)
                test.not_nil(err)
                test.is_true(tostring(err):find("descriptor", 1, true) ~= nil)
            end
        end)

        test.it("creating a memory through the knowledge control plane provisions its store, ledger projection and consolidation slot", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local store = rows("SELECT kb_type, embedding_model FROM kickside_memory_stores WHERE component_id = $1", { id })
            test.eq(#store, 1)
            test.eq(store[1].kb_type, "memory")
            test.eq(store[1].embedding_model, "test-embed")
            local projections = rows("SELECT kind FROM kickside_projection WHERE thread_id = $1", { id })
            local kinds = {}
            for _, row in ipairs(projections) do kinds[row.kind] = true end
            test.is_true(kinds["kickside.memory.ledger"] == true, json.encode(projections))
            local slot = rows("SELECT run_type, job_id FROM kickside_memory_runs WHERE id = $1", { "consolidate:" .. id })
            test.eq(#slot, 1)
            test.is_true(type(slot[1].job_id) == "string" and slot[1].job_id ~= "")
            local job = rows("SELECT status, scheduled_at FROM kickside_job WHERE id = $1", { slot[1].job_id })
            test.eq(job[1].status, "pending")
        end)

        test.it("serves its stores through the platform store contract and its own named binding", function()
            local descriptor = registry.get("kickside.memory:engine_memory")
            test.eq(descriptor.meta.store_contract, "kickside.knowledge:kb_store_lifecycle")
            test.eq(descriptor.meta.store_binding, "kickside.memory:store_lifecycle")
            local _, missing = registry.get("kickside.memory:kb_store_lifecycle")
            test.not_nil(missing, "memory keeps no private copy of the store contract")
            local user = fixture.user()
            local id = fixture.memory(user)
            local row = fixture.op(user, "store", { component_id = id })
            test.eq(row.kb_type, "memory")
        end)

        test.it("refuses configuration the engine schema does not declare", function()
            local user = fixture.user()
            local _, unknown_err = fixture.try_memory(user, { recall_max_itemz = 3 })
            test.not_nil(unknown_err)
            test.is_true(tostring(unknown_err):find("recall_max_itemz", 1, true) ~= nil, tostring(unknown_err))
            local _, range_err = fixture.try_memory(user, { recall_max_items = 0 })
            test.not_nil(range_err)
            local _, type_err = fixture.try_memory(user, { capture_conversation = "yes" })
            test.not_nil(type_err)
            local id = fixture.memory(user, { recall_max_items = 7, judge_model = "test-fast" })
            local store = rows("SELECT config FROM kickside_memory_stores WHERE component_id = $1", { id })
            test.eq(json.decode(store[1].config).recall_max_items, 7)
        end)

        test.it("folds an owner operation through the ledger into a current item", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "identity", scope_family = "agent", scope_id = "agent-a", key = "name", value = "You are Ada, a travel assistant.", content = "You are Ada, a travel assistant.",
            } })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            local item = fixture.op(user, "get", { component_id = id, item_id = created.item_id })
            test.not_nil(item)
            test.eq(item.status, "current")
            test.eq(item.kind, "identity")
            test.eq(item.scope_key, "agent:agent-a")
            test.eq(item.source, "owner")
            test.eq(item.version, 1)
        end)

        test.it("edits values as new versions and presentation text as revisions of the same claim", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local rule = fixture.op(user, "create", { component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "tone", value = "Answer briefly.", content = "Answer briefly.",
            } })
            fixture.settle(user, id)
            local edited, edit_err = fixture.op(user, "edit", { component_id = id, item_id = rule.item_id, fields = { value = "Answer in bullet points.", content = "Answer in bullet points." } })
            test.is_nil(edit_err, tostring(edit_err))
            test.is_true(edited.item_id ~= rule.item_id)
            local city = fixture.op(user, "create", { component_id = id, fields = {
                kind = "profile_slot", scope_family = "owner", key = "home_city", value = "Berlin", content = "The user lives in Berlin.",
                cardinality = "single",
            } })
            fixture.settle(user, id)
            local revised, revise_err = fixture.op(user, "edit", { component_id = id, item_id = city.item_id, fields = { content = "The user lives in Berlin, Germany." } })
            test.is_nil(revise_err, tostring(revise_err))
            test.eq(revised.item_id, city.item_id)
            local moved, value_err = fixture.op(user, "edit", { component_id = id, item_id = city.item_id,
                fields = { value = "Munich", content = "The user lives in Munich." } })
            test.is_nil(value_err, tostring(value_err))
            fixture.settle(user, id)
            local current = fixture.op(user, "get", { component_id = id, item_id = moved.item_id })
            test.eq(current.value, "Munich")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = city.item_id }).status, "superseded")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = edited.item_id }).value, "Answer in bullet points.")
            test.eq(fixture.op(user, "get", { component_id = id, item_id = rule.item_id }).status, "superseded")
        end)

        test.it("supersedes by event time: the later statement is current, a late older one is history", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local paris = fixture.candidate("profile_slot", "home_city", "Paris", "The user lives in Paris.", "m1", "2026-03-01T10:00:00Z")
            local first, err = fixture.remember(user, id, { paris }, "t1")
            test.is_nil(err, tostring(err))
            test.eq(first.stats.added, 1)
            test.eq(first.stats.judged, 0)
            local paris_id = first.item_ids[1]

            local berlin = fixture.candidate("profile_slot", "home_city", "Berlin", "The user lives in Berlin.", "m2", "2026-06-01T10:00:00Z")
            local second, second_err = fixture.remember(user, id, { berlin }, "t2")
            test.is_nil(second_err, tostring(second_err))
            test.eq(second.stats.superseded, 1)
            local berlin_id = second.item_ids[1]

            fixture.settle(user, id)
            local items = fixture.items(user, id, { kinds = { "profile_slot" } })
            local values = by_key(items)
            test.eq(values.Paris.status, "superseded")
            test.eq(values.Paris.superseded_by, berlin_id)
            test.eq(values.Berlin.status, "current")
            test.eq(values.Berlin.version, 2)

            local lyon = fixture.candidate("profile_slot", "home_city", "Lyon", "The user lives in Lyon.", "m0", "2025-01-01T10:00:00Z")
            local third, third_err = fixture.remember(user, id, { lyon }, "t3")
            test.is_nil(third_err, tostring(third_err))
            fixture.settle(user, id)
            values = by_key(fixture.items(user, id, { kinds = { "profile_slot" } }))
            test.eq(values.Lyon.status, "superseded")
            test.eq(values.Lyon.superseded_by, berlin_id)
            test.eq(values.Berlin.status, "current")
            test.eq(fixture.script.pending("structured_output"), 0)
        end)

        test.it("keeps contradicting memories in a conflict group until a person resolves it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local acme = fixture.remember(user, id, {
                fixture.candidate("fact", "employer", "Acme", "The user works at Acme.", "m1", "2026-05-01T10:00:00Z"),
            }, "c1")
            fixture.relations({ "contradicts" })
            local globex, err = fixture.remember(user, id, {
                fixture.candidate("fact", "employer", "Globex", "The user works at Globex.", "m2", "2026-05-01T10:00:00Z"),
            }, "c2")
            test.is_nil(err, tostring(err))
            test.eq(globex.stats.conflicted, 1)
            fixture.settle(user, id)
            local conflicted = fixture.items(user, id, { statuses = { "conflict" } })
            test.eq(#conflicted, 2)
            test.eq(conflicted[1].conflict_group, conflicted[2].conflict_group)

            local resolved, resolve_err = fixture.op(user, "resolve", {
                component_id = id, group_id = conflicted[1].conflict_group, winner_id = globex.item_ids[1],
            })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.eq(resolved.superseded, 1)
            fixture.settle(user, id)
            local values = by_key(fixture.items(user, id, { kinds = { "fact" } }))
            test.eq(values.Globex.status, "current")
            test.is_nil(values.Globex.conflict_group)
            test.eq(values.Acme.status, "superseded")
            test.eq(values.Acme.superseded_by, globex.item_ids[1])
        end)

        test.it("keeps a profile slot single-valued: a new value replaces or contests the known one, never sits beside it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local first = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "b1"),
            }, "slot-1")
            local second = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "b2"),
            }, "slot-2")
            test.eq(second.stats.superseded, 1)
            test.eq(second.stats.conflicted, 0)
            test.eq(second.stats.judged, 0)

            local fact = fixture.remember(user, id, {
                fixture.candidate("fact", "sibling", "Ana", "The user has a sister, Ana.", "b3"),
            }, "slot-3")
            test.eq(fact.stats.added, 1)
            test.eq(fact.stats.judged, 0)

            local reflected = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "birth_date", "1990", "The user was born in 1990."),
            }, "slot-4", { source = "reflection" })
            test.eq(reflected.stats.noop, 1)
            test.eq(reflected.stats.added, 0)
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("treats a key as one attribute across kinds: a profile slot value is never added beside another kind's value of that key", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("preference", "diet", "vegetarian", "The user is vegetarian.", "d1") }, "kind-1")
            fixture.settle(user, id)
            local vegan = fixture.remember(user, id, { fixture.candidate("profile_slot", "diet", "vegan", "The user is vegan.", "d2") }, "kind-2")
            test.eq(vegan.stats.superseded, 1)
            test.eq(vegan.stats.judged, 0)
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("keeps a conflict open when a contested memory is replaced", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local passport = fixture.remember(user, id, {
                fixture.candidate("fact", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "m1"),
            }, "o1")
            fixture.relations({ "contradicts" })
            local airline = fixture.remember(user, id, {
                fixture.candidate("fact", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "m2"),
            }, "o2")
            fixture.settle(user, id)
            local group = fixture.op(user, "get", { component_id = id, item_id = airline.item_ids[1] }).conflict_group
            fixture.relations({ "rephrases", "contradicts" })
            local restated = fixture.remember(user, id, {
                fixture.candidate("fact", "passport_birth_date", "1990-03-03", "The user was born on 3 March 1990, according to their passport.", "m3"),
            }, "o3")
            fixture.settle(user, id)
            local successor = fixture.op(user, "get", { component_id = id, item_id = restated.item_ids[1] })
            test.eq(successor.status, "conflict")
            test.eq(successor.conflict_group, group)
            local open = fixture.items(user, id, { statuses = { "conflict" } })
            test.eq(#open, 2)

            local resolved, err = fixture.op(user, "resolve", { component_id = id, group_id = group, winner_id = successor.id })
            test.is_nil(err, tostring(err))
            test.eq(resolved.superseded, 1)
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = successor.id }).status, "current")
            test.eq(#fixture.items(user, id, { statuses = { "conflict" } }), 0)
        end)

        test.it("is idempotent under redelivery: the same memory and the same decision write once", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local tea = fixture.candidate("preference", "drink", "tea", "The user prefers tea.", "m1")
            local first = fixture.remember(user, id, { tea }, "r1")
            local again, err = fixture.remember(user, id, { fixture.candidate("preference", "Drink", " TEA ", "The user prefers tea.", "m9") }, "r2")
            test.is_nil(err, tostring(err))
            test.eq(again.stats.noop, 1)
            test.eq(again.stats.added, 0)
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id, { kinds = { "preference" } }), 1)
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_memory_provenance WHERE item_id = $1", { first.item_ids[1] }), 2)

            local head = rows("SELECT event_count FROM kickside_thread WHERE id = $1", { id })[1].event_count
            local replay, replay_err = fixture.remember(user, id, { tea }, "r1")
            test.is_nil(replay_err, tostring(replay_err))
            test.eq(replay.inserted, 0)
            test.eq(rows("SELECT event_count FROM kickside_thread WHERE id = $1", { id })[1].event_count, head)
        end)

        test.it("archives an item out of query results and restores it", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local stored = fixture.remember(user, id, { fixture.candidate("fact", "allergy", "peanuts", "The user is allergic to peanuts.", "m1") }, "f1")
            local item_id = stored.item_ids[1]
            fixture.settle(user, id)
            local context = { component_id = id }
            local found = fixture.op(user, "query", { request = { query = "peanuts allergy", limit = 5 } }, context)
            test.eq(found.count, 1)
            local _, err = fixture.op(user, "archive", { component_id = id, item_id = item_id })
            test.is_nil(err, tostring(err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = item_id }).status, "archived")
            test.eq(fixture.op(user, "query", { request = { query = "peanuts allergy", limit = 5 } }, context).count, 0)
            local _, restore_err = fixture.op(user, "restore", { component_id = id, item_id = item_id })
            test.is_nil(restore_err, tostring(restore_err))
            fixture.settle(user, id)
            test.eq(fixture.op(user, "get", { component_id = id, item_id = item_id }).status, "current")
            test.eq(fixture.op(user, "query", { request = { query = "peanuts allergy", limit = 5 } }, context).count, 1)
        end)

        test.it("answers the queryable contract with current items in the caller's scope only", function()
            local alice, bob = fixture.user("alice"), fixture.user("bob")
            local id = fixture.memory(alice)
            fixture.remember(alice, id, { fixture.candidate("fact", "pet", "cat", "The user has a cat named Miso.", "m1") }, "q1")
            fixture.remember(alice, id, { fixture.candidate("fact", "pet", "dog", "The user has a dog named Rex.", "m2") }, "q2",
                { scope_id = bob })
            fixture.settle(alice, id)
            local result, err = fixture.op(alice, "query", { request = { query = "pet named", limit = 10 } }, { component_id = id })
            test.is_nil(err, tostring(err))
            test.eq(result.count, 1)
            test.eq(result.items[1].content, "The user has a cat named Miso.")
            test.eq(result.items[1].meta.node_type, "fact")
            test.not_nil(result.items[1].meta.similarity)
            test.not_nil(result.items[1].meta.created_at)
            local _, limit_err = fixture.op(alice, "query", { request = { query = "pet", limit = 500 } }, { component_id = id })
            test.not_nil(limit_err)
        end)

        test.it("stages embeddable content in the erasable derive input without putting it in the ledger", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local secret = "Juniper-481 memory ingest text"
            fixture.extraction({})
            local result, err = fixture.op(user, "embed", { request = {
                content = secret, content_type = "text/plain", external_id = "ingest-1", external_version = "1",
            } }, { component_id = id })
            test.is_nil(err, tostring(err))
            test.is_true(result.success, json.encode(result))
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "succeeded", tostring(runs[1].last_error))
            test.is_true(json.encode(runs[1].input):find(secret, 1, true) ~= nil, json.encode(runs[1].input))
            local events = fixture.op(user, "ledger", { component_id = id })
            test.is_true(json.encode(events):find(secret, 1, true) == nil, json.encode(events))
        end)

        test.it("admits embeddable writes before retaining input for readers and unrelated callers", function()
            local owner, reader, unrelated = fixture.user(), fixture.user(), fixture.user()
            local id = fixture.memory(owner)
            local grant, grant_err = fixture.call_as(owner, "kickside.component.binding:grant_subtree_func", {
                root_component_id = id, subject = { subject_id = reader, subject_type = "user" }, access_mask = 1,
            })
            test.is_nil(grant_err, tostring(grant_err))
            test.is_true(grant.success, json.encode(grant))
            for _, user in ipairs({ reader, unrelated }) do
                local result, err = fixture.op(user, "embed_contract", { component_id = id, request = {
                    content = "Rejected input.", external_id = "denied", external_version = "1",
                } })
                test.is_true(err ~= nil or result.success == false)
            end
            test.eq(#fixture.op(owner, "runs", { component_id = id, run_type = "derive" }), 0)
        end)

        test.it("accepts every optional ingest identifier combination", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            for i, request in ipairs({ {}, { external_id = "document" }, { external_version = "1" },
                { external_id = "document", external_version = "1" } }) do
                request.content = "Optional input " .. tostring(i)
                fixture.extraction({})
                local result, err = fixture.op(user, "embed_contract", { component_id = id, request = request })
                test.is_nil(err, tostring(err))
                test.is_true(result.success, json.encode(result))
                fixture.wait_runs(user, id, "derive", i)
            end
        end)

        test.it("rejects oversized ingestion before enrollment without discarding its suffix", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local result, err = fixture.op(user, "embed_contract", { component_id = id, request = {
                content = string.rep("x", 30000) .. "tail-marker", title = string.rep("title", 10000),
                external_id = "large", external_version = "1",
            } })
            test.is_true(err ~= nil or result.success == false)
            test.is_true(tostring(err or result.error):find("24000", 1, true) ~= nil)
            test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 0)
            test.eq(#fixture.script.requests("structured_output"), 0)
        end)

        test.it("rolls back ingest enrollment on queue failure and schedules the retry", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            local sqlite = db:type() == "sqlite"
            local statements = sqlite and {
                [[CREATE TRIGGER app_reject_derive BEFORE INSERT ON kickside_job WHEN NEW.job_type = 'kickside.memory.engine:derive_worker'
                    BEGIN SELECT RAISE(ABORT, 'queue enrollment rejected'); END]],
            } or {
                [[CREATE FUNCTION app_reject_derive_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
                    IF NEW.job_type = 'kickside.memory.engine:derive_worker' THEN RAISE EXCEPTION 'queue enrollment rejected'; END IF; RETURN NEW; END $$]],
                [[CREATE TRIGGER app_reject_derive BEFORE INSERT ON kickside_job FOR EACH ROW EXECUTE FUNCTION app_reject_derive_fn()]],
            }
            for _, statement in ipairs(statements) do
                local _, err = db:execute(statement)
                test.is_nil(err, tostring(err))
            end
            db:release()
            local request = { content = "Atomic input.", external_id = "atomic", external_version = "1" }
            local failed, failure = fixture.op(user, "embed_contract", { component_id = id, request = request })
            db = fixture.db()
            local _, drop_err = db:execute(sqlite and "DROP TRIGGER app_reject_derive" or "DROP TRIGGER app_reject_derive ON kickside_job")
            test.is_nil(drop_err, tostring(drop_err))
            if not sqlite then
                local _, fn_err = db:execute("DROP FUNCTION app_reject_derive_fn()")
                test.is_nil(fn_err, tostring(fn_err))
            end
            db:release()
            test.is_true(failure ~= nil or failed.success == false)
            test.eq(#fixture.op(user, "runs", { component_id = id, run_type = "derive" }), 0)
            fixture.extraction({})
            local retried, retry_err = fixture.op(user, "embed_contract", { component_id = id, request = request })
            test.is_nil(retry_err, tostring(retry_err))
            test.is_true(retried.success, json.encode(retried))
            local completed = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(completed.status, "succeeded")
            fixture.wait_job(completed.job_id, "done")
            local replayed, replay_err = fixture.op(user, "embed_contract", { component_id = id, request = request })
            test.is_nil(replay_err, tostring(replay_err))
            test.is_true(replayed.success, json.encode(replayed))
            test.eq(replayed.run_id, retried.run_id)
            db = fixture.db()
            local jobs, jobs_err = db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE job_type = 'kickside.memory.engine:derive_worker' AND thread_id = $1", { id })
            db:release()
            test.is_nil(jobs_err, tostring(jobs_err))
            test.eq(tonumber(jobs[1].n), 1)
        end)

        test.it("deleting the memory through the knowledge control plane purges its ledger and every row", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, {
                fixture.candidate("fact", "a", "one", "Fact one.", "m1"),
                fixture.candidate("fact", "b", "two", "Fact two.", "m2"),
            }, "d1")
            fixture.settle(user, id)
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_memory_items WHERE component_id = $1", { id }), 2)
            local result, err = fixture.delete_memory(user, id)
            test.is_nil(err, tostring(err))
            test.is_true(result.deleted == true, json.encode(result))
            for _, table_name in ipairs({ "kickside_memory_items", "kickside_memory_payloads", "kickside_memory_keys", "kickside_memory_provenance", "kickside_memory_embeddings",
                "kickside_memory_cursors", "kickside_memory_run_sources", "kickside_memory_runs", "kickside_memory_stores" }) do
                test.eq(count("SELECT COUNT(*) AS n FROM " .. table_name .. " WHERE component_id = $1", { id }), 0, table_name)
            end
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_event WHERE thread_id = $1", { id }), 0)
        end)

        test.it("records a failed derive run with the model's failure instead of storing nothing", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.script.fail("structured_output", "provider overloaded")
            fixture.script.fail("structured_output", "provider overloaded")
            fixture.script.fail("structured_output", "provider overloaded")
            local session = "s-" .. user
            fixture.history.record(session, { { id = "h1", role = "user", content = "I moved to Oslo last month." } })
            local applied, err = fixture.op(user, "apply", { payload = fixture.payload("before_step", session, "agent-a") },
                fixture.agent_context(id, session, "agent-a"))
            test.is_nil(err, tostring(err))
            test.is_true(applied.metadata.capture.captured)
            local runs = fixture.wait_runs(user, id, "derive", 1)
            test.eq(runs[1].status, "failed")
            local job = fixture.wait_job(runs[1].job_id, "dead")
            test.eq(job.attempts, 3)
            test.eq(fixture.script.pending("structured_output"), 0)
            test.eq(json.decode(runs[1].last_error).explanation, "memory extraction failed")
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 0)
        end)
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

        test.it("judges same-key multi candidates inside one decision", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.relations({ "unrelated" })
            local written = fixture.remember(user, id, {
                fixture.candidate("fact", "pets", "cat", "The user has a cat."),
                fixture.candidate("fact", "pets", "feline", "The user has a feline."),
            }, "same-key")
            test.eq(written.stats.judged, 1)
            test.eq(written.stats.added, 2)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
