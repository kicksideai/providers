local test = require("test")
local core = require("core")
local config = require("config")

local function define_tests()
    test.describe("HubSpot engagement source intent", function()
        local cases = {
            { object_type = "meetings", title_property = "hs_meeting_title", body_property = "hs_meeting_body" },
            { object_type = "notes", title_property = "", body_property = "hs_note_body" },
            { object_type = "emails", title_property = "hs_email_subject", body_property = "hs_email_text" },
            { object_type = "calls", title_property = "hs_call_title", body_property = "hs_call_body" },
        }
        for _, case in ipairs(cases) do
            test.it("pulls read-only " .. case.object_type .. " with content, watermark and complete associations", function()
                local association_pages = 0
                local properties: any = { hs_lastmodifieddate = "2026-09-01T12:00:00Z", hs_timestamp = "2026-09-01T11:00:00Z" }
                properties[case.body_property] = "<p>NORTHWIND-ENGAGEMENT-731</p>"
                if case.title_property ~= "" then properties[case.title_property] = "Northwind packing" end
                local fake: any = {}
                function fake.connect(_id: string?): (any, string?) return { component_id = "northwind", api_key = "fictional" }, nil end
                function fake.search_objects(_conn: any, object_type: string, request: any): any
                    test.eq(object_type, case.object_type)
                    test.eq(request.sorts[1].propertyName, "hs_lastmodifieddate")
                    return { success = true, data = { results = { { id = "731", properties = properties } } } }
                end
                function fake.batch_read_associations(_conn: any, from_type: string, to_type: string, inputs: any): any
                    test.eq(from_type, case.object_type)
                    test.eq(inputs[1].id, "731")
                    association_pages = association_pages + 1
                    local row: any = { from = { id = "731" }, to = {} }
                    if to_type == "contacts" then
                        if inputs[1].after == nil then
                            row.to = { { toObjectId = "contact-1" } }
                            row.paging = { next = { after = "next-contact" } }
                        else
                            test.eq(inputs[1].after, "next-contact")
                            row.to = { { toObjectId = "contact-2" } }
                        end
                    else
                        test.eq(to_type, "deals")
                        row.to = { { toObjectId = "deal-1" } }
                    end
                    return { success = true, data = { results = { row } } }
                end
                local page = core.pull({ config = { connection_id = "northwind" }, limit = 10 },
                    { object_type = case.object_type }, { transport = fake })
                test.is_true(page.success)
                test.eq(#page.items, 1)
                local item = page.items[1]
                test.eq(item.item_key, "hubspot:" .. case.object_type .. ":731")
                test.eq(item.source_version, properties.hs_lastmodifieddate)
                test.eq(item.payload.provenance.external_id, case.object_type .. "/731")
                test.contains(item.payload.content, "NORTHWIND-ENGAGEMENT-731")
                test.is_true(string.find(item.payload.content, "<p>", 1, true) == nil)
                test.eq(item.payload.associations.contacts[1], "contact-1")
                test.eq(item.payload.associations.contacts[2], "contact-2")
                test.eq(item.payload.associations.deals[1], "deal-1")
                test.eq(association_pages, 3)
                test.is_true(config.is_object_type(case.object_type))
                test.is_false(config.is_writable_object_type(case.object_type))
            end)
        end
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
