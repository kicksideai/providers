local test = require("test")
local json = require("json")
local registry = require("registry")
local read_tool = require("read_tool")
local write_tool = require("write_tool")

local READ_TOOL = "kickside.github.traits:read_tool"
local WRITE_TOOL = "kickside.github.traits:write_tool"

local function get_entry(id: string): any
    local entries, err = registry.find({ [".id"] = id })
    test.is_nil(err)
    test.not_nil(entries, id .. " lookup failed")
    test.eq(#entries, 1, id .. " should resolve once")
    return entries[1]
end

local function decode_schema(entry: any): any
    test.not_nil(entry.meta, entry.id .. " missing meta")
    test.eq(entry.meta.type, "tool")
    local schema, err = json.decode(tostring(entry.meta.input_schema or ""))
    test.is_nil(err)
    test.eq(schema.type, "object")
    test.eq(schema.additionalProperties, false)
    return schema
end

local function meta_of(id: string): any
    local entry = get_entry(id)
    return entry.meta or {}
end

local function enum_contains(enum: any, value: string): boolean
    for _, item in ipairs(enum or {}) do
        if item == value then return true end
    end
    return false
end

local fake_output = {
    sanitize = function(data: any): any
        return data
    end,
}

local function with_tool(tool: any, fake_transport: any, fn: any)
    local old_transport, old_output = tool._transport, tool._output
    tool._transport = fake_transport
    tool._output = fake_output
    local ok, err = pcall(fn)
    tool._transport, tool._output = old_transport, old_output
    if not ok then error(err) end
end

local function connect_ok(): any
    return {
        connect = function(): (any, any?) return { mode = "test" }, nil end,
        has_next_page = function(headers: any): boolean return type(headers) == "table" and headers.next == true end,
    }
end

local function connect_should_not_be_called(): any
    return { connect = function(): any error("connect should not be called for invalid args") end }
end

local function define_tests()
    test.describe("GitHub trait schemas", function()
        test.it("declares public context-configurable capabilities", function()
            for _, id in ipairs({
                "kickside.github.traits:reader",
                "kickside.github.traits:writer",
                "kickside.github.traits:manager",
            }) do
                local meta = meta_of(id)
                test.eq(meta.type, "agent.trait")
                test.is_true(meta.public)
                test.eq(meta.web_component, "kickside-connection-trait-picker")
                test.eq(meta.provider, "github")
                test.eq(meta.context_schema.type, "object")
                test.not_nil(meta.context_schema.properties.connection_id)
                test.eq(meta.context_schema.additionalProperties, false)
            end
        end)

        test.it("manager grants both read and write tools", function()
            local entry = get_entry("kickside.github.traits:manager")
            test.eq(entry.data.tools[1], READ_TOOL)
            test.eq(entry.data.tools[2], WRITE_TOOL)
            test.ok(tostring(entry.data.prompt or ""):find("Do not ask the user") ~= nil)
            test.ok(tostring(entry.data.prompt or ""):find("Do not mutate repository files") ~= nil)
        end)

        test.it("publishes read + write tools with complete action enums", function()
            local read_tool = get_entry(READ_TOOL)
            local write_tool = get_entry(WRITE_TOOL)
            local read_enum = decode_schema(read_tool).properties.action.enum
            local write_enum = decode_schema(write_tool).properties.action.enum
            test.is_true(enum_contains(read_tool.meta.tags, "github"))
            test.is_true(enum_contains(read_tool.meta.tags, "read-only"))
            test.is_true(enum_contains(write_tool.meta.tags, "github"))
            test.is_true(enum_contains(write_tool.meta.tags, "write"))
            for _, action in ipairs({ "viewer", "get_repo", "list_issues", "get_issue", "list_issue_comments", "get_pull", "list_pull_files", "get_file" }) do
                test.is_true(enum_contains(read_enum, action), "missing read action " .. action)
            end
            for _, action in ipairs({ "create_issue", "update_issue", "create_issue_comment" }) do
                test.is_true(enum_contains(write_enum, action), "missing write action " .. action)
            end
        end)

        test.it("keeps connection selection out of model-facing schemas", function()
            for _, id in ipairs({ READ_TOOL, WRITE_TOOL }) do
                local schema_text = tostring(get_entry(id).meta.input_schema or "")
                test.is_nil(schema_text:find("component_id", 1, true), id .. " exposes component_id")
                test.is_nil(schema_text:find("connection_id", 1, true), id .. " exposes connection_id")
            end
        end)
    end)

    test.describe("GitHubRead tool", function()
        test.it("validates action and repository arguments before opening a connection", function()
            with_tool(read_tool, connect_should_not_be_called(), function()
                test.ok(tostring((read_tool.handler({}) :: any).error):find("action is required") ~= nil)
                test.ok(tostring((read_tool.handler({ action = "nope" }) :: any).error):find("unknown action") ~= nil)
                test.ok(tostring((read_tool.handler({ action = "get_repo", repo = "r" }) :: any).error):find("owner is required") ~= nil)
                test.ok(tostring((read_tool.handler({ action = "get_file", owner = "o", repo = "r" }) :: any).error):find("path is required") ~= nil)
                test.ok(tostring((read_tool.handler({ action = "get_issue", owner = "o", repo = "r" }) :: any).error):find("number is required") ~= nil)
            end)
        end)

        test.it("dispatches list_issues with clamped pagination and filters", function()
            local seen: any = nil
            local fake = connect_ok()
            fake.list_issues = function(_conn: any, owner: string, repo: string, query: any): any
                seen = { owner = owner, repo = repo, query = query }
                return { success = true, data = { { number = 1, title = "Bug" } } }
            end
            with_tool(read_tool, fake, function()
                local decoded = read_tool.handler({
                    action = "list_issues",
                    owner = "o",
                    repo = "r",
                    state = "all",
                    limit = 999,
                    page = 3,
                    since = "2026-01-01T00:00:00Z",
                })
                test.is_true(decoded.success)
                test.eq(decoded.issues[1].title, "Bug")
                test.eq(decoded.page, 3)
                test.is_nil(decoded.next_page)
                test.eq(seen.owner, "o")
                test.eq(seen.repo, "r")
                test.eq(seen.query.per_page, 100)
                test.eq(seen.query.page, 3)
                test.eq(seen.query.state, "all")
                test.eq(seen.query.since, "2026-01-01T00:00:00Z")
            end)
        end)

        test.it("routes pull and file reads to the expected transport methods", function()
            local seen: any = {}
            local fake = connect_ok()
            fake.get_pull = function(_conn: any, owner: string, repo: string, number: string): any
                seen.pull = owner .. "/" .. repo .. "#" .. number
                return { success = true, data = { pull = seen.pull } }
            end
            fake.get_file = function(_conn: any, owner: string, repo: string, path: string, ref: string?): any
                seen.file = { owner = owner, repo = repo, path = path, ref = ref }
                return { success = true, data = seen.file }
            end
            with_tool(read_tool, fake, function()
                local pull = read_tool.handler({ action = "get_pull", owner = "o", repo = "r", number = "9" })
                test.not_nil(pull)
                local file = read_tool.handler({ action = "get_file", owner = "o", repo = "r", path = "src/a.lua", ref = "main" })
                test.eq(file.path, "src/a.lua")
                test.eq(file.ref, "main")
            end)
        end)

        test.it("returns complete GitHub records with nested fields", function()
            local body = string.rep("é body ", 5000)
            local fake = connect_ok()
            fake.get_file = function(): any return { success = true, data = { path = "large.txt", content = body, encoding = "base64" } } end
            fake.get_issue = function(): any
                return { success = true, data = { number = 7, title = "Bug", body = body, user = { login = "ada" }, labels = { { name = "bug" } } } }
            end
            fake.get_issue_comment = function() return {success = true, data = {id = 1, body = body, user = {login = "bob"}}} end
            fake.list_issue_comments = function(): any
                return { success = true, data = { { id = 1, body = body, user = { login = "bob" } } }, headers = { next = true } }
            end
            fake.list_pull_files = function(): any
                return { success = true, data = { { filename = "a.lua", patch = body, additions = 3 } } }
            end
            with_tool(read_tool, fake, function()
                local file: any = read_tool.handler({ action = "get_file", owner = "o", repo = "r", path = "large.txt" })
                test.is_nil(file.success)
                test.eq(file.content, body)
                test.is_nil(file.next_offset)
                local issue: any = read_tool.handler({ action = "get_issue", owner = "o", repo = "r", number = "7" })
                test.eq(issue.body, body)
                test.eq(issue.user.login, "ada")
                test.eq(issue.labels[1].name, "bug")
                local comments: any = read_tool.handler({ action = "list_issue_comments", owner = "o", repo = "r", number = "7", page = 2 })
                test.is_true(comments.success)
                test.is_nil(comments.comments[1].body)
                local comment: any = read_tool.handler({action = "get_issue_comment", owner = "o", repo = "r", comment_id = "1"})
                test.eq(comment.body, body)
                test.eq(comments.comments[1].user.login, "bob")
                test.eq(comments.page, 2)
                test.eq(comments.next_page, 3)
                local files: any = read_tool.handler({ action = "list_pull_files", owner = "o", repo = "r", number = "7" })
                test.is_nil(files.files[1].patch)
                test.is_nil(files.next_page)
            end)
        end)

        test.it("fails with typed connection and transport errors and returns GitHub's rejection", function()
            local selection = errors.new({ kind = errors.INVALID, message = "no GitHub connection selected" })
            with_tool(read_tool, { connect = function(): (any?, error?) return nil, selection end }, function()
                local result, err = read_tool.handler({ action = "viewer" })
                test.is_nil(result)
                test.eq(err, selection)
            end)
            local fake = connect_ok()
            fake.viewer = function(): any return { success = false, error = "forbidden", status_code = 403, error_kind = "forbidden",
                data = { message = "Resource not accessible" } } end
            with_tool(read_tool, fake, function()
                local result: any = read_tool.handler({ action = "viewer" })
                test.is_false(result.success)
                test.eq(result.status_code, 403)
                test.eq(result.error_kind, "forbidden")
                test.eq(result.data.message, "Resource not accessible")
            end)
            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            local broken = connect_ok()
            broken.create_issue = function(): (any?, error?) return nil, failure end
            with_tool(write_tool, broken, function()
                local result, err = write_tool.handler({ action = "create_issue", owner = "o", repo = "r", title = "t" })
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end)
    end)

    test.describe("GitHubWrite tool", function()
        test.it("validates write arguments before opening a connection", function()
            with_tool(write_tool, connect_should_not_be_called(), function()
                test.ok(tostring((write_tool.handler({}) :: any).error):find("action is required") ~= nil)
                test.ok(tostring((write_tool.handler({ action = "drop", owner = "o", repo = "r" }) :: any).error):find("unknown action") ~= nil)
                test.ok(tostring((write_tool.handler({ action = "create_issue", owner = "o", repo = "r" }) :: any).error):find("title is required") ~= nil)
                test.ok(tostring((write_tool.handler({ action = "update_issue", owner = "o", repo = "r", number = "1" }) :: any).error):find("at least one field") ~= nil)
                test.ok(tostring((write_tool.handler({ action = "create_issue_comment", owner = "o", repo = "r", number = "1" }) :: any).error):find("body is required") ~= nil)
            end)
        end)

        test.it("creates issues with title, body, labels, and assignees", function()
            local seen: any = nil
            local fake = connect_ok()
            fake.create_issue = function(_conn: any, owner: string, repo: string, body: any): any
                seen = { owner = owner, repo = repo, body = body }
                return { success = true, data = { number = 10 } }
            end
            with_tool(write_tool, fake, function()
                local decoded = write_tool.handler({
                    action = "create_issue",
                    owner = "o",
                    repo = "r",
                    title = "Bug",
                    body = "Fix",
                    labels = { "bug" },
                    assignees = { "ada" },
                })
                test.eq(decoded.number, 10)
                test.eq(seen.body.title, "Bug")
                test.eq(seen.body.labels[1], "bug")
                test.eq(seen.body.assignees[1], "ada")
            end)
        end)

        test.it("updates issues and creates comments", function()
            local calls: { any } = {}
            local fake = connect_ok()
            fake.update_issue = function(_conn: any, owner: string, repo: string, number: string, body: any): any
                calls[#calls + 1] = { action = "update", owner = owner, repo = repo, number = number, body = body }
                return { success = true, data = { updated = true } }
            end
            fake.create_issue_comment = function(_conn: any, owner: string, repo: string, number: string, body: string): any
                calls[#calls + 1] = { action = "comment", owner = owner, repo = repo, number = number, body = body }
                return { success = true, data = { commented = true } }
            end
            with_tool(write_tool, fake, function()
                test.is_true((write_tool.handler({ action = "update_issue", owner = "o", repo = "r", number = "7", state = "closed" }) :: any).updated)
                test.is_true((write_tool.handler({ action = "create_issue_comment", owner = "o", repo = "r", number = "7", body = "done" }) :: any).commented)
                local first = calls[1] :: any
                local second = calls[2] :: any
                test.eq(first.body.state, "closed")
                test.eq(second.body, "done")
            end)
        end)

        test.it("surfaces write API errors", function()
            local fake = connect_ok()
            fake.create_issue = function(): any return { success = false, error = "missing scope" } end
            with_tool(write_tool, fake, function()
                test.ok(tostring((write_tool.handler({ action = "create_issue", owner = "o", repo = "r", title = "Bug" }) :: any).error):find("missing scope") ~= nil)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
