local test = require("test")
local search = require("search")
local available = require("available")

local PROVIDER_TYPE = "kickside.webscout:search_provider"
local SETTINGS_NS = "kickside.webscout.providers.brave"

-- A config reader that answers one namespace only and records what it was
-- asked, so a test can prove the key is read from this provider's own namespace
-- and not from the WebScout core one.
local function config_of(value, asked)
    return {
        get = function(key, namespace)
            asked[#asked + 1] = { key = key, namespace = namespace }
            if namespace == SETTINGS_NS and key == "api_key" then return value end
            return nil
        end,
    }
end

local function responder(body, seen)
    return {
        get = function(url, options)
            seen.url = url
            seen.options = options
            return { status_code = 200, body = body }, nil
        end,
    }
end

local ARGS = {
    query = "fixture systems hiring",
    num = 4,
    offset = 0,
    max_response_body = 2048,
    timeout = 12,
    user_agent = "WebScout/1.0",
}

local BODY = [[{"web":{"results":[
  {"title":"Fixture Systems","url":"https://fixture.example/current","description":"Current public context.","profile":{"long_name":"fixture.example"}},
  {"title":"Fixture careers","url":"https://careers.example/fixture","description":"Open roles."},
  {"title":"No link here","description":"Dropped because it has no URL."}
]}}]]

local function define_tests()
    test.describe("Brave search provider", function()
        test.it("publishes module documentation through its definition", function()
            local registry = require("registry")
            local entry, err = registry.get("kickside.webscout.providers.brave:definition")
            test.is_nil(err)
            test.not_nil(entry)
            test.contains(tostring(entry.data.readme), "# kickside/webscout-brave")
            test.contains(tostring(entry.data.readme), "kickside.webscout:search_provider")
            test.contains(tostring(entry.data.readme), "api_key")
            local dependency, dep_err = registry.get("kickside.webscout.providers.brave:dep.kickside.webscout")
            test.is_nil(dep_err)
            test.eq(dependency.data.version, "*")
        end)

        test.it("declares the descriptor the WebScout protocol reads", function()
            local registry = require("registry")
            local entries, err = registry.find({
                [".kind"] = "registry.entry",
                ["meta.type"] = PROVIDER_TYPE,
            })
            test.is_nil(err)
            -- Against the real registry, with the core mounted beside this
            -- module: the descriptor read here is the one the module declares,
            -- and WebScout's own Google descriptor is visible next to it.
            local d: any, core: any = nil, nil
            for _, entry in ipairs(entries) do
                if (entry.data :: any).id == "brave" then d = entry.data end
                if (entry.data :: any).id == "google" then core = entry.data end
            end
            test.not_nil(core)
            test.not_nil(d)
            test.eq(d.id, "brave")
            test.eq(d.label, "Brave")
            test.eq(d.search_func, "kickside.webscout.providers.brave:search")
            test.eq(d.available_func, "kickside.webscout.providers.brave:available")
            test.eq(d.settings_ns, SETTINGS_NS)
            test.eq(d.max_results, 20)
            -- Brave is not the default: WebScout ships Google marked default and
            -- installing this module must not move the selection by itself.
            test.is_nil(d.default)
        end)

        test.it("reads its key from its own settings namespace", function()
            local asked: any = {}
            test.eq(available.available(nil, config_of("token", asked)).available, true)
            test.eq(asked[1].namespace, SETTINGS_NS)
            test.eq(asked[1].key, "api_key")

            local empty: any = {}
            test.eq(available.available(nil, config_of(nil, empty)).available, false)
        end)

        test.it("says so when the key is not set, before any request", function()
            local asked: any = {}
            local seen: any = {}
            local result, err = search.search(ARGS, {
                config = config_of(nil, asked),
                client = responder(BODY, seen),
            })
            test.is_nil(result)
            test.contains(err, "not configured")
            test.is_nil(seen.url)
        end)

        test.it("normalizes Brave results into the shared search result shape", function()
            local asked: any = {}
            local seen: any = {}
            local result, err = search.search(ARGS, {
                config = config_of("token", asked),
                client = responder(BODY, seen),
            })
            test.is_nil(err)
            test.contains(seen.url, "/res/v1/web/search?")
            test.contains(seen.url, "count=4")
            test.eq(seen.options.headers["X-Subscription-Token"], "token")
            test.eq(seen.options.headers["User-Agent"], "WebScout/1.0")
            test.eq(seen.options.timeout, 12)
            test.eq(seen.options.max_response_body, 2048)

            test.eq(result.query, "fixture systems hiring")
            test.eq(result.count, 2)
            test.eq(#result.results, 2)
            test.eq(result.results[1].title, "Fixture Systems")
            test.eq(result.results[1].link, "https://fixture.example/current")
            test.eq(result.results[1].snippet, "Current public context.")
            test.eq(result.results[1].displayLink, "fixture.example")
            -- No profile on the second row: the host is taken from the URL.
            test.eq(result.results[2].displayLink, "careers.example")
            -- The credential never travels back out with the results.
            test.is_nil(result.api_key)
        end)

        test.it("starts each page at the requested result offset and reports more results", function()
            local seen: any = {}
            local more = search.search({ query = "q", num = 4, offset = 8 }, {
                config = config_of("token", {}),
                client = responder([[{"query":{"more_results_available":true},"web":{"results":[{"title":"A","url":"https://a.example/"}]}}]], seen),
            })
            test.contains(seen.url, "count=4")
            test.contains(seen.url, "offset=2")
            test.is_true(more.has_more)
            search.search({ query = "q", num = 4, offset = 10 }, { config = config_of("token", {}), client = responder(BODY, seen) })
            test.contains(seen.url, "count=2")
            test.contains(seen.url, "offset=5")
            local last = search.search(ARGS, { config = config_of("token", {}), client = responder(BODY, {}) })
            test.is_false(last.has_more)
        end)

        test.it("reports a provider error rather than returning a partial answer", function()
            local asked: any = {}
            local result, err = search.search(ARGS, {
                config = config_of("token", asked),
                client = { get = function() return { status_code = 429, body = "" }, nil end },
            })
            test.is_nil(result)
            test.contains(err, "429")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
