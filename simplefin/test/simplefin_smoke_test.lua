local test = require("test")
local registry = require("registry")
local security = require("security")

local function get(id: string): any
    local entry, err = registry.get(id)
    test.is_nil(err, id .. ": " .. tostring(err))
    test.not_nil(entry, id .. " missing")
    return entry
end

local function meta(entry: any): any
    return (entry and entry.meta) or {}
end

local function value(entry: any, key: string): any
    local data: any = entry and entry.data or nil
    if type(data) == "table" and data[key] ~= nil then return data[key] end
    return nil
end

local function contract_methods(entry: any, contract_id: string): any
    for _, c in ipairs(value(entry, "contracts") or {}) do
        if c.contract == contract_id then return c end
    end
    return nil
end

local function define_tests()
    test.describe("kickside.simplefin packaging", function()
        test.it("publishes a schema-declared credential connection binding with a custom connect view", function()
            local binding = get("kickside.simplefin.connection:simplefin_connection")
            local m = meta(binding)
            test.eq(m.provider, "simplefin")
            test.eq(m.group, "Finance")
            test.eq(m.class[1], "connection")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "setup_token")
            test.eq(m.credential_schema.fields[1].type, "password")
            test.eq(m.credential_schema.fields[1].required, true)
            test.eq(m.component.create.view, "kickside.simplefin:connect_view")
        end)

        test.it("binds the component, connection and deletable contracts", function()
            local binding = get("kickside.simplefin.connection:simplefin_connection")
            local conn = contract_methods(binding, "kickside.connection:connection")
            test.not_nil(conn)
            test.eq(conn.context_required[1], "component_id")
            test.eq(conn.methods.test_connection, "kickside.simplefin.connection:test_connection")
            test.eq(conn.methods.discover_resources, "kickside.simplefin.connection:discover_resources")
            test.eq(conn.methods.get_status, "kickside.simplefin.connection:get_status")
            local del = contract_methods(binding, "kickside.contract:deletable")
            test.eq(del.methods.delete, "kickside.simplefin.connection:delete")
            local comp = contract_methods(binding, "kickside.contract:component")
            test.eq(comp.methods.get_status, "kickside.simplefin.connection:get_status")
            for _, fn in ipairs({ "get_status", "test_connection", "discover_resources", "delete" }) do
                get("kickside.simplefin.connection:" .. fn)
            end
        end)

        test.it("publishes the connect view served from the module bundle", function()
            local view = get("kickside.simplefin:connect_view")
            local m = meta(view)
            test.eq(m.type, "view.component")
            test.eq(m.tag_name, "kickside-simplefin-connect")
            test.eq(m.base_path, "kickside-simplefin")
            test.eq(m.entry_point, "index.js")
            local static = get("kickside.simplefin:ui_static")
            test.eq(value(static, "path"), "/kickside-simplefin")
            test.eq(value(static, "fs"), "kickside.simplefin:ui_fs")
        end)

        test.it("publishes three pullable sources and their ports", function()
            for _, pair in ipairs({
                { "transactions", "pull_transactions" },
                { "balances", "pull_balances" },
                { "holdings", "pull_holdings" },
            }) do
                local name, method = pair[1], pair[2]
                local source = get("kickside.simplefin.source:" .. name .. "_source")
                local pullable = contract_methods(source, "kickside.data:pullable")
                test.not_nil(pullable, name .. " must implement kickside.data:pullable")
                test.eq(pullable.context_required[1], "component_id")
                test.eq(pullable.methods.pull, "kickside.simplefin.source:" .. method)
                test.eq(meta(source).provider, "simplefin")
                local port = get("kickside.simplefin.source:" .. name)
                test.eq(meta(port).type, "kickside.automation.port")
                test.eq(value(port, "binding"), "kickside.simplefin.source:" .. name .. "_source")
                local schema = value(port, "config_schema")
                test.eq(schema.connection_id.picker, "kickside-connection-trait-picker")
                test.eq(schema.connection_id.provider, "simplefin")
                test.not_nil(value(port, "output_schema"))
            end
            local transactions = get("kickside.simplefin.source:transactions")
            test.eq(value(transactions, "reconcile").pull_keys, "kickside.simplefin.source:pull_keys")
            test.eq(value(get("kickside.simplefin.source:balances"), "reconcile").pull_keys,
                "kickside.simplefin.source:pull_balance_keys")
            test.eq(value(get("kickside.simplefin.source:holdings"), "reconcile").pull_keys,
                "kickside.simplefin.source:pull_holding_keys")
        end)

        test.it("publishes the reader trait and the read tool", function()
            local trait = get("kickside.simplefin.traits:reader")
            test.eq(meta(trait).type, "agent.trait")
            test.eq(meta(trait).web_component, "kickside-connection-trait-picker")
            test.eq(value(trait, "tools")[1], "kickside.simplefin.traits:read_tool")
            local tool = get("kickside.simplefin.traits:read_tool")
            test.eq(meta(tool).type, "tool")
            test.eq(meta(tool).llm_alias, "SimpleFINRead")
        end)

        test.it("guards the rotation endpoint with the module member policy", function()
            local endpoint = get("kickside.simplefin.api:rotate.endpoint")
            test.eq(value(endpoint, "method"), "PUT")
            test.eq(value(endpoint, "path"), "/simplefin/connections/{id}")
            test.eq(value(endpoint, "func"), "rotate")
            test.eq(meta(endpoint).router, "app:api")
            local policy = get("kickside.contract.http:user_endpoint_access")
            local p = value(policy, "policy")
            local baseline = assert(security.policy("kickside.contract.http:user_endpoint_access"))
            local member = assert(security.policy("kickside.simplefin.security:simplefin_endpoint_access"))
            local actor = security.new_actor("module-member", {})
            test.eq(baseline:evaluate(actor, "access", "kickside.core.threads.api:create_thread.endpoint"), "allow")
            test.eq(baseline:evaluate(actor, "access", endpoint.id), "undefined")
            test.eq(member:evaluate(actor, "access", endpoint.id), "allow")
            test.eq(member:evaluate(actor, "funcs.call", endpoint.id), "undefined")
            test.eq(member:evaluate(actor, "access", "unrelated.module:read.endpoint"), "undefined")
            test.is_table(p.resources)
            test.is_nil(p.conditions)
            test.eq(p.actions, "access")
            test.eq(p.effect, "allow")
            local groups = value(policy, "groups")
            test.eq(groups[1], "app:user", "the harness binds its member group on Contract")
        end)

        test.it("declares direct package dependencies", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
            }) do
                local dep = get("kickside.simplefin:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
