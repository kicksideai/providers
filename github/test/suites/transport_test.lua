local test = require("test")
local transport = require("transport")
local types = require("types")

local function with_component(fake: any, fn: any)
    fn(function(component_id: string?): (any?, any?)
        return transport._connect_with(fake, component_id)
    end)
end

local function base_component(overrides: any?): any
    local fake = {
        ACCESS = { READ = "read" },
        open = function(): (any?, any?) return nil, "no oauth" end,
        open_by_meta = function(): (any?, any?) return nil, "no oauth default" end,
        get_private_context = function(): (any?, any?) return nil, "no private context" end,
        get_context = function(): (any?, any?) return nil, "no context" end,
        get_context_by_meta = function(): (any?, any?) return nil, "no default context" end,
    }
    for k, v in pairs(overrides or {}) do fake[k] = v end
    return fake
end

local function define_tests()
    test.describe("GitHub transport", function()
        test.it("refuses a stored token before private context read when connection READ is denied", function()
            local private_reads = 0
            local fake = base_component({
                get_context = function(id: string, access: any): (any?, any?)
                    test.eq(id, "pat1")
                    test.eq(access, "read")
                    return nil, "permission denied"
                end,
                get_private_context = function(_id: string): (any?, any?)
                    private_reads = private_reads + 1
                    return { token = "secret" }, nil
                end,
            })
            local context, err = transport._credential_context_with(fake, "pat1")
            test.is_nil(context)
            test.not_nil(err)
            test.eq(private_reads, 0)
        end)
        test.it("opens an explicit OAuth component first", function()
            local oauth_conn = { marker = "oauth" }
            with_component(base_component({
                open = function(id: string, access: any, contract: string): (any?, any?)
                    test.eq(id, "c1")
                    test.eq(access, "read")
                    test.eq(contract, types.OAUTH_CONTRACT)
                    return oauth_conn, nil
                end,
            }), function(connect: any)
                local conn, err = connect("c1")
                test.is_nil(err)
                test.eq(conn.mode, "oauth")
                test.eq(conn.oauth_conn, oauth_conn)
                test.eq(conn.component_id, "c1")
            end)
        end)

        test.it("falls back to an explicit stored credential connection", function()
            with_component(base_component({
                get_context = function(id: string, access: any): (any?, any?)
                    test.eq(id, "pat1")
                    test.eq(access, "read")
                    return { component_id = id }, nil
                end,
                get_private_context = function(id: string): any
                    test.eq(id, "pat1")
                    return { token = "ghp_test" }, nil
                end,
            }), function(connect: any)
                local conn, err = connect("pat1")
                test.is_nil(err)
                test.eq(conn.mode, "credential")
                test.eq(conn.token, "ghp_test")
                test.eq(conn.component_id, "pat1")
            end)
        end)

        test.it("auto-selects an OAuth connection by provider metadata", function()
            local seen_meta: any = nil
            local oauth_conn = { marker = "default-oauth" }
            with_component(base_component({
                open_by_meta = function(meta: any, access: any, contract: string): any
                    seen_meta = meta
                    test.eq(access, "read")
                    test.eq(contract, types.OAUTH_CONTRACT)
                    return oauth_conn, nil
                end,
            }), function(connect: any)
                local conn, err = connect(nil)
                test.is_nil(err)
                test.eq(conn.mode, "oauth")
                test.eq(conn.oauth_conn, oauth_conn)
                test.eq(seen_meta.provider, types.PROVIDER)
                test.eq(seen_meta.class, types.CONNECTION_CLASS)
            end)
        end)

        test.it("auto-selects a stored credential connection by provider metadata", function()
            with_component(base_component({
                get_context_by_meta = function(meta: any): any
                    test.eq(meta.provider, "github")
                    return { component_id = "cred1", token = "pat" }, nil
                end,
            }), function(connect: any)
                local conn, err = connect("")
                test.is_nil(err)
                test.eq(conn.mode, "credential")
                test.eq(conn.token, "pat")
                test.eq(conn.component_id, "cred1")
            end)
        end)

        test.it("fails loudly when no default GitHub connection is available", function()
            with_component(base_component(), function(connect: any)
                local conn, err = connect(nil)
                test.is_nil(conn)
                test.ok(tostring(err):find("no GitHub connection selected") ~= nil)
            end)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
