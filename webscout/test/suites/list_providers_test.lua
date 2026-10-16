local test = require("test")
local registry = require("providers")
local endpoint = require("endpoint")

-- Two installed providers, as registry.find hands them over: one configured and
-- default, one installed but without credentials.
local GOOGLE = {
    id = "kickside.webscout.providers.google:provider",
    meta = { type = registry.PROVIDER_TYPE },
    data = {
        id = "google", label = "Google", icon = "tabler:brand-google",
        description = "Google Custom Search over the public web index.",
        search_func = "kickside.webscout.providers.google:search",
        available_func = "kickside.webscout.providers.google:available",
        settings_ns = "kickside.webscout", max_results = 10, default = true, order = 10,
    },
}

local ACME = {
    id = "acme.search:provider",
    meta = { type = registry.PROVIDER_TYPE },
    data = {
        id = "acme", label = "Acme",
        description = "Acme Search over its own index.",
        search_func = "acme.search:search",
        available_func = "acme.search:available",
        settings_ns = "acme.search", max_results = 20, order = 20,
    },
}

local function finder(entries)
    return function(query)
        if query["meta.type"] ~= registry.PROVIDER_TYPE then return {}, nil end
        return entries, nil
    end
end

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

-- Availability per function id; an id absent from the table answers with an
-- error, standing in for a gate that cannot be reached.
local function caller(available)
    return function(func_id, _args)
        if available[func_id] == nil then return nil, "no such func: " .. func_id end
        return { available = available[func_id] }, nil
    end
end

local READY = {
    ["kickside.webscout.providers.google:available"] = true,
    ["acme.search:available"] = false,
}

local function define_tests()
    test.describe("WebScout provider list endpoint", function()
        test.it("lists every installed provider with what the card has to show", function()
            local payload, err = endpoint.build({
                config = config_of("google"),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.is_nil(err)
            test.eq(payload.success, true)
            test.eq(#payload.providers, 2)

            local google = payload.providers[1]
            test.eq(google.id, "google")
            test.eq(google.label, "Google")
            test.eq(google.icon, "tabler:brand-google")
            test.eq(google.description, "Google Custom Search over the public web index.")
            test.eq(google.is_default, true)
        end)

        test.it("marks each provider configured or not from its own gate", function()
            local payload = endpoint.build({
                config = config_of("google"),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.eq(payload.providers[1].configured, true)
            test.eq(payload.providers[2].id, "acme")
            test.eq(payload.providers[2].configured, false)
        end)

        test.it("names the provider that would answer a search right now", function()
            local chosen = endpoint.build({
                config = config_of("acme"),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.eq(chosen.selected, "acme")

            -- Unset setting, and a setting naming a provider that is gone, both
            -- report the default — the same answer the search tool would give.
            local unset = endpoint.build({
                config = config_of(nil),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.eq(unset.selected, "google")

            local stale = endpoint.build({
                config = config_of("acme"),
                providers = installed({ GOOGLE }),
                call = caller(READY),
            })
            test.eq(stale.selected, "google")
        end)

        test.it("reports the saved choice beside the one in effect", function()
            -- Saved and effective agree: nothing to warn about.
            local settled = endpoint.build({
                config = config_of("acme"),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.eq(settled.stored, "acme")
            test.eq(settled.selected, "acme")

            -- The saved provider was uninstalled. The card needs both values to
            -- say so; reporting only the effective one hides the substitution.
            local substituted = endpoint.build({
                config = config_of("acme"),
                providers = installed({ GOOGLE }),
                call = caller(READY),
            })
            test.eq(substituted.stored, "acme")
            test.eq(substituted.selected, "google")

            -- Never written: nothing was substituted, so there is nothing to say.
            local unset = endpoint.build({
                config = config_of(nil),
                providers = installed({ GOOGLE, ACME }),
                call = caller(READY),
            })
            test.is_nil(unset.stored)
            test.eq(unset.selected, "google")
        end)

        test.it("treats a gate that cannot answer as not configured", function()
            local payload = endpoint.build({
                config = config_of("google"),
                providers = installed({ GOOGLE, ACME }),
                call = caller({}),
            })
            test.eq(payload.providers[1].configured, false)
            test.eq(payload.providers[2].configured, false)
        end)

        test.it("reports a broken declaration instead of a half list", function()
            local broken = { id = "nowhere.search:provider", data = { id = "nowhere", label = "Nowhere" } }
            local payload, err = endpoint.build({
                config = config_of("google"),
                providers = installed({ GOOGLE, broken }),
                call = caller(READY),
            })
            test.is_nil(payload)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:details().entry_id, "nowhere.search:provider")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
