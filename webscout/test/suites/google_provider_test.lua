local test = require("test")
local search = require("search")
local available = require("available")

-- The Google provider's own two functions: the gate that says whether it can
-- serve a query, and the call that builds the request and reads the answer.
-- Neither had ever been exercised -- the dispatcher's tests replace them with a
-- stub and prove only that the right id was called -- and neither can be
-- exercised live: the Custom Search JSON API has been closed to new clients
-- since January 2026 and shuts down on 2027-01-01. A scripted client is
-- therefore not a convenience here, it is the only instrument there is.
--
-- Google's credentials predate the provider protocol and stay in the WebScout
-- core namespace, which is why the reader below answers on a bare key with no
-- namespace, unlike Brave's.

local API_KEY = "fixture-api-key"
local ENGINE_ID = "fixture-engine-id"

-- A config reader over a table of values, recording what it was asked.
local function config_of(values, asked)
    return {
        get = function(key, namespace)
            asked[#asked + 1] = { key = key, namespace = namespace }
            return values[key]
        end,
    }
end

local function both()
    return { google_search_api_key = API_KEY, google_search_engine_id = ENGINE_ID }
end

local function responder(status, body, seen)
    return {
        get = function(url, options)
            seen.url = url
            seen.options = options
            return { status_code = status, body = body }, nil
        end,
    }
end

local ARGS = {
    query = "fixture systems hiring",
    num = 4,
    offset = 10,
    max_response_body = 2048,
    timeout = 12,
    user_agent = "WebScout/1.0",
}

local BODY = [[{"searchInformation":{"totalResults":"1270"},"items":[
  {"title":"Fixture Systems","link":"https://fixture.example/current","snippet":"Current public context.","displayLink":"fixture.example"},
  {"title":"Fixture careers","link":"https://careers.example/fixture","snippet":"Open roles.","displayLink":"careers.example"}
]}]]

local function define_tests()
    test.describe("Google search provider", function()
        test.it("is configured only when BOTH the key and the engine id are set", function()
            -- Two required values against Brave's one, and the descriptor's
            -- available_func answers with a single boolean: a gate that reads
            -- only the key would call a provider that cannot search.
            local asked: any = {}
            test.eq(available.available(nil, config_of(both(), asked)).available, true)

            local only_key: any = {}
            test.eq(
                available.available(nil, config_of({ google_search_api_key = API_KEY }, only_key)).available,
                false
            )

            local only_engine: any = {}
            test.eq(
                available.available(nil, config_of({ google_search_engine_id = ENGINE_ID }, only_engine)).available,
                false
            )

            local neither: any = {}
            test.eq(available.available(nil, config_of({}, neither)).available, false)
        end)

        test.it("refuses to search when either credential is missing, and says which", function()
            local asked: any = {}
            local _, no_key = search.search(ARGS, {
                config = config_of({ google_search_engine_id = ENGINE_ID }, asked),
                client = responder(200, BODY, {}),
            })
            test.contains(no_key, "API key not configured")

            local _, no_engine = search.search(ARGS, {
                config = config_of({ google_search_api_key = API_KEY }, asked),
                client = responder(200, BODY, {}),
            })
            test.contains(no_engine, "Engine ID not configured")
        end)

        test.it("builds the Custom Search request from the settings and the arguments", function()
            local seen: any = {}
            local asked: any = {}
            search.search(ARGS, { config = config_of(both(), asked), client = responder(200, BODY, seen) })

            test.contains(seen.url, "https://www.googleapis.com/customsearch/v1?")
            test.contains(seen.url, "key=" .. API_KEY)
            test.contains(seen.url, "cx=" .. ENGINE_ID)
            -- The query is encoded, not pasted: a space in it would otherwise
            -- end the URL at the first word. `encode_uri` spells a space `+`,
            -- the form encoding, which is what a query string takes.
            test.contains(seen.url, "q=fixture+systems+hiring")
            test.contains(seen.url, "num=4")
            test.contains(seen.url, "start=11")

            -- Transport values travel only because this caller owns them; with
            -- none the client applies the deployment's own.
            test.eq(seen.options.max_response_body, 2048)
            test.eq(seen.options.timeout, 12)
            test.eq(seen.options.headers["User-Agent"], "WebScout/1.0")

            local bare: any = {}
            search.search({ query = "q", num = 1, offset = 0 }, {
                config = config_of(both(), asked),
                client = responder(200, BODY, bare),
            })
            test.is_nil(bare.options.headers)
            test.is_nil(bare.options.timeout)
        end)

        test.it("reports whether Google offers a next page", function()
            local asked: any = {}
            local more = search.search(ARGS, { config = config_of(both(), asked), client = responder(200,
                [[{"queries":{"nextPage":[{"startIndex":15}]},"items":[{"title":"A","link":"https://a.example/"}]}]], {}) })
            test.is_true(more.has_more)
            local last = search.search(ARGS, { config = config_of(both(), asked), client = responder(200, BODY, {}) })
            test.is_false(last.has_more)
        end)

        test.it("normalizes a successful answer into the shared result shape", function()
            local seen: any = {}
            local asked: any = {}
            local result, err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = responder(200, BODY, seen),
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.query, ARGS.query)
            test.eq(result.count, 2)
            test.eq(result.total_results, "1270")
            test.eq(result.results[1].title, "Fixture Systems")
            test.eq(result.results[1].link, "https://fixture.example/current")
            test.eq(result.results[1].snippet, "Current public context.")
            test.eq(result.results[1].displayLink, "fixture.example")
            test.eq(result.results[2].link, "https://careers.example/fixture")
        end)

        test.it("answers an empty result set as a search that found nothing", function()
            -- Not an error: the query ran and the index had nothing. The
            -- dispatcher and the Research Source tell those apart, so this
            -- must not arrive as a failure.
            local seen: any = {}
            local asked: any = {}
            local result, err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = responder(200, '{"searchInformation":{"totalResults":"0"}}', seen),
            })
            test.is_nil(err)
            test.not_nil(result)
            test.eq(result.count, 0)
            test.eq(#result.results, 0)
        end)

        test.it("keeps a provider refusal as a result and reserves unavailable for outages", function()
            local asked: any = {}
            local rejected, http_err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = responder(429, "", {}),
            })
            test.is_nil(http_err)
            test.eq(rejected.success, false)
            test.eq(rejected.status_code, 429)
            test.contains(rejected.error, "Search API error: 429")

            local _, transport_err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = { get = function() return nil, "connection refused" end },
            })
            test.is_true(errors.is(transport_err, errors.UNAVAILABLE))
            test.contains(transport_err:message(), "Search request failed: connection refused")

            local _, outage_err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = responder(503, "", {}),
            })
            test.not_nil(outage_err)
            test.eq(outage_err:details().status_code, 503)
            test.eq(outage_err:kind(), errors.UNAVAILABLE)

            local _, parse_err = search.search(ARGS, {
                config = config_of(both(), asked),
                client = responder(200, "not json at all", {}),
            })
            test.contains(parse_err, "Failed to parse search results")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
