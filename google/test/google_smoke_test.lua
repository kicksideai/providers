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
        if type(item) == "table" and type(item.scope) == "string" then
            out[item.scope] = true
        end
    end
    return out
end

local function default_scope_set(provider: any): { [string]: boolean }
    local out: { [string]: boolean } = {}
    for _, scope in ipairs(value(provider, "default_scopes") or {}) do
        if type(scope) == "string" then out[scope] = true end
    end
    return out
end

local function define_tests()
    test.describe("kickside.google packaging", function()
        test.it("registers kickside.google.source:calendar_meeting_source with schema and connection authority", function()
            local binding = get("kickside.google.source:calendar_meeting_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.google.source:pull_calendar_meetings")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.google.source:calendar_meetings")
            test.eq(value(port, "binding"), "kickside.google.source:calendar_meeting_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.google.source:pull_calendar_meeting_keys")
        end)
        test.it("declares the Gmail draft writable guarantee", function()
            local binding = get("kickside.google.sink:gmail_draft_sink")
            test.eq(meta(binding).delivery, "at_most_once")
            test.eq(meta(binding).input_shape, "record")
        end)
        test.it("publishes a discoverable OAuth provider declaration", function()
            local provider = get("kickside.google:google")
            local m = meta(provider)
            test.eq(m.oauth_provider, "google")
            test.eq(value(provider, "component_contract_id"), "kickside.oauth:oauth_connection")
            test.not_nil(value(provider, "connector_contract"))
        end)

        test.it("requests offline access and explicit consent for the Google grant", function()
            local connector = value(get("kickside.google:google"), "connector_contract")
            test.eq(connector.implementation_id, "kickside.oauth:base_connector")
            test.eq(connector.context_values.oauth_extra_auth_params.access_type, "offline")
            test.eq(connector.context_values.oauth_extra_auth_params.prompt, "consent")
        end)

        test.it("publishes encrypted settings for OAuth credentials", function()
            for _, id in ipairs({
                "kickside.google:setting_client_id",
                "kickside.google:setting_client_secret",
            }) do
                local setting = get(id)
                test.eq(meta(setting).type, "kickside.settings:definition")
                test.eq(value(setting, "value_type"), "secret")
                test.eq(value(setting, "namespace"), "kickside.google")
            end
        end)

        test.it("publishes the Google trait connection picker", function()
            local view = get("kickside.google.ui:google_picker_view")
            local m = meta(view)
            test.eq(m.type, "view.component")
            test.eq(m.tag_name, "kickside-google-picker")
            test.eq(m.entry_point, "google_picker.js")
        end)

        test.it("exposes the UI static mount through the host requirement", function()
            local targets: any = value(get("kickside.google:ui_server"), "targets")
            test.eq(#targets, 1)
            test.eq(targets[1].entry, "kickside.google.ui:ui_static")
            test.eq(targets[1].path, ".meta.server")
        end)

        test.it("makes every Google trait configurable with the connection picker", function()
            for _, id in ipairs({
                "kickside.google.traits:gmail_reader",
                "kickside.google.traits:gmail_writer",
                "kickside.google.traits:drive_reader",
                "kickside.google.traits:drive_writer",
                "kickside.google.traits:calendar_reader",
                "kickside.google.traits:calendar_writer",
                "kickside.google.traits:sheets_reader",
                "kickside.google.traits:sheets_writer",
                "kickside.google.traits:slides_reader",
                "kickside.google.traits:slides_writer",
                "kickside.google.traits:docs_reader",
                "kickside.google.traits:docs_writer",
                "kickside.google.traits:contacts_reader",
                "kickside.google.traits:analytics_reader",
            }) do
                local t = get(id)
                test.eq(meta(t).type, "agent.trait")
                test.eq(meta(t).web_component, "kickside-google-picker")
            end
        end)

        test.it("keeps Google connection selection out of model-facing tool schemas", function()
            for _, id in ipairs({
                "kickside.google.traits:gmail_read_tool",
                "kickside.google.traits:gmail_write_tool",
                "kickside.google.traits:drive_read_tool",
                "kickside.google.traits:drive_write_tool",
                "kickside.google.traits:calendar_read_tool",
                "kickside.google.traits:calendar_write_tool",
                "kickside.google.traits:sheets_read_tool",
                "kickside.google.traits:sheets_write_tool",
                "kickside.google.traits:slides_read_tool",
                "kickside.google.traits:slides_write_tool",
                "kickside.google.traits:docs_read_tool",
                "kickside.google.traits:docs_write_tool",
                "kickside.google.traits:contacts_read_tool",
                "kickside.google.traits:analytics_read_tool",
            }) do
                local schema = tostring(value(get(id), "input_schema") or "")
                test.is_nil(schema:find("component_id", 1, true), id .. " exposes component_id")
            end
        end)

        test.it("does not depend on the retired result-window contract", function()
            for _, id in ipairs({
                "kickside.google.traits:gmail_tool_implementation",
                "kickside.google.traits:gmail_read_tool",
                "kickside.google.traits:gmail_write_tool",
                "kickside.google.traits:drive_tool_implementation",
                "kickside.google.traits:drive_read_tool",
                "kickside.google.traits:drive_write_tool",
                "kickside.google.traits:calendar_read_tool",
                "kickside.google.traits:calendar_write_tool",
                "kickside.google.traits:sheets_tool_implementation",
                "kickside.google.traits:sheets_read_tool",
                "kickside.google.traits:sheets_write_tool",
                "kickside.google.traits:slides_tool_implementation",
                "kickside.google.traits:slides_read_tool",
                "kickside.google.traits:slides_write_tool",
                "kickside.google.traits:docs_tool_implementation",
                "kickside.google.traits:docs_read_tool",
                "kickside.google.traits:docs_write_tool",
                "kickside.google.traits:contacts_read_tool",
                "kickside.google.traits:analytics_read_tool",
            }) do
                local imports = value(get(id), "imports") or {}
                test.is_nil(imports.tool_results, id .. " imports result_window")
            end
        end)

        test.it("advertises service scopes required by the Google tools", function()
            local scopes = scope_set(get("kickside.google:google"))
            for _, scope in ipairs({
                "openid",
                "https://www.googleapis.com/auth/userinfo.profile",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/gmail.readonly",
                "https://www.googleapis.com/auth/gmail.modify",
                "https://www.googleapis.com/auth/gmail.compose",
                "https://www.googleapis.com/auth/gmail.labels",
                "https://www.googleapis.com/auth/gmail.settings.basic",
                "https://www.googleapis.com/auth/drive.readonly",
                "https://www.googleapis.com/auth/drive.metadata.readonly",
                "https://www.googleapis.com/auth/drive",
                "https://www.googleapis.com/auth/calendar.readonly",
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/calendar.events.readonly",
                "https://www.googleapis.com/auth/calendar.events",
                "https://www.googleapis.com/auth/documents.readonly",
                "https://www.googleapis.com/auth/documents",
                "https://www.googleapis.com/auth/spreadsheets.readonly",
                "https://www.googleapis.com/auth/spreadsheets",
                "https://www.googleapis.com/auth/presentations.readonly",
                "https://www.googleapis.com/auth/presentations",
                "https://www.googleapis.com/auth/contacts.readonly",
                "https://www.googleapis.com/auth/analytics.readonly",
            }) do
                test.is_true(scopes[scope] == true, "missing Google scope: " .. scope)
            end
        end)

        test.it("keeps default Google OAuth scopes limited to account identity", function()
            local provider = get("kickside.google:google")
            local defaults = default_scope_set(provider)
            test.eq(#(value(provider, "default_scopes") or {}), 3)
            test.is_true(defaults["openid"] == true)
            test.is_true(defaults["https://www.googleapis.com/auth/userinfo.profile"] == true)
            test.is_true(defaults["https://www.googleapis.com/auth/userinfo.email"] == true)
            test.is_false(defaults["https://www.googleapis.com/auth/gmail.readonly"] == true)
            test.is_false(defaults["https://www.googleapis.com/auth/drive"] == true)
        end)

        test.it("publishes a reusable Calendar upcoming-events source", function()
            local source = get("kickside.google.source:calendar_meeting_source")
            local port = get("kickside.google.source:calendar_meetings")
            test.eq(meta(port).type, "kickside.automation.port")
            test.eq(value(port, "binding"), "kickside.google.source:calendar_meeting_source")
            test.eq(meta(source).provider, "google")
            local config = value(port, "config_schema")
            test.eq(config.connection.required, true)
            test.eq(config.lookahead_hours.default, 24)
            test.eq(config.lead_time_minutes, nil)
            test.eq(config.internal_domains, nil)
        end)

        test.it("declares every foreign package used by production entries", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
                { "oauth", "kickside/oauth" },
                { "settings", "kickside/settings" },
            }) do
                local dep = get("kickside.google:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
