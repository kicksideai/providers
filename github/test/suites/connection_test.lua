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

local function base_ok(component_id: string): any
    return {
        component_id = function(): (string, any?) return component_id, nil end,
        get_status = function(args: any): any return { success = true, status = "connected", details = args } end,
        delete = function(): any return { success = true } end,
    }
end

local function define_tests()
    test.describe("github connection", function()
        test.it("loads the connection module", function()
            test.eq(type(connection.test_connection), "function")
            test.eq(type(connection.discover_resources), "function")
        end)

        test.it("tests the selected connection through the GitHub transport", function()
            local seen: any = {}
            with_deps(base_ok("gh1"), {
                connect = function(id: string): any
                    seen.id = id
                    return { component_id = id, mode = "oauth" }, nil
                end,
                test_connection = function(conn: any): any
                    seen.conn = conn
                    return { success = true, data = { login = "octo" } }
                end,
            }, function()
                local result = connection.test_connection({})
                test.is_true(result.success)
                test.eq(seen.id, "gh1")
                test.eq(seen.conn.component_id, "gh1")
            end)
        end)

        test.it("fails with the typed connection error and returns GitHub's rejection", function()
            with_deps({
                component_id = function(): (any?, error) return nil, errors.new({ kind = errors.INTERNAL, message = "component missing" }) end,
                get_status = function(): any return {} end,
                delete = function(): any return {} end,
            }, {}, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.is_true(errors.is(err, errors.INTERNAL))
                test.eq(err:message(), "component missing")
            end)

            with_deps(base_ok("gh2"), {
                connect = function(): any return { component_id = "gh2" }, nil end,
                test_connection = function(): any return { success = false, error = "forbidden", status_code = 403, data = { message = "Forbidden" } } end,
            }, function()
                local result = connection.test_connection({})
                test.is_true(result.success == false)
                test.eq(result.error, "forbidden")
                test.eq(result.status_code, 403)
                test.eq(result.details.message, "Forbidden")
            end)

            local failure = errors.new({ kind = errors.UNAVAILABLE, message = "connection reset" })
            with_deps(base_ok("gh2"), {
                connect = function(): any return { component_id = "gh2" }, nil end,
                test_connection = function(): (any?, error?) return nil, failure end,
            }, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.eq(err, failure)
            end)
        end)

        test.it("discovers accessible repositories as selectable rows", function()
            local seen: any = {}
            with_deps(base_ok("gh3"), {
                connect = function(id: string): any return { component_id = id }, nil end,
                list_repositories = function(conn: any, query: any): any
                    seen.conn, seen.query = conn, query
                    return {
                        success = true,
                        data = {
                            {
                                full_name = "octo/one",
                                description = "First repo",
                                html_url = "https://github.com/octo/one",
                                owner = { login = "octo" },
                                visibility = "private",
                                private = true,
                                default_branch = "main",
                                archived = false,
                                updated_at = "2026-09-01T10:00:00Z",
                            },
                            {
                                full_name = "acme/two",
                                description = nil,
                                html_url = "https://github.com/acme/two",
                                owner = { login = "acme" },
                                private = false,
                                default_branch = "trunk",
                                archived = true,
                                updated_at = "2026-08-01T10:00:00Z",
                            },
                        },
                        headers = { Link = '<https://api.github.com/user/repos?page=2>; rel="next"' },
                    }
                end,
                has_next_page = function(headers: any): boolean return headers ~= nil and headers.Link ~= nil end,
            }, function()
                local result = connection.discover_resources({})
                test.is_true(result.success)
                test.eq(seen.conn.component_id, "gh3")
                test.eq(seen.query.page, 1)
                test.eq(seen.query.per_page, 100)
                test.eq(#result.resources, 2)
                local first = result.resources[1]
                test.eq(first.type, "github_repo")
                test.eq(first.id, "octo/one")
                test.eq(first.key, "octo/one")
                test.eq(first.name, "octo/one")
                test.is_nil(first.description)
                test.eq(first.url, "https://github.com/octo/one")
                test.is_true(first.selectable)
                test.is_nil(field(first, "parent_id"))
                test.eq(first.metadata.owner, "octo")
                test.eq(first.metadata.visibility, "private")
                test.eq(first.metadata.default_branch, "main")
                test.is_true(first.metadata.archived == false)
                test.eq(first.metadata.updated_at, "2026-09-01T10:00:00Z")
                local second = result.resources[2]
                test.is_nil(second.description)
                test.eq(second.metadata.visibility, "public")
                test.is_true(second.metadata.archived)
                test.eq(result.next_cursor, "2")
            end)
        end)

        test.it("pages with the returned cursor and clamps the limit", function()
            local queries: any = {}
            local fake = {
                connect = function(id: string): any return { component_id = id }, nil end,
                list_repositories = function(_conn: any, query: any): any
                    queries[#queries + 1] = query
                    return { success = true, data = {}, headers = {} }
                end,
                has_next_page = function(): boolean return false end,
            }
            with_deps(base_ok("gh5"), fake, function()
                local result = connection.discover_resources({ cursor = "3", limit = 500 })
                test.is_true(result.success)
                test.eq(#result.resources, 0)
                test.is_nil(result.next_cursor)
                connection.discover_resources({ limit = 0 })
                connection.discover_resources({ limit = 25 })
            end)
            test.eq(queries[1].page, 3)
            test.eq(queries[1].per_page, 100)
            test.eq(queries[2].per_page, 1)
            test.eq(queries[3].per_page, 25)
        end)

        test.it("rejects an invalid cursor and unsupported search", function()
            local calls = 0
            local fake = {
                connect = function(id: string): any calls = calls + 1 return { component_id = id }, nil end,
            }
            with_deps(base_ok("gh6"), fake, function()
                for _, cursor in ipairs({ "0", "-1", "abc", "1.5" }) do
                    local result = connection.discover_resources({ cursor = cursor })
                    test.is_true(result.success == false)
                    test.contains(result.error, "cursor")
                end
                local searched = connection.discover_resources({ q = "kick" })
                test.is_true(searched.success == false)
                test.contains(searched.error, "does not support search")
            end)
            test.eq(calls, 0)
        end)

        test.it("returns no rows for a resource type it does not provide", function()
            local calls = 0
            with_deps(base_ok("gh7"), {
                connect = function(id: string): any calls = calls + 1 return { component_id = id }, nil end,
            }, function()
                local result = connection.discover_resources({ type = "gitlab_project" })
                test.is_true(result.success)
                test.eq(#result.resources, 0)
                test.is_nil(result.next_cursor)

                local nested = connection.discover_resources({ parent_id = "octo" })
                test.is_true(nested.success)
                test.eq(#nested.resources, 0)
            end)
            test.eq(calls, 0)
        end)

        test.it("reports discovery failures from the connection and the API", function()
            with_deps({
                component_id = function(): (any?, error) return nil, errors.new({ kind = errors.INTERNAL, message = "component missing" }) end,
                get_status = function(): any return {} end,
                delete = function(): any return {} end,
            }, {}, function()
                local result, err = connection.discover_resources({})
                test.is_nil(result)
                test.eq(err:message(), "component missing")
            end)

            with_deps(base_ok("gh8"), {
                connect = function(id: string): any return { component_id = id }, nil end,
                list_repositories = function(): any
                    return { success = false, error = "unauthorized (check the GitHub token)", status_code = 401 }
                end,
            }, function()
                local result = connection.discover_resources({ type = "github_repo" })
                test.is_true(result.success == false)
                test.eq(result.error, "unauthorized (check the GitHub token)")
            end)
        end)

        test.it("delegates status and delete to the base connection helper", function()
            with_deps(base_ok("gh4"), {}, function()
                local status = connection.get_status({ reason = "check" })
                test.is_true(status.success)
                test.eq(status.status, "connected")
                test.eq(status.details.reason, "check")
                test.is_true(connection.delete({}).success)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
