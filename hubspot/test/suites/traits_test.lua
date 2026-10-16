local test = require("test")
local transport = require("transport")
local read_tool = require("read_tool")
local json = require("json")
local registry = require("registry")
local funcs = require("funcs")

local READABLE_TYPES = { "contacts", "companies", "deals", "tasks", "meetings", "notes", "emails", "calls" }
local WRITABLE_TYPES = { "contacts", "companies", "deals", "tasks" }
local ENGAGEMENT_TYPES = { "meetings", "notes", "emails", "calls" }

local READ_TOOL = "kickside.hubspot.traits:read_tool"
local WRITE_TOOL = "kickside.hubspot.traits:write_tool"

local function get_entry(id: string): any
    local entries, err = registry.find({ [".id"] = id })
    test.is_nil(err)
    test.not_nil(entries, id .. " lookup failed")
    test.eq(#entries, 1, id .. " should resolve once")
    return entries[1]
end

local function decode_schema(entry: any): any
    test.not_nil(entry.meta, entry.id .. " missing meta")
    test.eq(entry.meta.type, "tool")
    test.not_nil(entry.meta.input_schema, entry.id .. " missing input_schema")
    local schema, err = json.decode(tostring(entry.meta.input_schema))
    test.is_nil(err)
    test.eq(schema.type, "object")
    test.eq(schema.additionalProperties, false)
    return schema
end

local function enum_contains(enum: any, value: string): boolean
    for _, item in ipairs(enum or {}) do
        if item == value then return true end
    end
    return false
end

local function define_tests()
    test.describe("HubSpot traits", function()
        test.it("publishes read + write tools with model-facing schemas", function()
            local read_schema = decode_schema(get_entry(READ_TOOL))
            local write_schema = decode_schema(get_entry(WRITE_TOOL))
            test.not_nil(read_schema.properties.action.enum)
            test.not_nil(write_schema.properties.action.enum)
            test.eq(read_schema.required[1], "action")
            test.eq(read_schema.properties.after.type, "string")
            test.ok(tostring(read_schema.properties.after.description):find("search_objects", 1, true) ~= nil)
        end)

        test.it("advertises the documented read and write actions", function()
            local read_enum = decode_schema(get_entry(READ_TOOL)).properties.action.enum
            local write_enum = decode_schema(get_entry(WRITE_TOOL)).properties.action.enum
            for _, action in ipairs({ "list_objects", "get_object", "search_objects", "list_owners", "list_pipelines", "list_properties" }) do
                test.is_true(enum_contains(read_enum, action), "missing read action " .. action)
            end
            for _, action in ipairs({ "create_object", "update_object", "archive_object", "create_association", "log_activity" }) do
                test.is_true(enum_contains(write_enum, action), "missing write action " .. action)
            end
        end)

        test.it("scopes the read tool to all eight readable object types", function()
            local ot = decode_schema(get_entry(READ_TOOL)).properties.object_type.enum
            test.eq(#ot, #READABLE_TYPES)
            for _, t in ipairs(READABLE_TYPES) do
                test.is_true(enum_contains(ot, t), "read tool missing object_type " .. t)
            end
        end)

        test.it("scopes the write tool to the writable object types only", function()
            local schema = decode_schema(get_entry(WRITE_TOOL))
            for _, key in ipairs({ "object_type", "to_object_type" }) do
                local enum = schema.properties[key].enum
                test.eq(#enum, #WRITABLE_TYPES)
                for _, t in ipairs(WRITABLE_TYPES) do
                    test.is_true(enum_contains(enum, t), "write tool missing " .. key .. " " .. t)
                end
                for _, t in ipairs(ENGAGEMENT_TYPES) do
                    test.is_true(not enum_contains(enum, t), "write tool advertises pull-only " .. key .. " " .. t)
                end
            end
        end)

        test.it("rejects added read-only type writes before connection resolution", function()
            local raw, err = funcs.new():call(WRITE_TOOL, {
                action = "create_object", object_type = "calls", properties = { hs_call_title = "no write" },
            })
            test.is_nil(err)
            test.is_false(raw.success)
            test.not_nil((tostring(raw.error):find("pull%-only")))
        end)

        test.it("keeps connection selection out of the model-facing schemas", function()
            for _, id in ipairs({ READ_TOOL, WRITE_TOOL }) do
                local schema_text = tostring(get_entry(id).meta.input_schema or "")
                test.is_nil(schema_text:find("component_id", 1, true), id .. " exposes component_id")
                test.is_nil(schema_text:find("connection_id", 1, true), id .. " exposes connection_id")
            end
        end)

        test.it("rejects every write action against pull-only engagement types at the tool level", function()
            for _, object_type in ipairs(ENGAGEMENT_TYPES) do
                for _, action in ipairs({ "create_object", "update_object", "archive_object", "create_association", "log_activity" }) do
                    local raw, err = funcs.new():call(WRITE_TOOL, {
                        action = action,
                        object_type = object_type,
                        object_id = "1",
                        properties = { hs_meeting_title = "x" },
                        to_object_type = "contacts",
                        to_object_id = "2",
                    })
                    test.is_nil(err, action .. " " .. object_type .. " call failed: " .. tostring(err))
                    test.is_false(raw.success, action .. " " .. object_type .. " must be rejected")
                    test.not_nil(tostring(raw.error):find("pull-only", 1, true),
                        action .. " " .. object_type .. " rejection must name the write gate, got: " .. tostring(raw.error))
                end
            end
        end)

        test.it("rejects pull-only engagement types as association targets at the tool level", function()
            local raw, err = funcs.new():call(WRITE_TOOL, {
                action = "create_association",
                object_type = "contacts",
                object_id = "1",
                to_object_type = "meetings",
                to_object_id = "2",
            })
            test.is_nil(err)
            test.is_false(raw.success)
            test.not_nil(tostring(raw.error):find("to_object_type must be one of", 1, true),
                "expected the to_object_type gate, got: " .. tostring(raw.error))
        end)

        test.it("passes writable types through the gate to connection resolution", function()
            local raw, err = funcs.new():call(WRITE_TOOL, {
                action = "create_object",
                object_type = "contacts",
                properties = { firstname = "Ada" },
            })
            -- The harness has no HubSpot connection, so a writable type must fail on
            -- connection resolution with its typed error, never on the object-type gate.
            test.is_nil(raw)
            test.not_nil(err)
            test.is_nil(tostring(err):find("object_type must be", 1, true),
                "writable type hit the object-type gate: " .. tostring(err))
        end)

        test.it("returns compact CRM rows with requested properties and the provider cursor", function()
            local long = string.rep("é note ", 4000)
            local saved = { connect = transport.connect, list_objects = transport.list_objects,
                get_object = transport.get_object, search_objects = transport.search_objects, list_properties = transport.list_properties }
            local seen: any = {}
            transport.connect = function(): (any, any) return { access_token = "token" }, nil end
            transport.list_objects = function(_conn: any, _ot: string, q: any): any
                seen.list = q
                return { success = true, data = { results = { { id = "1", properties = { firstname = "Ada", notes = long } } },
                    paging = { next = { after = "cursor-2" } } } }
            end
            transport.search_objects = function(_conn: any, _ot: string, body: any): any
                seen.search = body
                return { success = true, data = { total = 1, results = { { id = "1", properties = { firstname = "Ada" } } } } }
            end
            transport.list_properties = function() return {success = true, data = {results = {{name = "firstname"}, {name = "notes"}}}} end
            transport.get_object = function(_, _, _, query): any
                seen.detail = query
                return { success = true, data = { id = "1", properties = { firstname = "Ada", notes = long } } }
            end
            local page: any, page_err = read_tool.handler({ action = "list_objects", object_type = "contacts", after = "cursor-1" })
            local search: any = read_tool.handler({ action = "search_objects", object_type = "contacts", query = "Ada", after = "5" })
            local record: any = read_tool.handler({ action = "get_object", object_type = "contacts", object_id = "1" })
            local selected: any = read_tool.handler({action = "list_objects", object_type = "contacts", properties = {"notes"}, after = "cursor-1"})
            for key, value in pairs(saved) do transport[key] = value end
            test.eq(selected.results[1].properties.notes, long)
            test.eq(seen.detail.properties, "firstname,notes")
            test.is_nil(page_err)
            test.eq(seen.list.after, "cursor-1")
            test.eq(page.results[1].properties.firstname, "Ada")
            test.is_nil(page.results[1].properties.notes)
            test.eq(seen.list.properties, "notes")
            test.eq(seen.search.properties[1], "firstname")
            test.eq(page.paging.next.after, "cursor-2")
            test.eq(seen.search.after, "5")
            test.eq(search.results[1].properties.firstname, "Ada")
            test.eq(record.properties.notes, long)
        end)

        test.it("pages compact property definitions", function()
            local saved = { connect = transport.connect, list_properties = transport.list_properties }
            transport.connect = function(): (any, any) return { access_token = "token" }, nil end
            local definitions = {}
            for i = 1, 3 do
                definitions[i] = { name = "p" .. tostring(i), label = "P" .. tostring(i), type = "enumeration", fieldType = "select",
                    description = "Property " .. tostring(i), options = { { label = "A", value = "a" } },
                    modificationMetadata = { readOnlyValue = false, archivable = true }, hubspotDefined = true }
            end
            transport.list_properties = function(): any return { success = true, data = { results = definitions } } end
            local first: any = read_tool.handler({ action = "list_properties", object_type = "deals", limit = 2 })
            local last: any = read_tool.handler({ action = "list_properties", object_type = "deals", limit = 2, after = first.next_after })
            for key, value in pairs(saved) do transport[key] = value end
            test.eq(first.count, 2)
            test.eq(first.next_after, "2")
            test.is_nil(first.properties[1].description)
            test.is_nil(first.properties[1].options)
            test.eq(first.properties[1].fieldType, "select")
            test.is_nil(first.properties[1].hubspotDefined)
            test.is_nil(first.properties[1].modificationMetadata)
            test.eq(last.properties[1].name, "p3")
            test.is_nil(last.next_after)
        end)

        test.it("returns complete property, pipeline and owner detail", function()
            local saved = {connect = transport.connect, get_property = transport.get_property,
                get_pipeline = transport.get_pipeline, get_owner = transport.get_owner}
            transport.connect = function() return {} end
            transport.get_property = function(_, _, name) return {success = true, data = {name = name, description = "Full property", options = {{value = "a"}}}} end
            transport.get_pipeline = function(_, _, id) return {success = true, data = {id = id, stages = {{id = "stage-1"}}}} end
            transport.get_owner = function(_, id) return {success = true, data = {id = id, teams = {{id = "team-1"}}}} end
            local property: any = read_tool.handler({action = "get_property", object_type = "deals", property_name = "tier"})
            local pipeline: any = read_tool.handler({action = "get_pipeline", object_type = "deals", object_id = "pipe-1"})
            local owner: any = read_tool.handler({action = "get_owner", object_id = "owner-1"})
            for key, value in pairs(saved) do transport[key] = value end
            test.eq(property.description, "Full property")
            test.eq(property.options[1].value, "a")
            test.eq(pipeline.stages[1].id, "stage-1")
            test.eq(owner.teams[1].id, "team-1")
        end)

        test.it("fails with the typed transport error and returns HubSpot's rejection", function()
            local saved = { connect = transport.connect, get_object = transport.get_object }
            transport.connect = function(): (any, any) return { access_token = "token" }, nil end
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            transport.get_object = function(): (any?, error?) return nil, failure end
            local missing, missing_err = read_tool.handler({ action = "get_object", object_type = "contacts", object_id = "1", properties = {"firstname"} })
            transport.get_object = function(): any return { success = false, error = "not found", status_code = 404,
                data = { status = "error", category = "OBJECT_NOT_FOUND" } } end
            local rejected: any = read_tool.handler({ action = "get_object", object_type = "contacts", object_id = "1", properties = {"firstname"} })
            for key, value in pairs(saved) do transport[key] = value end
            test.is_nil(missing)
            test.eq(missing_err, failure)
            test.is_false(rejected.success)
            test.eq(rejected.status_code, 404)
            test.eq(rejected.data.category, "OBJECT_NOT_FOUND")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
