local test = require("test")
local transport = require("transport")

local function with_component(fake: any, fn: any)
    local prev = transport._component
    transport._component = fake
    local ok, err = pcall(fn)
    transport._component = prev
    if not ok then error(err) end
end

local function fake_component(overrides: any?): any
    local fake = {
        ACCESS = { READ = "read" },
        get_private_context = function(): (any?, any?) return nil, "no private context" end,
        get_context = function(): (any?, any?) return nil, errors.new({ kind = errors.NOT_FOUND, message = "no context" }) end,
    }
    for k, v in pairs(overrides or {}) do fake[k] = v end
    return fake
end

local function define_tests()
    test.describe("gitlab transport", function()
        test.it("resolves a gitlab.com credential connection from the private context", function()
            with_component(fake_component({
                get_private_context = function(id: string): (any?, any?)
                    test.eq(id, "c1")
                    return { token = "glpat-1" }, nil
                end,
            }), function()
                local conn, err = transport.connect("c1")
                test.is_nil(err)
                test.eq(conn.component_id, "c1")
                test.eq(conn.mode, "credential")
                test.eq(conn.token, "glpat-1")
                test.eq(conn.base_url, "https://gitlab.com")
            end)
        end)

        test.it("normalizes a self-managed base URL", function()
            with_component(fake_component({
                get_private_context = function(): (any?, any?)
                    return { token = "glpat-2", base_url = "HTTPS://Git.Example.com/gitlab/api/v4/" }, nil
                end,
            }), function()
                local conn, err = transport.connect("c2")
                test.is_nil(err)
                test.eq(conn.base_url, "https://git.example.com/gitlab")
            end)
        end)

        test.it("falls back to the readable context when the private context is empty", function()
            local seen: any = {}
            with_component(fake_component({
                get_private_context = function(): (any?, any?) return {}, nil end,
                get_context = function(id: string, access: any): (any?, any?)
                    seen.id, seen.access = id, access
                    return { token = "glpat-3", base_url = "" }, nil
                end,
            }), function()
                local conn, err = transport.connect("c3")
                test.is_nil(err)
                test.eq(conn.token, "glpat-3")
                test.eq(conn.base_url, "https://gitlab.com")
            end)
            test.eq(seen.id, "c3")
            test.eq(seen.access, "read")
        end)

        test.it("rejects an invalid base URL at connect time", function()
            with_component(fake_component({
                get_private_context = function(): (any?, any?)
                    return { token = "glpat-4", base_url = "ftp://gitlab.example.com" }, nil
                end,
            }), function()
                local conn, err = transport.connect("c4")
                test.is_nil(conn)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(err:message(), "http or https")
            end)
        end)

        test.it("rejects a connection without a token", function()
            with_component(fake_component({
                get_private_context = function(): (any?, any?) return { base_url = "https://gitlab.com" }, nil end,
            }), function()
                local conn, err = transport.connect("c5")
                test.is_nil(conn)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(err:message(), "missing token")
            end)

            with_component(fake_component({
                get_private_context = function(): (any?, any?) return { token = "" }, nil end,
                get_context = function(): (any?, any?) return { token = "" }, nil end,
            }), function()
                local conn, err = transport.connect("c6")
                test.is_nil(conn)
                test.is_true(errors.is(err, errors.INVALID))
                test.contains(err:message(), "missing token")
            end)
        end)

        test.it("surfaces an unreadable connection component", function()
            with_component(fake_component({
                get_context = function(): (any?, any?) return nil, errors.new({ kind = errors.PERMISSION_DENIED, message = "access denied" }) end,
            }), function()
                local conn, err = transport.connect("c7")
                test.is_nil(conn)
                test.is_true(errors.is(err, errors.PERMISSION_DENIED))
                test.eq(err:message(), "access denied")
            end)
        end)

        test.it("requires a component id", function()
            local conn, err = transport.connect("")
            test.is_nil(conn)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "component_id is required")

            conn, err = transport.connect(nil)
            test.is_nil(conn)
            test.is_true(errors.is(err, errors.INVALID))
            test.contains(err:message(), "component_id is required")
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
