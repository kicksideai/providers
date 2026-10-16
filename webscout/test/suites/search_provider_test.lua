local test = require("test")
local registry = require("providers")
local dispatch = require("dispatch")

-- Descriptors in the shape registry.find hands over: the declaration's own
-- registry id on `id`, the declared fields under `data`.
local GOOGLE = {
    id = "kickside.webscout.providers.google:provider",
    meta = { type = registry.PROVIDER_TYPE },
    data = {
        id = "google",
        label = "Google",
        icon = "tabler:brand-google",
        search_func = "kickside.webscout.providers.google:search",
        available_func = "kickside.webscout.providers.google:available",
        settings_ns = "kickside.webscout",
        max_results = 10,
        default = true,
        order = 10,
    },
}

-- A second provider, of the kind that arrives as its own module. It is a made-up
-- one on purpose: this module must not name a real provider it does not ship.
local ACME = {
    id = "acme.search:provider",
    meta = { type = registry.PROVIDER_TYPE },
    data = {
        id = "acme",
        label = "Acme",
        search_func = "acme.search:search",
        available_func = "acme.search:available",
        settings_ns = "acme.search",
        max_results = 20,
        order = 20,
    },
}

-- finder answers the provider query only, so a test whose query drifted gets an
-- empty list instead of a pass.
local function finder(entries)
    return function(query)
        if query["meta.type"] ~= registry.PROVIDER_TYPE then return {}, nil end
        return entries, nil
    end
end

-- The real library bound to a fixed entry set, in the shape the dispatcher
-- consumes.
local function installed(entries)
    local find = finder(entries)
    return {
        list = function() return registry.list(find) end,
        resolve = function(id) return registry.resolve(id, find) end,
        default = function() return registry.default(find) end,
        selected = function(value) return registry.selected(value, find) end,
        describe = registry.describe,
    }
end

local function config_of(provider_id)
    return { get = function(key) return key == "search_provider" and provider_id or nil end }
end

