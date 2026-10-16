local test = require("test")
local registry = require("registry")
local create_policy = require("create_policy")

local BINDING_ID = "kickside.bitbucket.connection:bitbucket_connection"

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err)
    test.not_nil(entry, id .. " is missing")
    return entry
end

local function data(entry: any): any
    return entry.data or {}
end

local function contract_def(binding: any, contract_id: string): any
    for _, def in ipairs(data(binding).contracts or {}) do
        if def.contract == contract_id then return def end
    end
    return nil
end

local function schema_field(binding: any, key: string): any
    for _, field in ipairs(binding.meta.credential_schema.fields) do
        if field.key == key then return field end
    end
    return nil
end

local function contains(values: any, expected: string): boolean
    for _, item in ipairs(values or {}) do
        if item == expected then return true end
    end
    return false
end

local function define_tests()
    test.describe("kickside.bitbucket packaging", function()
        test.it("declares the Bitbucket credential connection binding", function()
            local binding = get(BINDING_ID)
            test.eq(binding.kind, "contract.binding")
            test.eq(binding.meta.provider, "bitbucket")
            test.eq(binding.meta.title, "Bitbucket")
            test.eq(binding.meta.icon, "tabler:brand-bitbucket")
            test.eq(binding.meta.group, "Developer")
            test.len(binding.meta.class, 1)
            test.eq(binding.meta.class[1], "connection")
        end)

        test.it("implements the component, connection, and deletable contracts", function()
            local binding = get(BINDING_ID)
            local component = contract_def(binding, "kickside.contract:component")
            test.not_nil(component)
            test.eq(component.methods.get_status, "kickside.bitbucket.connection:get_status")

            local connection = contract_def(binding, "kickside.connection:connection")
            test.not_nil(connection)
            test.is_true(contains(connection.context_required, "component_id"))
            test.eq(connection.methods.get_status, "kickside.bitbucket.connection:get_status")
            test.eq(connection.methods.test_connection, "kickside.bitbucket.connection:test_connection")
            test.eq(connection.methods.discover_resources, "kickside.bitbucket.connection:discover_resources")

            local deletable = contract_def(binding, "kickside.contract:deletable")
            test.not_nil(deletable)
            test.is_true(contains(deletable.context_required, "component_id"))
            test.eq(deletable.methods.delete, "kickside.bitbucket.connection:delete")
        end)

        test.it("resolves every bound method to a function entry", function()
            for _, name in ipairs({ "get_status", "test_connection", "discover_resources", "delete" }) do
                local fn = get("kickside.bitbucket.connection:" .. name)
                test.eq(fn.kind, "function.lua")
                test.eq(data(fn).method, name)
            end
            test.eq(get("kickside.bitbucket.connection:connection_lib").kind, "library.lua")
        end)

        test.it("declares both credential modes in the credential schema", function()
            local binding = get(BINDING_ID)
            local schema = binding.meta.credential_schema
            test.not_nil(schema)
            test.len(schema.fields, 5)

            local auth_type = schema_field(binding, "auth_type")
            test.eq(auth_type.type, "select")
            test.is_true(auth_type.required)
            test.len(auth_type.options, 2)
            test.eq(auth_type.options[1].value, "api_token")
            test.eq(auth_type.options[2].value, "access_token")

            for _, spec in ipairs({
                { "email", "email", "api_token" },
                { "api_token", "password", "api_token" },
                { "access_token", "password", "access_token" },
                { "workspace", "text", "access_token" },
            }) do
                local field = schema_field(binding, spec[1])
                test.not_nil(field, spec[1] .. " is missing")
                test.eq(field.type, spec[2])
                test.eq(field.required_if.key, "auth_type")
                test.eq(field.required_if.equals, spec[3])
            end
        end)

        test.it("accepts each credential mode under the connection create policy", function()
            local binding = get(BINDING_ID)
            test.is_nil(create_policy.validate_private_context(binding, {
                auth_type = "api_token", email = "dev@example.com", api_token = "ATATT-token",
            }))
            test.is_nil(create_policy.validate_private_context(binding, {
                auth_type = "api_token", email = "dev@example.com", api_token = "ATATT-token", workspace = "acme",
            }))
            test.is_nil(create_policy.validate_private_context(binding, {
                auth_type = "access_token", access_token = "ATCTT-token", workspace = "acme",
            }))
        end)

        test.it("rejects incomplete, unknown, and undeclared credentials under the create policy", function()
            local binding = get(BINDING_ID)
            test.eq(create_policy.validate_private_context(binding, { auth_type = "api_token", email = "dev@example.com" }),
                "api_token is required")
            test.eq(create_policy.validate_private_context(binding, { auth_type = "access_token", access_token = "t" }),
                "workspace is required")
            test.eq(create_policy.validate_private_context(binding, { auth_type = "app_password" }),
                "auth_type must be one of the declared options")
            test.eq(create_policy.validate_private_context(binding, {}), "auth_type is required")
            test.contains(create_policy.validate_private_context(binding, {
                auth_type = "access_token", access_token = "t", workspace = "acme", app_password = "x",
            }), "undeclared field")
        end)

        test.it("declares every foreign package unpinned", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection" },
                { "contract", "kickside/contract" },
            }) do
                local dep = get("kickside.bitbucket:dep.kickside." .. expected[1])
                test.eq(dep.kind, "ns.dependency")
                test.eq(data(dep).component, expected[2])
                test.eq(tostring(data(dep).version or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
