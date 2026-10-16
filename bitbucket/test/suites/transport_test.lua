local test = require("test")
local base64 = require("base64")
local transport = require("transport")
local types = require("types")

local function with_component(fake: any, fn: () -> ())
    local prev = transport._component
    transport._component = fake
    local ok, err = pcall(fn)
    transport._component = prev
    if not ok then error(err) end
end

local function component_with(private_ctx: any, public_ctx: any?, public_err: string?): any
    return {
        ACCESS = { READ = "read" },
        get_private_context = function(_id: string): (any?, any?)
            if private_ctx == nil then return nil, errors.new({ kind = errors.NOT_FOUND, message = "no private context" }) end
            return private_ctx, nil
        end,
        get_context = function(_id: string, _access: any): (any?, any?)
            if public_err then return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = public_err }) end
            return public_ctx, nil
        end,
    }
end

local function connect(ctx: any): (any?, string?)
    local conn: any, err: string?
    with_component(component_with(ctx), function()
        conn, err = transport.connect("cmp1")
    end)
    return conn, err
end

local function define_tests()
    test.describe("bitbucket transport", function()
        test.it("builds HTTP Basic authorization from an Atlassian API token", function()
            local conn, err = connect({ auth_type = "api_token", email = " dev@example.com ", api_token = "ATATT-1" })
            test.is_nil(err)
            test.eq(conn.component_id, "cmp1")
            test.eq(conn.auth_type, types.AUTH_API_TOKEN)
            test.eq(conn.authorization, "Basic " .. base64.encode("dev@example.com:ATATT-1"))
            test.is_nil(conn.workspace)
        end)

        test.it("keeps an optional workspace on an API token connection", function()
            local conn, err = connect({ auth_type = "api_token", email = "dev@example.com", api_token = "t", workspace = " acme " })
            test.is_nil(err)
            test.eq(conn.workspace, "acme")
            conn, err = connect({ auth_type = "api_token", email = "dev@example.com", api_token = "t", workspace = "" })
            test.is_nil(err)
            test.is_nil(conn.workspace)
        end)

        test.it("builds Bearer authorization from an access token bound to its workspace", function()
            local conn, err = connect({ auth_type = "access_token", access_token = "ATCTT-1", workspace = "acme" })
            test.is_nil(err)
            test.eq(conn.auth_type, types.AUTH_ACCESS_TOKEN)
            test.eq(conn.authorization, "Bearer ATCTT-1")
            test.eq(conn.workspace, "acme")
        end)

        test.it("rejects missing credentials for each mode", function()
            local _, err = connect({ auth_type = "api_token", api_token = "t" })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket API token connection is missing email")
            _, err = connect({ auth_type = "api_token", email = "dev@example.com", api_token = "  " })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket API token connection is missing api_token")
            _, err = connect({ auth_type = "access_token", workspace = "acme" })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket access token connection is missing access_token")
            _, err = connect({ auth_type = "access_token", access_token = "t" })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket access token connection is missing workspace")
        end)

        test.it("rejects a missing or unknown auth_type", function()
            local _, err = connect({ email = "dev@example.com", api_token = "t" })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket connection is missing auth_type")
            _, err = connect({ auth_type = "app_password", username = "dev", app_password = "x" })
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket connection has unsupported auth_type 'app_password'")
        end)

        test.it("rejects a workspace that is not a slug", function()
            local _, err = connect({ auth_type = "access_token", access_token = "t", workspace = "https://bitbucket.org/acme" })
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "is not a workspace slug")
            _, err = connect({ auth_type = "api_token", email = "dev@example.com", api_token = "t", workspace = "acme/repo" })
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "is not a workspace slug")
        end)

        test.it("falls back to the component context when no private context is stored", function()
            local conn: any, err: any
            with_component(component_with(nil, { auth_type = "access_token", access_token = "t", workspace = "acme" }), function()
                conn, err = transport.connect("cmp2")
            end)
            test.is_nil(err)
            test.eq(conn.component_id, "cmp2")
            test.eq(conn.authorization, "Bearer t")
        end)

        test.it("reports an unreadable component and a missing component id", function()
            local conn: any, err: any
            with_component(component_with(nil, nil, "access denied"), function()
                conn, err = transport.connect("cmp3")
            end)
            test.is_nil(conn)
            test.is_true(errors.is(err, errors.PERMISSION_DENIED))
            test.eq(err:message(), "access denied")

            with_component(component_with(nil, nil), function()
                conn, err = transport.connect("cmp4")
            end)
            test.is_nil(conn)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket connection has no stored credentials")

            conn, err = transport.connect("")
            test.is_nil(conn)
            test.is_true(errors.is(err, errors.INVALID))
            test.eq(err:message(), "Bitbucket connection component_id is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
