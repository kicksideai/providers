-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")
local json = require("json")

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
                    name = "04_memory_trait_context", id = id, database_id = "app:db",
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

    test.describe("cursor owner scope migration", function()
        test.it("backfills complete owner pins and safely re-applies", function()
            local user = fixture.user()
            local function migrate(name: string, id: string)
                local result, err = fixture.op(user, "migrate", { name = name, id = id })
                test.is_nil(err, tostring(err))
                test.not_nil(result)
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
            migrate("01_memory_schema", "memory-cursor-owner-schema")
            for _, item in ipairs({
                { "owner-item", "owner:one" }, { "other-item", "owner:two" },
            }) do
                exec([[INSERT INTO kickside_memory_items
                    (id, component_id, claim_id, kind, scope_family, scope_id, scope_key, key, cardinality, content, value,
                     content_hash, status, version, valid_at, recorded_at, source, last_seq)
                    VALUES ($1, 'memory', $2, 'preference', 'owner', $3, $2, 'topic', 'single', 'Topic', '"value"',
                     'hash', 'current', 1, '2026-01-01T00:00:00Z', '2026-01-01T00:00:00Z', 'owner', 1)]],
                    { item[1], item[2], item[2]:sub(7) })
            end
            for _, cursor in ipairs({
                { "complete", '["owner-item"]' }, { "empty", '[]' }, { "mixed", '["owner-item","other-item"]' },
            }) do
                exec([[INSERT INTO kickside_memory_cursors
                    (component_id, host_kind, host_id, agent_id, last_event_id, pinned_head, pinned_prompt, pinned_ids, updated_at)
                    VALUES ('memory', 'session', $1, 'agent', '', 1, 'prompt', $2, '2026-01-01T00:00:00Z')]], cursor)
            end
            migrate("02_cursor_owner_scope", "memory-cursor-owner-upgrade")
            local rows = query("SELECT host_id, owner_scope_key FROM kickside_memory_cursors WHERE component_id = 'memory' ORDER BY host_id")
            test.eq(rows[1].host_id, "complete")
            test.eq(rows[1].owner_scope_key, "owner:one")
            test.eq(rows[2].host_id, "empty")
            test.is_nil(rows[2].owner_scope_key)
            test.eq(rows[3].host_id, "mixed")
            test.is_nil(rows[3].owner_scope_key)
            migrate("02_cursor_owner_scope", "memory-cursor-owner-reapply")
            local reloaded = query("SELECT owner_scope_key FROM kickside_memory_cursors WHERE component_id = 'memory' AND host_id = 'complete'")
            test.eq(reloaded[1].owner_scope_key, "owner:one")
            exec([[INSERT INTO kickside_memory_runs
                (id, component_id, run_type, status, input, stats, created_at)
                VALUES ('existing-run', 'memory', 'consolidate', 'succeeded', '{}', '{}', '2026-01-01T00:00:00Z')]])
            for _, run in ipairs({
                { "failed-run", "failed", "2026-01-01T01:00:00Z" },
                { "running-run", "running", "2026-01-01T02:00:00Z" },
            }) do
                exec([[INSERT INTO kickside_memory_runs
                    (id, component_id, run_type, status, input, stats, created_at, started_at)
                    VALUES ($1, 'memory', 'consolidate', $2, '{}', '{}', '2026-01-01T00:00:00Z', $3)]], run)
            end
            migrate("03_run_cycle", "memory-run-cycle-upgrade")
            local runs = query("SELECT id, status, cycle FROM kickside_memory_runs WHERE id = 'existing-run'")
            test.eq(runs[1].id, "existing-run")
            test.eq(runs[1].status, "succeeded")
            test.is_nil(runs[1].cycle)
            local resumed = query("SELECT id, cycle FROM kickside_memory_runs WHERE id IN ('failed-run', 'running-run') ORDER BY id")
            test.eq(resumed[1].cycle, "2026-01-01T01:00:00Z")
            test.eq(resumed[2].cycle, "2026-01-01T02:00:00Z")
            migrate("03_run_cycle", "memory-run-cycle-reapply")
            local reapplied = query("SELECT cycle FROM kickside_memory_runs WHERE id = 'existing-run'")
            test.is_nil(reapplied[1].cycle)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
