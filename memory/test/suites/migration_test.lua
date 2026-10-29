-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")
local items = require("upgrade_items")
local fold = require("upgrade_fold")
local sql = require("sql")
local canonical_json = require("canonical_json")

local function define_tests()
    test.describe("memory trait context migration", function()
        test.it("removes retired settings from an existing agent context before strict resolution", function()
            local user = fixture.user()
            local memory = fixture.memory(user)
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
            private_context.trait_contexts[trait].read_enabled = false
            private_context.trait_contexts[trait].write_enabled = false
            private_context.trait_contexts[trait].recall_limit = 1
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
            test.is_nil(context.read_enabled)
            test.is_nil(context.write_enabled)
            test.is_nil(context.recall_limit)
            test.eq(tonumber(stored[1].context_revision), 1)

            local agent, resolve_err = fixture.call_as(user, "kickside.agents:agent_resolver_func", {
                agent_id = "user_agent:" .. created.component_id,
            })
            test.is_nil(resolve_err, tostring(resolve_err))
            test.not_nil(agent)
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
            for _, run in ipairs({ {"existing-run", "succeeded"}, {"failed-run", "failed"}, {"running-run", "running"} }) do
                exec([[INSERT INTO kickside_memory_kb_runs
                    (id, component_id, run_type, status, job_id, input, stats, created_at, started_at)
                    VALUES ($1, $2, 'consolidate', $3, '018fa100-0000-7000-8000-000000000003',
                        '{"span":[{"id":"event","text":"source"}],"context":[{"id":"context-event","text":"context"}]}', '{}', $4, $4)]],
                    {run[1], component, run[2], now})
            end
            exec([[INSERT INTO kickside_components (component_id, private_context, updated_at) VALUES ('agent',
                '{"trait_contexts":{"kickside.memory:memory":{"memory_id":"selected","read_enabled":false,"write_enabled":false,"recall_limit":1}}}', $1)]], {now})
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
            local listed, list_err = items.list(component, {})
            test.is_nil(list_err, tostring(list_err))
            test.eq(#listed, 3)
            local item, get_err = items.get(component, "owner-item")
            test.is_nil(get_err, tostring(get_err))
            test.eq(item.value, "Oslo")
            local found, search_err = items.search(component, vector, {query_text = "Oslo", scope_keys = {"owner:one"}, limit = 10})
            test.is_nil(search_err, tostring(search_err))
            test.eq(found[1].id, "owner-item")
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
            test.eq(#query("SELECT * FROM kickside_memory_run_sources"), 6)
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
            local runs = query("SELECT id, cycle FROM kickside_memory_runs ORDER BY id")
            test.is_nil(runs[1].cycle)
            test.eq(runs[2].cycle, now)
            test.eq(runs[3].cycle, now)
            local events = query("SELECT body FROM kickside_event")
            local body = assert(json.decode(tostring(events[1].body)))
            test.eq(body.key_id, key_id)
            test.is_nil(body.key)
            local contexts = query("SELECT private_context, context_revision FROM kickside_components")
            local context = assert(json.decode(tostring(contexts[1].private_context))).trait_contexts["kickside.memory:memory"]
            test.eq(context.memory_id, "selected")
            test.is_nil(context.read_enabled)
            test.is_nil(context.write_enabled)
            test.is_nil(context.recall_limit)
            test.eq(tonumber(contexts[1].context_revision), 1)
            exec("UPDATE kickside_memory_cursors SET owner_scope_key = 'owner:principal:service:reader' WHERE host_id = 'complete'")
            migrate("05_memory_upgrade", "memory-forward-upgrade")
            migrate("05_memory_upgrade", "memory-forward-reapply")
            test.eq(query("SELECT owner_scope_key FROM kickside_memory_cursors WHERE host_id = 'complete'")[1].owner_scope_key, "owner:principal:service:reader")
            test.eq(tonumber(query("SELECT context_revision FROM kickside_components")[1].context_revision), 1)
            test.eq(#query("SELECT * FROM kickside_memory_run_sources"), 6)
            test.eq(#query("SELECT * FROM kickside_memory_embeddings"), 3)
            test.eq(query("SELECT impl_id FROM kickside_components")[1].impl_id, "kickside.memory:memory_store")
            exec("DELETE FROM kickside_memory_items WHERE id = 'owner-item'")
            local replayed, replay_err = fold.fold(component, {{type = "kickside.memory.events:item.added", body = body, seq = 1, created_at = now}})
            test.is_nil(replay_err, tostring(replay_err))
            test.is_true(replayed)
            local replay_matches, replay_search_err = items.search(component, vector, {query_text = "Oslo", scope_keys = {"owner:one"}})
            test.is_nil(replay_search_err, tostring(replay_search_err))
            test.eq(replay_matches[1].id, "owner-item")
            local _, immutable_err = fixture.op(user, "migration_exec", {statement = "UPDATE kickside_event SET body = '{}'"})
            test.not_nil(immutable_err)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
