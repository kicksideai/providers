local test = require("test")
local contract = require("contract")
local security = require("security")

local NS = "kickside.sso.providers.github"

-- The provider's enable gate runs as the validate_func of its enabled setting:
-- every case writes through the settings contract the way an operator does.
local function define_tests()
    test.describe("github enable gate", function()
        local settings = contract.get("kickside.settings:settings")
            :with_actor(security.new_actor("sso-admin", {}))
            :with_scope(security.new_scope({ security.policy("app:admin_scope") }))
            :open()
        local function set(key: string, value: any): any
            return settings:set({ namespace = NS, key = key, value = value })
        end

        test.it("allows disabling without credentials", function()
            set("client_id", "")
            set("client_secret", "")
            test.is_true(set("enabled", false).success)
        end)

        test.it("refuses enabling without client credentials", function()
            set("client_id", "")
            set("client_secret", "")
            local result = set("enabled", true)
            test.is_false(result.success)
            test.not_nil(result.error)
        end)

        test.it("permits enabling once credentials are set", function()
            set("client_id", "client-abc")
            set("client_secret", "secret-xyz")
            test.is_true(set("enabled", true).success)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
