local test = require("test")
local registry = require("registry")
local json = require("json")

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

local function define_tests()
    test.describe("kickside.atlassian packaging", function()
        test.it("registers kickside.atlassian.jira.source:issues_source with schema and connection authority", function()
            local binding = get("kickside.atlassian.jira.source:issues_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.atlassian.jira.source:pull_issues")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.atlassian.jira.source:issues")
            test.eq(value(port, "binding"), "kickside.atlassian.jira.source:issues_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local schema: any = json.decode(value(port, "output_schema"))
            test.not_nil(schema.properties.content)
            test.not_nil(schema.properties.title)
            test.is_nil(schema.properties.payload)
            test.is_nil(schema.properties.item_key)

            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.atlassian.jira.source:pull_issue_keys")
        end)
        test.it("registers kickside.atlassian.confluence.source:content_source with schema and connection authority", function()
            local binding = get("kickside.atlassian.confluence.source:content_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.atlassian.confluence.source:pull_content")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.atlassian.confluence.source:content")
            test.eq(value(port, "binding"), "kickside.atlassian.confluence.source:content_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.atlassian.confluence.source:pull_content_keys")
        end)
        test.it("publishes a discoverable OAuth provider declaration with a connect UI", function()
            local provider = get("kickside.atlassian:atlassian")
            local m = meta(provider)
            test.eq(m.oauth_provider, "atlassian")
            test.eq(m.component.create.view, "kickside.atlassian.ui:connect_view")
            test.eq(value(provider, "component_contract_id"), "kickside.oauth:oauth_connection")
            local connector = value(provider, "connector_contract")
            test.not_nil(connector)
            test.eq(connector.implementation_id, "kickside.oauth:base_connector")
            test.eq(connector.context_values.oauth_token_endpoint, "https://auth.atlassian.com/oauth/token")
        end)

        test.it("publishes encrypted settings for OAuth credentials", function()
            for _, id in ipairs({
                "kickside.atlassian:setting_client_id",
                "kickside.atlassian:setting_client_secret",
            }) do
                local setting = get(id)
                test.eq(meta(setting).type, "kickside.settings:definition")
                test.eq(value(setting, "value_type"), "secret")
                test.eq(value(setting, "namespace"), "kickside.atlassian")
            end
        end)

        test.it("publishes the shared transport and site libraries", function()
            test.not_nil(get("kickside.atlassian.client:transport"))
            test.not_nil(get("kickside.atlassian.client:site"))
        end)

        test.it("publishes the single Atlassian credential connection binding", function()
            local binding = get("kickside.atlassian.connection:atlassian_connection")
            test.eq(meta(binding).provider, "atlassian")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local connection_methods: any = nil
            for _, c in ipairs(contracts) do
                if c.contract == "kickside.connection:connection" then
                    connection_methods = c.methods
                end
            end
            test.not_nil(connection_methods, "binds kickside.connection:connection")
            local method_count = 0
            for name, _ in pairs(connection_methods) do
                method_count = method_count + 1
                test.is_true(
                    name == "get_status" or name == "test_connection" or name == "discover_resources",
                    "unexpected connection method: " .. tostring(name)
                )
            end
            test.eq(method_count, 3)
            test.not_nil(get("kickside.atlassian.jira:api"))
            test.not_nil(get("kickside.atlassian.confluence:api"))
        end)

        test.it("publishes the Jira agent tools and traits", function()
            for _, id in ipairs({
                "kickside.atlassian.jira.traits:jira_get",
                "kickside.atlassian.jira.traits:jira_write",
            }) do
                test.eq(meta(get(id)).type, "tool")
            end
            for _, id in ipairs({
                "kickside.atlassian.jira.traits:jira_reader",
                "kickside.atlassian.jira.traits:jira_writer",
                "kickside.atlassian.jira.traits:jira_developer",
            }) do
                local t = get(id)
                test.eq(meta(t).type, "agent.trait")
                test.eq(meta(t).web_component, "kickside-atlassian-jira-picker")
            end
        end)

        test.it("publishes the Confluence agent tools and traits", function()
            for _, id in ipairs({
                "kickside.atlassian.confluence.traits:confluence_get",
                "kickside.atlassian.confluence.traits:confluence_write",
            }) do
                test.eq(meta(get(id)).type, "tool")
            end
            for _, id in ipairs({
                "kickside.atlassian.confluence.traits:confluence_reader",
                "kickside.atlassian.confluence.traits:confluence_writer",
                "kickside.atlassian.confluence.traits:confluence_editor",
            }) do
                local t = get(id)
                test.eq(meta(t).type, "agent.trait")
                test.eq(meta(t).web_component, "kickside-atlassian-confluence-picker")
            end
        end)

        test.it("publishes the connect + picker web components (view.component + static mount)", function()
            for _, pair in ipairs({
                { "kickside.atlassian.ui:connect_view", "kickside-atlassian-connect", "connect.js" },
                { "kickside.atlassian.ui:jira_picker_view", "kickside-atlassian-jira-picker", "jira_picker.js" },
                { "kickside.atlassian.ui:confluence_picker_view", "kickside-atlassian-confluence-picker", "confluence_picker.js" },
            }) do
                local view = get(pair[1])
                test.eq(meta(view).type, "view.component")
                test.eq(meta(view).tag_name, pair[2])
                test.eq(meta(view).entry_point, pair[3])
            end
            test.not_nil(get("kickside.atlassian.ui:ui_static"))
            test.not_nil(get("kickside.atlassian.ui:ui_fs"))
        end)

        test.it("exposes the UI static mount through the host requirement", function()
            local targets: any = value(get("kickside.atlassian:ui_server"), "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.atlassian.ui:ui_static")
            test.eq(targets[1].path, ".meta.server")
        end)

        test.it("publishes Jira issue source and sink ports with one selector picker", function()
            local source = get("kickside.atlassian.jira.source:issues")
            test.eq(meta(source).type, "kickside.automation.port")
            test.eq(value(source, "binding"), "kickside.atlassian.jira.source:issues_source")
            local scfg: any = value(source, "config_schema")
            test.eq(scfg.project_key.picker, "kickside-atlassian-jira-picker")
            test.eq(scfg.connection_id.required, true)
            test.not_nil(get("kickside.atlassian.jira.source:pull_issues"))
            test.not_nil(get("kickside.atlassian.jira.source:pull_issue_keys"))

            local sink = get("kickside.atlassian.jira.sink:issues")
            local binding = get("kickside.atlassian.jira.sink:issues_sink")
            test.eq(meta(binding).delivery, "at_most_once")
            test.eq(meta(binding).input_shape, "record")
            test.eq(meta(sink).type, "kickside.automation.port")
            test.eq(value(sink, "binding"), "kickside.atlassian.jira.sink:issues_sink")
            local kcfg: any = value(sink, "config_schema")
            test.eq(kcfg.project_key.picker, "kickside-atlassian-jira-picker")
            local ops: any = value(sink, "operations")
            test.not_nil(ops.upsert)
            test.not_nil(ops.add_comment)
            test.not_nil(ops.add_worklog)
        end)

        test.it("publishes Confluence content source and sink ports with one selector picker", function()
            local source = get("kickside.atlassian.confluence.source:content")
            test.eq(meta(source).type, "kickside.automation.port")
            test.eq(value(source, "binding"), "kickside.atlassian.confluence.source:content_source")
            local scfg: any = value(source, "config_schema")
            test.eq(scfg.space_key.picker, "kickside-atlassian-confluence-picker")
            test.eq(scfg.content_type.enum[1], "page")
            test.eq(scfg.content_type.enum[2], "blogpost")
            test.not_nil(get("kickside.atlassian.confluence.source:pull_content"))
            test.not_nil(get("kickside.atlassian.confluence.source:pull_content_keys"))

            local sink = get("kickside.atlassian.confluence.sink:content")
            local binding = get("kickside.atlassian.confluence.sink:content_sink_binding")
            test.eq(meta(binding).delivery, "at_most_once")
            test.eq(meta(binding).input_shape, "record")
            test.eq(meta(sink).type, "kickside.automation.port")
            test.eq(value(sink, "binding"), "kickside.atlassian.confluence.sink:content_sink_binding")
            local kcfg: any = value(sink, "config_schema")
            test.eq(kcfg.space_key.picker, "kickside-atlassian-confluence-picker")
            local ops: any = value(sink, "operations")
            test.not_nil(ops.upsert)
            test.not_nil(ops.add_comment)
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection" },
                { "contract", "kickside/contract" },
                { "oauth", "kickside/oauth" },
                { "settings", "kickside/settings" },
            }) do
                local dep = get("kickside.atlassian:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), "*", expected[2] .. " must stay unpinned")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
