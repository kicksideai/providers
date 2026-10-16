local test = require("test")
local registry = require("registry")

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

local function scope_set(provider: any): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for _, item in ipairs(value(provider, "available_scopes") or {}) do
        if type(item) == "table" and type(item.scope) == "string" then out[item.scope] = true end
    end
    return out
end

local function list_contains(values: any, expected: string): boolean
    for _, item in ipairs(values or {}) do
        if item == expected then return true end
    end
    return false
end

local function define_tests()
    test.describe("kickside.github packaging", function()
        test.it("registers kickside.github.source:repo_items_source with schema and connection authority", function()
            local binding = get("kickside.github.source:repo_items_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.github.source:pull_items")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.github.source:repo_items")
            test.eq(value(port, "binding"), "kickside.github.source:repo_items_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.github.source:pull_keys")
        end)
        test.it("publishes a discoverable OAuth provider declaration", function()
            local provider = get("kickside.github:github")
            local m = meta(provider)
            test.eq(m.oauth_provider, "github")
            test.eq(m.component.create.view, "kickside.github.ui:connect_view")
            test.eq(value(provider, "component_contract_id"), "kickside.oauth:oauth_connection")
            local connector = value(provider, "connector_contract")
            test.not_nil(connector)
            test.eq(connector.implementation_id, "kickside.oauth:base_connector")
            test.eq(connector.context_values.oauth_authorization_endpoint, "https://github.com/login/oauth/authorize")
            test.eq(connector.context_values.oauth_token_endpoint, "https://github.com/login/oauth/access_token")
            test.eq(connector.context_values.oauth_userinfo_endpoint, "https://api.github.com/user")
            test.eq(connector.context_values.oauth_client_id_env, "kickside.github:client_id")
            test.eq(connector.context_values.oauth_client_secret_env, "kickside.github:client_secret")
            test.eq(connector.context_values.oauth_client_id_setting, "kickside.github:client_id")
            test.eq(connector.context_values.oauth_client_secret_setting, "kickside.github:client_secret")
        end)

        test.it("publishes encrypted settings for OAuth credentials", function()
            for _, id in ipairs({
                "kickside.github:setting_client_id",
                "kickside.github:setting_client_secret",
            }) do
                local setting = get(id)
                test.eq(meta(setting).type, "kickside.settings:definition")
                test.eq(value(setting, "value_type"), "secret")
                test.eq(value(setting, "namespace"), "kickside.github")
            end
        end)

        test.it("advertises GitHub OAuth scopes needed by repo tools", function()
            local provider = get("kickside.github:github")
            local default_scopes = value(provider, "default_scopes")
            test.is_true(list_contains(default_scopes, "read:user"), "read:user must be a default identity scope")
            test.is_true(list_contains(default_scopes, "user:email"), "user:email must be a default identity scope")

            local scopes = scope_set(provider)
            for _, scope in ipairs({ "read:user", "user:email", "public_repo", "repo", "read:org" }) do
                test.is_true(scopes[scope] == true, "missing GitHub scope: " .. scope)
            end
        end)

        test.it("keeps the PAT credential binding as a fallback connection path", function()
            local binding = get("kickside.github.connection:github_connection")
            local m = meta(binding)
            test.eq(m.provider, "github")
            test.eq(m.group, "Developer")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "token")
            test.eq(m.credential_schema.fields[1].type, "password")
        end)

        test.it("publishes the GitHub connect web component", function()
            local view = get("kickside.github.ui:connect_view")
            test.eq(meta(view).type, "view.component")
            test.eq(meta(view).tag_name, "kickside-github-connect")
            test.eq(meta(view).entry_point, "connect.js")
            test.not_nil(get("kickside.github.ui:ui_static"))
            test.not_nil(get("kickside.github.ui:ui_fs"))
        end)

        test.it("exposes the UI static mount through the host requirement", function()
            local targets: any = value(get("kickside.github:ui_server"), "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.github.ui:ui_static")
            test.eq(targets[1].path, ".meta.server")
        end)

        test.it("publishes GitHub traits wired to the generic picker", function()
            for _, pair in ipairs({ { "reader", "read_tool" }, { "writer", "write_tool" }, { "manager", "read_tool", "write_tool" } }) do
                local trait = get("kickside.github.traits:" .. pair[1])
                local m = meta(trait)
                test.eq(m.type, "agent.trait")
                test.eq(m.provider, "github")
                test.eq(m.web_component, "kickside-connection-trait-picker")
                test.eq(m.context_schema.type, "object")
                test.not_nil(m.context_schema.properties.connection_id)
                test.eq(m.context_schema.additionalProperties, false)
                local tools = value(trait, "tools")
                test.not_nil(tools, pair[1] .. " trait has no tools")
                test.eq(tools[1], "kickside.github.traits:" .. pair[2])
                if pair[3] then test.eq(tools[2], "kickside.github.traits:" .. pair[3]) end
            end
        end)

        test.it("publishes GitHubRead and GitHubWrite without exposing connection_id", function()
            for _, pair in ipairs({
                { "read_tool", "GitHubRead" },
                { "write_tool", "GitHubWrite" },
            }) do
                local tool = get("kickside.github.traits:" .. pair[1])
                test.eq(meta(tool).type, "tool")
                test.eq(meta(tool).llm_alias, pair[2])
                local schema = tostring(value(tool, "input_schema") or "")
                test.is_nil(schema:find("connection_id", 1, true), pair[1] .. " exposes connection_id")
            end
        end)

        test.it("publishes the repository issue and pull request source", function()
            local source = get("kickside.github.source:repo_items")
            test.eq(meta(source).type, "kickside.automation.port")
            test.eq(value(source, "binding"), "kickside.github.source:repo_items_source")
            local cfg = value(source, "config_schema")
            test.eq(cfg.connection_id.provider, "github")
            test.eq(cfg.connection_id.required, true)
            test.eq(cfg.item_type.enum[1], "all")
            test.not_nil(get("kickside.github.source:pull_items"))
            test.not_nil(get("kickside.github.source:pull_keys"))
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection" },
                { "contract", "kickside/contract" },
                { "oauth", "kickside/oauth" },
                { "settings", "kickside/settings" },
            }) do
                local dep = get("kickside.github:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
