local test = require("test")
local errors = require("errors")
local pull_core = require("pull_core")
local policy = require("operation_policy")

local function control_bounds_for(operation: string): any
    local value = {
        version = "SourceOperationControlBounds/v1", provider = "phantombuster", policy_ref = "phantombuster-test-control",
        revision = "v1", operation_id = operation,
        limits = { max_results = { minimum = 1, maximum = 10 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 86400 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { class = "source_specific", max_age_seconds = { minimum = 1, maximum = 2592000 } } },
        tool = { list_limit = { minimum = 1, maximum = 100 }, output_chars = { minimum = 1, maximum = 100000 } },
    }
    local result, err = policy.with_bounds_digest(value)
    test.is_nil(err)
    return result
end

local function operation_policy_for(operation: string, rows: number): any
    local control = control_bounds_for(operation)
    local value = {
        version = "SourceOperationPolicy/v1",
        policy_id = "phantombuster-test",
        revision = "v1",
        source_binding_id = "kickside.phantombuster.source:test",
        operation_id = operation,
        control_digest = control.digest,
        limits = { max_results = rows, timeout_seconds = 30 },
        lifecycle = { stale_after_seconds = 86400, stale_action = "unresolved", not_found_action = "unresolved" },
        storage = { mode = "bounded", limit_chars = 100000, retention = { class = "source_specific", max_age_seconds = 2592000 } },
        ownership = { owner_component_id = "owner-component", connection_id = "conn-1" },
    }
    local result, err = policy.with_digest(value)
    test.is_nil(err)
    return result
end

local function define_tests()
    test.describe("PhantomBuster candidate pull source", function()
        test.it("reads freshness from HTTP data when optional receipt fields are absent", function()
            for _, nested_receipt in ipairs({ false, true }) do
                local data = { completed = true, snapshot_id = "snapshot-1",
                    results = { { id = "person-1", name = "Northwind Operator" } } }
                if nested_receipt then
                    data.receipt = { captured_at = "2026-08-12T11:59:00Z" }
                else
                    data.completed_at = "2026-08-12T11:59:00Z"
                end
                local page = pull_core.pull({ config = { actor_id = "actor-7", query = "Northwind",
                    max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                    control_bounds = control_bounds_for("candidate_snapshot"),
                    operation_policy = operation_policy_for("candidate_snapshot", 1) } }, nil,
                    { component_id = "conn-1", now = function() return "2026-08-12T12:00:00Z" end,
                      transport = { connect = function() return { api_key = "fake" }, nil end,
                        get_agent_output = function() return { success = true, data = data } end } })
                test.eq(page.success, true)
                test.eq(#page.items, 1)
                test.eq(page.next_cursor.receipt.captured_at, "2026-08-12T11:59:00Z")
            end
        end)

        test.it("accepts numeric-leading component UUIDs without changing ownership checks", function()
            local connection = "01a10a3c-dd41-75a5-b076-33ed92695303"
            local owner = "01a10a3c-dd41-75a5-b076-33ed92695304"
            local control = control_bounds_for("candidate_snapshot")
            local raw = operation_policy_for("candidate_snapshot", 1)
            raw.ownership = { owner_component_id = owner, connection_id = connection }
            raw.digest = nil
            local resolved, digest_err = policy.with_digest(raw)
            test.is_nil(digest_err)
            local result, err = policy.validate(resolved, { connection_id = connection,
                operation_id = "candidate_snapshot", control_bounds = control })
            test.is_nil(err)
            test.eq(result.ownership.owner_component_id, owner)
            test.eq(result.ownership.connection_id, connection)
            local denied, mismatch = policy.validate(resolved, { connection_id = owner,
                operation_id = "candidate_snapshot", control_bounds = control })
            test.is_nil(denied)
            test.contains(mismatch, "must match config.connection_id")
            for _, invalid in ipairs({ "owner component", "Owner", "../owner", "owner/child" }) do
                raw.ownership.owner_component_id = invalid
                local malformed = policy.with_digest(raw)
                local rejected, invalid_err = policy.validate(malformed, { connection_id = connection,
                    operation_id = "candidate_snapshot", control_bounds = control })
                test.is_nil(rejected)
                test.contains(invalid_err, "bounded lower-case identifier")
            end
        end)

        test.it("accepts the round consumer's connection context with a distinct policy owner", function()
            local page = pull_core.pull({ config = { actor_id = "actor-7", query = "CTO",
                max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                control_bounds = control_bounds_for("candidate_snapshot"),
                operation_policy = operation_policy_for("candidate_snapshot", 1) } }, nil,
                { component_id = "conn-1", now = function() return "2026-08-12T12:00:00Z" end,
                  transport = { connect = function(id: string)
                      test.eq(id, "conn-1")
                      return { api_key = "fake" }, nil
                  end, get_agent_output = function() return { success = true, completed = true,
                      completed_at = "2026-08-12T11:59:00Z", snapshot_id = "run-1",
                      data = { { id = "person-1" } } } end } })
            test.eq(page.success, true)
            test.eq(page.items[1].item_key, "phantombuster:actor-7:person-1")
        end)

        test.it("returns a typed access denial without reading actor output", function()
            for _, scenario in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull },
                { operation = "activity_snapshot", pull = pull_core.pull_activities },
            }) do
                local actor_reads = 0
                local page = scenario.pull({ config = { actor_id = "actor-7", query = "CTO",
                    max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                    control_bounds = control_bounds_for(scenario.operation),
                    operation_policy = operation_policy_for(scenario.operation, 1) } }, nil,
                    { component_id = "conn-1", transport = {
                        connect = function() return nil, errors.new({ kind = errors.PERMISSION_DENIED,
                            message = "connection READ denied" }) end,
                        get_agent_output = function() actor_reads = actor_reads + 1 end,
                    } })
                test.eq(page.success, false)
                test.eq(page.error.code, "permission_denied")
                test.eq(page.error.scope, "connection")
                test.eq(page.error.retriable, false)
                test.eq(actor_reads, 0)
            end
        end)
        test.it("maps fake actor output to canonical candidates and obeys the configured cap", function()
            local page = pull_core.pull({ config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 1) } }, nil, {
                component_id = "owner-component",
                now = function() return "2026-08-12T12:00:00Z" end,
                transport = {
                    connect = function(id) test.eq(id, "conn-1"); return { api_key = "fake" }, nil end,
                    get_agent_output = function(conn, actor_id, query)
                        test.eq(query.timeout, 30)
                        return { success = true, completed = true, completed_at = "2026-08-12T11:59:00Z", snapshot_id = "run-1", data = {
                            { id = "p1", email = "ada@example.com", firstName = "Ada", lastName = "Example", company = "Example Company", jobTitle = "CTO" },
                            { email = "over@example.com" },
                        } }
                    end,
                },
            })
            test.eq(page.success, true)
            test.eq(#page.items, 1)
            local candidate = page.items[1].payload
            test.eq(candidate.email, "ada@example.com")
            test.eq(candidate.first_name, "Ada")
            test.eq(candidate.source_pull_id, "run-1")
            test.eq(candidate.provenance.external_source, "phantombuster")
            test.eq(candidate.no_auto_send, true)
            test.eq(page.next_cursor.receipt.snapshot_id, "run-1")
            test.eq(page.next_cursor.receipt.policy_receipt.revision, "v1")
            test.eq(page.coverage.mode, "complete")
            test.eq(page.coverage.final, false)
        end)

        test.it("keeps candidate keys stable when snapshot rows reorder and resumes a bounded page", function()
            local rows = {
                { id = "p1", email = "ada@example.com" },
                { id = "p2", email = "grace@example.com" },
            }
            local request = { config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1,
                connection_id = "conn-1", owner_component_id = "owner-component",
                control_bounds = control_bounds_for("candidate_snapshot"),
                operation_policy = operation_policy_for("candidate_snapshot", 1) } }
            local deps = { component_id = "owner-component", now = function() return "2026-08-12T12:00:00Z" end,
                transport = { connect = function() return { api_key = "fake" }, nil end,
                    get_agent_output = function() return { success = true, completed = true,
                        completed_at = "2026-08-12T11:59:00Z", snapshot_id = "run-1", data = rows } end } }
            local first = pull_core.pull(request, nil, deps)
            test.eq(first.success, true)
            test.eq(first.has_more, true)
            test.eq(first.coverage.mode, "complete")
            test.eq(first.coverage.final, false)
            test.eq(first.items[1].item_key, "phantombuster:actor-7:p1")
            request.cursor = first.next_cursor
            local second = pull_core.pull(request, nil, deps)
            test.eq(second.success, true)
            test.eq(second.has_more, false)
            test.eq(second.coverage.final, true)
            test.eq(second.items[1].item_key, "phantombuster:actor-7:p2")
            test.eq(second.next_cursor.receipt.snapshot_id, "run-1")
            test.is_nil(second.receipt)
            rows[1], rows[2] = rows[2], rows[1]
            request.cursor = nil
            local reordered = pull_core.pull(request, nil, deps)
            test.eq(reordered.items[1].item_key, "phantombuster:actor-7:p2")
        end)

        test.it("refuses candidate and activity rows without provider-stable identity", function()
            for _, scenario in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull, row = { name = "No ID" } },
                { operation = "activity_snapshot", pull = pull_core.pull_activities, row = { text = "No post ID" } },
            }) do
                local page = scenario.pull({ config = { actor_id = "actor-7", query = "CTO",
                    max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                    control_bounds = control_bounds_for(scenario.operation),
                    operation_policy = operation_policy_for(scenario.operation, 1) } }, nil,
                    { component_id = "owner-component", now = function() return "2026-08-12T12:00:00Z" end,
                      transport = { connect = function() return { api_key = "fake" }, nil end,
                          get_agent_output = function() return { success = true, completed = true,
                              completed_at = "2026-08-12T11:59:00Z", snapshot_id = "run-1",
                              data = { scenario.row } } end } })
                test.eq(page.success, false)
                test.eq(page.error.code, "invalid_request")
                test.eq(page.error.scope, "item")
            end
        end)

        test.it("enumerates the same stable candidate and activity keys for reconcile", function()
            for _, scenario in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull, keys = pull_core.pull_candidate_keys,
                  row = { id = "person-1", email = "ada@example.com" } },
                { operation = "activity_snapshot", pull = pull_core.pull_activities, keys = pull_core.pull_activity_keys,
                  row = { post_id = "post-1", text = "Update" } },
            }) do
                local req = { config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1,
                    connection_id = "conn-1", owner_component_id = "owner-component",
                    control_bounds = control_bounds_for(scenario.operation),
                    operation_policy = operation_policy_for(scenario.operation, 1) } }
                local deps = { component_id = "owner-component", now = function() return "2026-08-12T12:00:00Z" end,
                    transport = { connect = function() return { api_key = "fake" }, nil end,
                        get_agent_output = function() return { success = true, completed = true,
                            completed_at = "2026-08-12T11:59:00Z", snapshot_id = "run-1",
                            data = { scenario.row } } end } }
                local page = scenario.pull(req, nil, deps)
                local keys = scenario.keys(req, nil, deps)
                test.eq(keys.success, true)
                test.eq(keys.keys[1].item_key, page.items[1].item_key)
                test.eq(keys.keys[1].dedup_key, page.items[1].dedup_key)
                test.eq(keys.coverage.final, true)
            end
        end)

        test.it("passes typed actor-output failures through pulls and reconcile keys", function()
            for _, scenario in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull, keys = pull_core.pull_candidate_keys },
                { operation = "activity_snapshot", pull = pull_core.pull_activities, keys = pull_core.pull_activity_keys },
            }) do
                for _, read in ipairs({ scenario.pull, scenario.keys }) do
                    local expected = errors.new({ kind = errors.UNAVAILABLE, message = "actor output unavailable" })
                    local page, err = read({ config = { actor_id = "actor-7", query = "CTO",
                        max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                        control_bounds = control_bounds_for(scenario.operation),
                        operation_policy = operation_policy_for(scenario.operation, 1) } }, nil,
                        { component_id = "owner-component", transport = {
                            connect = function() return { api_key = "fake" }, nil end,
                            get_agent_output = function() return nil, expected end,
                        } })
                    test.is_nil(page)
                    test.eq(err:kind(), errors.UNAVAILABLE)
                    test.eq(err:message(), "actor output unavailable")
                end
            end
        end)

        test.it("classifies actor-output HTTP rejections as source errors", function()
            for _, scenario in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull, keys = pull_core.pull_candidate_keys },
                { operation = "activity_snapshot", pull = pull_core.pull_activities, keys = pull_core.pull_activity_keys },
            }) do
                for _, read in ipairs({ scenario.pull, scenario.keys }) do
                    local page = read({ config = { actor_id = "actor-7", query = "CTO",
                        max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component",
                        control_bounds = control_bounds_for(scenario.operation),
                        operation_policy = operation_policy_for(scenario.operation, 1) } }, nil,
                        { component_id = "owner-component", transport = {
                            connect = function() return { api_key = "fake" }, nil end,
                            get_agent_output = function() return { success = false, error = "forbidden", status_code = 403,
                                data = { message = "not allowed" } } end,
                        } })
                    test.is_false(page.success)
                    test.eq(page.error.code, "provider_error")
                    test.eq(page.error.message, "actor output unavailable")
                end
            end
        end)

        test.it("fails closed when a pull cap or completed snapshot identity is absent", function()
            local calls = 0
            local deps = {
                component_id = "owner-component",
                now = function() return "2026-08-12T12:00:00Z" end,
                transport = {
                    connect = function() calls = calls + 1; return { api_key = "fake" }, nil end,
                    get_agent_output = function() return { success = true, completed = true, completed_at = "2026-08-12T11:59:00Z", data = {} } end,
                },
            }
            local missing_limit = pull_core.pull({ config = { actor_id = "actor-7", query = "CTO", connection_id = "conn-1" }, limit = 10 }, nil, deps)
            test.eq(missing_limit.success, false)
            test.eq(missing_limit.error.code, "invalid_config")
            test.eq(calls, 0)

            local missing_identity = pull_core.pull({ config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 10, connection_id = "conn-1", owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 10) } }, nil, deps)
            test.eq(missing_identity.success, false)
            test.eq(missing_identity.error.code, "provider_error")
            test.eq(calls, 1)
        end)

        test.it("accepts an explicit request snapshot identity without minting one", function()
            local page = pull_core.pull({
                pull_id = "requested-snapshot",
                config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 1) },
            }, nil, {
                component_id = "owner-component",
                now = function() return "2026-08-12T12:00:00Z" end,
                transport = {
                    connect = function() return { api_key = "fake" }, nil end,
                    get_agent_output = function() return { success = true, completed = true, completed_at = "2026-08-12T11:59:00Z", data = {} } end,
                },
            })
            test.eq(page.success, true)
            test.eq(page.next_cursor.receipt.snapshot_id, "requested-snapshot")
        end)

        test.it("rejects a provider snapshot identity that disagrees with the request", function()
            local page = pull_core.pull({
                pull_id = "requested-snapshot",
                config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 1) },
            }, nil, {
                component_id = "owner-component",
                now = function() return "2026-08-12T12:00:00Z" end,
                transport = {
                    connect = function() return { api_key = "fake" }, nil end,
                    get_agent_output = function() return { success = true, completed = true, completed_at = "2026-08-12T11:59:00Z", snapshot_id = "provider-snapshot", data = {} } end,
                },
            })
            test.eq(page.success, false)
            test.eq(page.error.code, "provider_error")
            test.eq(page.error.message, "provider snapshot identity does not match the requested snapshot identity")
        end)

        test.it("rejects missing or stale snapshot freshness evidence", function()
            local function run(output)
                return pull_core.pull({
                    config = { actor_id = "actor-7", query = "CTO", max_rows_per_pull = 1, connection_id = "conn-1", owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 1) },
                }, nil, {
                    component_id = "owner-component",
                    now = function() return "2026-08-12T12:00:00Z" end,
                    transport = {
                        connect = function() return { api_key = "fake" }, nil end,
                        get_agent_output = function() return output end,
                    },
                })
            end
            local missing = run({ success = true, completed = true, snapshot_id = "snapshot-without-time", data = {} })
            test.eq(missing.success, false)
            test.eq(missing.error.message, "completed actor output has no freshness timestamp")
            local stale = run({ success = true, completed = true, completed_at = "2026-08-10T00:00:00Z", snapshot_id = "stale-snapshot", data = {} })
            test.eq(stale.success, false)
            test.eq(stale.error.message, "completed actor output is stale under operation_policy.lifecycle.stale_after_seconds")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(o) return run_cases(o) end }
