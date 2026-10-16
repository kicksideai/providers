local test = require("test")
local sink = require("sink")
local config = require("config")

local function new_fake(): any
    local fake: any = { created = {}, updated = {}, archived = {}, searches = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, any?)
        if component_id == "bad" then return nil, errors.new({ message = "revoked", kind = errors.INVALID }) end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, api_key = "pat" }, nil
    end
    function fake.search_objects(_conn: any, object_type: string, body: any): any
        fake.searches[#fake.searches + 1] = { object_type = object_type, body = body }
        if body.filterGroups[1].filters[1].value == "existing" then
            return { success = true, data = { results = { { id = "99", properties = { wippy_external_key = "existing" }, updatedAt = "2026-06-02T10:00:00Z" } } } }
        end
        return { success = true, data = { results = {} } }
    end
    function fake.create_object(_conn: any, object_type: string, properties: any): any
        fake.created[#fake.created + 1] = { object_type = object_type, properties = properties }
        return { success = true, data = { id = "101", properties = properties, updatedAt = "2026-06-01T10:00:00Z" } }
    end
    function fake.update_object(_conn: any, object_type: string, id: string, properties: any): any
        fake.updated[#fake.updated + 1] = { object_type = object_type, id = id, properties = properties }
        return { success = true, data = { id = id, properties = properties, updatedAt = "2026-06-02T10:00:00Z" } }
    end
    function fake.archive_object(_conn: any, object_type: string, id: string): any
        fake.archived[#fake.archived + 1] = { object_type = object_type, id = id }
        return { success = true }
    end
    return fake
end

local function req(over: any): any
    local r: any = {
        config = { connection_id = "conn1", external_key_property = "wippy_external_key" },
        sink_op = "upsert",
        input = { external_key = "new", properties = { firstname = "Contact" } },
        identity_key = "crm-1",
        idempotency_key = "idem1",
    }
    for k, v in pairs(type(over) == "table" and over or {}) do r[k] = v end
    return r
end

local function write(fake: unknown, r: any, object_type: string?): any
    local res = sink.write(r, { object_type = object_type or "contacts" }, { transport = fake })
    test.not_nil(res, "write returned nil")
    return res
end

local function define_tests()
    test.describe("HubSpot object sink", function()
        test.it("uses identity_key for the configured external property", function()
            local fake = new_fake()
            local res = write(fake, req({ input = { properties = { firstname = "Contact" } } }), "contacts")
            test.eq(res.success, true)
            test.eq(fake.created[1].properties.wippy_external_key, "crm-1")
        end)
        test.it("creates a record and returns dest_ref/version", function()
            local fake = new_fake()
            local res = write(fake, req({}), "contacts")
            test.eq(res.success, true)
            test.eq(res.result, "created")
            test.eq(res.dest_ref.object_type, "contacts")
            test.eq(res.dest_ref.object_id, "101")
            test.eq(res.dest_version, "2026-06-01T10:00:00Z")
            test.eq(fake.created[1].properties.wippy_external_key, "new")
        end)

        test.it("preserves raw properties and destination identity for every writable object", function()
            test.is_true(#config.WRITE_OBJECT_TYPES > 0)
            for _, object_type in ipairs(config.WRITE_OBJECT_TYPES) do
                local fake = new_fake()
                local created = write(fake, req({ input = { properties = { custom_value = "raw value" } } }), object_type)
                test.is_true(created.success)
                test.eq(created.dest_ref.object_type, object_type)
                test.eq(created.dest_ref.object_id, "101")
                test.eq(fake.created[1].object_type, object_type)
                test.eq(fake.created[1].properties.custom_value, "raw value")
                local updated = write(fake, req({ dest_ref = created.dest_ref,
                    input = { properties = { custom_value = "changed value" } } }), object_type)
                test.is_true(updated.success)
                test.eq(updated.result, "updated")
                test.eq(updated.dest_ref.object_type, object_type)
                test.eq(updated.dest_ref.object_id, "101")
                test.eq(fake.updated[1].object_type, object_type)
                test.eq(fake.updated[1].properties.custom_value, "changed value")
                test.eq(#fake.created, 1)
            end
        end)

        test.it("updates by dest_ref without creating a duplicate", function()
            local fake = new_fake()
            local res = write(fake, req({ dest_ref = { object_id = "42" }, input = { properties = { firstname = "Contact" } } }), "contacts")
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].id, "42")
            test.eq(#fake.created, 0)
        end)

        test.it("uses the configured external key for idempotent upsert", function()
            local fake = new_fake()
            local res = write(fake, req({ input = { external_key = "existing", properties = { firstname = "Contact" } } }), "contacts")
            test.eq(res.success, true)
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].id, "99")
            test.eq(#fake.created, 0)
        end)

        test.it("rejects non-canonical operation names", function()
            local fake = new_fake()
            test.eq(write(fake, req({ sink_op = "create" }), "contacts").error.code, "invalid_request")
            test.eq(write(fake, req({ sink_op = "update" }), "contacts").error.code, "invalid_request")
            test.eq(#fake.created, 0)
            test.eq(#fake.updated, 0)
        end)

        test.it("uses the selected destination receipt slot", function()
            local fake = new_fake()
            local res = write(fake, req({
                map_slot = "contact",
                dest_refs = { contact = { dest_ref = { object_id = "42" } } },
                input = { external_key = "new", properties = { firstname = "Contact" } },
            }), "contacts")
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].id, "42")
            test.eq(#fake.created, 0)
        end)

        test.it("archives by dest_ref and treats 404 as already deleted", function()
            local fake = new_fake()
            local res = write(fake, req({ sink_op = "delete", dest_ref = { object_id = "42" }, input = {} }), "contacts")
            test.eq(res.result, "deleted")
            test.eq(res.dest_ref.object_id, "42")
            test.eq(fake.archived[1].id, "42")

            function fake.archive_object(_conn: any, _object_type: string, _id: string): any
                return { success = false, error = "not found", status_code = 404 }
            end
            res = write(fake, req({ sink_op = "delete", dest_ref = { object_id = "42" }, input = {} }), "contacts")
            test.eq(res.result, "deleted")
            test.eq(res.dest_ref.object_id, "42")
        end)

        test.it("upserts task-backed activity and returns a HubSpot dest_ref", function()
            local fake = new_fake()
            local res = write(fake, req({
                sink_op = "upsert",
                input = {
                    external_key = "activity-1",
                    properties = {
                        hs_task_subject = "Call contact",
                        hs_task_body = "Follow up",
                    },
                },
            }), "tasks")
            test.eq(res.success, true)
            test.eq(res.result, "created")
            test.eq(res.dest_ref.object_type, "tasks")
            test.eq(fake.created[1].object_type, "tasks")
            test.eq(fake.created[1].properties.hs_task_subject, "Call contact")
            test.eq(fake.created[1].properties.wippy_external_key, "activity-1")
        end)

        test.it("surfaces invalid request and connection errors", function()
            local bad_op = write(new_fake(), req({ sink_op = "merge" }), "contacts")
            test.eq(bad_op.error.code, "invalid_request")
            local out, connection_err = sink.write(req({ config = { connection_id = "bad" } }), { object_type = "contacts" }, { transport = new_fake() })
            test.is_nil(out)
            test.not_nil(connection_err)
            local bad_object = write(new_fake(), req({}), "tickets")
            test.eq(bad_object.error.code, "invalid_config")
        end)

        test.it("returns typed transport failures without converting them to provider envelopes", function()
            local cause = errors.new({ message = "transport unavailable", kind = errors.UNAVAILABLE })
            local operations: { any } = {
                { method = "connect", request = req({}) },
                { method = "search_objects", request = req({}) },
                { method = "create_object", request = req({ input = { external_key = "new", properties = {} } }) },
                { method = "update_object", request = req({ dest_ref = { object_id = "42" } }) },
                { method = "archive_object", request = req({ sink_op = "delete", dest_ref = { object_id = "42" }, input = {} }) },
            }
            for _, operation in ipairs(operations) do
                local fake = new_fake()
                fake[operation.method] = function(...): (nil, any)
                    return nil, cause
                end
                local out, err = sink.write(operation.request, { object_type = "contacts" }, { transport = fake })
                test.is_nil(out, operation.method)
                test.eq(err, cause, operation.method)
            end
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
