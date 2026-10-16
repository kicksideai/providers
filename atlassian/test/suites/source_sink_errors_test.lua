local test = require("test")
local types = require("types")
local jira_source = require("jira_source")
local confluence_source = require("confluence_source")
local jira_sink = require("jira_sink")
local confluence_sink = require("confluence_sink")

local function define_tests()
    test.describe("Atlassian source and sink errors", function()
        test.it("preserves provider failures through every source and sink", function()
            for _, expected in ipairs({
                { status = 401, code = "auth_expired", scope = "connection", retriable = false },
                { status = 403, code = "permission_denied", scope = "flow", retriable = false },
                { status = 404, code = "not_found", scope = "flow", retriable = false },
                { status = 409, code = "conflict", scope = "item", retriable = false },
                { status = 429, code = "rate_limited", scope = "provider", retriable = true },
                { status = 503, code = "provider_unavailable", scope = "provider", retriable = true },
                { status = 0, code = "provider_unavailable", scope = "provider", retriable = true },
            }) do
                local failure = { success = false, status_code = expected.status,
                    error = "provider failure", retry_after_ms = 2300 }
                local api = {
                    connect = function(_id: string?): (types.Conn?, string?)
                        return { mode = "credential", deployment = "cloud", jira_base = "https://jira.example.test",
                            confluence_base = "https://confluence.example.test", header = "Bearer fixture-token" }, nil
                    end,
                    search_issues = function(...: any): any return failure end,
                    search = function(...: any): any return failure end,
                    create_issue = function(...: any): any return failure end,
                    create_content = function(...: any): any return failure end,
                }
                local request = { config = { connection_id = "connection", project_key = "ABC", space_key = "DOC" },
                    input = { summary = "Issue", title = "Page", body = "Body" }, sink_op = "create",
                    identity_key = "record", idempotency_key = "receipt" }
                for _, surface in ipairs({
                    { name = "Jira source", result = jira_source.pull(request, { transport = api, jira = api }) },
                    { name = "Confluence source", result = confluence_source.pull(request, { transport = api, confluence = api }) },
                    { name = "Jira sink", result = jira_sink.write(request, { transport = api, jira = api }) },
                    { name = "Confluence sink", result = confluence_sink.write(request, { transport = api, confluence = api }) },
                }) do
                    local result = surface.result
                    test.not_nil(result, surface.name .. " returns no result")
                    test.is_false(result.success)
                    test.eq(result.error.code, expected.code)
                    test.eq(result.error.scope, expected.scope)
                    test.eq(result.error.retriable, expected.retriable)
                    test.is_true(result.error.message:find("provider failure", 1, true) ~= nil)
                    test.is_nil(result.items)
                    test.is_nil(result.next_cursor)
                    test.is_nil(result.has_more)
                    if expected.status == 429 then test.eq(result.retry_after_ms, 2300)
                    else test.is_nil(result.retry_after_ms) end
                end
            end
        end)

        test.it("forwards typed API failures through every source and sink call path", function()
            local function unavailable(message: string): error
                return errors.new({ kind = errors.UNAVAILABLE, message = message })
            end
            local transport = {
                connect = function(): any
                    return { mode = "credential", deployment = "cloud", jira_base = "https://jira.example.test",
                        confluence_base = "https://confluence.example.test" }, nil
                end,
            }
            local function expect(call: () -> (any?, error?), failure: error)
                local result, err = call()
                test.is_nil(result)
                test.eq(err, failure)
            end

            for _, source in ipairs({
                { name = "Jira search", run = function(failure: error): (any?, error?)
                    return jira_source.pull({ config = { connection_id = "connection" } }, { transport = transport,
                        jira = { search_issues = function(): (any?, error?) return nil, failure end } })
                end },
                { name = "Confluence search", run = function(failure: error): (any?, error?)
                    return confluence_source.pull({ config = { connection_id = "connection", space_key = "DOC" } }, { transport = transport,
                        confluence = { search = function(): (any?, error?) return nil, failure end } })
                end },
                { name = "Confluence page", run = function(failure: error): (any?, error?)
                    return confluence_source.pull({ config = { connection_id = "connection", space_key = "DOC" } }, { transport = transport,
                        confluence = {
                            search = function(): any return { success = true, data = { results = { { id = "1" } } } } end,
                            get_page = function(): (any?, error?) return nil, failure end,
                        } })
                end },
            }) do
                local failure = unavailable(source.name)
                expect(function(): (any?, error?) return source.run(failure) end, failure)
            end

            local function jira_api(failing: string, failure: error, existing: boolean?): any
                local function result(name: string, data: any): (any?, error?)
                    if name == failing then return nil, failure end
                    return { success = true, data = data or {} }, nil
                end
                return {
                    search_issues = function(): (any?, error?) return result("search_issues", { issues = existing and { { key = "ABC-1" } } or {} }) end,
                    create_issue = function(): (any?, error?) return result("create_issue", { key = "ABC-1" }) end,
                    update_issue = function(): (any?, error?) return result("update_issue", {}) end,
                    delete_issue = function(): (any?, error?) return result("delete_issue", {}) end,
                    add_comment = function(): (any?, error?) return result("add_comment", {}) end,
                    add_worklog = function(): (any?, error?) return result("add_worklog", {}) end,
                    transition_issue = function(): (any?, error?) return result("transition_issue", {}) end,
                    assign_issue = function(): (any?, error?) return result("assign_issue", {}) end,
                }
            end
            local jira_request = { config = { connection_id = "connection", project_key = "ABC" }, identity_key = "record", idempotency_key = "receipt" }
            for _, sink_case in ipairs({
                { name = "search_issues", request = { sink_op = "upsert", input = { summary = "Issue", external_key = "external", external_key_field = "external" } } },
                { name = "create_issue", request = { sink_op = "create", input = { summary = "Issue" } } },
                { name = "update_issue", request = { sink_op = "update", input = { issue_key = "ABC-1" } } },
                { name = "update_issue", existing = true, request = { sink_op = "upsert", input = { summary = "Issue", external_key = "external", external_key_field = "external" } } },
                { name = "delete_issue", request = { sink_op = "delete", input = { issue_key = "ABC-1" } } },
                { name = "add_comment", request = { sink_op = "add_comment", input = { issue_key = "ABC-1", comment = "Note" } } },
                { name = "add_worklog", request = { sink_op = "add_worklog", input = { issue_key = "ABC-1", time_spent_seconds = 1 } } },
                { name = "add_comment", request = { sink_op = "create", input = { summary = "Issue", comment = "Note" } } },
                { name = "add_worklog", request = { sink_op = "create", input = { summary = "Issue", time_spent_seconds = 1 } } },
                { name = "transition_issue", request = { sink_op = "transition", input = { issue_key = "ABC-1", transition_id = "1" } } },
                { name = "assign_issue", request = { sink_op = "assign", input = { issue_key = "ABC-1", account_id = "user" } } },
            }) do
                local failure = unavailable("Jira " .. sink_case.name)
                local request: any = { config = jira_request.config, identity_key = jira_request.identity_key,
                    idempotency_key = jira_request.idempotency_key, sink_op = sink_case.request.sink_op, input = sink_case.request.input }
                expect(function(): (any?, error?) return jira_sink.write(request, { transport = transport,
                    jira = jira_api(sink_case.name, failure, sink_case.existing) }) end, failure)
            end

            local function confluence_api(failing: string, failure: error): any
                local function result(name: string, data: any): (any?, error?)
                    if name == failing then return nil, failure end
                    return { success = true, data = data or {} }, nil
                end
                return {
                    search = function(): (any?, error?) return result("search", { results = {} }) end,
                    get_page = function(): (any?, error?) return result("get_page", { version = { number = 1 } }) end,
                    update_content = function(): (any?, error?) return result("update_content", {}) end,
                    create_content = function(): (any?, error?) return result("create_content", { id = "1" }) end,
                    delete_content = function(): (any?, error?) return result("delete_content", {}) end,
                    add_comment = function(): (any?, error?) return result("add_comment", {}) end,
                }
            end
            local confluence_request = { config = { connection_id = "connection", space_key = "DOC" }, identity_key = "record", idempotency_key = "receipt" }
            for _, sink_case in ipairs({
                { name = "search", request = { sink_op = "upsert", input = { title = "Page" } } },
                { name = "get_page", request = { sink_op = "update", input = { content_id = "1", title = "Page" } } },
                { name = "update_content", request = { sink_op = "update", input = { content_id = "1", title = "Page", version = 1 } } },
                { name = "create_content", request = { sink_op = "create", input = { title = "Page" } } },
                { name = "delete_content", request = { sink_op = "delete", input = { content_id = "1" } } },
                { name = "add_comment", request = { sink_op = "add_comment", input = { content_id = "1", comment = "Note" } } },
            }) do
                local failure = unavailable("Confluence " .. sink_case.name)
                local request: any = { config = confluence_request.config, identity_key = confluence_request.identity_key,
                    idempotency_key = confluence_request.idempotency_key, sink_op = sink_case.request.sink_op, input = sink_case.request.input }
                expect(function(): (any?, error?) return confluence_sink.write(request, { transport = transport,
                    confluence = confluence_api(sink_case.name, failure) }) end, failure)
            end
        end)
    end)
end
local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
