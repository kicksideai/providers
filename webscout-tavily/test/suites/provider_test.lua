local test = require("test")
local json = require("json")
local search = require("search")
local available = require("available")

local PROVIDER_TYPE = "kickside.webscout:search_provider"
local SETTINGS_NS = "kickside.webscout.providers.tavily"

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

local function responder(status, body, seen)
    return {
        post = function(url, options)
            seen.url = url
            seen.options = options
            return { status_code = status, body = body }, nil
        end,
    }
end

local ARGS = {
    query = "open source workflow automation platform written in Go",
    num = 4,
    offset = 0,
    max_response_body = 2048,
    timeout = 12,
    user_agent = "WebScout/1.0",
}

local function run_search(status, body, seen)
    return search.search(ARGS, {
        config = config_of("token", {}),
        client = responder(status, body, seen or {}),
    })
end

-- Three rows from a live Tavily answer with domains replaced, plus two
-- synthetic ones: an empty title with no content, and a row without a URL.
local BODY = [[{"query":"open source workflow automation platform written in Go","follow_up_questions":null,"answer":null,"images":[],"results":[
  {"title":"Awesome workflow engines: a curated list of open source workflow engines","url":"https://repo.example/awesome-workflow-engines","score":0.8810534,"raw_content":null,
   "content":"Restate Stars - A low-latency durable execution engine for workflows, event-driven handlers, transactional state machines, and stateful orchestration. Fully self-contained in a single binary."},
  {"title":"Open Source Workflow Engine: Top Tools & Selection Guide","url":"https://engine.example/resources/open-source-workflow-engine","score":0.8302782,"raw_content":null,
   "content":"Windmill is an open-source platform designed for developers to build internal tools, scripts, and workflows. It combines a visual builder with the ability to write scripts in Python, TypeScript, Go, and Bash."},
  {"title":"Open Source Workflow Automation: Capabilities Compared","url":"https://blog.automation.example/open-source-workflow-automation","score":0.79293,"raw_content":null,
   "content":"Temporal is not a visual tool — it's a durable execution engine for code-first teams. Its MIT-licensed server is free to self-host, and you write workflows directly in Go, Java, Python and TypeScript."},
  {"title":"","url":"https://untitled.example/page","score":0.5,"raw_content":null},
  {"title":"No link here","content":"Dropped because it has no URL.","score":0.4}
],"response_time":1.02,"request_id":"00000000-0000-4000-8000-000000000000"}]]

local ERROR_432 = [[{"detail":{"error":"This request exceeds your plan's set usage limit. Please upgrade your plan or contact support@tavily.com"}}]]
local ERROR_422 = [[{"detail":[{"type":"missing","loc":["body","query"],"msg":"Field required","input":{}}]}]]

