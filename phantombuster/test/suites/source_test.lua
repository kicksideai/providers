local test = require("test")
local source = require("source")
local policy = require("operation_policy")
local pull_core = require("pull_core")

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

local function operation_policy_for(operation: string, rows: number, connection_id: string, owner_component_id: string): any
    local control = control_bounds_for(operation)
    local value = {
        version = "SourceOperationPolicy/v1",
        policy_id = "phantombuster-test",
        revision = "v1",
        source_binding_id = "kickside.phantombuster.research:test",
        operation_id = operation,
        control_digest = control.digest,
        limits = { max_results = rows, timeout_seconds = 30 },
        lifecycle = { stale_after_seconds = 86400, stale_action = "unresolved", not_found_action = "unresolved" },
        storage = { mode = "bounded", limit_chars = 100000, retention = { class = "source_specific", max_age_seconds = 2592000 } },
        ownership = { owner_component_id = owner_component_id, connection_id = connection_id },
    }
    local result, err = policy.with_digest(value)
    test.is_nil(err)
    return result
end

local function define_tests()
    test.describe("PhantomBuster Research Source", function()
        test.it("consumes declared pullable receipts for candidate and activity snapshots", function()
            for _, row in ipairs({
                { operation = "candidate_snapshot", pull = pull_core.pull, data = { id = "person-1", name = "Operator" } },
                { operation = "activity_snapshot", pull = pull_core.pull_activities, data = { post_id = "post-1", text = "Dispatch" } },
            }) do
                local control = control_bounds_for(row.operation)
                local config = { connection_id = "connection-fixture", actor_id = "actor-fixture", actor_scope = "Declared scope",
                    max_rows_per_pull = 4, owner_component_id = "owner-component", control_bounds = control,
                    operation_policy = operation_policy_for(row.operation, 4, "connection-fixture", "owner-component") }
                local function read(request)
                    return row.pull(request, nil, {
                        component_id = "connection-fixture", now = function() return "2026-08-12T12:00:00Z" end,
                        transport = { connect = function() return {} end, get_agent_output = function()
                            return { success = true, completed = true, completed_at = "2026-08-12T11:59:00Z",
                                snapshot_id = "run-1", data = { row.data } }
                        end },
                    })
                end
                local result, err = source.run({ input = { operation = row.operation, limits = { max_results = 4 } }, config = config },
                    { candidates = read, activities = read })
                test.is_nil(err)
                test.eq(#result.artifacts, 1)
                test.eq(result.receipt.snapshot_id, "run-1")
                test.eq(result.completeness.mode, "snapshot")
                test.eq(result.completeness.complete, true)
                test.eq(result.completeness.snapshot_id, "run-1")
                test.eq(result.completeness.rows_read, 1)
            end
        end)
        test.it("returns bounded candidate evidence from a configured actor snapshot", function()
            local result, run_err = source.run({
                input = {
                    operation = "candidate_snapshot",
                    subject = { kind = "market", ref = "market-fixture" },
                    limits = { max_results = 4 },
                },
                config = {
                    connection_id = "connection-fixture",
                    actor_id = "actor-fixture",
                    actor_scope = "Declared market fixture",
                    max_rows_per_pull = 4,
                    owner_component_id = "owner-component",
                    control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 4, "connection-fixture", "owner-component"),
                },
            }, {
                candidates = function(request: unknown): unknown
                    local req = request :: any
                    test.eq(req.config.connection_id, "connection-fixture")
                    test.eq(req.config.actor_id, "actor-fixture")
                    test.eq(req.config.query, "Declared market fixture")
                    test.eq(req.limit, 4)
                    test.eq(req.config.max_rows_per_pull, 4)
                    return {
                        success = true,
                        next_cursor = { receipt = { provider = "phantombuster", actor_id = "actor-fixture", snapshot_id = "candidate-snapshot", captured_at = "2026-08-12T11:59:00Z", complete = true, rows_read = 1, policy_receipt = policy.receipt(req.config.operation_policy), control_receipt = policy.control_receipt(control_bounds_for("candidate_snapshot")), control_digest = control_bounds_for("candidate_snapshot").digest } },
                        has_more = false,
                        coverage = { mode = "complete", final = true, pass_key = "candidate-snapshot", scope_key = "phantombuster-fixture" },
                        items = {
                            {
                                payload = {
                                    name = "Candidate fixture",
                                    company_name = "Company fixture",
                                    title = "Role fixture",
                                    provenance = {
                                        external_id = "candidate-fixture",
                                        source_url = "https://example.invalid/profile/candidate-fixture",
                                    },
                                },
                            },
                        },
                    }
                end,
                activities = function(_: unknown): unknown return { success = true, items = {} } end,
            })
            test.is_nil(run_err)
            test.eq(result.source_id, "kickside.phantombuster.research:source")
            test.eq(result.artifacts[1].content.company_name, "Company fixture")
            test.eq(result.artifacts[1].subject_refs[1].ref, "market-fixture")
            test.eq(result.receipt.policy_receipt.digest, operation_policy_for("candidate_snapshot", 4, "connection-fixture", "owner-component").digest)
        end)

        test.it("returns attributable social activity without policy scoring", function()
            local result, run_err = source.run({
                input = {
                    operation = "activity_snapshot",
                    subject = { kind = "company", ref = "company-fixture" },
                    limits = { max_results = 4 },
                },
                config = {
                    connection_id = "connection-fixture",
                    actor_id = "activity-actor-fixture",
                    actor_scope = "Curated account fixture",
                    max_rows_per_pull = 4,
                    owner_component_id = "owner-component",
                    control_bounds = control_bounds_for("activity_snapshot"), operation_policy = operation_policy_for("activity_snapshot", 4, "connection-fixture", "owner-component"),
                },
            }, {
                candidates = function(_: unknown): unknown return { success = true, items = {} } end,
                activities = function(request: unknown): unknown
                    local req = request :: any
                    return {
                        success = true,
                        next_cursor = { receipt = { provider = "phantombuster", actor_id = "activity-actor-fixture", snapshot_id = "activity-snapshot", captured_at = "2026-08-12T11:59:00Z", complete = true, rows_read = 1, policy_receipt = policy.receipt(req.config.operation_policy), control_receipt = policy.control_receipt(control_bounds_for("activity_snapshot")), control_digest = control_bounds_for("activity_snapshot").digest } },
                        has_more = false,
                        coverage = { mode = "complete", final = true, pass_key = "activity-snapshot", scope_key = "phantombuster-fixture" },
                        items = {
                            {
                                payload = {
                                    post_id = "post-fixture",
                                    author = { name = "Author fixture", profile_url = "https://example.invalid/author" },
                                    text = "Public activity fixture",
                                    url = "https://example.invalid/posts/post-fixture",
                                    published_at = "2026-07-30T00:00:00Z",
                                },
                            },
                        },
                    }
                end,
            })
            test.is_nil(run_err)
            test.eq(result.artifacts[1].published_at, "2026-07-30T00:00:00Z")
            test.eq(result.artifacts[1].content.text, "Public activity fixture")
            test.is_nil(result.artifacts[1].confidence)
            test.eq(result.receipt.snapshot_id, "activity-snapshot")
            test.eq(result.completeness.complete, true)
        end)

        test.it("requires explicit limits and rejects an unreceipted snapshot", function()
            local base = {
                input = { operation = "candidate_snapshot", subject = { kind = "market", ref = "market-fixture" }, limits = {} },
                config = { connection_id = "connection-fixture", actor_id = "actor-fixture", actor_scope = "Declared market fixture", max_rows_per_pull = 1, owner_component_id = "owner-component", control_bounds = control_bounds_for("candidate_snapshot"), operation_policy = operation_policy_for("candidate_snapshot", 1, "connection-fixture", "owner-component") },
            }
            local missing, missing_err = source.run(base, { candidates = function() return {} end, activities = function() return {} end })
            test.is_nil(missing)
            test.eq(missing_err, "input.limits.max_results is required and must be an integer")

            base.input.limits = { max_results = 1 }
            local incomplete, incomplete_err = source.run(base, {
                candidates = function() return { success = true, items = {}, coverage = { mode = "snapshot", complete = true, snapshot_id = "snapshot", rows_read = 0 } } end,
                activities = function() return {} end,
            })
            test.is_nil(incomplete)
            test.eq(incomplete_err, "PhantomBuster output read failed: provider receipt is not complete")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
