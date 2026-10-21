local test = require("test")
local service = require("service")
local fixture = require("fixture")
local json = require("json")
local function cases()
    test.describe("Linear issue workflows", function()
        test.it("pages issues and creates a team-scoped issue using GraphQL variables", function()
            local deps, state = fixture.new("linear", {
                {method = "POST", url = "https://api.linear.app/graphql",
                    check = function(options)
                        local body = json.decode(options.body)
                        test.eq(body.variables.first, 2)
                        test.ok(body.query:find("issues(", 1, true) ~= nil)
                        test.ok(body.query:find("pageInfo", 1, true) ~= nil)
                    end,
                    reply = {data = {issues = {nodes = {{id = "issue-1", identifier = "ENG-1"}}, pageInfo = {hasNextPage = true, endCursor = "next-1"}}}}},
                {method = "POST", url = "https://api.linear.app/graphql",
                    check = function(options)
                        local body = json.decode(options.body)
                        test.eq(body.variables.input.teamId, "team-1")
                        test.eq(body.variables.input.title, "A quote: \" followed by } mutation { evil }")
                        test.ok(body.query:find("issueCreate(input: $input)", 1, true) ~= nil)
                        test.is_nil(body.query:find("evil", 1, true))
                    end,
                    reply = {data = {issueCreate = {success = true, issue = {id = "issue-2", identifier = "ENG-2"}}}}},
            })
            local run = service.new(deps).run
            local page, err = run("list_issues", {first = 2}, nil, false)
            test.is_nil(err); test.eq(page.next_cursor, "next-1")
            local created = run("create_issue", {input = {teamId = "team-1", title = "A quote: \" followed by } mutation { evil }"}}, nil, true)
            test.eq(created.data.issue.identifier, "ENG-2"); test.eq(state.writes, 1); state.done()
        end)
        test.it("treats HTTP 200 with partial GraphQL errors as a failure", function()
            local deps, state = fixture.new("linear", {{method = "POST", url = "https://api.linear.app/graphql",
                reply = {data = {viewer = {id = "partial"}}, errors = {{message = "Not authorized", extensions = {code = "FORBIDDEN"}}}}}})
            local result, err = service.new(deps).run("get_viewer", {}, nil, false)
            test.is_nil(err); test.eq(result.success, false); test.eq(result.error, "GraphQL operation failed"); state.done()
        end)
        test.it("clears nullable assignments and preserves empty label arrays on the wire", function()
            local deps, state = fixture.new("linear", {{method = "POST", url = "https://api.linear.app/graphql",
                reply = {data = {issueUpdate = {success = true, issue = {id = "issue-1"}}}}, check = function(o)
                    test.ok(o.body:find('"assigneeId":null', 1, true) ~= nil)
                    test.ok(o.body:find('"labelIds":[]', 1, true) ~= nil)
                    test.is_nil(o.body:find('"clear_fields"', 1, true))
                end}})
            local result, err = service.new(deps).run("update_issue", {id = "issue-1", input = {labelIds = {}}, clear_fields = {"assigneeId"}}, nil, true)
            test.is_nil(err); test.eq(result.success, true); state.done()
        end)
        test.it("rejects raw GraphQL and unknown mutation input fields", function()
            local deps, state = fixture.new("linear", {})
            local run = service.new(deps).run
            for _, args in ipairs({{query = "mutation { evil }"}, {input = {teamId = "t", title = "ok", clientSecret = "bad"}}}) do
                local result, err = run("create_issue", args, nil, true)
                test.is_nil(result); test.is_true(errors.is(err, errors.INVALID))
            end
            state.done()
        end)
    end)
end
return {run = test.run_cases(cases)}
