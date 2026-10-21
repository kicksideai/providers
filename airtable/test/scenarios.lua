local test = require("test")
local service = require("service")
local fixture = require("fixture")
local function cases()
    test.describe("Airtable record workflows", function()
        test.it("encodes field arrays, structured sort and opaque pagination cursors", function()
            local deps, state = fixture.new("airtable", {{method = "GET",
                url = "https://api.airtable.com/v0/app1/Tasks?fields%5B%5D=Name&offset=itr%2Fnext%3D&pageSize=2&sort%5B0%5D%5Bdirection%5D=asc&sort%5B0%5D%5Bfield%5D=Name",
                reply = {records = {{id = "rec1", fields = {Name = "Task"}}}, offset = "opaque-next"}}})
            local result, err = service.new(deps).run("list_records", {base_id = "app1", table_id = "Tasks", pageSize = 2,
                fields = {"Name"}, offset = "itr/next=", sort = {{field = "Name", direction = "asc"}}}, nil, false)
            test.is_nil(err); test.eq(result.next_cursor, "opaque-next"); state.done()
        end)
        test.it("creates records and deletes a bounded batch with repeated query keys", function()
            local deps, state = fixture.new("airtable", {
                {method = "POST", url = "https://api.airtable.com/v0/app1/tbl1", body = {records = {{fields = {Name = "New"}}}}, reply = {records = {{id = "rec1"}}}},
                {method = "DELETE", url = "https://api.airtable.com/v0/app1/tbl1?records%5B%5D=rec1&records%5B%5D=rec2", reply = {records = {{id = "rec1", deleted = true}}}},
            })
            local run = service.new(deps).run
            local result, err = run("create_records", {base_id = "app1", table_id = "tbl1", records = {{fields = {Name = "New"}}}}, nil, true)
            test.is_nil(err); test.eq(result.data.records[1].id, "rec1")
            local deleted = run("delete_records", {base_id = "app1", table_id = "tbl1", records = {"rec1", "rec2"}}, nil, true)
            test.eq(deleted.data.records[1].deleted, true); test.eq(state.writes, 2); state.done()
        end)
        test.it("rejects over-limit record writes without making an HTTP request", function()
            local deps, state = fixture.new("airtable", {})
            local records = {}; for i = 1, 11 do records[i] = {fields = {Name = "x"}} end
            local result, err = service.new(deps).run("create_records", {base_id = "app", table_id = "tbl", records = records}, nil, true)
            test.is_nil(result); test.is_true(errors.is(err, errors.INVALID)); state.done()
        end)
        test.it("clears cells using explicit JSON nulls", function()
            local deps, state = fixture.new("airtable", {{method = "PATCH", url = "https://api.airtable.com/v0/app1/tbl1/rec1",
                reply = {id = "rec1", fields = {}}, check = function(o)
                    test.eq(o.body, '{"fields":{"Assignee":null,"Due":null}}')
                end}})
            local result, err = service.new(deps).run("clear_record_fields", {base_id = "app1", table_id = "tbl1", record_id = "rec1", clear_fields = {"Assignee", "Due"}}, nil, true)
            test.is_nil(err); test.eq(result.success, true); state.done()
        end)
        test.it("keeps webhook MAC credentials out of the agent result", function()
            local deps, state = fixture.new("airtable", {{method = "POST", url = "https://api.airtable.com/v0/bases/app1/webhooks",
                reply = {id = "ach1", macSecretBase64 = "fixture-signing-secret", expirationTime = "2026-12-01T00:00:00Z"}}})
            local result, err = service.new(deps).run("create_webhook", {base_id = "app1", specification = {options = {filters = {dataTypes = {"tableData"}}}}}, nil, true)
            test.is_nil(err); test.eq(result.data.id, "ach1"); test.is_nil(result.data.macSecretBase64); state.done()
        end)
    end)
end
return {run = test.run_cases(cases)}
