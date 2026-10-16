local test = require("test")
local sink = require("sink")

local function new_fake(): any
    local fake: any = { created = {}, updated = {}, deleted = {}, comments = {}, searches = {}, gets = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, string?)
        if component_id == "bad" then return nil, "revoked" end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id }, nil
    end
    function fake.search(_conn: any, cql: string, _limit: integer?, _start: integer?): any
        fake.searches[#fake.searches + 1] = cql
        if cql:find("Existing", 1, true) then return { success = true, data = { results = { { id = "42", title = "Existing", version = { number = 3, when = "2026-06-02T10:00:00Z" } } } } } end
        return { success = true, data = { results = {} } }
    end
    function fake.get_page(_conn: any, id: string): any
        fake.gets[#fake.gets + 1] = id
        return { success = true, data = { id = id, title = "Existing", version = { number = 3, when = "2026-06-02T10:00:00Z" } } }
    end
    function fake.create_content(_conn: any, space_key: string?, content_type: string?, title: string?, body: string?, parent_id: string?): any
        fake.created[#fake.created + 1] = { space_key = space_key, content_type = content_type, title = title, body = body, parent_id = parent_id }
        return { success = true, data = { id = "101", title = title, type = content_type, version = { number = 1 } } }
    end
    function fake.update_content(_conn: any, id: string?, content_type: string?, title: string?, body: string?, version: integer?): any
        fake.updated[#fake.updated + 1] = { id = id, content_type = content_type, title = title, body = body, version = version }
        return { success = true, data = { id = id, title = title, type = content_type, version = { number = (version or 0) + 1 } } }
    end
    function fake.delete_content(_conn: any, id: string?): any
        fake.deleted[#fake.deleted + 1] = id
        return { success = true }
    end
    function fake.add_comment(_conn: any, id: string?, body: string?): any
        fake.comments[#fake.comments + 1] = { id = id, body = body }
        return { success = true, data = { id = "c1", version = { number = 1 } } }
    end
    return fake
end

local function req(over: any): any
    local r: any = {
        config = { connection_id = "conn1", space_key = "DOC", content_type = "page" },
        sink_op = "upsert",
        input = { title = "New", body = "Hello\n\nWorld" },
        identity_key = "content-1",
        idempotency_key = "idem1",
    }
    for k, v in pairs(type(over) == "table" and over or {}) do r[k] = v end
    return r
end

local function write(fake: any, r: any): any
    local res = sink.write(r, { transport = fake, confluence = fake })
    test.not_nil(res, "write returned nil")
    return res
end

local function define_tests()
    test.describe("Confluence content sink", function()
        test.it("requires delivery keys before touching the provider", function()
            local fake = new_fake()
            local res = write(fake, req({ identity_key = false }))
            test.eq(res.error.code, "invalid_request")
            test.eq(#fake.connect_ids, 0)
        end)
        test.it("creates content and returns dest_ref", function()
            local fake = new_fake()
            local res = write(fake, req({}))
            test.eq(res.success, true)
            test.eq(res.result, "created")
            test.eq(res.dest_ref.content_id, "101")
            test.eq(fake.created[1].space_key, "DOC")
            test.eq(fake.created[1].content_type, "page")
            test.is_true(fake.created[1].body:find("<p>Hello</p>", 1, true) ~= nil, tostring(fake.created[1].body))
        end)

        test.it("updates by dest_ref with the current version", function()
            local fake = new_fake()
            local res = write(fake, req({ dest_ref = { content_id = "42" }, input = { title = "Changed", body = "Body" } }))
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].id, "42")
            test.eq(fake.updated[1].version, 3)
            test.eq(#fake.created, 0)
        end)

        test.it("uses title lookup for idempotent upsert", function()
            local fake = new_fake()
            local res = write(fake, req({ input = { title = "Existing", body = "Changed" } }))
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].id, "42")
            test.eq(#fake.created, 0)
        end)

        test.it("deletes and comments through content operations", function()
            local fake = new_fake()
            local res = write(fake, req({ sink_op = "delete", dest_ref = { content_id = "42" }, input = {} }))
            test.eq(res.result, "deleted")
            test.eq(fake.deleted[1], "42")

            res = write(fake, req({ sink_op = "add_comment", dest_ref = { content_id = "42" }, input = { comment = "Looks good" } }))
            test.eq(res.result, "updated")
            test.is_true(fake.comments[1].body:find("Looks good", 1, true) ~= nil, tostring(fake.comments[1].body))
        end)

        test.it("surfaces invalid request and connection errors", function()
            local bad_op = write(new_fake(), req({ sink_op = "merge" }))
            test.eq(bad_op.error.code, "invalid_request")
            local bad_conn = write(new_fake(), req({ config = { connection_id = "bad", space_key = "DOC", content_type = "page" } }))
            test.eq(bad_conn.error.code, "auth_expired")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
