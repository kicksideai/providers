local test = require("test")
local json = require("json")
local registry = require("registry")
local funcs = require("funcs")
local operation_policy = require("operation_policy")

local GET_TOOL = "kickside.phantombuster.traits:get_tool"
local WRITE_TOOL = "kickside.phantombuster.traits:write_tool"

local function get_entry(id: string): any
    local entries, err = registry.find({ [".id"] = id })
    test.is_nil(err)
    test.not_nil(entries, id .. " lookup failed")
    test.eq(#entries, 1, id .. " should resolve once")
    return entries[1]
end

local function decode_schema(entry: any): any
    test.not_nil(entry.meta, entry.id .. " missing meta")
    test.eq(entry.meta.type, "tool")
    test.not_nil(entry.meta.input_schema, entry.id .. " missing input_schema")
    local schema, err = json.decode(tostring(entry.meta.input_schema))
    test.is_nil(err)
    test.eq(schema.type, "object")
    test.eq(schema.additionalProperties, false)
    return schema
end

local function enum_contains(enum: any, value: string): boolean
    for _, item in ipairs(enum or {}) do
        if item == value then return true end
    end
    return false
end

local function control_bounds(): any
    local value, err = operation_policy.with_bounds_digest({
        version = "SourceOperationControlBounds/v1", provider = "phantombuster", policy_ref = "phantombuster-test-control",
        revision = "v1", operation_id = "tool",
        limits = { max_results = { minimum = 1, maximum = 10 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 86400 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { class = "source_specific", max_age_seconds = { minimum = 1, maximum = 2592000 } } },
        tool = { list_limit = { minimum = 1, maximum = 100 }, output_chars = { minimum = 1, maximum = 100 } },
    })
    test.is_nil(err)
    return value
end

local function probe(tool: string, args: any, responses: any, rejections: any?, failures: any?): any
    local out, err = funcs.new():with_context({ control_bounds = control_bounds() })
        :call("app.suites:tool_probe", { tool = tool, args = args, responses = responses, rejections = rejections, failures = failures })
    test.is_nil(err)
    return out
end

local function define_tests()
    test.describe("PhantomBuster traits", function()
        test.it("publishes toolkit tools with model-facing schemas", function()
            local get_schema = decode_schema(get_entry(GET_TOOL))
            local write_schema = decode_schema(get_entry(WRITE_TOOL))

            test.not_nil(get_schema.properties.action.enum)
            test.not_nil(write_schema.properties.action.enum)
            test.eq(get_schema.required[1], "action")
            test.eq(write_schema.required[1], "action")
        end)

        test.it("advertises the documented high-value PhantomBuster actions", function()
            local get_schema = decode_schema(get_entry(GET_TOOL))
            local write_schema = decode_schema(get_entry(WRITE_TOOL))
            local get_enum = get_schema.properties.action.enum
            local write_enum = write_schema.properties.action.enum

            for _, action in ipairs({
                "get_org",
                "get_org_resources",
                "list_running_containers",
                "list_agents",
                "get_agent",
                "list_deleted_agents",
                "get_agent_output",
                "list_containers",
                "get_container",
                "get_container_output",
                "get_result",
            }) do
                test.is_true(enum_contains(get_enum, action), "missing read action " .. action)
            end

            for _, action in ipairs({ "launch_agent", "launch_agent_soon", "stop_agent" }) do
                test.is_true(enum_contains(write_enum, action), "missing write action " .. action)
            end
            test.is_false(enum_contains(write_enum, "abort_container"), "abort_container must not be model-facing")
        end)

        test.it("keeps connection selection out of model-facing schemas", function()
            for _, id in ipairs({ GET_TOOL, WRITE_TOOL }) do
                local schema_text = tostring(get_entry(id).meta.input_schema or "")
                test.is_nil(schema_text:find("component_id", 1, true), id .. " exposes component_id")
                test.is_nil(schema_text:find("connection_id", 1, true), id .. " exposes connection_id")
            end
        end)

        test.it("returns complete PhantomBuster objects beyond the configured output size", function()
            local long = string.rep("é result ", 2000)
            local agent = probe("get", { action = "get_agent", agent_id = "a1" },
                { get_agent = { id = "a1", name = "Scraper", argument = long, apiKey = "secret" } })
            test.is_nil(agent.error)
            test.eq(agent.result.argument, long)
            test.eq(agent.result.apiKey, "[redacted]")
            local output = probe("get", { action = "get_container_output", container_id = "c1" },
                { get_container_output = { output = long, status = "finished" } })
            test.eq(output.result.output, long)
            local result = probe("get", { action = "get_result", container_id = "c1" },
                { get_result_object = { rows = { { profile = { name = "Ada" } } } } })
            test.eq(result.result.rows[1].profile.name, "Ada")
            local resources = probe("get", { action = "get_org_resources" }, { get_org_resources = { dailyExecutionTime = 600, plan = "pro" } })
            test.eq(resources.result.dailyExecutionTime, 600)
            local launched = probe("write", { action = "launch_agent", agent_id = "a1" }, { launch_agent = { containerId = "c9", extra = long } })
            test.eq(launched.result.containerId, "c9")
            test.eq(launched.result.extra, long)
        end)

        test.it("pages agent lists with offset and next_offset", function()
            local agents = {}
            for i = 1, 5 do agents[i] = { id = "a" .. tostring(i), name = "Agent " .. tostring(i) } end
            local page = probe("get", { action = "list_agents", limit = 2, offset = 2 }, { list_agents = agents })
            test.eq(page.result.agents[1].id, "a3")
            test.eq(page.result.next_offset, 4)
        end)

        test.it("pages compact agent and container records", function()
            local agents = { { id = "a1", name = "Scraper", script = "linkedin.js", launchType = "manually", s3Folder = "f1",
                argument = "{}", repeatedLaunchTimes = { minute = { 0 } }, orgId = "o1" } }
            local page = probe("get", { action = "list_agents", limit = 5 }, { list_agents = agents })
            test.is_nil(page.result.agents[1].s3Folder)
            test.is_nil(page.result.agents[1].repeatedLaunchTimes)
            test.eq(page.result.agents[1].launchType, "manually")
            local containers = { { id = "c1", agentId = "a1", status = "finished", exitCode = 0, retryNumber = 1, labels = { "nightly" } } }
            local running = probe("get", { action = "list_containers", agent_id = "a1", limit = 5 }, { list_containers = { containers = containers } })
            test.is_nil(running.result.containers[1].labels)
            test.eq(running.result.containers[1].exitCode, 0)
            local org = probe("get", { action = "get_org" }, { get_org = { id = "o1", name = "Acme", timezone = "UTC", billing = { plan = "pro" } } })
            test.eq(org.result.timezone, "UTC")
            test.eq(org.result.billing.plan, "pro")
        end)

        test.it("reads a container with its result object, output, runtime events and neighbours", function()
            local got = probe("get", { action = "get_container", container_id = "c1" }, { get_container = { id = "c1", output = "log" } })
            local query = got.calls.get_container[3]
            test.eq(query.withResultObject, "true")
            test.eq(query.withOutput, "true")
            test.eq(query.withRuntimeEvents, "true")
            test.eq(query.withNewerAndOlderContainerId, "true")
            test.eq(got.result.output, "log")
        end)

        test.it("returns raw provider output as the result", function()
            local raw = probe("get", { action = "get_container_output", container_id = "c1", mode = "raw" }, { get_container_output = "line 1\nline 2" })
            test.is_nil(raw.error)
            test.eq(raw.result, "line 1\nline 2")
        end)

        test.it("fails with the typed transport error and returns PhantomBuster's rejection", function()
            local failed = probe("get", { action = "get_agent", agent_id = "a1" }, {}, nil, { get_agent = "connection reset" })
            test.is_nil(failed.result)
            test.eq(failed.error.kind, errors.UNAVAILABLE)
            test.eq(failed.error.message, "connection reset")
            local rejected = probe("write", { action = "stop_agent", agent_id = "a1" }, {}, {
                stop_agent = { success = false, error = "forbidden", status_code = 403, data = { error = "Agent belongs to another org" } } })
            test.is_false(rejected.result.success)
            test.eq(rejected.result.status_code, 403)
            test.eq(rejected.result.data.error, "Agent belongs to another org")
        end)

        test.it("returns tool failures as errors", function()
            local missing = probe("get", { action = "get_agent" }, {})
            test.is_false(missing.result.success)
            test.eq(missing.result.error, "agent_id required")
        end)

        test.it("names the unknown action in its failure", function()
            local unknown = probe("get", { action = "bogus" }, {})
            test.is_false(unknown.result.success)
            test.contains(unknown.result.error, "unknown action 'bogus'")
            test.contains(unknown.result.error, "Use: get_org,")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
