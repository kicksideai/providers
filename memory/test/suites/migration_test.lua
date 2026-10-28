-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fixture = require("fixture")

local function define_tests()
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
            migrate("03_run_cycle", "memory-run-cycle-upgrade")
            local runs = query("SELECT id, status, cycle FROM kickside_memory_runs WHERE id = 'existing-run'")
            test.eq(runs[1].id, "existing-run")
            test.eq(runs[1].status, "succeeded")
            test.is_nil(runs[1].cycle)
            migrate("03_run_cycle", "memory-run-cycle-reapply")
            local reapplied = query("SELECT cycle FROM kickside_memory_runs WHERE id = 'existing-run'")
            test.is_nil(reapplied[1].cycle)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
