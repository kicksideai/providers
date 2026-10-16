local test = require("test")
local config = require("config")

local function contains(values: { string }, key: string): boolean
    for _, value in ipairs(values or {}) do
        if value == key then return true end
    end
    return false
end

local function define_tests()
    test.describe("HubSpot config", function()
        test.it("preserves registry failures for defaults and configured mappings", function()
            local cause = errors.new({ message = "mapping registry unavailable", kind = errors.UNAVAILABLE })
            config._registry = { get = function(_id: string): (any, any?) return nil, cause end }
            local configs: { any } = { {}, { default_field_mapping_ref = "app:custom_mapping" } }
            local results: { any } = {}
            for _, value in ipairs(configs) do
                for _, operation in ipairs({ config.field_map_for, config.properties_for, config.mirrors_all_properties }) do
                    local out, err = operation(value, "contacts")
                    results[#results + 1] = { out = out, err = err }
                end
                local out, err = config.apply_field_map(value, "contacts", { email = "member@example.test" })
                results[#results + 1] = { out = out, err = err }
            end
            config._registry = nil
            for _, result in ipairs(results) do
                test.is_nil(result.out)
                test.eq(result.err, cause)
            end
        end)

        test.it("exposes the readable CRM set with added read-only object types", function()
            test.is_true(config.is_object_type("contacts"))
            test.is_true(config.is_object_type("companies"))
            test.is_true(config.is_object_type("deals"))
            test.is_true(config.is_object_type("tasks"))
            test.is_true(config.is_writable_object_type("tasks"))
            for _, object_type in ipairs({ "meetings", "notes", "emails", "calls" }) do
                test.is_true(config.is_object_type(object_type), object_type .. " must be readable")
                test.is_true(not config.is_writable_object_type(object_type), object_type .. " must remain read-only")
                test.eq(config.watermark_property_for({}, object_type), "hs_lastmodifieddate")
            end
            test.is_true(not config.can_enumerate_archived("meetings"))
            for _, object_type in ipairs({ "contacts", "companies", "deals", "tasks", "notes", "emails", "calls" }) do
                test.is_true(config.can_enumerate_archived(object_type), object_type .. " must enumerate archived records")
            end
            test.is_true(not config.is_object_type("tickets"))
        end)

        test.it("pulls engagements as source-only object types", function()
            test.is_true(config.is_object_type("meetings"))
            test.is_true(config.is_object_type("notes"))
            test.is_true(config.is_object_type("emails"))
            test.is_true(not config.is_writable_object_type("meetings"))
            test.is_true(not config.is_writable_object_type("notes"))
            test.is_true(not config.is_writable_object_type("emails"))
            test.eq(config.watermark_property_for({}, "meetings"), "hs_lastmodifieddate")
            test.eq(config.watermark_property_for({}, "notes"), "hs_lastmodifieddate")
            test.eq(config.watermark_property_for({}, "emails"), "hs_lastmodifieddate")
        end)

        test.it("pulls calls as a source-only engagement type", function()
            test.is_true(config.is_object_type("calls"))
            test.is_true(not config.is_writable_object_type("calls"))
            test.eq(config.watermark_property_for({}, "calls"), "hs_lastmodifieddate")
        end)

        -- Status is transport/lifecycle and disposition is the call outcome:
        -- two different facts, so both are requested and both are mapped.
        test.it("requests the identifying call properties, status and disposition apart", function()
            local calls = config.properties_for({}, "calls")
            for _, property in ipairs({
                "hs_call_title", "hs_call_body", "hs_timestamp", "hs_call_direction",
                "hs_call_duration", "hs_call_recording_url", "hs_call_status",
                "hs_call_disposition", "hs_call_has_voicemail", "hs_lastmodifieddate",
            }) do
                test.is_true(contains(calls, property), "calls property selection missing " .. property)
            end

            local field_map = config.field_map_for({}, "calls")
            test.eq(field_map.hs_call_status, "call_status")
            test.eq(field_map.hs_call_disposition, "call_disposition")
            test.eq(field_map.hs_call_has_voicemail, "has_voicemail")
            test.eq(field_map.hs_call_duration, "duration_ms")
            test.eq(field_map.hs_call_recording_url, "recording_url")
            test.eq(field_map.hs_call_direction, "direction")
            test.eq(field_map.hs_call_title, "title")
            test.eq(field_map.hs_call_body, "body")
            test.eq(field_map.hs_timestamp, "occurred_at")
        end)

        test.it("requests the identifying engagement properties per type", function()
            local meetings = config.properties_for({}, "meetings")
            test.is_true(contains(meetings, "hs_meeting_title"))
            test.is_true(contains(meetings, "hs_meeting_start_time"))
            test.is_true(contains(meetings, "hs_all_attendee_emails"))
            test.is_true(contains(meetings, "hs_meeting_recording_url"))
            test.is_true(contains(meetings, "hs_has_meeting_transcript"))
            test.is_true(contains(meetings, "hs_lastmodifieddate"))

            local notes = config.properties_for({}, "notes")
            test.is_true(contains(notes, "hs_note_body"))
            test.is_true(contains(notes, "hs_timestamp"))

            local emails = config.properties_for({}, "emails")
            test.is_true(contains(emails, "hs_email_subject"))
            test.is_true(contains(emails, "hs_email_text"))
            test.is_true(contains(emails, "hs_email_direction"))
            test.is_true(contains(emails, "hs_email_from_email"))
            test.is_true(contains(emails, "hs_email_to_email"))
            test.is_true(contains(emails, "hs_timestamp"))

            local tasks = config.properties_for({}, "tasks")
            test.is_true(contains(tasks, "hs_task_subject"))
            test.is_true(contains(tasks, "hs_task_status"))
        end)

        test.it("treats an explicit object field map as authoritative", function()
            local field_map = config.field_map_for({
                field_map = {
                    contacts = {
                        phone = false,
                        mobilephone = "phone",
                    },
                },
            }, "contacts")
            test.is_nil(field_map.phone)
            test.eq(field_map.mobilephone, "phone")
        end)

        test.it("loads default field mapping from the declared registry artifact", function()
            local prev = config._registry
            config._registry = {
                get = function(id)
                    if id == config.DEFAULTS_CONFIG then
                        return { meta = { default_field_mapping_ref = "tenant:hubspot_fields" } }, nil
                    end
                    if id == "tenant:hubspot_fields" then
                        return {
                            meta = {
                                field_map = {
                                    contacts = {
                                        email = "email",
                                        phone = "phone",
                                    },
                                },
                                property_selection = {
                                    contacts = { "email", "phone" },
                                },
                            },
                        }, nil
                    end
                    return nil, "unexpected registry id " .. tostring(id)
                end,
            }

            local field_map = config.field_map_for({}, "contacts")
            local props = config.properties_for({}, "contacts")
            config._registry = prev

            test.eq(field_map.email, "email")
            test.eq(field_map.phone, "phone")
            test.is_true(contains(props, "phone"))
        end)

        test.it("derives default property selection from seeded config without pulling every portal property", function()
            local props = config.properties_for({}, "contacts")
            test.is_true(contains(props, "email"))
            test.is_true(contains(props, "hs_lastmodifieddate"))
            test.is_true(contains(props, "jobtitle"))
            test.is_true(#props < 30, "default contact property subset should stay bounded")
        end)

        test.it("honors explicit property selection while preserving system metadata", function()
            local props = config.properties_for({
                property_selection = {
                    contacts = { "email", "phone" },
                },
            }, "contacts")
            test.is_true(contains(props, "email"))
            test.is_true(contains(props, "phone"))
            test.is_true(contains(props, "hs_lastmodifieddate"))
            test.is_true(not contains(props, "jobtitle"))
        end)

        test.it("treats the wildcard and explicit flag as full-property mirror mode", function()
            local wildcard = { property_selection = { contacts = { "*" } } }
            local mirrors, mirror_err = config.mirrors_all_properties(wildcard, "contacts")
            test.is_nil(mirror_err)
            test.is_true(mirrors)
            local mirrors, mirror_err = config.mirrors_all_properties({ all_properties = true }, "contacts")
            test.is_nil(mirror_err)
            test.is_true(mirrors)
            local props = config.properties_for(wildcard, "contacts")
            test.is_true(not contains(props, "*"))
            test.is_true(contains(props, "lastmodifieddate"))
        end)

        test.it("resolves per-object watermark properties and overrides", function()
            test.eq(config.watermark_property_for({}, "contacts"), "lastmodifieddate")
            test.eq(config.watermark_property_for({}, "companies"), "hs_lastmodifieddate")
            test.eq(config.watermark_property_for({}, "deals"), "hs_lastmodifieddate")
            test.eq(config.watermark_property_for({}, "tasks"), "hs_lastmodifieddate")

            local prop = config.watermark_property_for({
                objects = {
                    contacts = { watermark_property = "custom_modified_at" },
                },
            }, "contacts")
            test.eq(prop, "custom_modified_at")

            local props = config.properties_for({
                objects = {
                    contacts = { watermark_property = "custom_modified_at" },
                },
                property_selection = {
                    contacts = { "email" },
                },
            }, "contacts")
            test.is_true(contains(props, "custom_modified_at"))
        end)

        test.it("applies configured field maps as data", function()
            local mapped = config.apply_field_map({
                field_map = {
                    contacts = {
                        email = "email",
                        jobtitle = "title",
                    },
                },
            }, "contacts", {
                email = "contact@example.invalid",
                jobtitle = "Engineer",
            })
            test.eq(mapped.email, "contact@example.invalid")
            test.eq(mapped.title, "Engineer")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