local function define_tests()
    test.describe("Tavily search provider", function()
        test.it("publishes module documentation through its definition", function()
            local registry = require("registry")
            local entry, err = registry.get("kickside.webscout.providers.tavily:definition")
            test.is_nil(err)
            test.not_nil(entry)
            test.contains(tostring(entry.data.readme), "# kickside/webscout-tavily")
            test.contains(tostring(entry.data.readme), "kickside.webscout:search_provider")
            test.contains(tostring(entry.data.readme), "api_key")
            local dependency, dep_err = registry.get("kickside.webscout.providers.tavily:dep.kickside.webscout")
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
            local d: any, core: any = nil, nil
            for _, entry in ipairs(entries) do
                if (entry.data :: any).id == "tavily" then d = entry.data end
                if (entry.data :: any).id == "google" then core = entry.data end
            end
            test.not_nil(core)
            test.not_nil(d)
            test.eq(d.label, "Tavily")
            test.eq(d.search_func, "kickside.webscout.providers.tavily:search")
            test.eq(d.available_func, "kickside.webscout.providers.tavily:available")
            test.eq(d.settings_ns, SETTINGS_NS)
            test.eq(d.max_results, 20)
            -- Installing this module must not move the selection by itself.
            test.is_nil(d.default)
        end)

        test.it("reads its key from its own settings namespace", function()
            local asked: any = {}
            test.eq(available.available(nil, config_of("token", asked)).available, true)
            test.eq(asked[1].namespace, SETTINGS_NS)
            test.eq(asked[1].key, "api_key")
            test.eq(available.available(nil, config_of(nil, {})).available, false)
        end)

        test.it("says so when the key is not set, before any request", function()
            local seen: any = {}
            local result, err = search.search(ARGS, {
                config = config_of(nil, {}),
                client = responder(200, BODY, seen),
            })
            test.is_nil(result)
            test.contains(err, "not configured")
            test.is_nil(seen.url)
        end)

        test.it("answers one page and refuses to continue from an offset", function()
            local result, err = run_search(200, BODY, {})
            test.is_nil(err)
            test.is_false(result.has_more)
            local seen: any = {}
            local later, later_err = search.search({ query = "q", num = 4, offset = 4 }, {
                config = config_of("token", {}),
                client = responder(200, BODY, seen),
            })
            test.is_nil(later)
            test.contains(later_err, "cannot continue from offset 4")
            test.is_nil(seen.url)
        end)

        test.it("posts the query with basic depth and nothing else", function()
            local seen: any = {}
            local _, err = run_search(200, BODY, seen)
            test.is_nil(err)
            test.eq(seen.url, "https://api.tavily.com/search")
            test.eq(seen.options.headers["Authorization"], "Bearer token")
            test.eq(seen.options.headers["Content-Type"], "application/json")
            test.eq(seen.options.headers["User-Agent"], "WebScout/1.0")
            test.eq(seen.options.timeout, 12)
            test.eq(seen.options.max_response_body, 2048)

            local sent: any = json.decode(seen.options.body)
            local keys = {}
            for key in pairs(sent) do keys[#keys + 1] = key end
            table.sort(keys)
            test.eq(table.concat(keys, ","), "max_results,query,search_depth")
            test.eq(sent.query, ARGS.query)
            test.eq(sent.max_results, 4)
            test.eq(sent.search_depth, "basic")
        end)

        test.it("normalizes Tavily results into the shared search result shape", function()
            local result: any, err = run_search(200, BODY)
            test.is_nil(err)
            test.eq(result.query, ARGS.query)
            -- The row without a URL is dropped.
            test.eq(result.count, 4)
            test.eq(result.total_results, 4)
            test.eq(#result.results, 4)
            local first = result.results[1]
            test.eq(first.title, "Awesome workflow engines: a curated list of open source workflow engines")
            test.eq(first.link, "https://repo.example/awesome-workflow-engines")
            test.contains(first.snippet, "durable execution engine")
            test.eq(first.displayLink, "repo.example")
            test.eq(result.results[3].displayLink, "blog.automation.example")
            -- An empty title falls back to the host, missing content to "".
            test.eq(result.results[4].title, "untitled.example")
            test.eq(result.results[4].snippet, "")
            test.is_nil(first.score)
            test.is_nil(result.api_key)
        end)

        test.it("drops a row whose URL has no host instead of failing the search", function()
            local body = json.encode({ results = {
                { title = "", url = "https:///path", content = "No host." },
                { title = "Kept", url = "https://kept.example/", content = "Kept." },
            } })
            local result: any, err = run_search(200, body)
            test.is_nil(err)
            test.eq(result.count, 1)
            test.eq(result.results[1].link, "https://kept.example/")
        end)

        test.it("treats an empty result list as an answer, not an error", function()
            local result: any, err = run_search(200, [[{"query":"x","results":[]}]])
            test.is_nil(err)
            test.eq(result.count, 0)
            test.eq(#result.results, 0)
        end)

        test.it("returns the full title, snippet and error detail", function()
            local long = string.rep("я", 4001)
            local title = string.rep("Workflow engines ", 40)
            local body = json.encode({ results = { { title = title, url = "https://long.example/", content = long } } })
            local result: any, err = run_search(200, body)
            test.is_nil(err)
            test.eq(result.results[1].snippet, long)
            test.eq(result.results[1].title, title)
            local detail = string.rep("Quota detail. ", 30)
            local _, error_text = run_search(429, json.encode({ detail = { error = detail } }))
            test.eq(error_text, "Search API error: 429: " .. detail)
        end)

        test.it("names the exhausted monthly credits on 432", function()
            local result, err = run_search(432, ERROR_432)
            test.is_nil(result)
            test.contains(err, "Tavily monthly credit limit reached (432)")
            test.contains(err, "exceeds your plan's set usage limit")
        end)

        test.it("reports a provider error with its detail and no partial answer", function()
            local result, err = run_search(422, ERROR_422)
            test.is_nil(result)
            test.eq(err, "Search API error: 422: Field required")

            local _, err429 = run_search(429, [[{"detail":{"error":"Rate limit exceeded"}}]])
            test.eq(err429, "Search API error: 429: Rate limit exceeded")

            local _, err500 = run_search(500, "Internal Server Error")
            test.eq(err500, "Search API error: 500")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
