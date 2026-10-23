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

        test.it("creating a memory through the knowledge control plane provisions its store, ledger projection and consolidation slot", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local store = rows("SELECT kb_type, embedding_model FROM kickside_memory_kb_stores WHERE component_id = $1", { id })
            test.eq(#store, 1)
            test.eq(store[1].kb_type, "memory")
            test.eq(store[1].embedding_model, "test-embed")
            local projections = rows("SELECT kind FROM kickside_projection WHERE thread_id = $1", { id })
            local kinds = {}
            for _, row in ipairs(projections) do kinds[row.kind] = true end
            test.is_true(kinds["kickside.memory_kb.ledger"] == true, json.encode(projections))
            local slot = rows("SELECT run_type, job_id FROM kickside_memory_kb_runs WHERE id = $1", { "consolidate:" .. id })
            test.eq(#slot, 1)
            test.is_true(type(slot[1].job_id) == "string" and slot[1].job_id ~= "")
            local job = rows("SELECT status, scheduled_at FROM kickside_job WHERE id = $1", { slot[1].job_id })
            test.eq(job[1].status, "pending")
        end)

        test.it("serves its stores through the platform store contract and its own named binding", function()
            local descriptor = registry.get("kickside.memory_kb:engine_memory")
            test.eq(descriptor.meta.store_contract, "kickside.knowledge:kb_store_lifecycle")
            test.eq(descriptor.meta.store_binding, "kickside.memory_kb:store_lifecycle")
            local _, missing = registry.get("kickside.memory_kb:kb_store_lifecycle")
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
            local store = rows("SELECT config FROM kickside_memory_kb_stores WHERE component_id = $1", { id })
            test.eq(json.decode(store[1].config).recall_max_items, 7)
        end)

        test.it("folds an owner operation through the ledger into a current item", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local created, err = fixture.op(user, "create", { component_id = id, fields = {
                kind = "identity", scope_family = "agent", scope_id = "agent-a", key = "name", content = "You are Ada, a travel assistant.",
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

        test.it("edits text items as new versions and other items' text as revisions of the same claim", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local rule = fixture.op(user, "create", { component_id = id, fields = {
                kind = "rule", scope_family = "agent", scope_id = "agent-a", key = "tone", content = "Answer briefly.",
            } })
            fixture.settle(user, id)
            local edited, edit_err = fixture.op(user, "edit", { component_id = id, item_id = rule.item_id, fields = { content = "Answer in bullet points." } })
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

            fixture.verdict("SUPERSEDE", { paris_id })
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

            fixture.verdict("SUPERSEDE", { berlin_id })
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
            fixture.verdict("CONFLICT", { acme.item_ids[1] })
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
            fixture.verdict("CONFLICT", { first.item_ids[1] })
            local second = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "b2"),
            }, "slot-2")
            test.eq(second.stats.conflicted, 1)
            local offered = fixture.script.requests("structured_output")[1].properties.action.enum
            test.eq(table.concat(offered, ","), "SUPERSEDE,MERGE,NOOP,CONFLICT")

            fixture.verdict("ADD", {})
            local fact = fixture.remember(user, id, {
                fixture.candidate("fact", "sibling", "Ana", "The user has a sister, Ana.", "b3"),
            }, "slot-3")
            test.eq(fact.stats.added, 1)
            local fact_actions = fixture.script.requests("structured_output")[2].properties.action.enum
            test.is_true(table.concat(fact_actions, ","):find("ADD", 1, true) ~= nil)

            local reflected = fixture.remember(user, id, {
                fixture.candidate("profile_slot", "birth_date", "1990", "The user was born in 1990."),
            }, "slot-4", { source = "reflection" })
            test.eq(reflected.stats.noop, 1)
            test.eq(reflected.stats.added, 0)
            test.eq(#fixture.script.requests("structured_output"), 2)
        end)

        test.it("treats a key as one attribute across kinds: a profile slot value is never added beside another kind's value of that key", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.remember(user, id, { fixture.candidate("preference", "diet", "vegetarian", "The user is vegetarian.", "d1") }, "kind-1")
            fixture.settle(user, id)
            local vegetarian = fixture.items(user, id)[1]
            fixture.verdict("SUPERSEDE", { vegetarian.id })
            local vegan = fixture.remember(user, id, { fixture.candidate("profile_slot", "diet", "vegan", "The user is vegan.", "d2") }, "kind-2")
            test.eq(vegan.stats.superseded, 1)
            local offered = fixture.script.requests("structured_output")[1].properties.action.enum
            test.eq(table.concat(offered, ","), "SUPERSEDE,MERGE,NOOP,CONFLICT")
        end)

        test.it("keeps a conflict open when a contested memory is replaced", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local passport = fixture.remember(user, id, {
                fixture.candidate("fact", "birth_date", "1990-03-03", "The user was born on 3 March 1990.", "m1"),
            }, "o1")
            fixture.verdict("CONFLICT", { passport.item_ids[1] })
            local airline = fixture.remember(user, id, {
                fixture.candidate("fact", "birth_date", "1990-03-05", "The user was born on 5 March 1990.", "m2"),
            }, "o2")
            fixture.settle(user, id)
            local group = fixture.op(user, "get", { component_id = id, item_id = airline.item_ids[1] }).conflict_group
            fixture.verdict("MERGE", { passport.item_ids[1] })
            local restated = fixture.remember(user, id, {
                fixture.candidate("fact", "passport_birth_date", "1990-03-03", "The user's passport gives 3 March 1990 as their birth date.", "m3"),
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
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_memory_kb_provenance WHERE item_id = $1", { first.item_ids[1] }), 2)

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

        test.it("bounds direct ingestion before persistence and extraction", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            fixture.extraction({})
            local result, err = fixture.op(user, "embed_contract", { component_id = id, request = {
                content = string.rep("x", 30000) .. "tail-marker", title = string.rep("title", 10000),
                external_id = "large", external_version = "1",
            } })
            test.is_nil(err, tostring(err))
            test.is_true(result.success, json.encode(result))
            local run = fixture.wait_runs(user, id, "derive", 1)[1]
            test.eq(run.status, "succeeded", tostring(run.last_error))
            test.is_true(#run.input.span[1].text <= 24000)
            test.is_true(#fixture.script.prompts("structured_output")[1].user < 25000)
        end)

        test.it("rolls back ingest enrollment on queue failure and schedules the retry", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local db = fixture.db()
            local sqlite = db:type() == "sqlite"
            local statements = sqlite and {
                [[CREATE TRIGGER app_reject_derive BEFORE INSERT ON kickside_job WHEN NEW.job_type = 'kickside.memory_kb.engine:derive_worker'
                    BEGIN SELECT RAISE(ABORT, 'queue enrollment rejected'); END]],
            } or {
                [[CREATE FUNCTION app_reject_derive_fn() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN
                    IF NEW.job_type = 'kickside.memory_kb.engine:derive_worker' THEN RAISE EXCEPTION 'queue enrollment rejected'; END IF; RETURN NEW; END $$]],
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
            local jobs, jobs_err = db:query("SELECT COUNT(*) AS n FROM kickside_job WHERE job_type = 'kickside.memory_kb.engine:derive_worker' AND thread_id = $1", { id })
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
            test.eq(count("SELECT COUNT(*) AS n FROM kickside_memory_kb_items WHERE component_id = $1", { id }), 2)
            local result, err = fixture.delete_memory(user, id)
            test.is_nil(err, tostring(err))
            test.is_true(result.deleted == true, json.encode(result))
            for _, table_name in ipairs({ "kickside_memory_kb_items", "kickside_memory_kb_payloads", "kickside_memory_kb_keys", "kickside_memory_kb_provenance", "kickside_memory_kb_embeddings",
                "kickside_memory_kb_cursors", "kickside_memory_kb_runs", "kickside_memory_kb_stores" }) do
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
            test.is_true(tostring(runs[1].last_error):find("provider overloaded", 1, true) ~= nil, tostring(runs[1].last_error))
            fixture.settle(user, id)
            test.eq(#fixture.items(user, id), 0)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