-- A funcs.call stub: readiness per availability function id, one recorded call
-- per invocation.
local function caller(available, calls)
    return function(func_id, args)
        calls[#calls + 1] = { func_id = func_id, args = args }
        if available[func_id] ~= nil then return { available = available[func_id] }, nil end
        return { query = args.query, results = {}, count = 0 }, nil
    end
end

local function define_tests()
    test.describe("WebScout search provider discovery", function()
        test.it("finds a descriptor declared the way a provider module ships one", function()
            local providers, err = registry.list()
            test.is_nil(err)
            -- Against the real registry, not a stub finder: discovery sees the
            -- harness fixture AND the descriptor the module itself ships, which
            -- is the point of booting the module rather than a copy of it.
            local fixture: any, shipped: any = nil, nil
            for _, provider in ipairs(providers) do
                if provider.id == "fixture" then fixture = provider end
                if provider.id == "google" then shipped = provider end
            end
            test.not_nil(shipped)
            test.eq(shipped.entry_id, "kickside.webscout.providers.google:provider")
            test.not_nil(fixture)
            test.eq(fixture.entry_id, "app:fixture_provider")
            test.eq(fixture.id, "fixture")
            test.eq(fixture.label, "Fixture")
            test.eq(fixture.search_func, "app:fixture_search")
            test.eq(fixture.available_func, "app:fixture_available")
            test.eq(fixture.settings_ns, "app")
            test.eq(fixture.max_results, 7)
            test.eq(fixture.is_default, true)
        end)

        test.it("normalizes installed descriptors and orders them by declared order", function()
            local providers, err = registry.list(finder({ ACME, GOOGLE }))
            test.is_nil(err)
            test.eq(#providers, 2)
            test.eq(providers[1].id, "google")
            test.eq(providers[2].id, "acme")
            test.eq(providers[1].entry_id, "kickside.webscout.providers.google:provider")
            test.eq(providers[1].label, "Google")
            test.eq(providers[1].search_func, "kickside.webscout.providers.google:search")
            test.eq(providers[1].available_func, "kickside.webscout.providers.google:available")
            test.eq(providers[1].settings_ns, "kickside.webscout")
            test.eq(providers[1].max_results, 10)
            test.eq(providers[1].is_default, true)
            test.eq(providers[2].is_default, false)
        end)

        test.it("names the entry and the field a descriptor leaves out", function()
            local broken = { id = "nowhere.search:provider", data = { id = "nowhere", label = "Nowhere" } }
            local providers, err = registry.list(finder({ broken }))
            test.is_nil(providers)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "nowhere.search:provider")
            test.contains(err:message(), "search_func")
            test.eq(err:details().entry_id, "nowhere.search:provider")
            test.eq(err:details().field, "search_func")
        end)

        test.it("refuses two descriptors claiming the same id", function()
            local twin = { id = "other.search:provider", data = GOOGLE.data }
            local providers, err = registry.list(finder({ GOOGLE, twin }))
            test.is_nil(providers)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "'google'")
            test.contains(err:message(), "other.search:provider")
            test.eq(err:details().id, "google")
        end)

        test.it("resolves by id, and falls back to the declared default", function()
            local find = finder({ GOOGLE, ACME })
            local acme, err = registry.resolve("acme", find)
            test.is_nil(err)
            test.eq(acme.id, "acme")

            local missing, missing_err = registry.resolve("bing", find)
            test.is_nil(missing)
            test.is_true(errors.is(missing_err, errors.NOT_FOUND))
            test.contains(missing_err:message(), "'bing'")

            local default, default_err = registry.default(find)
            test.is_nil(default_err)
            test.eq(default.id, "google")

            local none, none_err = registry.default(finder({}))
            test.is_nil(none)
            test.is_true(errors.is(none_err, errors.UNAVAILABLE))
            test.contains(none_err:message(), "no default search provider installed")
        end)

        test.it("refuses a setting value no installed descriptor claims", function()
            local find = finder({ GOOGLE, ACME })
            test.eq(registry.validate_setting({ key = "search_provider", value = "acme" }, find).valid, true)

            local rejected = registry.validate_setting({ key = "search_provider", value = "bing" }, find)
            test.eq(rejected.valid, false)
            test.contains(rejected.error, "'bing'")
            test.contains(rejected.error, "Google (google)")
            test.contains(rejected.error, "Acme (acme)")

            -- With no finder injected it reads the REAL registry, which is the
            -- path the setting's validate_func takes in a deployment: the stub
            -- above proves the rule, this proves the entry is wired to it.
            test.eq(registry.validate_setting({ key = "search_provider", value = "fixture" }).valid, true)
            local live = registry.validate_setting({ key = "search_provider", value = "bing" })
            test.eq(live.valid, false)
            test.contains(live.error, "Fixture (fixture)")
        end)
    end)

    test.describe("WebScout search dispatch", function()
        local ARGS = {
            query = "kickside gtm",
            num = 6,
            max_response_body = 2048,
            timeout = 12,
            user_agent = "WebScout/1.0",
        }

        test.it("searches from a query alone with the selected provider's result ceiling", function()
            local calls: any = {}
            local result, err = dispatch.handle({ query = "subject-only search" }, {
                config = config_of("acme"), providers = installed({ GOOGLE, ACME }),
                call = caller({ ["acme.search:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(result.query, "subject-only search")
            test.eq(calls[2].args.num, 20)
            test.is_nil(calls[2].args.timeout)
            test.is_nil(calls[2].args.max_response_body)
            test.is_nil(calls[2].args.user_agent)
        end)

        test.it("calls the selected provider's search function with the tool arguments unchanged", function()
            local calls: any = {}
            local result, err = dispatch.handle(ARGS, {
                config = config_of("acme"),
                providers = installed({ GOOGLE, ACME }),
                call = caller({ ["acme.search:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(result.query, "kickside gtm")
            test.eq(#calls, 2)
            test.eq(calls[1].func_id, "acme.search:available")
            test.eq(calls[2].func_id, "acme.search:search")
            test.eq(calls[2].args.query, "kickside gtm")
            test.eq(calls[2].args.num, 6)
            test.eq(calls[2].args.max_response_body, 2048)
            test.eq(calls[2].args.timeout, 12)
            test.eq(calls[2].args.user_agent, "WebScout/1.0")
        end)

        test.it("asks the provider for everything it offers when no count is given", function()
            -- The model can no longer state a count; omitting it must mean the
            -- provider's own ceiling, not some smaller guess.
            local calls: any = {}
            local _, err = dispatch.handle({
                query = "kickside gtm",
                max_response_body = 2048, timeout = 12, user_agent = "WebScout/1.0",
            }, {
                config = config_of("acme"),
                providers = installed({ GOOGLE, ACME }),
                call = caller({ ["acme.search:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(calls[2].args.num, 20)
        end)

        test.it("pages the provider until the requested count and returns the continuation", function()
            local calls: any = {}
            local function paging(func_id: string, args: any): (any, any)
                calls[#calls + 1] = { func_id = func_id, args = args }
                if func_id == "kickside.webscout.providers.google:available" then return { available = true }, nil end
                local results = {}
                for index = 1, args.num do
                    results[index] = { title = "r" .. tostring(args.offset + index), link = "https://example.test/" .. tostring(args.offset + index) }
                end
                return { query = args.query, total_results = "1000", results = results, count = #results, has_more = true }, nil
            end
            local result, err = dispatch.handle({ query = "kickside gtm", num = 25 }, {
                config = config_of("google"), providers = installed({ GOOGLE, ACME }), call = paging,
            })
            test.is_nil(err)
            test.eq(#calls, 4)
            test.eq(calls[2].args.num, 10); test.eq(calls[2].args.offset, 0)
            test.eq(calls[3].args.num, 10); test.eq(calls[3].args.offset, 10)
            test.eq(calls[4].args.num, 5); test.eq(calls[4].args.offset, 20)
            test.eq(result.count, 25)
            test.eq(result.results[25].title, "r25")
            test.eq(result.total_results, "1000")
            test.eq(result.next_cursor, "25")

            calls = {}
            local next_page, next_err = dispatch.handle({ query = "kickside gtm", num = 3, cursor = result.next_cursor }, {
                config = config_of("google"), providers = installed({ GOOGLE, ACME }), call = paging,
            })
            test.is_nil(next_err)
            test.eq(calls[2].args.offset, 25)
            test.eq(next_page.results[1].title, "r26")
            test.eq(next_page.next_cursor, "28")

            local _, cursor_err = dispatch.handle({ query = "kickside gtm", cursor = "page-two" }, {
                config = config_of("google"), providers = installed({ GOOGLE, ACME }), call = paging,
            })
            test.is_true(errors.is(cursor_err, errors.INVALID))
            test.contains(cursor_err:message(), "cursor must be a next_cursor value")
        end)

        test.it("stops where the provider has no more results", function()
            local calls: any = {}
            local result, err = dispatch.handle({ query = "kickside gtm", num = 25 }, {
                config = config_of("google"), providers = installed({ GOOGLE, ACME }),
                call = function(func_id: string, args: any): (any, any)
                    calls[#calls + 1] = { func_id = func_id, args = args }
                    if func_id == "kickside.webscout.providers.google:available" then return { available = true }, nil end
                    return { query = args.query, results = { { title = "only", link = "https://example.test/only" } }, count = 1, has_more = false }, nil
                end,
            })
            test.is_nil(err)
            test.eq(#calls, 2)
            test.eq(result.count, 1)
            test.is_nil(result.next_cursor)
        end)

        test.it("returns a selected provider's rejected HTTP result unchanged", function()
            local rejection = { success = false, error = "Search API error: 429", status_code = 429 }
            local result, err = dispatch.handle(ARGS, {
                config = config_of("google"), providers = installed({ GOOGLE, ACME }),
                call = function(func_id: string): (any, any)
                    if func_id == "kickside.webscout.providers.google:available" then return { available = true }, nil end
                    return rejection, nil
                end,
            })
            test.is_nil(err)
            test.eq(result, rejection)
        end)

        test.it("passes a request under the ceiling through untouched", function()
            local calls: any = {}
            local _, err = dispatch.handle({
                query = "kickside gtm", num = 3,
                max_response_body = 2048, timeout = 12, user_agent = "WebScout/1.0",
            }, {
                config = config_of("google"),
                providers = installed({ GOOGLE, ACME }),
                call = caller({ ["kickside.webscout.providers.google:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(calls[2].args.num, 3)
        end)

        test.it("falls back to the default provider when the setting names one that is gone", function()
            local calls: any = {}
            local _, err = dispatch.handle(ARGS, {
                config = config_of("acme"),
                providers = installed({ GOOGLE }),
                call = caller({ ["kickside.webscout.providers.google:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(calls[2].func_id, "kickside.webscout.providers.google:search")
        end)

        test.it("uses the default provider when the setting has never been written", function()
            local calls: any = {}
            local _, err = dispatch.handle(ARGS, {
                config = config_of(nil),
                providers = installed({ GOOGLE, ACME }),
                call = caller({ ["kickside.webscout.providers.google:available"] = true }, calls),
            })
            test.is_nil(err)
            test.eq(calls[2].func_id, "kickside.webscout.providers.google:search")
        end)

        test.it("names the unconfigured provider and the others that are installed", function()
            local calls: any = {}
            local result, err = dispatch.handle(ARGS, {
                config = config_of("google"),
                providers = installed({ GOOGLE, ACME }),
                call = caller({ ["kickside.webscout.providers.google:available"] = false }, calls),
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(err:message(), "Google (google) is not configured")
            test.contains(err:message(), "Acme (acme)")
            test.eq(#calls, 1)
        end)

        test.it("says plainly when no provider is installed at all", function()
            local result, err = dispatch.handle(ARGS, {
                config = config_of(nil),
                providers = installed({}),
                call = caller({}, {}),
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.UNAVAILABLE))
            test.contains(err:message(), "no default search provider installed")
        end)

        test.it("refuses a missing query with a typed invalid error", function()
            local result, err = dispatch.handle({ query = "" }, {
                config = config_of(nil),
                providers = installed({ GOOGLE }),
                call = caller({}, {}),
            })
            test.is_nil(result)
            test.is_true(errors.is(err, errors.INVALID))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
