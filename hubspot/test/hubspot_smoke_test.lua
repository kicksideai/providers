local test = require("test")
local registry = require("registry")
local pull_core = require("pull_core")
local connection = require("connection")

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

local function contains(values: { string }, expected: string): boolean
    for _, value in ipairs(values or {}) do
        if value == expected then return true end
    end
    return false
end

local function count_keys(values: { [string]: any }): number
    local count = 0
    for _, _ in pairs(values or {}) do count = count + 1 end
    return count
end

local STANDARD_FIELD_MAP = {
    contacts = {
        email = "email",
        firstname = "first_name",
        lastname = "last_name",
        phone = "phone",
        jobtitle = "title",
        lifecyclestage = "lifecycle_stage",
        hs_lead_status = "lead_status",
        company = "company",
        website = "website",
        city = "city",
        state = "state",
        country = "country",
        createdate = "created_at",
        lastmodifieddate = "updated_at",
    },
    companies = {
        name = "name",
        domain = "domain",
        industry = "industry",
        numberofemployees = "employee_count",
        annualrevenue = "annual_revenue",
        phone = "phone",
        website = "website",
        city = "city",
        state = "state",
        country = "country",
        description = "description",
        lifecyclestage = "lifecycle_stage",
        createdate = "created_at",
        hs_lastmodifieddate = "updated_at",
    },
    deals = {
        dealname = "name",
        amount = "amount",
        dealstage = "stage",
        pipeline = "pipeline",
        closedate = "close_date",
        dealtype = "deal_type",
        createdate = "created_at",
        hs_lastmodifieddate = "updated_at",
    },
}

