local test = require("test")
local source = require("source")
local policy = require("operation_policy")

type Map = { [string]: any }

local function copy(value: any): any
    if type(value) ~= "table" then return value end
    local result: Map = {}
    for key, item in pairs(value :: Map) do result[key] = copy(item) end
    return result
end

local function bounds(): Map
    local raw: Map = {
        version = "SourceOperationControlBounds/v1", policy_ref = "webscout-source-test",
        revision = "r1", operation_id = "prospect_context",
        limits = { max_results = { minimum = 1, maximum = 10 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        catalog = { page_size = { minimum = 1, maximum = 10 }, max_provider_calls = { minimum = 1, maximum = 10 }, max_provider_pages = { minimum = 1, maximum = 10 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 3600 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { max_age_seconds = { minimum = 1, maximum = 86400 } } },
        controls = { response_body_bytes = { minimum = 1, maximum = 1000000 } },
    }
    local bounded, bounded_err = policy.with_bounds_digest(raw)
    if bounded_err or not bounded then return {} end
    return bounded :: Map
end

local function owner_policy(max_results: number): Map
    return {
        version = "SourceOperationPolicy/v1", policy_id = "webscout-owner", revision = "r1",
        source_binding_id = "kickside.webscout.research:source", operation_id = "prospect_context",
        limits = { max_results = max_results, timeout_seconds = 10 },
        storage = { mode = "bounded", limit_chars = 1000, retention = { class = "source_specific", max_age_seconds = 3600 } },
        controls = { response_body_bytes = 50000 },
    }
end

local function input(): Map
    return { case_id = "case-source-test", idempotency_key = "case-source-test:1",
        operation = "prospect_context", capability = "prospect.current_context",
        subject = { kind = "company", ref = "company-source-test" },
        input = { query = "fixture", user_agent = "Kickside-WebScout-Test/1" } }
end

local function define_tests()
    test.describe("WebScout production source policy", function()
        test.it("fails closed when the installed policy envelope is missing", function()
            local result, run_err = source.run({ input = input() })
            test.is_nil(result)
            test.contains(tostring(run_err.message), "config")
        end)

        test.it("fails closed for stale control receipts and out-of-bounds owner values", function()
            local control = bounds()
            local valid = { input = input(), config = { control_bounds = control, operation_policy = owner_policy(3) } }
            local stale_control = copy(control)
            stale_control.digest = "sha256:stale"
            local stale, stale_err = source.run({ input = input(), config = { control_bounds = stale_control, operation_policy = owner_policy(3) } })
            test.is_nil(stale)
            test.contains(tostring(stale_err.message), "does not match")

            local out_of_bounds, bounds_err = source.run({ input = input(), config = { control_bounds = control, operation_policy = owner_policy(11) } })
            test.is_nil(out_of_bounds)
            test.contains(tostring(bounds_err.message), "between")

            local result, run_err = source.run(valid, {
                call = function(_function_id: string, _request: any)
                    return { results = { { title = "Fixture", link = "https://example.test", snippet = "fixture", displayLink = "example.test" } } }, nil
                end,
            })
            test.is_nil(run_err)
            test.eq(result.receipt.policy_receipt.bounds_policy_digest, control.digest)
            test.eq(result.receipt.control_receipt.digest, control.digest)
        end)

        test.it("binds every requested limit and operation to the owner policy", function()
            local control = bounds()
            local good_input = input()
            good_input.limits = { max_results = 3, timeout_seconds = 10 }
            local result, run_err = source.run({
                input = good_input,
                config = { control_bounds = control, operation_policy = owner_policy(3) },
            }, {
                call = function(_function_id: string, _request: any)
                    return { results = { { title = "Fixture", link = "https://example.test", snippet = "fixture", displayLink = "example.test" } } }, nil
                end,
            })
            test.is_nil(run_err)
            test.not_nil(result)

            local mismatched = copy(good_input)
            mismatched.limits.timeout_seconds = 11
            local rejected, rejected_err = source.run({
                input = mismatched,
                config = { control_bounds = control, operation_policy = owner_policy(3) },
            })
            test.is_nil(rejected)
            test.contains(tostring(rejected_err.message), "match operation_policy")

            local wrong_operation = owner_policy(3)
            wrong_operation.operation_id = "company_discovery"
            local wrong, wrong_err = source.run({
                input = good_input,
                config = { control_bounds = control, operation_policy = wrong_operation },
            })
            test.is_nil(wrong)
            test.contains(tostring(wrong_err.message), "operation_id")
        end)

        test.it("fails closed when the owner omits storage or retention policy", function()
            local control = bounds()
            local incomplete = owner_policy(3)
            incomplete.storage = nil
            local result, run_err = source.run({
                input = input(),
                config = { control_bounds = control, operation_policy = incomplete },
            })
            test.is_nil(result)
            test.contains(tostring(run_err.message), "storage")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
