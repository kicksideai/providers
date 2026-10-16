local test = require("test")
local core = require("pull_core")
local config = require("config")
local conformance = require("conformance")

local function new_fake(): any
    local fake: any = { searches = {}, lists = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, any?)
        if component_id == "bad" then return nil, errors.new({ message = "revoked", kind = errors.INVALID }) end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, api_key = "pat" }, nil
    end
    function fake.batch_read_associations(_conn: any, _from: string, _to: string, inputs: any): any
        local results: { any } = {}
        for _, input in ipairs(inputs) do
            results[#results + 1] = { from = { id = input.id }, to = {} }
        end
        return { success = true, data = { results = results } }
    end
    function fake.search_objects(_conn: any, object_type: string, body: any): any
        fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
        if object_type == "bad" then return { success = false, error = "bad object", status_code = 400 } end
        local filters = (body.filterGroups and body.filterGroups[1] and body.filterGroups[1].filters) or {}
        local by: any = {}
        for _, f in ipairs(filters) do by[f.propertyName .. ":" .. f.operator] = f.value end
        if by["lastmodifieddate:EQ"] == "2026-06-02T10:00:00Z" then
            -- the tie drain re-reads the group the opening page ended on
            return { success = true, data = { results = {
                { id = "2", properties = { firstname = "Contact", lastname = "Two", email = "<b>contact-two@example.invalid</b>", lastmodifieddate = "2026-06-02T10:00:00Z", createdate = "2026-06-01T09:00:00Z" }, updatedAt = "2026-06-02T10:00:00Z", createdAt = "2026-06-01T09:00:00Z" },
            } } }
        end
        if by["lastmodifieddate:GT"] == "2026-06-02T10:00:00Z" then
            return { success = true, data = { results = {
                { id = "3", properties = { firstname = "Contact", lastname = "Three", email = "contact-three@example.invalid", lastmodifieddate = "2026-06-03T10:00:00Z", createdate = "2026-06-01T10:00:00Z" }, updatedAt = "2026-06-03T10:00:00Z", createdAt = "2026-06-01T10:00:00Z" },
            } } }
        end
        return { success = true, data = { results = {
            { id = "1", properties = { firstname = "Contact", lastname = "One", email = "contact-one@example.invalid", lastmodifieddate = "2026-06-01T10:00:00Z", createdate = "2026-06-01T09:00:00Z" }, updatedAt = "2026-06-01T10:00:00Z", createdAt = "2026-06-01T09:00:00Z" },
            { id = "2", properties = { firstname = "Contact", lastname = "Two", email = "<b>contact-two@example.invalid</b>", lastmodifieddate = "2026-06-02T10:00:00Z", createdate = "2026-06-01T09:00:00Z" }, updatedAt = "2026-06-02T10:00:00Z", createdAt = "2026-06-01T09:00:00Z" },
        }, paging = { next = { after = "2" } } } }
    end
    function fake.list_objects(_conn: any, object_type: string, query: any): any
        fake.lists[#fake.lists + 1] = { object_type = object_type, query = query }
        return { success = true, data = { results = {
            { id = "old", archived = true, properties = { firstname = "Old", lastmodifieddate = "2026-06-01T08:00:00Z" }, updatedAt = "2026-06-01T08:00:00Z" },
        } } }
    end
    return fake
end

local function conformance_fake(): any
    local fake: any = { search_count = 0 }
    function fake.connect(component_id: string?): (any, any?)
        if component_id == "bad" then return nil, errors.new({ message = "revoked", kind = errors.INVALID }) end
        return { component_id = "conn", api_key = "pat" }, nil
    end
    function fake.search_objects(_conn: any, _object_type: string, body: any): any
        fake.search_count = fake.search_count + 1
        if fake.search_count == 1 then
            return { success = true, data = { results = {
                { id = "1", properties = { firstname = "A", lastmodifieddate = "2026-06-01T10:00:00Z" }, updatedAt = "2026-06-01T10:00:00Z" },
                { id = "2", properties = { firstname = "B", lastmodifieddate = "2026-06-02T10:00:00Z" }, updatedAt = "2026-06-02T10:00:00Z" },
            }, paging = { next = { after = "2" } } } }
        end
        return { success = true, data = { results = {
            { id = "3", properties = { firstname = "C", lastmodifieddate = "2026-06-03T10:00:00Z" }, updatedAt = "2026-06-03T10:00:00Z" },
        } } }
    end
    function fake.list_objects(_conn: any, _object_type: string, _query: any): any
        return { success = true, data = { results = {} } }
    end
    return fake
end

local function define_tests()
    test.describe("HubSpot pull_core", function()
        test.it("stops active, archived and key pulls when registry configuration is unavailable", function()
            local cause = errors.new({ message = "registry lookup unavailable", kind = errors.UNAVAILABLE })
            config._registry = { get = function(_id: string): (any, any?) return nil, cause end }
            local results: { any } = {}
            for _, phase in ipairs({ "backfill_active", "backfill_archived" }) do
                for _, operation in ipairs({ core.pull, core.pull_keys }) do
                    local fake = new_fake()
                    local out, err = operation({
                        cursor = { phase = phase, connection_id = "conn1", object_type = "contacts" },
                        config = { connection_id = "conn1" }, limit = 2,
                    }, { object_type = "contacts" }, { transport = fake })
                    results[#results + 1] = { out = out, err = err, calls = #fake.searches + #fake.lists }
                end
            end
            config._registry = nil
            for _, result in ipairs(results) do
                test.is_nil(result.out)
                test.eq(result.err, cause)
                test.eq(result.calls, 0)
            end
        end)

        test.it("paginates active records, emits upserts, clean markdown, versions, and delete ops", function()
            local fake = new_fake()
            local first = core.pull({ config = { connection_id = "conn1" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(first.success, true)
            test.eq(first.has_more, true)
            test.eq(first.items[1].item_key, "hubspot:contacts:1")
            test.eq(first.items[1].op, "upsert")
            test.eq(first.items[1].source_version, "2026-06-01T10:00:00Z")
            test.eq(first.items[1].payload.origin.mode, "backfill")
            test.eq(first.items[1].payload.origin.backfill, true)
            test.eq(first.items[1].payload.provenance.external_source, "hubspot")
            test.eq(first.items[1].payload.provenance.external_id, "contacts/1")
            test.eq(first.items[1].payload.raw.id, "1")
            test.eq(first.items[1].payload.record.id, "1")
            test.eq(first.items[1].payload.record.source.type, "hubspot.crm")
            test.eq(first.items[1].payload.record.source.id, "conn1")
            test.eq(first.items[1].payload.record.fields.email, "contact-one@example.invalid")
            test.is_true(first.items[2].payload.content:find("<b>", 1, true) == nil, "HTML tags must be stripped")
            -- A full page ends inside its highest watermark group: the opaque
            -- cursor is ignored and that group is drained by object id.
            test.is_nil(first.next_cursor.after)
            test.eq(first.next_cursor.tie_ts, "2026-06-02T10:00:00Z")

            local drain = core.pull({ cursor = first.next_cursor, config = { connection_id = "conn1" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(drain.success, true)
            test.eq(#drain.items, 0, "the re-read group row was already delivered")
            test.eq(drain.next_cursor.resume_ts, "2026-06-02T10:00:00Z")

            local second = core.pull({ cursor = drain.next_cursor, config = { connection_id = "conn1" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(second.success, true)
            test.eq(second.has_more, true)
            test.eq(second.items[1].item_key, "hubspot:contacts:3")
            test.eq(second.next_cursor.phase, "backfill_archived")

            local third = core.pull({ cursor = second.next_cursor, config = { connection_id = "conn1" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(third.success, true)
            test.eq(third.items[1].op, "delete")
            test.eq(third.items[1].item_key, "hubspot:contacts:old")
            test.eq(fake.lists[1].query.archived, "true")
            test.eq(third.next_cursor.active_hw, "2026-06-03T10:00:00Z")
            test.eq(third.next_cursor.active_hw_ids[1], "contacts/3")
            test.eq(third.next_cursor.archived_hw, "2026-06-01T08:00:00Z")
            test.eq(third.has_more, false)
            test.eq(third.next_cursor.phase, "live_active")
        end)

        test.it("maps a meeting engagement into a titled, provenance-tagged envelope", function()
            local fake: any = { searches = {} }
            function fake.connect(_component_id: string?): (any, string?)
                return { component_id = "conn1", api_key = "pat" }, nil
            end
            function fake.batch_read_associations(_conn: any, _from: string, to_type: string, inputs: any): any
                local results: { any } = {}
                for _, input in ipairs(inputs) do
                    local to: { any } = {}
                    if to_type == "contacts" then to[#to + 1] = { toObjectId = "c-77" } end
                    results[#results + 1] = { from = { id = input.id }, to = to }
                end
                return { success = true, data = { results = results } }
            end
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "77", properties = {
                        hs_meeting_title = "Acme proposal review",
                        hs_meeting_start_time = "2026-06-30T15:00:00Z",
                        hs_meeting_end_time = "2026-06-30T15:30:00Z",
                        hs_meeting_body = "<p>Reviewed pricing.</p>",
                        hs_all_attendee_emails = "drew@acme.invalid;rachel@acme.invalid",
                        hs_meeting_outcome = "COMPLETED",
                        hs_meeting_recording_url = "https://rec/77",
                        hs_has_meeting_transcript = "true",
                        hs_lastmodifieddate = "2026-06-30T16:00:00Z",
                    }, updatedAt = "2026-06-30T16:00:00Z", createdAt = "2026-06-30T14:00:00Z" },
                } } }
            end
            local page = core.pull({ config = { connection_id = "conn1" }, limit = 10 }, { object_type = "meetings" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(fake.searches[1].object_type, "meetings")
            test.eq(fake.searches[1].body.sorts[1].propertyName, "hs_lastmodifieddate")
            local item = page.items[1]
            test.eq(item.item_key, "hubspot:meetings:77")
            test.eq(item.op, "upsert")
            test.eq(item.source_version, "2026-06-30T16:00:00Z")
            test.eq(item.payload.object_type, "meetings")
            test.eq(item.payload.provenance.external_id, "meetings/77")
            test.eq(item.payload.title, "Acme proposal review")
            test.is_true(item.payload.content:find("<p>", 1, true) == nil, "HTML tags must be stripped")
            test.eq(item.payload.properties.hs_all_attendee_emails, "drew@acme.invalid;rachel@acme.invalid")
            test.eq(item.payload.record.fields.recording_url, "https://rec/77")
            test.eq(item.payload.record.fields.has_transcript, "true")
            test.eq(item.payload.associations.contacts[1], "c-77")
            test.eq(#item.payload.associations.deals, 0)
        end)

        test.it("maps a call engagement into a titled, provenance-tagged envelope", function()
            local fake: any = { searches = {} }
            function fake.connect(_component_id: string?): (any, string?)
                return { component_id = "conn1", api_key = "pat" }, nil
            end
            function fake.batch_read_associations(_conn: any, _from: string, _to: string, inputs: any): any
                local results: { any } = {}
                for _, input in ipairs(inputs) do results[#results + 1] = { from = { id = input.id }, to = {} } end
                return { success = true, data = { results = results } }
            end
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "901", properties = {
                        hs_call_title = "Discovery call",
                        hs_call_body = "<p>Walked the pipeline.</p>",
                        hs_timestamp = "2026-07-02T15:00:00Z",
                        hs_call_direction = "INBOUND",
                        hs_call_duration = "930000",
                        hs_call_recording_url = "https://rec/901",
                        hs_call_status = "COMPLETED",
                        hs_call_disposition = "f240bbac-87c9-4f6e-bf70-924b57d47db7",
                        hs_call_has_voicemail = "false",
                        hs_lastmodifieddate = "2026-07-02T16:00:00Z",
                    }, updatedAt = "2026-07-02T16:00:00Z", createdAt = "2026-07-02T14:00:00Z" },
                } } }
            end
            local page = core.pull({ config = { connection_id = "conn1" }, limit = 10 }, { object_type = "calls" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(fake.searches[1].object_type, "calls")
            test.eq(fake.searches[1].body.sorts[1].propertyName, "hs_lastmodifieddate")
            local item = page.items[1]
            test.eq(item.item_key, "hubspot:calls:901")
            test.eq(item.source_version, "2026-07-02T16:00:00Z")
            test.eq(item.payload.object_type, "calls")
            test.eq(item.payload.provenance.external_id, "calls/901")
            test.eq(item.payload.title, "Discovery call")
            test.is_true(item.payload.content:find("<p>", 1, true) == nil, "HTML tags must be stripped")
            test.is_true(item.payload.content:find("Walked the pipeline.", 1, true) ~= nil, "the call body belongs in the content")
            -- Status and disposition are different facts and travel apart.
            local fields = item.payload.record.fields
            test.eq(fields.call_status, "COMPLETED")
            test.eq(fields.call_disposition, "f240bbac-87c9-4f6e-bf70-924b57d47db7")
            test.eq(fields.duration_ms, "930000")
            test.eq(fields.recording_url, "https://rec/901")
            test.eq(fields.direction, "INBOUND")
            test.eq(item.payload.properties.hs_call_has_voicemail, "false")
        end)

        -- A high-fanout engagement's associations arrive over several pages, and
        -- a batch read covers at most 100 objects. Reading one shot would hand
        -- the transform a silently truncated participant and deal set.
        test.it("hydrates engagement associations through paged batch reads", function()
            local fake: any = { batches = {} }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.list_objects(_conn: any, _object_type: string, _query: any): any
                return { success = true, data = { results = {} } }
            end
            function fake.search_objects(_conn: any, _object_type: string, _body: any): any
                local results: { any } = {}
                for index = 1, 150 do
                    results[#results + 1] = { id = tostring(index), properties = {
                        hs_call_title = "Call " .. tostring(index),
                        hs_lastmodifieddate = "2026-07-02T16:00:00Z",
                    } }
                end
                return { success = true, data = { results = results } }
            end
            function fake.batch_read_associations(_conn: any, from_type: string, to_type: string, inputs: any): any
                fake.batches[#fake.batches + 1] = { from_type = from_type, to_type = to_type, inputs = inputs }
                local results: { any } = {}
                for _, input in ipairs(inputs) do
                    if to_type == "contacts" and input.id == "1" then
                        if input.after == nil then
                            results[#results + 1] = { from = { id = "1" },
                                to = { { toObjectId = "c1" } },
                                paging = { next = { after = "page-2" } } }
                        else
                            results[#results + 1] = { from = { id = "1" }, to = { { toObjectId = "c2" } } }
                        end
                    elseif to_type == "deals" and input.id == "1" then
                        results[#results + 1] = { from = { id = "1" }, to = { { toObjectId = "d9" } } }
                    else
                        results[#results + 1] = { from = { id = input.id }, to = {} }
                    end
                end
                return { success = true, data = { results = results } }
            end

            local page = core.pull({ config = { connection_id = "conn1" }, limit = 200 }, { object_type = "calls" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(#page.items, 150)
            local first = page.items[1]
            test.eq(first.payload.associations.contacts[1], "c1")
            test.eq(first.payload.associations.contacts[2], "c2", "the continuation page must be drained")
            test.eq(#first.payload.associations.deals, 1)
            test.eq(first.payload.associations.deals[1], "d9")
            test.eq(#page.items[2].payload.associations.contacts, 0)

            -- 150 objects means two 100-capped chunks per associated type, and
            -- the contacts chunk carrying object 1 runs one continuation round.
            local sizes: { [string]: { number } } = { contacts = {}, deals = {} }
            for _, batch in ipairs(fake.batches) do
                test.eq(batch.from_type, "calls")
                test.is_true(#batch.inputs <= 100, "a batch read may cover at most 100 objects")
                local seen = sizes[batch.to_type]
                seen[#seen + 1] = #batch.inputs
            end
            test.eq(#sizes.contacts, 3)
            test.eq(#sizes.deals, 2)
            test.eq(sizes.contacts[1], 100)
            test.eq(sizes.contacts[2], 1, "only the object with an unread page re-enters")
            test.eq(sizes.contacts[3], 50)
        end)

        -- A reconcile listing answers identities and throws every payload away,
        -- so the association reads a delivered item needs are cost it never owes.
        test.it("spends no association reads on the keys-only reconcile listing", function()
            local fake: any = { batches = 0 }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.search_objects(_conn: any, _object_type: string, _body: any): any
                return { success = true, data = { results = {
                    { id = "901", properties = { hs_call_title = "Discovery call", hs_lastmodifieddate = "2026-07-02T16:00:00Z" } },
                } } }
            end
            function fake.batch_read_associations(_conn: any, _from: string, _to: string, inputs: any): any
                fake.batches = fake.batches + 1
                local results: { any } = {}
                for _, input in ipairs(inputs) do results[#results + 1] = { from = { id = input.id }, to = {} } end
                return { success = true, data = { results = results } }
            end
            local page = core.pull_keys({ config = { connection_id = "conn1" }, limit = 10 }, { object_type = "calls" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(page.keys[1].item_key, "hubspot:calls:901")
            test.eq(fake.batches, 0)

            core.pull({ config = { connection_id = "conn1" }, limit = 10 }, { object_type = "calls" }, { transport = fake })
            test.eq(fake.batches, 2, "a delivered item still hydrates contacts and deals")
        end)

        test.it("fails an engagement page when association hydration fails", function()
            local fake: any = {}
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.search_objects(_conn: any, _object_type: string, _body: any): any
                return { success = true, data = { results = {
                    { id = "901", properties = { hs_call_title = "Discovery call", hs_lastmodifieddate = "2026-07-02T16:00:00Z" } },
                } } }
            end
            function fake.batch_read_associations(_conn: any, _from: string, _to: string, _inputs: any): any
                return { success = false, error = "association batch unavailable", status_code = 503 }
            end
            local page = core.pull({ config = { connection_id = "conn1" }, limit = 10 }, { object_type = "calls" }, { transport = fake })
            test.eq(page.success, false)
            test.eq(page.error.retriable, true)
            test.is_true(tostring(page.error.message):find("association", 1, true) ~= nil, tostring(page.error.message))
        end)

        test.it("uses search filters for backfill_since", function()
            local fake = new_fake()
            core.pull({ config = { connection_id = "conn1", backfill_since = "2026-06-02T00:00:00Z" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
            local filter = fake.searches[1].body.filterGroups[1].filters[1]
            test.eq(fake.searches[1].body.sorts[1].propertyName, "lastmodifieddate")
            test.eq(filter.propertyName, "lastmodifieddate")
            test.eq(filter.operator, "GTE")
            test.eq(filter.value, "2026-06-02T00:00:00Z")
        end)

        test.it("completes meetings without entering the unsupported archived scan", function()
            local fake = new_fake()
            local first = core.pull({ config = { connection_id = "conn1" }, limit = 2 },
                { object_type = "meetings" }, { transport = fake })
            local second = core.pull({ cursor = first.next_cursor, config = { connection_id = "conn1" }, limit = 2 },
                { object_type = "meetings" }, { transport = fake })

            print("DEBUG first.success", first.success, "has_more", first.has_more, "phase", first.next_cursor and first.next_cursor.phase, "err", first.error and first.error.message)
            print("DEBUG second.success", second.success, "has_more", second.has_more, "phase", second.next_cursor and second.next_cursor.phase, "err", second.error and second.error.message)
            test.eq(second.success, true)
            test.eq(second.has_more, false)
            test.eq(second.next_cursor.phase, "live_active")
            test.eq(#fake.lists, 0)
        end)

        test.it("repairs a persisted meetings archived cursor without calling HubSpot", function()
            local fake = new_fake()
            local page = core.pull({
                cursor = {
                    phase = "backfill_archived",
                    after = "100",
                    active_hw = "2026-06-03T10:00:00Z",
                    active_hw_ids = { "meetings/3" },
                    connection_id = "conn1",
                    object_type = "meetings",
                },
                config = { connection_id = "conn1" },
                limit = 2,
            }, { object_type = "meetings" }, { transport = fake })

            test.eq(page.success, true)
            test.eq(page.has_more, false)
            test.eq(page.next_cursor.phase, "live_active")
            test.eq(page.next_cursor.active_hw, "2026-06-03T10:00:00Z")
            test.is_nil(page.next_cursor.after)
            test.eq(#fake.lists, 0)
        end)

        test.it("maps read-only call records and rejects malformed provider success payloads", function()
            local fake: any = {}
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.batch_read_associations(_conn: any, _from: string, _to: string, inputs: any): any
                local results: { any } = {}
                for _, input in ipairs(inputs) do
                    results[#results + 1] = { from = { id = input.id }, to = {} }
                end
                return { success = true, data = { results = results } }
            end
            function fake.search_objects(_conn: any, object_type: string, _body: any): any
                if object_type == "calls" then
                    return { success = true, data = { results = {
                        { id = "901", properties = {
                            hs_call_title = "Discovery call",
                            hs_call_body = "<p>Qualified.</p>",
                            hs_call_status = "COMPLETED",
                            hs_call_disposition = "qualified",
                            hs_lastmodifieddate = "2026-08-25T10:00:00Z",
                        } },
                    } } }
                end
                return { success = true, data = { results = { { id = {} } } } }
            end
            function fake.list_objects(_conn: any, _object_type: string, _query: any): any
                return { success = true, data = { results = {} } }
            end

            local calls = core.pull({ config = { connection_id = "conn1" } }, { object_type = "calls" }, { transport = fake })
            test.eq(calls.success, true)
            test.eq(calls.items[1].payload.object_type, "calls")
            test.eq(calls.items[1].payload.record.fields.call_status, "COMPLETED")
            test.is_nil(calls.items[1].payload.content:find("<p>", 1, true))

            local malformed = core.pull({ config = { connection_id = "conn1" } }, { object_type = "meetings" }, { transport = fake })
            test.eq(malformed.success, false)
            test.eq(malformed.error.code, "invalid_request")
        end)

        test.it("uses configured watermark property for search and cursor advancement", function()
            local fake: any = { searches = {} }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "1", properties = { lastmodifieddate = "2026-06-03T10:00:00Z", hs_lastmodifieddate = "2026-06-01T10:00:00Z", email = "contact-one@example.invalid" }, updatedAt = "2026-06-09T10:00:00Z" },
                } } }
            end
            function fake.list_objects(_conn: any, _object_type: string, _query: any): any
                return { success = true, data = { results = {} } }
            end

            local res = core.pull({
                config = { connection_id = "conn1", backfill_since = "2026-06-01T00:00:00Z" },
                limit = 10,
            }, { object_type = "contacts" }, { transport = fake })

            test.eq(res.success, true)
            test.eq(fake.searches[1].body.sorts[1].propertyName, "lastmodifieddate")
            test.eq(fake.searches[1].body.filterGroups[1].filters[1].propertyName, "lastmodifieddate")
            test.eq(res.items[1].source_version, "2026-06-03T10:00:00Z")
            test.eq(res.items[1].payload.provenance.external_version, "2026-06-03T10:00:00Z")
            test.eq(res.next_cursor.active_hw, "2026-06-03T10:00:00Z")

            fake.searches = {}
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "2", properties = { custom_modified_at = "2026-06-04T10:00:00Z", lastmodifieddate = "2026-06-02T10:00:00Z", email = "contact-two@example.invalid" }, updatedAt = "2026-06-09T10:00:00Z" },
                } } }
            end

            res = core.pull({
                config = {
                    connection_id = "conn1",
                    backfill_since = "2026-06-01T00:00:00Z",
                    objects = {
                        contacts = { watermark_property = "custom_modified_at" },
                    },
                },
                limit = 10,
            }, { object_type = "contacts" }, { transport = fake })

            test.eq(res.success, true)
            test.eq(fake.searches[1].body.sorts[1].propertyName, "custom_modified_at")
            test.eq(fake.searches[1].body.filterGroups[1].filters[1].propertyName, "custom_modified_at")
            test.eq(res.items[1].source_version, "2026-06-04T10:00:00Z")
            test.eq(res.items[1].payload.provenance.external_version, "2026-06-04T10:00:00Z")
            test.eq(res.next_cursor.active_hw, "2026-06-04T10:00:00Z")
        end)

        test.it("uses the incremental search helper when the transport provides it", function()
            local fake = new_fake()
            fake.incrementals = {}
            function fake.search_incremental(conn: any, object_type: string, properties: any, watermark: any, limit: any, after: any, watermark_property: any): any
                fake.incrementals[#fake.incrementals + 1] = {
                    object_type = object_type,
                    properties = properties,
                    watermark = watermark,
                    limit = limit,
                    after = after,
                    watermark_property = watermark_property,
                }
                return fake.search_objects(conn, object_type, {
                    limit = limit,
                    properties = properties,
                    after = after,
                    filterGroups = watermark and { { filters = { { propertyName = watermark_property, operator = "GTE", value = watermark } } } } or nil,
                })
            end

            core.pull({ config = { connection_id = "conn1", backfill_since = "2026-06-02T00:00:00Z" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })

            test.eq(fake.incrementals[1].object_type, "contacts")
            test.eq(fake.incrementals[1].watermark, "2026-06-02T00:00:00Z")
            test.eq(fake.incrementals[1].watermark_property, "lastmodifieddate")
            test.eq(fake.incrementals[1].limit, 2)
            test.eq(fake.incrementals[1].after, nil)
        end)

        test.it("uses config property selection instead of pulling every contact property", function()
            local fake = new_fake()
            core.pull({
                config = {
                    connection_id = "conn1",
                    property_selection = {
                        contacts = { "email", "custom_fit_score" },
                    },
                },
                limit = 2,
            }, { object_type = "contacts" }, { transport = fake })
            local props = fake.searches[1].body.properties
            test.eq(props[1], "email")
            test.eq(props[2], "custom_fit_score")
            test.is_true(#props < 10, "explicit property selection should remain bounded")
        end)

        test.it("resolves account owner and deal pipeline labels without hardcoded identifiers", function()
            local fake = new_fake()
            function fake.search_objects(_conn: any, _object_type: string, _body: any): any
                return { success = true, data = { results = {
                    { id = "deal-1", properties = {
                        dealname = "Synthetic opportunity",
                        hubspot_owner_id = "owner-1",
                        pipeline = "pipeline-1",
                        dealstage = "stage-1",
                        hs_lastmodifieddate = "2026-07-26T10:00:00Z",
                    } },
                } } }
            end
            function fake.list_owners(_conn: any, query: any): any
                test.eq(query.limit, 500)
                return { success = true, data = { results = {
                    { id = "owner-1", firstName = "Example", lastName = "Owner", email = "owner@example.invalid" },
                } } }
            end
            function fake.list_pipelines(_conn: any, object_type: string): any
                test.eq(object_type, "deals")
                return { success = true, data = { results = {
                    { id = "pipeline-1", label = "Opportunity", stages = {
                        { id = "stage-1", label = "Discovery" },
                    } },
                } } }
            end

            local result = core.pull({
                config = {
                    connection_id = "conn1",
                    object_type = "deals",
                    resolve_labels = true,
                    field_map = { deals = {
                        dealname = "name",
                        owner_name = "owner_name",
                        owner_email = "owner_email",
                        pipeline_name = "pipeline_name",
                        stage_name = "stage_name",
                    } },
                },
                limit = 10,
            }, { object_type = "deals" }, { transport = fake })

            test.eq(result.success, true)
            local fields = result.items[1].payload.record.fields
            test.eq(fields.name, "Synthetic opportunity")
            test.eq(fields.owner_name, "Example Owner")
            test.eq(fields.owner_email, "owner@example.invalid")
            test.eq(fields.pipeline_name, "Opportunity")
            test.eq(fields.stage_name, "Discovery")
        end)

        test.it("discovers and batch-hydrates every readable portal property", function()
            local fake = new_fake()
            fake.batch_reads = {}
            function fake.list_properties(_conn: any, object_type: string): any
                test.eq(object_type, "contacts")
                local results: { any } = {}
                for index = 1, 205 do results[#results + 1] = { name = "custom_" .. tostring(index) } end
                results[#results + 1] = { name = "email" }
                results[#results + 1] = { name = "lastmodifieddate" }
                return { success = true, data = { results = results } }
            end
            function fake.batch_read_objects(_conn: any, object_type: string, ids: any, properties: any): any
                fake.batch_reads[#fake.batch_reads + 1] = {
                    object_type = object_type,
                    ids = ids,
                    properties = properties,
                }
                local results: { any } = {}
                for _, id in ipairs(ids) do
                    local values: any = {}
                    for _, property in ipairs(properties) do
                        if property == "custom_205" then values[property] = "mirrored:" .. id end
                    end
                    results[#results + 1] = { id = id, properties = values }
                end
                return { success = true, data = { results = results } }
            end

            local result = core.pull({
                config = { connection_id = "conn1", all_properties = true },
                limit = 2,
            }, { object_type = "contacts" }, { transport = fake })

            test.eq(result.success, true)
            test.eq(result.items[1].payload.properties.custom_205, "mirrored:1")
            test.eq(#fake.batch_reads, 3)
            test.eq(#fake.batch_reads[1].properties, 100)
            test.eq(#fake.batch_reads[3].properties, 7)
            for _, property in ipairs(fake.searches[1].body.properties) do
                test.is_true(property ~= "*", "wildcard must not be sent to HubSpot search")
            end
        end)

        test.it("live polling uses GTE high-water filters and dedups already-seen external IDs", function()
            local fake: any = { searches = {} }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                return { success = true, data = { results = {
                    { id = "1", properties = { lastmodifieddate = "100", email = "older-contact@example.invalid" }, updatedAt = "2026-06-01T10:00:00Z" },
                    { id = "2", properties = { lastmodifieddate = "100", email = "newer-contact@example.invalid" }, updatedAt = "2026-06-01T10:00:00Z" },
                } } }
            end

            local res = core.pull({
                cursor = { phase = "live_active", active_hw = "100", active_hw_ids = { "contacts/1" }, connection_id = "conn1", object_type = "contacts" },
                config = { connection_id = "conn1" },
                limit = 10,
            }, { object_type = "contacts" }, { transport = fake })

            test.eq(res.success, true)
            test.eq(#res.items, 1)
            test.eq(res.items[1].payload.provenance.external_id, "contacts/2")
            test.eq(res.items[1].payload.origin.mode, "live")
            local filter = fake.searches[1].body.filterGroups[1].filters[1]
            test.eq(fake.searches[1].body.sorts[1].propertyName, "lastmodifieddate")
            test.eq(filter.propertyName, "lastmodifieddate")
            test.eq(filter.operator, "GTE")
            test.eq(filter.value, "100")
            test.eq(res.next_cursor.active_hw, "100")
            test.eq(#res.next_cursor.active_hw_ids, 2)
        end)

        -- HubSpot search does not order rows with equal sort values stably
        -- across pages, so a tie group wider than one page leaks records
        -- through the opaque `after` cursor. The backfill pages by keyset
        -- instead: a full page ending on watermark T drains the T group by
        -- hs_object_id, then resumes strictly after T.
        test.it("drains a watermark tie group wider than a page by object id and resumes strictly after it", function()
            local fake: any = { searches = {} }
            function fake.connect(component_id: string?): (any, string?)
                return { component_id = component_id, api_key = "pat" }, nil
            end
            local function row(id: string, ts: string): any
                return { id = id, properties = { hs_object_id = id, lastmodifieddate = ts, email = id .. "@example.invalid" }, updatedAt = ts }
            end
            -- Portal: 1@T1, then 2,3,4,5 all @T2, then 6@T3. Page limit 2.
            function fake.search_objects(_conn: any, object_type: string, body: any): any
                fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
                local filters = (body.filterGroups and body.filterGroups[1] and body.filterGroups[1].filters) or {}
                local by: any = {}
                for _, f in ipairs(filters) do by[f.propertyName .. ":" .. f.operator] = f.value end
                if by["lastmodifieddate:EQ"] == "T2" then
                    local last = tonumber(by["hs_object_id:GT"]) or 0
                    local out: any = {}
                    for _, id in ipairs({ "2", "3", "4", "5" }) do
                        if tonumber(id) > last and #out < body.limit then out[#out + 1] = row(id, "T2") end
                    end
                    return { success = true, data = { results = out } }
                end
                if by["lastmodifieddate:GT"] == "T2" then
                    return { success = true, data = { results = { row("6", "T3") } } }
                end
                -- opening scan: the portal hands back an unstable tie slice
                return { success = true, data = { results = { row("1", "T1"), row("3", "T2") }, paging = { next = { after = "opaque" } } } }
            end

            local seen: any = {}
            local cursor: any = nil
            local rounds = 0
            repeat
                local res = core.pull({ cursor = cursor, config = { connection_id = "conn1" }, limit = 2 }, { object_type = "contacts" }, { transport = fake })
                test.eq(res.success, true, tostring(res.error and res.error.message))
                for _, item in ipairs(res.items) do
                    local id = item.payload.provenance.external_id
                    test.is_true(seen[id] == nil, "duplicate delivery of " .. id)
                    seen[id] = true
                end
                cursor = res.next_cursor
                rounds = rounds + 1
            until cursor.phase ~= "backfill_active" or rounds > 12
            test.is_true(rounds <= 12, "backfill must terminate")
            for _, id in ipairs({ "contacts/1", "contacts/2", "contacts/3", "contacts/4", "contacts/5", "contacts/6" }) do
                test.is_true(seen[id] == true, "missing " .. id)
            end
            -- The tie drain sorts by object id and never uses the opaque cursor.
            local drained = false
            for _, s in ipairs(fake.searches) do
                local filters = (s.body.filterGroups and s.body.filterGroups[1] and s.body.filterGroups[1].filters) or {}
                for _, f in ipairs(filters) do
                    if f.propertyName == "hs_object_id" then
                        drained = true
                        test.eq(s.body.sorts[1].propertyName, "hs_object_id")
                        test.is_nil(s.body.after)
                    end
                end
            end
            test.is_true(drained, "a tie group wider than the page must be drained by object id")
        end)

        test.it("pull_keys connects with the request-carried connection component", function()
            local fake = new_fake()
            local page = core.pull_keys({ component_id = "conn-reconcile", limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(fake.connect_ids[1], "conn-reconcile")
            test.eq(page.next_cursor.connection_id, "conn-reconcile")
        end)

        test.it("returns connection infrastructure failures unchanged", function()
            local cause = errors.new({ message = "revoked", kind = errors.INVALID })
            local fake = new_fake()
            fake.connect = function(_component_id: string?): (nil, any) return nil, cause end
            local out, err = core.pull({ config = { connection_id = "bad" } }, { object_type = "contacts" }, { transport = fake })
            test.is_nil(out)
            test.eq(err, cause)
        end)

        test.it("returns typed transport failures without converting them to provider envelopes", function()
            local cause = errors.new({ message = "transport unavailable", kind = errors.UNAVAILABLE })
            local operations: { any } = {
                { phase = "backfill_active", method = "search_objects" },
                { phase = "backfill_active", method = "search_incremental" },
                { phase = "backfill_archived", method = "list_objects" },
                { phase = "backfill_active", method = "list_properties", config = { all_properties = true } },
                { phase = "backfill_active", method = "batch_read_objects", config = { all_properties = true } },
                { phase = "backfill_active", method = "batch_read_associations", object_type = "calls" },
                { phase = "backfill_active", method = "list_owners", config = { resolve_labels = true } },
                { phase = "backfill_active", method = "list_pipelines", object_type = "deals", config = { resolve_labels = true } },
            }
            for _, operation in ipairs(operations) do
                local fake = new_fake()
                if operation.method == "list_properties" then
                    fake.batch_read_objects = function(...): any return { success = true, data = { results = {} } } end
                end
                if operation.method == "batch_read_objects" then
                    fake.list_properties = function(...): any return { success = true, data = { results = { { name = "firstname" } } } } end
                end
                if operation.method == "list_pipelines" then
                    fake.list_owners = function(...): any return { success = true, data = { results = {} } } end
                end
                fake[operation.method] = function(...): (nil, any)
                    return nil, cause
                end
                local out, err = core.pull({
                    cursor = { phase = operation.phase, connection_id = "conn1", object_type = operation.object_type or "contacts" },
                    config = operation.config or { connection_id = "conn1" },
                    limit = 2,
                }, { object_type = operation.object_type or "contacts" }, { transport = fake })
                test.is_nil(out, operation.method)
                test.eq(err, cause, operation.method)
            end
        end)

        test.it("keeps provider rejections as result envelopes", function()
            local operations: { any } = {
                { method = "search_objects" },
                { method = "list_properties", config = { all_properties = true } },
                { method = "list_owners", config = { resolve_labels = true } },
                { method = "list_pipelines", object_type = "deals", config = { resolve_labels = true } },
            }
            for _, operation in ipairs(operations) do
                local fake = new_fake()
                if operation.method == "list_pipelines" then
                    fake.list_owners = function(...): any return { success = true, data = { results = {} } } end
                end
                fake[operation.method] = function(...): any
                    return { success = false, error = "upstream rejected request", status_code = 503 }
                end
                local out, err = core.pull({
                    cursor = { phase = "backfill_active", connection_id = "conn1", object_type = operation.object_type or "contacts" },
                    config = operation.config or { connection_id = "conn1" },
                    limit = 2,
                }, { object_type = operation.object_type or "contacts" }, { transport = fake })
                test.not_nil(out, operation.method)
                test.is_nil(err, operation.method)
                test.eq(out.success, false, operation.method)
                test.eq(out.error.code, "provider_unavailable", operation.method)
            end
        end)

        test.it("uses the request-carried connection component for reconcile key listing", function()
            local fake = new_fake()
            local page = core.pull_keys({ component_id = "conn-reconcile", limit = 2 }, { object_type = "contacts" }, { transport = fake })
            test.eq(page.success, true)
            test.eq(fake.connect_ids[1], "conn-reconcile")
            test.eq(page.next_cursor.connection_id, "conn-reconcile")
        end)

        test.it("passes the pullable conformance kit offline", function()
            local fake = conformance_fake()
            local result = conformance.run({
                pull = function(req: any): any return core.pull(req, { object_type = "contacts" }, { transport = fake }) end,
                config = { connection_id = "conn1" },
                failure_config = {},
                backfill_since = { mode = "honored", value = "2026-06-01T00:00:00Z" },
                limit = 2,
                max_pages = 5,
            })
            local failures = conformance.format_failures(result)
            test.eq(result.success, true, type(failures) == "string" and failures or tostring(failures or ""))
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
