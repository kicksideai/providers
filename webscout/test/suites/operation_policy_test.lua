local test = require("test")
local policy = require("operation_policy")
type Map = { [string]: any }

local function bounds(): Map
    return {
        version = "SourceOperationControlBounds/v1",
        policy_ref = "webscout-host",
        revision = "r1",
        operation_id = "page_read",
        limits = {
            max_results = { minimum = 1, maximum = 10 },
            timeout_seconds = { minimum = 1, maximum = 60 },
        },
        catalog = {
            page_size = { minimum = 1, maximum = 10 },
            max_provider_calls = { minimum = 1, maximum = 10 },
            max_provider_pages = { minimum = 1, maximum = 10 },
        },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 3600 } },
        storage = {
            limit_chars = { minimum = 1, maximum = 100000 },
            retention = { max_age_seconds = { minimum = 1, maximum = 86400 } },
        },
        controls = { response_body_bytes = { minimum = 1, maximum = 1000000 } },
    }
end

local function define_tests()
    test.describe("WebScout operation policy", function()
        test.it("requires a trusted bounds document and receipts both policy digests", function()
            local trusted_bounds, bounds_err = policy.with_bounds_digest(bounds())
            test.is_nil(bounds_err)
            local control, control_err = policy.validate_bounds(trusted_bounds)
            test.is_nil(control_err)
            local effective, effective_err = policy.validate({
                version = "SourceOperationPolicy/v1", policy_id = "owner-web", revision = "r1",
                source_binding_id = "kickside.webscout.research:source", operation_id = "page_read",
                limits = { max_results = 1, timeout_seconds = 10 },
                storage = { mode = "bounded", limit_chars = 1000, retention = { class = "source_specific", max_age_seconds = 3600 } },
                controls = { response_body_bytes = 50000 },
            }, { operation_id = "page_read", control_bounds = control, limits = true, storage = true, controls = true })
            test.is_nil(effective_err)
            test.not_nil(effective)
            local receipt = policy.receipt(effective :: Map)
            test.eq(receipt.bounds_policy_digest, control.digest)
            test.eq(type(receipt.effective_policy_digest), "string")
        end)

        test.it("rejects missing and tampered control bounds", function()
            local _, missing_err = policy.validate_bounds(nil)
            test.contains(tostring(missing_err), "required")
            local raw = bounds()
            local bounded_raw = policy.with_bounds_digest(raw)
            raw = bounded_raw :: Map
            raw.digest = "sha256:tampered"
            local _, digest_err = policy.validate_bounds(raw)
            test.contains(tostring(digest_err), "does not match")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
