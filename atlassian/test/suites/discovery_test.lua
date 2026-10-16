local test = require("test")
local connection = require("connection")
local function run(jira: any, confluence: any): any
    return connection.discover_resources({}, {
        open = function() return { jira_base = "jira", confluence_base = "confluence", deployment = "cloud" }, nil end,
        get = function(_conn: any, url: string) return url:sub(1, 4) == "jira" and jira or confluence end,
    })
end
local function define_tests()
    test.describe("Atlassian resource discovery", function()
        test.it("reports both inaccessible products with their provider status", function()
            local result = run({ success = false, error = "bad credential", status_code = 401 },
                { success = false, error = "forbidden", status_code = 403 })
            test.is_false(result.success)
            test.eq(result.error, "Jira: bad credential (HTTP 401); Confluence: forbidden (HTTP 403)")
        end)
        test.it("fails with the typed connection and transport errors", function()
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            local opened, open_err = connection.discover_resources({}, { open = function() return nil, failure end })
            test.is_nil(opened)
            test.eq(open_err, failure)
            local sent, send_err = connection.discover_resources({}, {
                open = function() return { deployment = "cloud", jira_base = "j", confluence_base = "c" }, nil end,
                get = function() return nil, failure end,
            })
            test.is_nil(sent)
            test.eq(send_err, failure)
        end)
        test.it("accepts an empty accessible product while the other refuses", function()
            local result = run({ success = true, data = { values = {} } }, { success = false, error = "not enabled" })
            test.is_true(result.success)
            test.eq(#result.resources, 0)
        end)
        test.it("returns each accessible product's typed resources", function()
            local result = run({ success = true, data = { values = { { id = "1", key = "PROJ", name = "Project" } } } },
                { success = true, data = { results = { { id = "2", key = "SPACE", name = "Space" } } } })
            test.is_true(result.success)
            test.eq(#result.resources, 2)
            test.eq(result.resources[1].type, "jira_project")
            test.eq(result.resources[2].type, "confluence_space")
        end)
    end)
end
return { run = test.run_cases(define_tests) }