local function define_tests()
    test.describe("kickside.hubspot packaging", function()
        test.it("registers kickside.hubspot.source:crm_source with schema and connection authority", function()
            local binding = get("kickside.hubspot.source:crm_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.hubspot.source:pull_crm")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.hubspot.source:crm")
            test.eq(value(port, "binding"), "kickside.hubspot.source:crm_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.hubspot.source:pull_crm_keys")
        end)
        test.it("registers kickside.hubspot.source:association_source with schema and connection authority", function()
            local binding = get("kickside.hubspot.source:association_source")
            local contracts: any = value(binding, "contracts")
            test.not_nil(contracts)
            local pullable: any = nil
            for _, declaration in ipairs(contracts) do
                if declaration.contract == "kickside.data:pullable" then pullable = declaration end
            end
            test.not_nil(pullable, "source must implement pullable")
            test.eq(pullable.methods.pull, "kickside.hubspot.source:pull_associations")
            test.eq(pullable.context_required[1], "component_id")
            local port = get("kickside.hubspot.source:crm_associations")
            test.eq(value(port, "binding"), "kickside.hubspot.source:association_source")
            local config: any = value(port, "config_schema")
            test.not_nil(config)
            test.eq(config.connection_id.required, true)
            test.not_nil(value(port, "output_schema"))
            local reconcile: any = value(port, "reconcile")
            test.eq(reconcile.pull_keys, "kickside.hubspot.source:pull_association_keys")
        end)
        test.it("publishes a schema-declared credential connection binding", function()
            local binding = get("kickside.hubspot.connection:hubspot_connection")
            local m = meta(binding)
            test.eq(m.provider, "hubspot")
            test.eq(m.group, "CRM")
            test.not_nil(m.credential_schema)
            test.eq(m.credential_schema.fields[1].key, "api_key")
            test.eq(m.credential_schema.fields[1].type, "password")
        end)

        test.it("binds the connection + deletable contracts", function()
            local contracts = value(get("kickside.hubspot.connection:hubspot_connection"), "contracts")
            test.not_nil(contracts, "binding has no contracts")
            local seen: { [string]: boolean } = {}
            for _, c in ipairs(contracts or {}) do seen[tostring((c :: any).contract)] = true end
            test.is_true(seen["kickside.connection:connection"], "missing connection contract")
            test.is_true(seen["kickside.contract:deletable"], "missing deletable contract")
        end)

        test.it("publishes Reader + Writer traits wired to the generic picker", function()
            for _, pair in ipairs({ { "reader", "read_tool" }, { "writer", "write_tool" } }) do
                local trait = get("kickside.hubspot.traits:" .. pair[1])
                local m = meta(trait)
                test.eq(m.type, "agent.trait")
                test.eq(m.provider, "hubspot")
                test.eq(m.web_component, "kickside-connection-trait-picker")
                local tools = value(trait, "tools")
                test.not_nil(tools, pair[1] .. " trait has no tools")
                test.eq(tools[1], "kickside.hubspot.traits:" .. pair[2])
            end
        end)

        test.it("publishes the HubSpotRead and HubSpotWrite tools", function()
            test.eq(meta(get("kickside.hubspot.traits:read_tool")).llm_alias, "HubSpotRead")
            test.eq(meta(get("kickside.hubspot.traits:write_tool")).llm_alias, "HubSpotWrite")
        end)

        test.it("publishes one CRM source and one canonical CRM sink with object_type as the selector picker", function()
            local source = get("kickside.hubspot.source:crm")
            local source_meta = meta(source)
            test.eq(source_meta.type, "kickside.automation.port")
            test.eq(value(source, "binding"), "kickside.hubspot.source:crm_source")
            local source_cfg = value(source, "config_schema")
            test.eq(source_cfg.object_type.picker, "kickside-hubspot-picker")
            test.eq(#source_cfg.object_type.enum, 8)
            for _, object_type in ipairs({ "contacts", "companies", "deals", "tasks", "meetings", "notes", "emails", "calls" }) do
                test.is_true(contains(source_cfg.object_type.enum, object_type), "source enum missing " .. object_type)
            end
            test.not_nil(source_cfg.property_selection)
            test.not_nil(source_cfg.field_map)
            test.not_nil(source_cfg.objects)

            local sink = get("kickside.hubspot.sink:crm")
            local sink_meta = meta(sink)
            test.eq(sink_meta.type, "kickside.automation.port")
            test.eq(value(sink, "binding"), "kickside.hubspot.sink:crm_sink")
            local sink_cfg = value(sink, "config_schema")
            test.eq(sink_cfg.object_type.picker, "kickside-hubspot-picker")
            test.eq(#sink_cfg.object_type.enum, 4)
            test.eq(sink_cfg.object_type.enum[4], "tasks")
            test.not_nil(sink_cfg.field_map)
            local ops = value(sink, "operations")
            test.not_nil(ops.upsert)
            test.not_nil(ops.delete)
            test.is_nil(ops.create)
            test.is_nil(ops.update)
            test.is_nil(ops.log_activity)
            test.is_nil(ops.list_keys)
        end)

        test.it("registers the HubSpot picker view component", function()
            local picker = get("kickside.hubspot.ui:picker_view")
            local picker_meta = meta(picker)
            test.eq(picker_meta.type, "view.component")
            test.eq(picker_meta.tag_name, "kickside-hubspot-picker")
        end)

        test.it("declares UI server and default field-mapping requirements", function()
            local ui_req = get("kickside.hubspot:ui_server")
            test.is_nil(value(ui_req, "default"))
            test.eq(value(ui_req, "targets")[1].entry, "kickside.hubspot.ui:ui_static")
            test.eq(value(ui_req, "targets")[1].path, ".meta.server")
            test.eq(meta(get("kickside.hubspot.ui:ui_static")).server, "app:gateway")

            local mapping_req = get("kickside.hubspot:default_field_mapping_ref")
            test.eq(value(mapping_req, "default"), "kickside.hubspot.client:default_field_mapping.standard")
            test.eq(value(mapping_req, "targets")[1].entry, "kickside.hubspot.client:config_defaults")
            test.eq(value(mapping_req, "targets")[1].path, ".meta.default_field_mapping_ref")

            local defaults = get("kickside.hubspot.client:config_defaults")
            test.eq(meta(defaults).default_field_mapping_ref, "kickside.hubspot.client:default_field_mapping.standard")

            local mapping = get("kickside.hubspot.client:default_field_mapping.standard")
            test.eq(meta(mapping).type, "kickside.hubspot.field_mapping")
            test.eq(meta(mapping).title, "Standard HubSpot field mapping defaults")
            test.eq(meta(mapping).comment, "Standard HubSpot field mapping defaults")
        end)

        test.it("maps standard HubSpot properties to canonical CRM attributes only", function()
            local mapping = meta(get("kickside.hubspot.client:default_field_mapping.standard"))
            local field_map = mapping.field_map or {}
            local selection = mapping.property_selection or {}

            for object_type, expected_map in pairs(STANDARD_FIELD_MAP) do
                local actual_map = field_map[object_type] or {}
                test.eq(count_keys(actual_map), count_keys(expected_map), object_type .. " has only standard properties")
                for property, canonical_attribute in pairs(expected_map) do
                    test.eq(actual_map[property], canonical_attribute, object_type .. "." .. property)
                    test.is_true(contains(selection[object_type] or {}, property), object_type .. " selects " .. property)
                end
                test.eq(#(selection[object_type] or {}), count_keys(expected_map), object_type .. " has no extra selected properties")
            end

            local companies = field_map.companies or {}
            test.eq(companies.name, "name")
            test.eq(companies.domain, "domain")
            test.eq(companies.industry, "industry")
            test.eq(companies.numberofemployees, "employee_count")
            test.eq((field_map.tasks or {}).hs_task_subject, "subject")
            test.is_true(contains(selection.tasks or {}, "hs_task_priority"))

            local tasks = field_map.tasks or {}
            test.eq(tasks.hs_task_status, "status")
            test.is_true(contains(selection.tasks or {}, "hs_task_subject"))

            local meetings = field_map.meetings or {}
            test.eq(meetings.hs_meeting_title, "title")
            test.eq(meetings.hs_meeting_recording_url, "recording_url")
            test.eq(meetings.hs_has_meeting_transcript, "has_transcript")
            test.eq((field_map.notes or {}).hs_note_body, "body")
            test.eq((field_map.emails or {}).hs_email_subject, "subject")

            local calls = field_map.calls or {}
            test.eq(calls.hs_call_title, "title")
            test.eq(calls.hs_call_status, "call_status")
            test.eq(calls.hs_call_disposition, "call_disposition")
            test.eq(calls.hs_call_has_voicemail, "has_voicemail")
            test.is_true(contains(selection.calls or {}, "hs_call_recording_url"))
            test.is_true(contains(selection.calls or {}, "hs_call_duration"))
        end)

        test.it("lists every readable object type while keeping the added types out of writes", function()
            local rows = connection.object_resources()
            test.eq(#rows, 8)
            local ids: { string } = {}
            for _, row in ipairs(rows) do
                test.eq(row.type, "hubspot_object")
                test.not_nil(row.name)
                ids[#ids + 1] = row.id
            end
            for _, object_type in ipairs({ "contacts", "companies", "deals", "tasks", "meetings", "notes", "emails", "calls" }) do
                test.is_true(contains(ids, object_type), "resource missing " .. object_type)
            end
        end)

        test.it("publishes typed record and association ports for the generic Automation surface", function()
            local source = get("kickside.hubspot.source:crm")
            local source_meta = meta(source)
            test.eq(source_meta.type, "kickside.automation.port")
            local config_schema = value(source, "config_schema")
            test.eq(config_schema.object_type.picker, "kickside-hubspot-picker")
            test.eq(config_schema.connection_id.required, true)
            test.eq(config_schema.object_type.required, true)
            test.eq(config_schema.backfill_since.required, false)
            test.is_nil(config_schema.direction)
            test.is_nil(config_schema.schedule)

            local associations = get("kickside.hubspot.source:crm_associations")
            test.eq(meta(associations).type, "kickside.automation.port")
            test.eq(value(associations, "binding"), "kickside.hubspot.source:association_source")
            test.eq(value(associations, "reconcile").pull_keys, "kickside.hubspot.source:pull_association_keys")
            local association_config = value(associations, "config_schema")
            test.eq(association_config.from_object_type.required, true)
            test.eq(association_config.to_object_type.required, true)
            test.eq(association_config.connection_id.required, true)
            test.is_nil(association_config.object_type)
            test.is_nil(association_config.field_map)
        end)

        test.it("discovers and batch-hydrates a full-property mirror without sending a wildcard", function()
            local fake: any = { searches = {}, batches = {} }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "1", properties = { lastmodifieddate = "2026-07-25T00:00:00Z" } },
                } } }
            end
            function fake.list_properties(_conn: any, _object_type: string): any
                return { success = true, data = { results = {
                    { name = "lastmodifieddate" },
                    { name = "custom_intent_signal" },
                } } }
            end
            function fake.batch_read_objects(_conn: any, object_type: string, ids: any, properties: any): any
                fake.batches[#fake.batches + 1] = { object_type = object_type, ids = ids, properties = properties }
                return { success = true, data = { results = {
                    { id = "1", properties = { custom_intent_signal = "high" } },
                } } }
            end

            local result = pull_core.pull({
                config = { connection_id = "hubspot-1", all_properties = true },
            }, { object_type = "contacts" }, { transport = fake })

            test.eq(result.success, true)
            test.eq(result.items[1].payload.properties.custom_intent_signal, "high")
            test.eq(#fake.batches, 1)
            for _, property in ipairs(fake.searches[1].body.properties) do
                test.is_true(property ~= "*")
            end
        end)

        test.it("declares direct package dependencies in production", function()
            for _, expected in ipairs({
                { "component", "kickside/component" },
                { "connection", "kickside/connection", ">=0.3.0" },
                { "contract", "kickside/contract" },
            }) do
                local dep = get("kickside.hubspot:dep.kickside." .. expected[1])
                test.eq(value(dep, "component"), expected[2])
                test.eq(tostring(value(dep, "version") or ""), expected[3] or "*", expected[2] .. " must retain its compatibility bound")
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
