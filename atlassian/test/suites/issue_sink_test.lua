local test = require("test")
local sink = require("sink")

local function new_fake(): any
    local fake: any = { created = {}, updated = {}, deleted = {}, comments = {}, worklogs = {}, searches = {}, transitions = {}, assigns = {}, connect_ids = {} }
    function fake.connect(component_id: string?): (any, string?)
        if component_id == "bad" then return nil, "revoked" end
        fake.connect_ids[#fake.connect_ids + 1] = component_id
        return { component_id = component_id, deployment = "cloud" }, nil
    end
    function fake.search_issues(_conn: any, jql: string, _start_at: integer?, _max_results: integer?): any
        fake.searches[#fake.searches + 1] = jql
        if jql:find("existing", 1, true) then return { success = true, data = { issues = { { id = "99", key = "ABC-99", fields = { updated = "2026-06-02T10:00:00Z" } } } } } end
        return { success = true, data = { issues = {} } }
    end
    function fake.create_issue(_conn: any, project_key: string?, summary: string?, issue_type: string?, description: string?, extra_fields: any?): any
        fake.created[#fake.created + 1] = { project_key = project_key, summary = summary, issue_type = issue_type, description = description, extra_fields = extra_fields }
        return { success = true, data = { id = "101", key = "ABC-101" } }
    end
    function fake.update_issue(_conn: any, issue_key: string?, fields: any): any
        fake.updated[#fake.updated + 1] = { issue_key = issue_key, fields = fields }
        return { success = true, data = { key = issue_key, fields = { updated = "2026-06-03T10:00:00Z" } } }
    end
    function fake.delete_issue(_conn: any, issue_key: string?, delete_subtasks: boolean?): any
        fake.deleted[#fake.deleted + 1] = { issue_key = issue_key, delete_subtasks = delete_subtasks }
        return { success = true }
    end
    function fake.add_comment(_conn: any, issue_key: string?, body: string?): any
        fake.comments[#fake.comments + 1] = { issue_key = issue_key, body = body }
        return { success = true, data = { id = "c1" } }
    end
    function fake.add_worklog(_conn: any, issue_key: string?, body: string?, seconds: integer?): any
        fake.worklogs[#fake.worklogs + 1] = { issue_key = issue_key, body = body, seconds = seconds }
        return { success = true, data = { id = "w1" } }
    end
    function fake.transition_issue(_conn: any, issue_key: string?, transition_id: string?): any
        fake.transitions[#fake.transitions + 1] = { issue_key = issue_key, transition_id = transition_id }
        return { success = true }
    end
    function fake.assign_issue(_conn: any, issue_key: string?, account_id: string?): any
        fake.assigns[#fake.assigns + 1] = { issue_key = issue_key, account_id = account_id }
        return { success = true }
    end
    return fake
end

local function req(over: any): any
    local r: any = {
        config = { connection_id = "conn1", project_key = "ABC", external_key_field = "Kickside External Key" },
        sink_op = "upsert",
        input = { external_key = "new", summary = "New issue", issue_type = "Task", description = "Body" },
        identity_key = "issue-1",
        idempotency_key = "idem1",
    }
    for k, v in pairs(type(over) == "table" and over or {}) do r[k] = v end
    return r
end

local function write(fake: any, r: any): any
    local res = sink.write(r, { transport = fake, jira = fake })
    test.not_nil(res, "write returned nil")
    return res
end

local function define_tests()
    test.describe("Jira issue sink", function()
        test.it("uses identity_key for the configured external field", function()
            local fake = new_fake()
            local res = write(fake, req({ input = { summary = "New issue", issue_type = "Task" } }))
            test.eq(res.success, true)
            test.eq(fake.created[1].extra_fields["Kickside External Key"], "issue-1")
        end)
        test.it("creates an issue and returns dest_ref", function()
            local fake = new_fake()
            local res = write(fake, req({}))
            test.eq(res.success, true)
            test.eq(res.result, "created")
            test.eq(res.dest_ref.issue_key, "ABC-101")
            test.eq(fake.created[1].extra_fields["Kickside External Key"], "new")
        end)

        test.it("updates by dest_ref without creating a duplicate", function()
            local fake = new_fake()
            local res = write(fake, req({ dest_ref = { issue_key = "ABC-42" }, input = { fields = { summary = "Changed" } } }))
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].issue_key, "ABC-42")
            test.eq(#fake.created, 0)
        end)

        test.it("uses a configured external key for idempotent upsert", function()
            local fake = new_fake()
            local res = write(fake, req({ input = { external_key = "existing", fields = { summary = "Changed" } } }))
            test.eq(res.result, "updated")
            test.eq(fake.updated[1].issue_key, "ABC-99")
            test.eq(#fake.created, 0)
        end)

        test.it("deletes, comments, worklogs, transitions, and assigns through issue operations", function()
            local fake = new_fake()
            local res = write(fake, req({ sink_op = "delete", dest_ref = { issue_key = "ABC-1" }, input = { delete_subtasks = true } }))
            test.eq(res.result, "deleted")
            test.eq(fake.deleted[1].delete_subtasks, true)

            res = write(fake, req({ sink_op = "add_comment", dest_ref = { issue_key = "ABC-1" }, input = { comment = "hello" } }))
            test.eq(res.result, "updated")
            test.eq(fake.comments[1].body, "hello")

            res = write(fake, req({ sink_op = "add_worklog", dest_ref = { issue_key = "ABC-1" }, input = { comment = "worked", time_spent_seconds = 600 } }))
            test.eq(res.result, "updated")
            test.eq(fake.worklogs[1].seconds, 600)

            res = write(fake, req({ sink_op = "transition", dest_ref = { issue_key = "ABC-1" }, input = { transition_id = "31" } }))
            test.eq(res.result, "updated")
            test.eq(fake.transitions[1].transition_id, "31")

            res = write(fake, req({ sink_op = "assign", dest_ref = { issue_key = "ABC-1" }, input = { account_id = "acct" } }))
            test.eq(res.result, "updated")
            test.eq(fake.assigns[1].account_id, "acct")
        end)

        test.it("surfaces invalid request and connection errors", function()
            local bad_op = write(new_fake(), req({ sink_op = "merge" }))
            test.eq(bad_op.error.code, "invalid_request")
            local bad_conn = write(new_fake(), req({ config = { connection_id = "bad" } }))
            test.eq(bad_conn.error.code, "auth_expired")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options: any): any return run_cases(options) end }
