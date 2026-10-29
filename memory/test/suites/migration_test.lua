-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")
local sql = require("sql")
local canonical_json = require("canonical_json")

local function define_tests()
    test.describe("memory trait context migration", function()
        test.it("moves a published memory trait to the current capability before native execution", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local published_trait = "kickside.memory:knowledge_based_memory"
            local trait = "kickside.memory:memory"
            local created, create_err = fixture.call_as(user, "kickside.agents.registry:a_create", {
                name = "upgraded memory agent", model = "test-fast", traits = { trait },
                trait_contexts = { [trait] = { memory_id = memory } },
            })
            test.is_nil(create_err, tostring(create_err))

            local db = fixture.db()
            local rows, read_err = db:query("SELECT private_context FROM kickside_components WHERE component_id = $1", { created.component_id })
            test.is_nil(read_err, tostring(read_err))
            local private_context, decode_err = json.decode(tostring(rows[1].private_context))
            test.is_nil(decode_err, tostring(decode_err))
            private_context.traits = { published_trait }
            private_context.trait_contexts[published_trait] = private_context.trait_contexts[trait]
            private_context.trait_contexts[trait] = nil
            private_context.tools = { "kickside.memory:memory_recall_tool" }
            private_context.trait_contexts[published_trait] = {
                memory_id = memory, read_enabled = false, write_enabled = false, recall_limit = 1,
            }
            local encoded, encode_err = json.encode(private_context)
            test.is_nil(encode_err, tostring(encode_err))
            local _, write_err = db:execute("UPDATE kickside_components SET private_context = $1 WHERE component_id = $2", { encoded, created.component_id })
            db:release()
            test.is_nil(write_err, tostring(write_err))

            local function migrate(id: string)
                local result, migrate_err = fixture.op(user, "migrate", {
                    name = "05_memory_upgrade", id = id, database_id = "app:db",
                })
                test.is_nil(migrate_err, tostring(migrate_err))
                test.not_nil(result)
                test.eq(result.failed, 0, result.error)
            end
            migrate("memory-trait-context-upgrade")
            migrate("memory-trait-context-reapply")

            local stored, query_err = fixture.op(user, "migration_query", {
                database_id = "app:db",
                statement = "SELECT private_context, context_revision FROM kickside_components WHERE component_id = $1",
                params = { created.component_id },
            })
            test.is_nil(query_err, tostring(query_err))
            local migrated, migrated_decode_err = json.decode(tostring(stored[1].private_context))
            test.is_nil(migrated_decode_err, tostring(migrated_decode_err))
            local context = migrated.trait_contexts[trait]
            test.eq(context.memory_id, memory)
            test.eq(context.read_enabled, false)
            test.eq(context.write_enabled, false)
            test.eq(context.recall_limit, 1)
            test.is_nil(migrated.trait_contexts[published_trait])
            test.eq(migrated.traits[1], trait)
            test.eq(migrated.tools[1], "kickside.memory.agent:search_tool")
            test.eq(tonumber(stored[1].context_revision), 1)

            local agent, resolve_err = fixture.call_as(user, "kickside.agents:agent_resolver_func", {
                agent_id = "user_agent:" .. created.component_id,
            })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.not_nil(agent)
            fixture.script.respond(memory, "generate", "Memory is ready.")
            local ran, run_err = fixture.op(user, "trait_agent", {
                spec = agent,
                messages = {{role = "user", text = "Use memory."}},
            }, fixture.agent_context(memory, "migration-session", agent.id))
            test.is_nil(run_err, tostring(run_err))
            test.eq(ran.response.result, "Memory is ready.")
        end)

        test.it("resolves a published document-backed memory agent", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local published_trait = "kickside.memory:knowledge_based_memory"
            local trait = "kickside.memory:memory"
            local created, create_err = fixture.call_as(user, "kickside.agents.registry:a_create", {
                name = "published document memory agent", model = "test-fast", traits = { trait },
                trait_contexts = { [trait] = { memory_id = memory } },
            })
            test.is_nil(create_err, tostring(create_err))
            local db = fixture.db()
            local rows, read_err = db:query("SELECT private_context FROM kickside_components WHERE component_id = $1", { created.component_id })
            test.is_nil(read_err, tostring(read_err))
            local published_context, decode_err = json.decode(tostring(rows[1].private_context))
            test.is_nil(decode_err, tostring(decode_err))
            published_context.traits = { published_trait }
            published_context.tools = { "kickside.memory:memory_recall_tool" }
            published_context.trait_contexts = {
                [published_trait] = {
                    kb_ids = { "document-one", "document-two" }, write_kb_id = "document-two",
                    read_enabled = true, write_enabled = false, recall_limit = 5, recall_max_chars = 4000,
                    recall_prompt = "Search selected documents.", checkpoint_model = "test-fast",
                    checkpoint_prompt = "Keep the active task.", checkpoint_temperature = 0.1,
                    checkpoint_max_tokens = 321, checkpoint_source_max_chars = 20000,
                },
            }
            local encoded, encode_err = json.encode(published_context)
            test.is_nil(encode_err, tostring(encode_err))
            local _, write_err = db:execute("UPDATE kickside_components SET private_context = $1 WHERE component_id = $2", { encoded, created.component_id })
            db:release()
            test.is_nil(write_err, tostring(write_err))

            local migrated, migrate_err = fixture.op(user, "migrate", {
                name = "05_memory_upgrade", id = "published-document-memory", database_id = "app:db",
            })
            test.is_nil(migrate_err, tostring(migrate_err))
            test.eq(migrated.failed, 0, migrated.error)
            local stored, query_err = fixture.op(user, "migration_query", {
                database_id = "app:db", statement = "SELECT private_context FROM kickside_components WHERE component_id = $1",
                params = { created.component_id },
            })
            test.is_nil(query_err, tostring(query_err))
            local context, decode_err = json.decode(tostring(stored[1].private_context))
            test.is_nil(decode_err, tostring(decode_err))
            local settings = context.trait_contexts[published_trait]
            test.eq(context.traits[1], published_trait)
            test.eq(context.tools[1], "kickside.memory:memory_recall_tool")
            test.eq(settings.kb_ids[1], "document-one")
            test.eq(settings.kb_ids[2], "document-two")
            test.eq(settings.write_kb_id, "document-two")
            test.eq(settings.recall_max_chars, 4000)
            test.eq(settings.checkpoint_model, "test-fast")

            local agent, resolve_err = fixture.call_as(user, "kickside.agents:agent_resolver_func", {
                agent_id = "user_agent:" .. created.component_id,
            })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.not_nil(agent)
        end)
    end)

    test.describe("published pending derives", function()
        local held_scope: string? = nil

        test.after_each(function()
            if held_scope then fixture.script.release(held_scope, "structured_output"); held_scope = nil end
        end)

        test.it("cancels a queued published derive before recapturing its source", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
            local session = "migration-pending-" .. user
            fixture.record_chat(user, session, {
                { id = "published-source", role = "user", author = { kind = "user", id = user }, content = "I prefer a quiet room." },
            })
            held_scope = memory
            fixture.script.hold(memory, "structured_output")
            fixture.extraction(memory, {})
            local queued, queue_err = fixture.apply(user, "before_step", memory, session, "agent-a")
            test.is_nil(queue_err, tostring(queue_err))
            test.is_true(queued.metadata.capture.captured)

            local db = fixture.db()
            local input = assert(json.encode({ span = { { id = "published-source", text = "I prefer a quiet room." } } }))
            local _, rewrite_err = db:execute("UPDATE kickside_memory_runs SET input = $1 WHERE id = $2", { input, queued.metadata.capture.run_id })
            db:release()
            test.is_nil(rewrite_err, tostring(rewrite_err))

            local migrated, migrate_err = fixture.op(user, "migrate", {
                name = "05_memory_upgrade", id = "published-pending-derive", database_id = "app:db",
            })
            test.is_nil(migrate_err, tostring(migrate_err))
            test.eq(migrated.failed, 0, migrated.error)
            local cancelled = fixture.op(user, "run", { run_id = queued.metadata.capture.run_id })
            test.eq(cancelled.status, "cancelled")
            local job = fixture.rows("SELECT status FROM kickside_job WHERE id = $1", { cancelled.job_id })[1]
            test.eq(job.status, "cancelled")

            fixture.script.release(memory, "structured_output")
            held_scope = nil
            fixture.record_chat(user, session, {
                { id = "recaptured-source", role = "user", author = { kind = "user", id = user }, content = "I prefer a room away from the lift." },
            })
            fixture.extraction(memory, {})
            local recaptured, recapture_err = fixture.apply(user, "before_step", memory, session, "agent-a")
            test.is_nil(recapture_err, tostring(recapture_err))
            local completed = fixture.wait_run(user, recaptured.metadata.capture.run_id, function(run: any): boolean
                return run.status == "succeeded"
            end)
            test.eq(completed.status, "succeeded", tostring(completed.last_error))
            test.eq(completed.input.span[1].text, "I prefer a quiet room.")
            test.eq(completed.input.span[2].text, "I prefer a room away from the lift.")
        end)
    end)

    test.describe("memory schema upgrade", function()
        test.it("installs the final schema on a fresh database", function()
            local user = fixture.user()
            local id = fixture.memory(user)
            local added = fixture.create_claim(user, id, "Oslo")
            test.eq(fixture.items(user, id)[1].id, added.item_id)
            test.eq(fixture.count_rows("kickside_memory_run_sources", id), 0)
            local _, err = fixture.op(user, "migration_query", { database_id = "app:db",
                statement = "SELECT owner_scope_key FROM kickside_memory_cursors UNION ALL SELECT cycle FROM kickside_memory_runs" })
            test.is_nil(err, tostring(err))
        end)

        test.it("upgrades typed rows, vectors, source ownership, pins and event bodies from the published schema", function()
            local user = fixture.user()
            local function migrate(name: string, id: string, entry: string?)
                local result, err = fixture.op(user, "migrate", { name = name, id = id, entry = entry })
                test.is_nil(err, tostring(err))
                test.not_nil(result)
                test.eq(result.failed, 0, result.error)
            end
            local function exec(statement: string, params: any?)
                local _, err = fixture.op(user, "migration_exec", { statement = statement, params = params })
                test.is_nil(err, tostring(err))
            end
            local function query(statement: string, params: any?): any
                local rows, err = fixture.op(user, "migration_query", { statement = statement, params = params })
                test.is_nil(err, tostring(err))
                return rows
            end
            migrate("01_memory_schema", "published-memory-schema")
            migrate("", "memory-thread-schema", "kickside.core.migrations:01_thread")
            query("SELECT 1 AS n FROM kickside_memory_kb_stores")
            -- Column type is chosen from the application's database resource.
            local db = fixture.db()
            local engine = db:type()
            db:release()
            local is_postgres = engine ~= sql.type.SQLITE
            exec("CREATE TABLE kickside_components (component_id TEXT PRIMARY KEY, impl_id TEXT DEFAULT 'kickside.memory:memory_kb', private_context " ..
                (is_postgres and "jsonb" or "TEXT") .. ", context_revision INTEGER DEFAULT 0, updated_at TEXT)")
            local component = "018fa100-0000-7000-8000-000000000001"
            exec("INSERT INTO kickside_thread (id, component_id) VALUES ($1, $2)", { component, component })
            local now = "2026-01-01T00:00:00Z"
            exec([[INSERT INTO kickside_memory_kb_stores
                (component_id, kb_type, embedding_model, config, created_at, updated_at)
                VALUES ($1, 'memory', 'test-embed', '{"extraction_instructions":"Keep preferences"}', $2, $2)]], { component, now })
            exec([[INSERT INTO kickside_memory_kb_stores
                (component_id, kb_type, embedding_model, config, created_at, updated_at)
                VALUES ('empty-config', 'memory', 'test-embed', '[]', $1, $1)]], {now})
            local vector = {}
            for i = 1, 512 do vector[i] = i == 1 and 1 or 0 end
            local literal = assert(json.encode(vector))
            for _, row in ipairs({
                { "owner-item", "owner:one", "current", "Oslo" },
                { "other-item", "owner:two", "superseded", "Paris" },
                { "agent-item", "agent:reader", "current", "Berlin" },
            }) do
                exec([[INSERT INTO kickside_memory_kb_items
                    (id, component_id, claim_id, kind, scope_family, scope_id, scope_key, key, cardinality, content, value,
                     content_hash, status, version, valid_at, recorded_at, source, last_seq)
                    VALUES ($1, $2, $1, 'preference', $3, $4, $5, 'home_city', 'single', $6, $7,
                     'hash', $8, 1, $9, $9, 'owner', 1)]],
                    {row[1], component, row[2]:match("^([^:]+)"), row[2]:match(":(.*)$"), row[2],
                     "The current city is " .. row[4] .. ".", assert(json.encode(row[4])), row[3], now})
                exec([[INSERT INTO kickside_memory_kb_keys (component_id, scope_key, key, cardinality)
                    VALUES ($1, $2, 'home_city', 'single')]], {component, row[2]})
                exec([[INSERT INTO kickside_memory_kb_payloads (item_id, component_id, owner_item_id, content, value, content_hash, created_at)
                    VALUES ($1, $2, $1, $3, $4, 'hash', $5)]], {row[1], component, "The current city is " .. row[4] .. ".", assert(json.encode(row[4])), now})
                exec([[INSERT INTO kickside_memory_kb_embeddings (item_id, component_id, embedding, content_hash)
                    VALUES ($1, $2, $3, 'hash')]], {row[1], component, literal})
                exec([[INSERT INTO kickside_memory_kb_provenance (item_id, component_id, host_kind, host_id, event_id, recorded_at)
                    VALUES ($1, $2, 'session', 'session', 'event', $3)]], {row[1], component, now})
            end
            if not is_postgres then
                exec("INSERT INTO kickside_memory_kb_fts (item_id, content) SELECT id, content FROM kickside_memory_kb_items")
            end
            exec([[INSERT INTO kickside_event (id, thread_id, type, body, seq)
                VALUES ('018fa100-0000-7000-8000-000000000002', $1, 'kickside.memory.events:item.added', $2, 1)]],
                {component, assert(json.encode({item_id = "owner-item", key = "home_city", cardinality = "single",
                    scope_family = "owner", scope_id = "one", content_hash = "hash", kind = "preference", claim_id = "owner-item",
                    valid_at = now, source = "owner", provenance = {}}))})
            for _, cursor in ipairs({
                { "complete", '["owner-item"]' }, { "empty", '[]' }, { "mixed", '["owner-item","other-item"]' },
                { "owner-and-agent", '["owner-item","agent-item"]' },
            }) do
                exec([[INSERT INTO kickside_memory_kb_cursors
                    (component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, pinned_ids, updated_at)
                    VALUES ($1, 'session', $2, 'reader', 'event', 1, 'prompt', $3, $4)]], {component, cursor[1], cursor[2], now})
            end
            exec([[INSERT INTO kickside_memory_kb_cursors
                (component_id, host_kind, host_id, agent_id, last_event_id, updated_at)
                VALUES ($1, 'session', 'pending', 'reader', 'pending-end', $2)]], {component, now})
            for _, run in ipairs({ {"existing-run", "succeeded"}, {"failed-run", "failed"}, {"running-run", "running"} }) do
                exec([[INSERT INTO kickside_memory_kb_runs
                    (id, component_id, run_type, status, job_id, input, stats, created_at, started_at)
                    VALUES ($1, $2, 'consolidate', $3, '018fa100-0000-7000-8000-000000000003',
                        $4, '[]', $5, $5)]],
                    {run[1], component, run[2], run[1] == "existing-run" and "[]"
                        or '{"span":[{"id":"event","text":"source"}],"context":[{"id":"context-event","text":"context"}]}', now})
            end
            exec([[INSERT INTO kickside_memory_kb_runs
                (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, to_event_id, input, created_at)
                VALUES ('initial-pending-derive', $1, 'derive', 'scheduled', 'session', 'pending', 'reader', '', 'pending-before',
                    '{"span":[{"id":"pending-before","text":"I prefer a quiet car."}],"owner_id":"reader"}', $2)]], {component, now})
            exec([[INSERT INTO kickside_memory_kb_runs
                (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, to_event_id, input, created_at)
                VALUES ('pending-derive', $1, 'derive', 'scheduled', 'session', 'pending', 'reader', 'pending-before', 'pending-end',
                    '{"span":[{"id":"pending-end","text":"I prefer window seats."}],"owner_id":"reader"}', $2)]], {component, now})
            exec([[INSERT INTO kickside_memory_kb_runs
                (id, component_id, run_type, status, host_kind, host_id, agent_id, from_event_id, to_event_id, input, created_at)
                VALUES ('attributed-derive', $1, 'derive', 'succeeded', 'session', 'attributed', 'reader', 'attributed-before', 'attributed-end',
                    '{"host":{"kind":"session","id":"attributed"},"span":[{"id":"attributed-end","text":"I prefer aisle seats.","author":{"kind":"user","id":"reader"}}],"owner_id":"reader"}', $2)]], {component, now})
            exec([[INSERT INTO kickside_components (component_id, private_context, updated_at) VALUES ('agent',
                '{"traits":["kickside.memory:knowledge_based_memory"],"tools":["kickside.memory:memory_recall_tool"],"trait_contexts":{"kickside.memory:knowledge_based_memory":{"memory_id":"selected","read_enabled":false,"write_enabled":false,"recall_limit":1}}}', $1)]], {now})
            exec([[INSERT INTO kickside_memory_kb_runs (id, component_id, run_type, status, input, created_at)
                VALUES ('invalid-source', $1, 'derive', 'failed', '{"span":[{"text":"missing id"}]}', $2)]], {component, now})
            local rejected, reject_err = fixture.op(user, "migrate", {name = "05_memory_upgrade", id = "memory-forward-upgrade"})
            test.is_nil(reject_err, tostring(reject_err))
            test.eq(rejected.failed, 1)
            test.eq(#query("SELECT * FROM kickside_memory_kb_items"), 3)
            test.eq(#query("SELECT * FROM kickside_memory_kb_embeddings"), 3)
            exec("DELETE FROM kickside_memory_kb_runs WHERE id = 'invalid-source'")
            migrate("05_memory_upgrade", "memory-forward-upgrade")
            local objects = query(is_postgres and "SELECT tablename AS name FROM pg_tables WHERE schemaname = 'public' AND tablename LIKE 'kickside_memory_kb_%' UNION ALL SELECT indexname AS name FROM pg_indexes WHERE schemaname = 'public' AND indexname LIKE '%kickside_memory_kb_%'"
                or "SELECT name FROM sqlite_master WHERE name LIKE '%kickside_memory_kb_%'")
            test.eq(#objects, 0)
            test.eq(#query("SELECT id FROM kickside_memory_items WHERE component_id = $1", {component}), 3)
            local item = query("SELECT value FROM kickside_memory_items WHERE id = 'owner-item'")[1]
            test.eq(assert(json.decode(tostring(item.value))), "Oslo")
            local lexical = query(is_postgres and "SELECT id FROM kickside_memory_items WHERE search_vector @@ plainto_tsquery('simple', 'Oslo')"
                or "SELECT item_id AS id FROM kickside_memory_fts WHERE kickside_memory_fts MATCH 'Oslo'")
            test.eq(#lexical, 1)
            test.eq(lexical[1].id, "owner-item")
            local key_id = assert(canonical_json.hash({"key", component, "owner:one", "home_city"}))
            local keys = query("SELECT id FROM kickside_memory_keys WHERE scope_key = 'owner:one'")
            test.eq(keys[1].id, key_id)
            local payloads = query("SELECT embedding FROM kickside_memory_payloads")
            test.eq(#payloads, 3)
            test.eq(#assert(json.decode(payloads[1].embedding)), 512)
            test.eq(#query("SELECT * FROM kickside_memory_provenance"), 3)
            test.eq(#query("SELECT * FROM kickside_memory_run_sources"), 7)
            local rows = query("SELECT host_id, owner_scope_key, last_event_id, pinned_head, pinned_prompt, pinned_ids FROM kickside_memory_cursors ORDER BY host_id")
            test.eq(rows[1].owner_scope_key, "owner:one")
            test.is_nil(rows[2].owner_scope_key)
            test.is_nil(rows[3].owner_scope_key)
            test.eq(rows[4].owner_scope_key, "owner:one")
            for _, row in ipairs({rows[2], rows[3]}) do
                test.eq(row.last_event_id, "event")
                test.is_nil(row.pinned_head)
                test.is_nil(row.pinned_prompt)
                test.is_nil(row.pinned_ids)
            end
            test.eq(rows[4].pinned_ids, '["owner-item","agent-item"]')
            local pending = query("SELECT status, last_error FROM kickside_memory_runs WHERE id = 'pending-derive'")[1]
            test.eq(pending.status, "cancelled")
            test.eq(pending.last_error, "cancelled: source records do not provide author attribution")
            local initial = query("SELECT status, last_error FROM kickside_memory_runs WHERE id = 'initial-pending-derive'")[1]
            test.eq(initial.status, "cancelled")
            test.eq(initial.last_error, "cancelled: source records do not provide author attribution")
            test.is_nil(query("SELECT last_event_id FROM kickside_memory_cursors WHERE host_id = 'pending'")[1].last_event_id)
            local attributed = assert(json.decode(tostring(query("SELECT input FROM kickside_memory_runs WHERE id = 'attributed-derive'")[1].input)))
            test.is_nil(attributed.host)
            test.eq(tostring(query("SELECT config FROM kickside_memory_stores WHERE component_id = 'empty-config'")[1].config), "{}")
            local settings = assert(json.decode(tostring(query("SELECT config FROM kickside_memory_stores WHERE component_id = $1", {component})[1].config)))
            test.eq(settings.extraction_instructions, "Keep preferences")
            local runs = query("SELECT id, cycle FROM kickside_memory_runs ORDER BY id")
            local cycles = {}
            for _, run in ipairs(runs) do cycles[run.id] = run.cycle end
            test.is_nil(cycles["existing-run"])
            test.eq(cycles["failed-run"], now)
            test.eq(cycles["running-run"], now)
            test.is_nil(cycles["pending-derive"])
            local events = query("SELECT body FROM kickside_event")
            local body = assert(json.decode(tostring(events[1].body)))
            test.eq(body.key_id, key_id)
            test.is_nil(body.key)
            local contexts = query("SELECT private_context, context_revision FROM kickside_components")
            local context = assert(json.decode(tostring(contexts[1].private_context))).trait_contexts["kickside.memory:memory"]
            test.eq(context.memory_id, "selected")
            test.eq(context.read_enabled, false)
            test.eq(context.write_enabled, false)
            test.eq(context.recall_limit, 1)
            test.eq(tonumber(contexts[1].context_revision), 1)
            local agent_context = assert(json.decode(tostring(contexts[1].private_context)))
            test.eq(agent_context.traits[1], "kickside.memory:memory")
            test.eq(agent_context.tools[1], "kickside.memory.agent:search_tool")
            exec("UPDATE kickside_memory_cursors SET owner_scope_key = 'owner:principal:service:reader' WHERE host_id = 'complete'")
            migrate("05_memory_upgrade", "memory-forward-upgrade")
            migrate("05_memory_upgrade", "memory-forward-reapply")
            test.eq(query("SELECT owner_scope_key FROM kickside_memory_cursors WHERE host_id = 'complete'")[1].owner_scope_key, "owner:principal:service:reader")
            test.eq(tonumber(query("SELECT context_revision FROM kickside_components")[1].context_revision), 1)
            test.eq(#query("SELECT * FROM kickside_memory_run_sources"), 7)
            test.eq(#query("SELECT * FROM kickside_memory_embeddings"), 3)
            test.eq(query("SELECT impl_id FROM kickside_components")[1].impl_id, "kickside.memory:memory_store")
            local _, immutable_err = fixture.op(user, "migration_exec", {statement = "UPDATE kickside_event SET body = '{}'"})
            test.not_nil(immutable_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
