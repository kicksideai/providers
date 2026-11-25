-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local blocks = require("settings_blocks")

local NAMESPACE = "kickside.mail.resend"

return {run = test.run_cases(function()
    test.describe("Resend settings in System Settings", function()
        test.it("describes host requirements and their scalar values", function()
            for _, name in ipairs({"api_base_url"}) do
                local requirement = assert(registry.get(NAMESPACE .. ":" .. name))
                test.eq("string", requirement.meta.value_type)
                test.is_true(type(requirement.meta.description) == "string" and #requirement.meta.description > 0)
            end
        end)

        test.it("leaves its settings namespace for the composite Mail block", function()
            for _, block in ipairs(blocks.declared()) do
                test.neq(NAMESPACE, block.namespace)
                for _, namespace in ipairs(block.namespaces or {}) do
                    test.neq(NAMESPACE, namespace)
                end
            end
        end)
    end)
end)}
