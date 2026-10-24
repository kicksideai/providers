local test = require("test")
local registry = require("registry")
local research_source = require("research_source")
local operation_policy = require("operation_policy")

local function control_bounds_for(operation: string): any
    local value = {
        version = "SourceOperationControlBounds/v1", provider = "phantombuster", policy_ref = "phantombuster-test-control",
        revision = "v1", operation_id = operation,
        limits = { max_results = { minimum = 1, maximum = 10 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 86400 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { class = "source_specific", max_age_seconds = { minimum = 1, maximum = 2592000 } } },
        tool = { list_limit = { minimum = 1, maximum = 100 }, output_chars = { minimum = 1, maximum = 100000 } },
    }
    local result, err = operation_policy.with_bounds_digest(value)
    test.is_nil(err)
    return result
end

local function operation_policy_for(operation: string, rows: number): any
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
        ownership = { owner_component_id = "owner-component", connection_id = "connection-fixture" },
    }
    local result, err = operation_policy.with_digest(value)
    test.is_nil(err)
    return result
end

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function define_tests()
    test.describe("kickside.phantombuster packaging", function()
        test.it("registers kickside.phantombuster.source:candidate_source with schema and connection authority", function()
            local binding = get("kickside.phantombuster.source:candidate_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.phantombuster.source:pull_candidates")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.phantombuster.source:candidates")
            test.eq(value(port, "binding"), "kickside.phantombuster.source:candidate_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.phantombuster.source:pull_candidate_keys")
        end)
        test.it("registers kickside.phantombuster.source:activity_source with schema and connection authority", function()
            local binding = get("kickside.phantombuster.source:activity_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.phantombuster.source:pull_activities")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.phantombuster.source:activities")
            test.eq(value(port, "binding"), "kickside.phantombuster.source:activity_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.phantombuster.source:pull_activity_keys")
        end)
        test.it("publishes a schema-declared credential connection binding", function()
            local binding = get("kickside.phantombuster.connection:phantombuster_connection")
            local m = meta(binding)
            test.eq(m.provider, "phantombuster")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "api_key")
            test.eq(m.credential_schema.fields[1].type, "password")

            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local has_connection = false
            for _, c in ipairs(contracts) do
                if c.contract == "kickside.connection:connection" then has_connection = true end
            end
            test.eq(has_connection, true)
        end)

        test.it("publishes provider-owned picker backed traits", function()
            for _, id in ipairs({
                "kickside.phantombuster.traits:reader",
                "kickside.phantombuster.traits:operator",
                "kickside.phantombuster.traits:manager",
            }) do
                local t = get(id)
                local m = meta(t)
                test.eq(m.type, "agent.trait")
                test.eq(m.web_component, "kickside-phantombuster-picker")
                test.eq(m.provider, "phantombuster")
            end
            local picker = get("kickside.phantombuster:phantombuster_picker_view")
            local picker_meta = meta(picker)
            test.eq(picker_meta.type, "view.component")
            test.eq(picker_meta.tag_name, "kickside-phantombuster-picker")
            test.eq(picker_meta.entry_point, "phantombuster_picker.js")
        end)

        test.it("does not expose component_id in PhantomBuster tool schemas", function()
            for _, id in ipairs({
                "kickside.phantombuster.traits:get_tool",
                "kickside.phantombuster.traits:write_tool",
            }) do
                local schema = tostring(meta(get(id)).input_schema or "")
                test.is_nil(schema:find("component_id", 1, true), id .. " exposes component_id")
                test.is_nil(schema:find("connection_id", 1, true), id .. " exposes connection_id")
            end
        end)

        test.it("publishes a raw LinkedIn activity pull without engagement policy", function()
            local activities = get("kickside.phantombuster.source:activities")
            local schema = tostring(value(activities, "output_schema") or "")
            test.contains(schema, "post_id")
            test.contains(schema, "author")
            test.is_nil((schema:find("score", 1, true)))
            test.is_nil((schema:find("comment_draft", 1, true)))
        end)

        test.it("exposes the UI static mount through the host requirement", function()
            local targets: any = value(get("kickside.phantombuster:ui_server"), "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.phantombuster:ui_static")
            test.eq(targets[1].path, ".meta.server")
        end)

        test.it("declares direct package dependencies in production", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
                { "uploads", "kickside/uploads" },
            }) do
                local dep = get("kickside.phantombuster:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)

        test.it("normalizes a bounded actor snapshot into attributable Research evidence", function()
            local result, run_err = research_source.run({
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
                    control_bounds = control_bounds_for("candidate_snapshot"),
                    operation_policy = operation_policy_for("candidate_snapshot", 4),
                },
            }, {
                candidates = function(request: unknown): unknown
                    local req = request :: any
                    test.eq(req.config.query, "Declared market fixture")
                    test.eq(req.limit, 4)
                    return {
                        success = true,
                        next_cursor = { receipt = { provider = "phantombuster", actor_id = "actor-fixture", snapshot_id = "candidate-snapshot", captured_at = "2026-08-12T11:59:00Z", complete = true, rows_read = 1, policy_receipt = operation_policy.receipt(request.config.operation_policy), control_receipt = operation_policy.control_receipt(control_bounds_for("candidate_snapshot")), control_digest = control_bounds_for("candidate_snapshot").digest } },
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
            test.eq(result.artifacts[1].content.company_name, "Company fixture")
            test.eq(result.artifacts[1].subject_refs[1].ref, "market-fixture")
            test.is_nil(result.artifacts[1].confidence)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
