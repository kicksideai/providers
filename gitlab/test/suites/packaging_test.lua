local test = require("test")
local registry = require("registry")

local BINDING = "kickside.gitlab.connection:gitlab_connection"

local function value(entry: any, key: string): any
    if type(entry) ~= "table" then return nil end
    if key == "id" or key == "kind" or key == "meta" then return entry[key] end
    if type(entry.data) == "table" then return entry.data[key] end
    return nil
end

local function meta(entry: any): any
    return type(entry) == "table" and (entry.meta or (entry.data and entry.data.meta)) or nil
end

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function contract(binding: any, contract_id: string): any
    for _, item in ipairs(value(binding, "contracts") or {}) do
        if type(item) == "table" and item.contract == contract_id then return item end
    end
    return nil
end

local function field(schema: any, key: string): any
    for _, item in ipairs(schema.fields or {}) do
        if item.key == key then return item end
    end
    return nil
end

local function define_tests()
    test.describe("kickside.gitlab packaging", function()
        test.it("declares the GitLab connection binding metadata", function()
            local m = meta(get(BINDING))
            test.eq(m.provider, "gitlab")
            test.eq(m.title, "GitLab")
            test.eq(m.icon, "tabler:brand-gitlab")
            test.eq(m.group, "Developer")
            test.eq(#m.class, 1)
            test.eq(m.class[1], "connection")
        end)

        test.it("declares exactly the base_url and token credential fields", function()
            local schema = meta(get(BINDING)).credential_schema
            test.not_nil(schema)
            test.eq(#schema.fields, 2)

            local base_url = field(schema, "base_url")
            test.not_nil(base_url, "base_url field is missing")
            test.eq(base_url.type, "text")
            test.is_true(base_url.required ~= true, "base_url must be optional")
            test.eq(base_url.placeholder, "https://gitlab.com")
            test.contains(base_url.help, "https://gitlab.com")

            local token = field(schema, "token")
            test.not_nil(token, "token field is missing")
            test.eq(token.type, "password")
            test.eq(token.required, true)
            test.contains(token.help, "personal")
            test.contains(token.help, "group")
            test.contains(token.help, "project")
            test.contains(token.help, "read_api")
            test.contains(token.help, "or api")
        end)

        test.it("binds the component, connection, and deletable contracts", function()
            local binding = get(BINDING)
            test.eq(#value(binding, "contracts"), 3)

            local component = contract(binding, "kickside.contract:component")
            test.not_nil(component, "component contract is missing")
            test.eq(component.methods.get_status, "kickside.gitlab.connection:get_status")

            local connection = contract(binding, "kickside.connection:connection")
            test.not_nil(connection, "connection contract is missing")
            test.eq(#connection.context_required, 1)
            test.eq(connection.context_required[1], "component_id")
            test.eq(connection.methods.get_status, "kickside.gitlab.connection:get_status")
            test.eq(connection.methods.test_connection, "kickside.gitlab.connection:test_connection")
            test.eq(connection.methods.discover_resources, "kickside.gitlab.connection:discover_resources")

            local deletable = contract(binding, "kickside.contract:deletable")
            test.not_nil(deletable, "deletable contract is missing")
            test.eq(#deletable.context_required, 1)
            test.eq(deletable.context_required[1], "component_id")
            test.eq(deletable.methods.delete, "kickside.gitlab.connection:delete")
        end)

        test.it("resolves every bound method to a function entry", function()
            for _, name in ipairs({ "get_status", "test_connection", "discover_resources", "delete" }) do
                local entry = get("kickside.gitlab.connection:" .. name)
                test.eq(entry.kind, "function.lua")
                test.eq(value(entry, "method"), name)
            end
        end)

        test.it("publishes the client and connection libraries", function()
            for _, id in ipairs({
                "kickside.gitlab.client:types",
                "kickside.gitlab.client:api",
                "kickside.gitlab.client:transport",
                "kickside.gitlab.connection:connection_lib",
            }) do
                test.eq(get(id).kind, "library.lua")
            end
        end)

        test.it("declares every foreign package unpinned", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection" },
                { "contract", "kickside/contract" },
            }) do
                local dep = get("kickside.gitlab:dep.kickside." .. expected[1])
                test.eq(dep.kind, "ns.dependency")
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
