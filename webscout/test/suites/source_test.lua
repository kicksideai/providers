local test = require("test")
local source = require("source")
local operation_policy = require("operation_policy")

type JsonMap = { [string]: unknown }

local CAPABILITIES = {
    company_discovery = "market.company.discovery",
    prospect_context = "prospect.current_context",
    person_context = "person.current_context",
    product_proof = "product.relevant_proof",
    relationship_context = "relationship.external_context",
    page_read = "web.page.read",
    site_links = "web.site.links",
}

local function request(
    operation: string,
    subject: JsonMap,
    operation_input: JsonMap,
    limits: JsonMap?
): JsonMap
    local requested = limits or {}
    local max_results = requested.max_results or requested.max_links or 3
    local max_content = requested.max_content_chars or 30000
    local raw_bounds: JsonMap = {
        version = "SourceOperationControlBounds/v1", policy_ref = "webscout-fixture",
        revision = "r1", operation_id = operation,
        limits = { max_results = { minimum = 1, maximum = 10 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        catalog = { page_size = { minimum = 1, maximum = 10 }, max_provider_calls = { minimum = 1, maximum = 10 }, max_provider_pages = { minimum = 1, maximum = 10 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 3600 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { max_age_seconds = { minimum = 1, maximum = 86400 } } },
        controls = { response_body_bytes = { minimum = 1, maximum = 1000000 } },
    }
    local bounds, bounds_err = operation_policy.with_bounds_digest(raw_bounds)
    if bounds_err or not bounds then return {} end
    local effective = {
        version = "SourceOperationPolicy/v1", policy_id = "webscout-fixture", revision = "r1",
        source_binding_id = "kickside.webscout.research:source", operation_id = operation,
        limits = { max_results = max_results, timeout_seconds = 10 },
        storage = { mode = "bounded", limit_chars = max_content, retention = { class = "source_specific", max_age_seconds = 3600 } },
        controls = { response_body_bytes = 50000 },
    }
    return {
        input = {
            case_id = "case-fixture",
            idempotency_key = "case-fixture:probe:1",
            operation = operation,
            capability = CAPABILITIES[operation],
            subject = subject,
            input = (function()
                local copy: JsonMap = {}
                for key, value in pairs(operation_input) do copy[key] = value end
                copy.user_agent = "Kickside-WebScout-Fixture/1"
                return copy
            end)(),
            limits = requested,
        },
        config = { control_bounds = bounds, operation_policy = effective },
    }
end

local function error_code(value: unknown): string
    return type(value) == "table" and tostring((value :: JsonMap).code or "") or ""
end

local function error_message(value: unknown): string
    return type(value) == "table" and tostring((value :: JsonMap).message or "") or tostring(value or "")
end

local function define_tests()
    test.describe("WebScout Research Source", function()
        test.it("returns closed attributable artifacts without exposing credentials", function()
            local result, run_err = source.run(request(
                "prospect_context",
                { kind = "company", ref = "company-fixture", names = { "Fixture Systems" } },
                { query = "Example organization current product" },
                { max_results = 3 }
            ), {
                call = function(function_id, call_input)
                    test.eq(function_id, "kickside.webscout.traits:search")
                    test.eq((call_input :: JsonMap).num, 3)
                    return {
                        results = {
                            {
                                title = "Example result",
                                link = "https://example.invalid/current",
                                snippet = "Current attributable information.",
                                displayLink = "example.invalid",
                            },
                        },
                    }, nil
                end,
            })
            test.is_nil(run_err)
            test.eq(result.source_id, "kickside.webscout.research:source")
            test.eq(result.operation, "prospect_context")
            test.eq(#result.artifacts, 1)
            test.eq(result.artifacts[1].canonical_uri, "https://example.invalid/current")
            test.eq(result.artifacts[1].subject_refs[1].ref, "company-fixture")
            test.eq(result.retrieval.transport, "http")
            test.eq(result.retrieval.escalatable, false)
            test.is_nil(result.artifacts[1].content.api_key)
        end)

        test.it("uses the same provider-neutral search transport for market discovery", function()
            local result, run_err = source.run(request(
                "company_discovery",
                { kind = "market", ref = "market-fixture" },
                { query = "legal operations software companies" },
                { max_results = 2 }
            ), {
                call = function(function_id, call_input)
                    test.eq(function_id, "kickside.webscout.traits:search")
                    test.eq((call_input :: JsonMap).query, "legal operations software companies")
                    return { results = {{
                        title = "Fixture Legal",
                        link = "https://legal.example.test",
                        snippet = "Legal operations software.",
                        displayLink = "legal.example.test",
                    }}}, nil
                end,
            })
            test.is_nil(run_err)
            test.eq(result.operation, "company_discovery")
            test.eq(result.artifacts[1].subject_refs[1].kind, "market")
        end)

        test.it("rejects undeclared operations and capability mismatches before calling the provider", function()
            -- Built through the helper so the envelope carries a policy: the
            -- Source checks config BEFORE the operation name, so a probe with
            -- no config tests the policy gate rather than the operation check.
            local unsupported = request(
                "arbitrary",
                { kind = "company", ref = "company-fixture" },
                { query = "ignored" }
            )
            unsupported.input.idempotency_key = "probe-unsupported"
            unsupported.input.capability = "web.search"
            local _, unsupported_err = source.run(unsupported)
            test.eq(error_code(unsupported_err), "invalid_input")
            test.contains(error_message(unsupported_err), "unsupported")

            local _, capability_err = source.run(request(
                "prospect_context",
                { kind = "company", ref = "company-fixture" },
                { query = "ignored" }
            ))
            -- The helper built the correct capability; mutate the canonical
            -- envelope to prove the provider does not trust caller labels.
            local bad = request("prospect_context", { kind = "company", ref = "company-fixture" }, { query = "ignored" })
            local bad_input = bad.input :: JsonMap
            bad_input.capability = "web.search"
            _, capability_err = source.run(bad)
            test.eq(error_code(capability_err), "invalid_input")
            test.contains(error_message(capability_err), "capability")
        end)

        test.it("requires canonical ownership and rejects provider config overrides", function()
            local without_case = request(
                "prospect_context",
                { kind = "company", ref = "company-fixture" },
                { query = "Fixture" }
            )
            without_case.input.case_id = nil
            local missing, missing_err = source.run(without_case)
            test.is_nil(missing)
            test.eq(error_code(missing_err), "invalid_input")
            test.contains(error_message(missing_err), "case_id")

            local overridden = request(
                "prospect_context",
                { kind = "company", ref = "company-fixture" },
                { query = "Fixture" }
            )
            overridden.config = { connection_id = "other-owner" }
            local _, override_err = source.run(overridden)
            test.eq(error_code(override_err), "invalid_input")
            test.contains(error_message(override_err), "unsupported field")
        end)

        test.it("reports an empty search result as a non-escalatable provider failure", function()
            local result, run_err = source.run(request(
                "prospect_context",
                { kind = "company", ref = "company-fixture" },
                { query = "No attributable result" },
                {}
            ), {
                call = function(_function_id, _call_input) return { results = {} }, nil end,
            })
            test.is_nil(result)
            test.eq(error_code(run_err), "no_attributable_results")
            test.contains(error_message(run_err), "no attributable results")
        end)

        test.it("preserves a provider HTTP rejection in the research outcome", function()
            local result, run_err = source.run(request(
                "prospect_context",
                { kind = "company", ref = "company-fixture" },
                { query = "Rejected search" },
                {}
            ), {
                call = function(_function_id, _call_input)
                    return { success = false, error = "Search API error: 429", status_code = 429 }, nil
                end,
            })
            test.is_nil(result)
            test.eq(error_code(run_err), "rate_limited")
            test.contains(error_message(run_err), "Search API error: 429")
        end)

        test.it("captures full first-party page content with canonical provenance", function()
            local result, run_err = source.run(request(
                "page_read",
                { kind = "company", ref = "company-fixture" },
                { url = "https://example.invalid/about" },
                { max_content_chars = 12000 }
            ), {
                call = function(function_id, call_input)
                    test.eq(function_id, "kickside.webscout.traits:read")
                    test.eq((call_input :: JsonMap).url, "https://example.invalid/about")
                    test.is_nil((call_input :: JsonMap).max_size)
                    return "First-party product and company evidence.", nil
                end,
            })
            test.is_nil(run_err)
            test.eq(result.operation, "page_read")
            test.eq(result.artifacts[1].media_type, "text/plain")
            test.eq(result.artifacts[1].canonical_uri, "https://example.invalid/about")
            test.eq(result.artifacts[1].source_artifact_key, "https://example.invalid/about")
            test.eq(result.artifacts[1].content, "First-party product and company evidence.")
        end)

        test.it("keeps provider page output within the requested content budget", function()
            local result, run_err = source.run(request(
                "page_read",
                { kind = "company", ref = "company-fixture" },
                { url = "https://example.invalid/large" },
                { max_content_chars = 1000 }
            ), {
                call = function(_function_id, _call_input)
                    return string.rep("x", 5000), nil
                end,
            })
            test.is_nil(run_err)
            test.eq(#result.artifacts[1].content <= 1000, true)
            test.contains(result.artifacts[1].content, "[content truncated]")
        end)

        test.it("captures a bounded site link map for follow-up planning", function()
            local result, run_err = source.run(request(
                "site_links",
                { kind = "company", ref = "company-fixture" },
                { url = "https://example.invalid" },
                { max_links = 2 }
            ), {
                call = function(function_id, call_input)
                    test.eq(function_id, "kickside.webscout.traits:links")
                    test.eq((call_input :: JsonMap).absolute_only, true)
                    test.eq((call_input :: JsonMap).limit, 2)
                    return {
                        total_links = 4,
                        links = {
                            "https://example.invalid/product",
                            "https://example.invalid/careers",
                            "https://example.invalid/too-many",
                            "javascript:alert(1)",
                        },
                    }, nil
                end,
            })
            test.is_nil(run_err)
            test.eq(result.operation, "site_links")
            test.eq(result.artifacts[1].content.total_links, 2)
            test.eq(result.artifacts[1].content.links[2], "https://example.invalid/careers")
        end)

        test.it("rejects local/private page targets before transport", function()
            local called = false
            local result, run_err = source.run(request(
                "page_read",
                { kind = "company", ref = "company-fixture" },
                { url = "http://127.0.0.1:8080/admin" }
            ), {
                call = function(_function_id, _call_input)
                    called = true
                    return "should not be fetched", nil
                end,
            })
            test.is_nil(result)
            test.eq(called, false)
            test.eq(error_code(run_err), "invalid_input")
            test.contains(error_message(run_err), "private")
        end)

        test.it("emits only the typed escalation outcomes and keeps access failures closed", function()
            for _, value in ipairs({
                { text = "Google Search API key not configured", code = "connection_not_configured", escalatable = false },
                { text = "enable JavaScript to continue", code = "javascript_required", escalatable = true },
                { text = "dynamic content is not in the static response", code = "dynamic_content", escalatable = true },
                { text = "enable JavaScript after login", code = "login_required", escalatable = false },
                { text = "login required", code = "login_required", escalatable = false },
                { text = "robots.txt disallowed", code = "robots_disallowed", escalatable = false },
                { text = "HTTP status 429", code = "rate_limited", escalatable = false },
                { text = "Page returned status 401", code = "login_required", escalatable = false },
                { text = "not allowed: https://target.example", code = "access_denied", escalatable = false },
                { text = "Access Denied", code = "access_denied", escalatable = false },
            }) do
                local classified = source._test.classify_retrieval_error(value.text)
                test.eq(classified, value.code)
                test.eq(source._test.escalatable_outcomes[classified] == true, value.escalatable)
                test.eq(source._test.non_escalatable_outcomes[classified] == true, not value.escalatable)
            end
        end)

        test.it("rejects the removed direct and unbounded caller shape", function()
            local result, run_err = source.run({ input = {
                operation = "prospect_context", capability = "prospect.current_context",
                subject = { kind = "company", ref = "company-fixture" }, input = { query = "legacy fixture query" },
            } })
            test.is_nil(result)
            test.eq(error_code(run_err), "invalid_input")
            test.contains(error_message(run_err), "config")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
