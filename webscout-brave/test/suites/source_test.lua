local test = require("test")
local source = require("source")
local operation_policy = require("operation_policy")

type JsonMap = { [string]: unknown }
type HttpResponse = { status_code: number, body: unknown }

local CAPABILITIES = {
    company_discovery = "market.company.discovery",
    prospect_context = "prospect.current_context",
    person_context = "person.current_context",
    product_proof = "product.relevant_proof",
    relationship_context = "relationship.external_context",
    company_news = "company.news.discovery",
}

local FRESHNESS = "year"
local SAFE_SEARCH = "moderate"

-- One caller-owned envelope per request: host-installed bounds, the owner's
-- selection within them, and an input that matches that selection. The Source
-- rejects anything else, so the fixture has to build all three.
local function request(operation: string, query: string, limits: JsonMap?): JsonMap
    local requested = limits or {}
    local raw_bounds: JsonMap = {
        version = "SourceOperationControlBounds/v1", policy_ref = "webscout-brave-fixture",
        revision = "r1", operation_id = operation,
        limits = { max_results = { minimum = 1, maximum = 20 }, timeout_seconds = { minimum = 1, maximum = 60 } },
        catalog = { page_size = { minimum = 1, maximum = 20 }, max_provider_calls = { minimum = 1, maximum = 10 }, max_provider_pages = { minimum = 1, maximum = 10 } },
        lifecycle = { stale_after_seconds = { minimum = 1, maximum = 3600 } },
        storage = { limit_chars = { minimum = 1, maximum = 100000 }, retention = { max_age_seconds = { minimum = 1, maximum = 86400 } } },
        controls = { response_body_bytes = { minimum = 1, maximum = 1000000 } },
        search = { freshness = { "day", "week", "month", "year" }, safe_search = { "off", "moderate", "strict" } },
    }
    local bounds, bounds_err = operation_policy.with_bounds_digest(raw_bounds)
    if bounds_err or not bounds then return {} end
    local effective: JsonMap = {
        version = "SourceOperationPolicy/v1", policy_id = "webscout-brave-fixture", revision = "r1",
        source_binding_id = "kickside.webscout.providers.brave:source", operation_id = operation,
        limits = { max_results = requested.max_results or 8, timeout_seconds = 10 },
        storage = { mode = "bounded", limit_chars = 30000, retention = { class = "source_specific", max_age_seconds = 3600 } },
        controls = { response_body_bytes = 50000 },
        search = { freshness = FRESHNESS, safe_search = SAFE_SEARCH },
    }
    return {
        input = {
            case_id = "case-brave-fixture",
            idempotency_key = "case-brave-fixture:probe:1",
            operation = operation,
            capability = CAPABILITIES[operation],
            subject = { kind = "company", ref = "company-fixture" },
            input = { query = query, user_agent = "Kickside-WebScout-Fixture/1", freshness = FRESHNESS, safe_search = SAFE_SEARCH },
            limits = requested,
        },
        config = { control_bounds = bounds, operation_policy = effective },
    }
end

local function error_code(value: unknown): string
    return type(value) == "table" and tostring((value :: JsonMap).code or "") or ""
end

