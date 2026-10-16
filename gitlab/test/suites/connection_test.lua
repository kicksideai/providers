local test = require("test")
local connection = require("connection")

-- field reads a key from a discovered row as the serialized table the API
-- returns, so a test can assert that a key is absent.
local function field(row: unknown, key: string): unknown
    if type(row) ~= "table" then return nil end
    for k, v in pairs(row) do
        if k == key then return v end
    end
    return nil
end

local function with_deps(fake_base: any, fake_transport: any, fn: any)
    local old_base, old_transport = connection._base, connection._transport
    connection._base = fake_base
    connection._transport = fake_transport
    local ok, err = pcall(fn)
    connection._base = old_base
    connection._transport = old_transport
    if not ok then error(err) end
end

local function trim(value: any): string
    if type(value) ~= "string" then return "" end
    return (value:gsub("^%s*(.-)%s*$", "%1"))
end

local function base_ok(component_id: string, deletes: { string }?): any
    return {
        trim = trim,
        component_id = function(): (string, any?) return component_id, nil end,
        get_status = function(args: any): any return { success = true, status = "connected", details = args } end,
        delete = function(): any
            if deletes then deletes[#deletes + 1] = component_id end
            return { success = true }
        end,
    }
end

local function base_missing(): any
    return {
        trim = trim,
        component_id = function(): (any?, error) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
        get_status = function(): (any?, error?) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
        delete = function(): (any?, error?) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
    }
end

local function lister(seen: any, response: any): any
    return {
        connect = function(id: string): (any, any?)
            seen.connected = id
            return { component_id = id, mode = "credential", base_url = "https://gitlab.com", token = "t" }, nil
        end,
        list_projects = function(conn: any, query: any): any
            seen.conn, seen.query = conn, query
            seen.calls = (seen.calls or 0) + 1
            return response
        end,
        next_page = function(headers: { [string]: string }?): string?
            if not headers then return nil end
            local page = headers["x-next-page"]
            if page == nil or page == "" then return nil end
            return page
        end,
    }
end

local PROJECTS = {
    {
        id = 42,
        description = "Core services",
        name = "Core",
        path_with_namespace = "acme/platform/core",
        web_url = "https://gitlab.com/acme/platform/core",
        default_branch = "main",
        visibility = "private",
        last_activity_at = "2026-09-01T10:00:00.000Z",
        namespace = { id = 3, full_path = "acme/platform", kind = "group" },
    },
    {
        id = 7,
        description = "",
        path_with_namespace = "jane/notes",
        web_url = "https://gitlab.com/jane/notes",
        visibility = "internal",
        last_activity_at = "2026-08-01T10:00:00.000Z",
        namespace = { id = 9, full_path = "jane", kind = "user" },
    },
}

local function define_tests()
    test.describe("gitlab connection test_connection", function()
        test.it("checks the current user through the transport", function()
            local seen: any = {}
            with_deps(base_ok("gl1"), {
                connect = function(id: string): (any, any?)
                    seen.id = id
                    return { component_id = id, mode = "credential" }, nil
                end,
                current_user = function(conn: any): any
                    seen.conn = conn
                    return { success = true, data = { id = 1, username = "jane" } }
                end,
            }, function()
                local result = connection.test_connection({})
                test.is_true(result.success)
                test.is_nil(result.error)
            end)
            test.eq(seen.id, "gl1")
            test.eq(seen.conn.component_id, "gl1")
        end)

        test.it("propagates API failures", function()
            with_deps(base_ok("gl2"), {
                connect = function(id: string): (any, any?) return { component_id = id }, nil end,
                current_user = function(): any
                    return { success = false, status_code = 401, error = "unauthorized (check the GitLab access token)",
                        data = { message = "401 Unauthorized" } }
                end,
            }, function()
                local result = connection.test_connection({})
                test.is_true(result.success == false)
                test.eq(result.error, "unauthorized (check the GitLab access token)")
                test.eq(result.status_code, 401)
                test.eq(result.details.message, "401 Unauthorized")
            end)
        end)

        test.it("fails with the typed missing-component and invalid-credential errors", function()
            with_deps(base_missing(), {}, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(tostring(err), "component_id not in scope")
            end)

            local invalid = errors.new({ kind = errors.INVALID, message = "GitLab base_url must use http or https, got ftp" })
            with_deps(base_ok("gl3"), {
                connect = function(): (any?, error?) return nil, invalid end,
            }, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.eq(err, invalid)
            end)

            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "dial tcp: connection refused" })
            with_deps(base_ok("gl3"), {
                connect = function(id: string): (any, any?) return { component_id = id }, nil end,
                current_user = function(): (any?, error?) return nil, failure end,
            }, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end)
    end)

    test.describe("gitlab connection discover_resources", function()
        test.it("shapes member projects as selectable rows", function()
            local seen: any = {}
            with_deps(base_ok("gl4"), lister(seen, {
                success = true,
                data = PROJECTS,
                headers = { ["x-next-page"] = "" },
            }), function()
                local result = connection.discover_resources({})
                test.is_true(result.success)
                test.is_nil(result.next_cursor)
                test.eq(#result.resources, 2)

                local first = result.resources[1]
                test.eq(first.type, "gitlab_project")
                test.eq(first.id, "42")
                test.eq(first.key, "acme/platform/core")
                test.eq(first.name, "acme/platform/core")
                test.is_nil(first.description)
                test.eq(first.url, "https://gitlab.com/acme/platform/core")
                test.is_true(first.selectable)
                test.is_nil(field(first, "parent_id"))
                test.is_nil(field(first, "drillable"))
                test.eq(first.metadata.owner, "acme/platform")
                test.eq(first.metadata.visibility, "private")
                test.eq(first.metadata.default_branch, "main")
                test.eq(first.metadata.updated_at, "2026-09-01T10:00:00.000Z")
                test.is_nil(field(first.metadata, "archived"))

                local second = result.resources[2]
                test.eq(second.id, "7")
                test.is_nil(second.description)
                test.is_nil(second.metadata.default_branch)
                test.eq(second.metadata.owner, "jane")
                test.eq(second.metadata.visibility, "internal")
            end)
            test.eq(seen.connected, "gl4")
            test.eq(seen.query.page, 1)
            test.eq(seen.query.per_page, 100)
            test.is_nil(seen.query.search)
        end)

        test.it("skips malformed project rows", function()
            with_deps(base_ok("gl5"), lister({}, {
                success = true,
                data = { "junk", { id = 1 }, { path_with_namespace = "no/id" }, PROJECTS[2] },
                headers = {},
            }), function()
                local result = connection.discover_resources({})
                test.is_true(result.success)
                test.eq(#result.resources, 1)
                test.eq(result.resources[1].id, "7")
            end)
        end)

        test.it("returns an empty page for no projects", function()
            with_deps(base_ok("gl6"), lister({}, { success = true, data = {}, headers = {} }), function()
                local result = connection.discover_resources({})
                test.is_true(result.success)
                test.eq(#result.resources, 0)
                test.is_nil(result.next_cursor)
            end)
        end)

        test.it("reads the cursor as the page and returns the next page", function()
            local seen: any = {}
            with_deps(base_ok("gl7"), lister(seen, {
                success = true,
                data = { PROJECTS[1] },
                headers = { ["x-next-page"] = "4" },
            }), function()
                local result = connection.discover_resources({ cursor = "3" })
                test.is_true(result.success)
                test.eq(result.next_cursor, "4")
            end)
            test.eq(seen.query.page, 3)
        end)

        test.it("rejects an invalid cursor without calling GitLab", function()
            for _, cursor in ipairs({ "abc", "0", "-1", "1.5" }) do
                local seen: any = {}
                with_deps(base_ok("gl8"), lister(seen, { success = true, data = {} }), function()
                    local result = connection.discover_resources({ cursor = cursor })
                    test.is_true(result.success == false)
                    test.contains(result.error, "invalid discovery cursor")
                end)
                test.is_nil(seen.calls)
            end
        end)

        test.it("clamps the limit to 1..100", function()
            for _, case in ipairs({ { 0, 1 }, { -5, 1 }, { 25, 25 }, { 100, 100 }, { 1000, 100 }, { "30", 30 }, { "many", 100 } }) do
                local seen: any = {}
                with_deps(base_ok("gl9"), lister(seen, { success = true, data = {}, headers = {} }), function()
                    test.is_true(connection.discover_resources({ limit = case[1] }).success)
                end)
                test.eq(seen.query.per_page, case[2])
            end
        end)

        test.it("passes q to GitLab as server-side search", function()
            local seen: any = {}
            with_deps(base_ok("gl10"), lister(seen, { success = true, data = { PROJECTS[1] }, headers = {} }), function()
                local result = connection.discover_resources({ q = "  core  " })
                test.is_true(result.success)
                test.eq(#result.resources, 1)
            end)
            test.eq(seen.query.search, "core")

            local blank_seen: any = {}
            with_deps(base_ok("gl11"), lister(blank_seen, { success = true, data = {}, headers = {} }), function()
                test.is_true(connection.discover_resources({ q = "   " }).success)
            end)
            test.is_nil(blank_seen.query.search)
        end)

        test.it("filters by resource type", function()
            local seen: any = {}
            with_deps(base_ok("gl12"), lister(seen, { success = true, data = PROJECTS, headers = {} }), function()
                local result = connection.discover_resources({ type = "github_repo" })
                test.is_true(result.success)
                test.eq(#result.resources, 0)
            end)
            test.is_nil(seen.calls)

            with_deps(base_ok("gl13"), lister(seen, { success = true, data = PROJECTS, headers = {} }), function()
                local result = connection.discover_resources({ type = "gitlab_project" })
                test.eq(#result.resources, 2)
            end)
            test.eq(seen.calls, 1)
        end)

        test.it("returns no rows under a parent id because projects have no containers", function()
            local seen: any = {}
            with_deps(base_ok("gl14"), lister(seen, { success = true, data = PROJECTS, headers = {} }), function()
                local result = connection.discover_resources({ parent_id = "acme" })
                test.is_true(result.success)
                test.eq(#result.resources, 0)
            end)
            test.is_nil(seen.calls)
        end)

        test.it("propagates listing and connection failures", function()
            with_deps(base_ok("gl15"), lister({}, {
                success = false,
                status_code = 403,
                error = "forbidden (the token may lack the read_api scope or access to this resource)",
            }), function()
                local result = connection.discover_resources({})
                test.is_true(result.success == false)
                test.contains(result.error, "read_api")
            end)

            local invalid = errors.new({ kind = errors.INVALID, message = "GitLab credential connection is missing token" })
            with_deps(base_ok("gl16"), {
                connect = function(): (any?, error?) return nil, invalid end,
            }, function()
                local result, err = connection.discover_resources({})
                test.is_nil(result)
                test.eq(err, invalid)
            end)

            with_deps(base_missing(), {}, function()
                local result, err = connection.discover_resources({})
                test.is_nil(result)
                test.eq(tostring(err), "component_id not in scope")
            end)
        end)
    end)

    test.describe("gitlab connection base delegation", function()
        test.it("delegates get_status to the base connection", function()
            with_deps(base_ok("gl17"), {}, function()
                local result = connection.get_status({ probe = true })
                test.is_true(result.success)
                test.eq(result.status, "connected")
                test.eq(result.details.probe, true)
            end)
        end)

        test.it("delegates delete to the base connection", function()
            local deletes: { string } = {}
            with_deps(base_ok("gl18", deletes), {}, function()
                local result = connection.delete({})
                test.is_true(result.success)
            end)
            test.len(deletes, 1)
            test.eq(deletes[1], "gl18")

            with_deps(base_missing(), {}, function()
                for _, method in ipairs({ "get_status", "delete" }) do
                    local result, err = (connection :: any)[method]({})
                    test.is_nil(result)
                    test.is_true(errors.is(err, errors.INTERNAL))
                    test.eq(tostring(err), "component_id not in scope")
                end
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
