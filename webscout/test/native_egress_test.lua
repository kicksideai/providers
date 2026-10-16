local test = require("test")
local funcs = require("funcs")
local security = require("security")
local registry = require("registry")
local function call(url, granted)
    local policies = { security.policy("app:request_scope") }
    if granted then policies[#policies + 1] = security.policy("app:private_scope") end
    return funcs.new():with_actor(security.new_actor("fixture", {})):with_scope(security.new_scope(policies)):call("app:native_fetch", { url = url })
end
local function define_tests()
    test.describe("Native private IP policy", function()
        test.it("denies private destinations without a private IP grant", function()
            for _, url in ipairs({ "http://localhost/admin", "http://127.0.0.1:8080/admin", "http://10.0.0.2/metadata", "http://172.16.0.2/internal", "http://169.254.169.254/latest", "http://192.168.1.2/router", "http://[::1]/admin" }) do
                local result, err = call(url, false)
                test.is_nil(err)
                test.is_nil(result.response)
                test.not_nil(result.error)
                test.is_true(result.error:find("denied", 1, true) ~= nil or result.error:find("private", 1, true) ~= nil)
            end
        end)
        test.it("allows the granted loopback fixture", function()
            local entry = registry.get("app:fixture")
            local result, err = call(entry.data.url, true)
            test.is_nil(err)
            test.is_nil(result.error)
            test.eq(result.response.status_code, 200)
            test.contains(result.response.body, "NORTHWIND-NATIVE-731")
        end)
    end)
end
local cases = test.run_cases(define_tests)
return { run = function(options) return cases(options) end }