local function define_tests()
    test.describe("Brave Research Source", function()
        test.it("normalizes bounded web discovery without exposing its credential", function()
            local result, run_err = source.run(request("prospect_context", "Fixture Systems current initiatives", { max_results = 4 }), {
                get = function(url: string, options: unknown): (HttpResponse?, string?)
                    test.contains(url, "/web/search?")
                    test.contains(url, "count=4")
                    test.eq((options :: JsonMap).headers["X-Subscription-Token"], "fixture-key")
                    return { status_code = 200, body = { web = { results = {
                        { title = "Fixture Systems", url = "https://fixture.example.test/current", description = "Current public context.", profile = { long_name = "fixture.example.test" } },
                    } } } }, nil
                end,
            }, "fixture-key")
            test.is_nil(run_err)
            test.eq(result.source_id, "kickside.webscout.providers.brave:source")
            test.eq(result.artifacts[1].content.provider, "brave")
            test.eq(result.retrieval.transport, "brave")
            test.is_nil(result.artifacts[1].content.api_key)
        end)

        test.it("uses the news index for company coverage", function()
            local result, run_err = source.run(request("company_news", "Fixture Systems", {}), {
                get = function(url: string, _options: unknown): (HttpResponse?, string?)
                    test.contains(url, "/news/search?")
                    return { status_code = 200, body = { results = {
                        { title = "Fixture Systems announces expansion", url = "https://news.example.test/fixture", description = "Attributable coverage.", page_age = "2026-07-30T12:00:00Z" },
                    } } }, nil
                end,
            }, "fixture-key")
            test.is_nil(run_err)
            test.eq(result.operation, "company_news")
            test.eq(result.artifacts[1].content.result_kind, "news")
            test.eq(result.artifacts[1].published_at, "2026-07-30T12:00:00Z")
        end)

        test.it("uses the web index for market company discovery", function()
            local result, run_err = source.run(request("company_discovery", "legal analytics platform companies", {}), {
                get = function(url: string, _options: unknown): (HttpResponse?, string?)
                    test.contains(url, "/web/search?")
                    return { status_code = 200, body = { web = { results = {
                        { title = "Fixture Analytics", url = "https://analytics.example.test", description = "Legal analytics software." },
                    } } } }, nil
                end,
            }, "fixture-key")
            test.is_nil(run_err)
            test.eq(result.operation, "company_discovery")
            test.eq(result.artifacts[1].subject_refs[1].ref, "company-fixture")
        end)

        test.it("requires canonical ownership and an explicit key", function()
            local missing, missing_err = source.run(request("company_news", "Fixture Systems", {}))
            test.is_nil(missing)
            test.eq(error_code(missing_err), "connection_not_configured")
            local malformed, malformed_err = source.run({ input = {
                operation = "company_news",
                capability = "company.news.discovery",
                input = { query = "Fixture Systems" },
                limits = {},
            } }, nil, "fixture-key")
            test.is_nil(malformed)
            test.eq(error_code(malformed_err), "invalid_input")
        end)

        test.it("returns bounded typed failures for throttling and access denial", function()
            local rate, rate_err = source.run(request("company_news", "Fixture Systems", {}), {
                get = function(_url: string, _options: unknown): (HttpResponse?, string?)
                    return { status_code = 429, body = "" }, nil
                end,
            }, "fixture-key")
            test.is_nil(rate)
            test.eq(error_code(rate_err), "rate_limited")

            local denied, denied_err = source.run(request("company_news", "Fixture Systems", {}), {
                get = function(_url: string, _options: unknown): (HttpResponse?, string?)
                    return { status_code = 403, body = "" }, nil
                end,
            }, "fixture-key")
            test.is_nil(denied)
            test.eq(error_code(denied_err), "access_denied")
        end)

        test.it("rejects empty attributable results", function()
            local empty, empty_err = source.run(request("company_news", "Fixture Systems", {}), {
                get = function(_url: string, _options: unknown): (HttpResponse?, string?)
                    return { status_code = 200, body = { results = {} } }, nil
                end,
            }, "fixture-key")
            test.is_nil(empty)
            test.eq(error_code(empty_err), "no_attributable_results")
        end)

        test.it("does not promote private search result URLs to evidence", function()
            local result, run_err = source.run(request("company_discovery", "Fixture Systems", {}), {
                get = function(_url: string, _options: unknown): (HttpResponse?, string?)
                    return { status_code = 200, body = { web = { results = {
                        { title = "Internal", url = "http://127.0.0.1/admin", description = "private" },
                        { title = "Public", url = "https://fixture.example.test/public", description = "public" },
                    } } } }, nil
                end,
            }, "fixture-key")
            test.is_nil(run_err)
            test.eq(#result.artifacts, 1)
            test.eq(result.artifacts[1].canonical_uri, "https://fixture.example.test/public")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
