local test = require("test")
local connection = require("connection")

local function with_deps(fake_base: any, fake_transport: any, fn: () -> ())
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

local function base_missing(): any
    return {
        component_id = function(): (any?, error) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
        get_status = function(): (any?, error?) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
        delete = function(): (any?, error?) return nil, errors.new({ kind = errors.INTERNAL, message = "component_id not in scope" }) end,
    }
end

local function slug(value: any): (string?, string?)
    if type(value) == "string" and value:match("^[%w_%-]+$") then return value, nil end
    return nil, "Bitbucket workspace '" .. tostring(value) .. "' is not a workspace slug"
end

local function next_page(data: { next: string? }): (string?, string?)
    local link = data.next
    if not link then return nil, nil end
    return link:match("[?&]page=(%d+)"), nil
end

type Recorder = { workspaces: { any }, repositories: { any }, connects: integer }

-- fake_transport scripts one connection handle and one listing response and
-- records every listing request it receives.
local function fake_transport(conn: any, response: any): (any, Recorder)
    local seen: Recorder = { workspaces = {}, repositories = {}, connects = 0 }
    return {
        connect = function(id: string): (any?, string?)
            seen.connects = seen.connects + 1
            if conn == nil then return nil, "Bitbucket connection is missing auth_type" end
            conn.component_id = id
            return conn, nil
        end,
        test_connection = function(c: any): any
            return response or { success = true, data = { username = "dev" } }
        end,
        list_workspaces = function(c: any, query: any): any
            seen.workspaces[#seen.workspaces + 1] = { conn = c, query = query }
            return response
        end,
        list_repositories = function(c: any, workspace: string, query: any): any
            seen.repositories[#seen.repositories + 1] = { conn = c, workspace = workspace, query = query }
            return response
        end,
        next_page = next_page,
        workspace_slug = slug,
    }, seen
end

local API_UNSCOPED = { auth_type = "api_token", authorization = "Basic x" }

local REPOSITORY = {
    uuid = "{6f4d4483-c0e8-4894-8d54-b189ae1e5604}",
    full_name = "acme/web-app",
    name = "web-app",
    slug = "web-app",
    is_private = true,
    description = "Storefront",
    updated_on = "2026-07-17T19:06:57.974373+00:00",
    mainbranch = { name = "main", type = "branch" },
    links = { html = { href = "https://bitbucket.org/acme/web-app" } },
    workspace = { type = "workspace", slug = "acme", name = "Acme" },
}

local function define_tests()
    test.describe("bitbucket connection", function()
        test.it("tests the selected connection through the transport", function()
            local transport, seen = fake_transport({ auth_type = "api_token", authorization = "Basic x" }, nil)
            with_deps(base_ok("bb1"), transport, function()
                local result = connection.test_connection({})
                test.is_true(result.success)
                test.is_nil(result.error)
            end)
            test.eq(seen.connects, 1)
        end)

        test.it("reports test failures from scope, credentials, and the API", function()
            with_deps(base_missing(), {}, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.eq(tostring(err), "component_id not in scope")
            end)

            local transport = fake_transport(nil, nil)
            with_deps(base_ok("bb2"), transport, function()
                local result, err = connection.test_connection({})
                test.is_nil(result)
                test.eq(tostring(err), "Bitbucket connection is missing auth_type")
            end)

            transport = fake_transport({ auth_type = "access_token", authorization = "Bearer t", workspace = "acme" },
                { success = false, error = "unauthorized (check the Bitbucket credentials)", status_code = 401,
                    data = { type = "error", error = { message = "Invalid credentials" } } })
            with_deps(base_ok("bb3"), transport, function()
                local result = connection.test_connection({})
                test.is_false(result.success)
                test.eq(result.error, "unauthorized (check the Bitbucket credentials)")
                test.eq(result.status_code, 401)
                test.eq(result.details.error.message, "Invalid credentials")
            end)
        end)

        test.it("lists workspaces as drillable containers for an unscoped API token", function()
            local transport, seen = fake_transport(API_UNSCOPED, {
                success = true,
                data = {
                    page = 1,
                    pagelen = 100,
                    next = "https://api.bitbucket.org/2.0/user/workspaces?page=2&pagelen=100",
                    values = {
                        {
                            type = "workspace_access",
                            administrator = true,
                            workspace = {
                                type = "workspace_base",
                                slug = "acme",
                                uuid = "{470c176d-3574-44ea-bb41-89e8638bcca4}",
                                links = { self = { href = "https://api.bitbucket.org/2.0/workspaces/acme" } },
                            },
                        },
                        { type = "workspace_access", workspace = { slug = "" } },
                    },
                },
            })
            with_deps(base_ok("bb4"), transport, function()
                local result = connection.discover_resources({})
                test.is_true(result.success)
                test.len(result.resources, 1)
                local row = result.resources[1]
                test.eq(row.type, "bitbucket_workspace")
                test.eq(row.id, "acme")
                test.eq(row.key, "acme")
                test.eq(row.name, "acme")
                test.is_nil(row.url)
                test.is_false(row.selectable)
                test.is_true(row.drillable)
                test.is_nil(row.parent_id)
                test.eq(row.metadata.uuid, "{470c176d-3574-44ea-bb41-89e8638bcca4}")
                test.is_true(row.metadata.administrator)
                test.eq(result.next_cursor, "2")
            end)
            test.len(seen.workspaces, 1)
            test.len(seen.repositories, 0)
            test.eq(seen.workspaces[1].conn.component_id, "bb4")
            test.eq(seen.workspaces[1].query.page, 1)
            test.eq(seen.workspaces[1].query.pagelen, 100)
            test.is_nil(seen.workspaces[1].query.q)
        end)

        test.it("drills into a workspace to list its repositories", function()
            local transport, seen = fake_transport(API_UNSCOPED, {
                success = true, data = { page = 1, values = { REPOSITORY } },
            })
            with_deps(base_ok("bb5"), transport, function()
                local result = connection.discover_resources({ parent_id = "acme" })
                test.is_true(result.success)
                test.len(result.resources, 1)
                test.is_nil(result.next_cursor)
                local row = result.resources[1]
                test.eq(row.type, "bitbucket_repository")
                test.eq(row.id, "acme/web-app")
                test.eq(row.key, "acme/web-app")
                test.eq(row.name, "acme/web-app")
                test.is_nil(row.description)
                test.eq(row.url, "https://bitbucket.org/acme/web-app")
                test.is_true(row.selectable)
                test.is_nil(row.drillable)
                test.eq(row.parent_id, "acme")
                test.eq(row.metadata.owner, "acme")
                test.eq(row.metadata.uuid, "{6f4d4483-c0e8-4894-8d54-b189ae1e5604}")
                test.eq(row.metadata.visibility, "private")
                test.eq(row.metadata.default_branch, "main")
                test.eq(row.metadata.updated_at, "2026-07-17T19:06:57.974373+00:00")
            end)
            test.len(seen.workspaces, 0)
            test.len(seen.repositories, 1)
            test.eq(seen.repositories[1].workspace, "acme")
        end)

        test.it("omits repository fields Bitbucket does not report", function()
            local transport = fake_transport(API_UNSCOPED, {
                success = true,
                data = { values = { { full_name = "acme/bare", is_private = false, description = "" }, { name = "no-full-name" } } },
            })
            with_deps(base_ok("bb6"), transport, function()
                local result = connection.discover_resources({ parent_id = "acme" })
                test.is_true(result.success)
                test.len(result.resources, 1)
                local row = result.resources[1]
                test.eq(row.id, "acme/bare")
                test.is_nil(row.description)
                test.is_nil(row.url)
                test.eq(row.metadata.visibility, "public")
                test.is_nil(row.metadata.owner)
                test.is_nil(row.metadata.default_branch)
                test.is_nil(row.metadata.updated_at)
            end)
        end)

        test.it("lists the configured workspace directly for access tokens and scoped API tokens", function()
            for _, conn in ipairs({
                { auth_type = "access_token", authorization = "Bearer t", workspace = "acme" },
                { auth_type = "api_token", authorization = "Basic x", workspace = "acme" },
            }) do
                local transport, seen = fake_transport(conn, { success = true, data = { values = { REPOSITORY } } })
                with_deps(base_ok("bb7"), transport, function()
                    local root = connection.discover_resources({})
                    test.is_true(root.success)
                    test.eq(root.resources[1].type, "bitbucket_repository")
                    local same = connection.discover_resources({ parent_id = "acme" })
                    test.is_true(same.success)
                    local other, other_err = connection.discover_resources({ parent_id = "other" })
                    test.is_nil(other)
                    test.is_true(errors.is(other_err, errors.PERMISSION_DENIED))
                    test.eq(tostring(other_err), "Bitbucket connection is limited to workspace 'acme'")
                end)
                test.len(seen.workspaces, 0)
                test.len(seen.repositories, 2)
                test.eq(seen.repositories[1].workspace, "acme")
                test.eq(seen.repositories[2].workspace, "acme")
            end
        end)

        test.it("pages with the returned cursor and clamps the limit", function()
            local transport, seen = fake_transport(API_UNSCOPED, { success = true, data = { values = {} } })
            with_deps(base_ok("bb8"), transport, function()
                local result = connection.discover_resources({ parent_id = "acme", cursor = "3", limit = 500 })
                test.is_true(result.success)
                test.len(result.resources, 0)
                test.is_nil(result.next_cursor)
                connection.discover_resources({ parent_id = "acme", limit = 0 })
                connection.discover_resources({ parent_id = "acme", limit = 25 })
                connection.discover_resources({ parent_id = "acme", limit = "abc" })
            end)
            test.eq(seen.repositories[1].query.page, 3)
            test.eq(seen.repositories[1].query.pagelen, 100)
            test.eq(seen.repositories[2].query.page, 1)
            test.eq(seen.repositories[2].query.pagelen, 1)
            test.eq(seen.repositories[3].query.pagelen, 25)
            test.eq(seen.repositories[4].query.pagelen, 100)
        end)

        test.it("rejects an invalid cursor before contacting Bitbucket", function()
            local transport, seen = fake_transport(API_UNSCOPED, { success = true, data = { values = {} } })
            with_deps(base_ok("bb9"), transport, function()
                for _, cursor in ipairs({ "0", "-1", "abc", "1.5" }) do
                    local result = connection.discover_resources({ cursor = cursor })
                    test.is_false(result.success)
                    test.contains(result.error, "cursor")
                end
            end)
            test.eq(seen.connects, 0)
        end)

        test.it("passes search text to the server-side filter", function()
            local transport, seen = fake_transport(API_UNSCOPED, { success = true, data = { values = {} } })
            with_deps(base_ok("bb10"), transport, function()
                test.is_true(connection.discover_resources({ q = "ac" }).success)
                test.is_true(connection.discover_resources({ parent_id = "acme", q = "web" }).success)
                test.is_true(connection.discover_resources({ parent_id = "acme", q = "" }).success)
            end)
            test.eq(seen.workspaces[1].query.q, "ac")
            test.eq(seen.repositories[1].query.q, "web")
            test.is_nil(seen.repositories[2].query.q)
        end)

        test.it("filters by resource type", function()
            local transport, seen = fake_transport(API_UNSCOPED, { success = true, data = { values = { REPOSITORY } } })
            with_deps(base_ok("bb11"), transport, function()
                local foreign = connection.discover_resources({ type = "github_repo" })
                test.is_true(foreign.success)
                test.len(foreign.resources, 0)
                test.is_nil(foreign.next_cursor)

                local root_repos = connection.discover_resources({ type = "bitbucket_repository" })
                test.is_true(root_repos.success)
                test.len(root_repos.resources, 0)

                local drilled_workspaces = connection.discover_resources({ type = "bitbucket_workspace", parent_id = "acme" })
                test.is_true(drilled_workspaces.success)
                test.len(drilled_workspaces.resources, 0)

                local drilled = connection.discover_resources({ type = "bitbucket_repository", parent_id = "acme" })
                test.is_true(drilled.success)
                test.len(drilled.resources, 1)
            end)
            test.eq(seen.connects, 3)
            test.len(seen.workspaces, 0)
            test.len(seen.repositories, 1)
        end)

        test.it("rejects a parent that is not a workspace slug", function()
            local transport, seen = fake_transport(API_UNSCOPED, { success = true, data = { values = {} } })
            with_deps(base_ok("bb12"), transport, function()
                local result, err = connection.discover_resources({ parent_id = "acme/web-app" })
                test.is_nil(result)
                test.contains(tostring(err), "is not a workspace slug")
            end)
            test.len(seen.repositories, 0)
        end)

        test.it("reports discovery failures from scope, credentials, the API, and malformed pages", function()
            with_deps(base_missing(), {}, function()
                local result, err = connection.discover_resources({})
                test.is_nil(result)
                test.eq(tostring(err), "component_id not in scope")
            end)

            with_deps(base_ok("bb13"), fake_transport(nil, nil), function()
                local result, err = connection.discover_resources({})
                test.is_nil(result)
                test.eq(tostring(err), "Bitbucket connection is missing auth_type")
            end)

            with_deps(base_ok("bb14"), fake_transport(API_UNSCOPED,
                { success = false, error = "rate limited by Bitbucket", status_code = 429 }), function()
                local result = connection.discover_resources({})
                test.is_false(result.success)
                test.eq(result.error, "rate limited by Bitbucket")
            end)

            with_deps(base_ok("bb15"), fake_transport(API_UNSCOPED, { success = true, data = { size = 0 } }), function()
                local result = connection.discover_resources({})
                test.is_false(result.success)
                test.eq(result.error, "Bitbucket returned an unexpected discovery response")
            end)
        end)

        test.it("surfaces an unreadable pagination link", function()
            local transport = fake_transport(API_UNSCOPED, { success = true, data = { values = {}, next = "x" } })
            transport.next_page = function(_data: any): (string?, string?) return nil, "Bitbucket pagination link has no page number: x" end
            with_deps(base_ok("bb16"), transport, function()
                local result = connection.discover_resources({})
                test.is_false(result.success)
                test.eq(result.error, "Bitbucket pagination link has no page number: x")
            end)
        end)

        test.it("delegates status and delete to the base connection helper", function()
            with_deps(base_ok("bb17"), {}, function()
                local status = connection.get_status({ reason = "check" })
                test.is_true(status.success)
                test.eq(status.status, "connected")
                test.eq(status.details.reason, "check")
                test.is_true(connection.delete({}).success)
            end)
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
