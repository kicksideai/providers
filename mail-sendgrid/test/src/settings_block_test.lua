-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")
local blocks = require("settings_blocks")

local NAMESPACE = "kickside.mail.sendgrid"

return {run = test.run_cases(function()
    test.describe("SendGrid settings in System Settings", function()
        test.it("assigns Send mail through the harness role instead of changing its policy", function()
            local policy = assert(registry.get("kickside.mail.security:send_access"))
            test.eq(0, #(policy.data.groups or {}))
            local role = assert(registry.get("app:mail_senders_composition"))
            test.eq("app:mail_senders", role.data.group_id)
            test.eq("kickside.mail.security:send_access", role.data.policies[1])
        end)

        test.it("describes host requirements and their scalar values", function()
            for _, name in ipairs({"api_base_url"}) do
                local requirement = assert(registry.get(NAMESPACE .. ":" .. name))
                test.eq("string", requirement.meta.value_type)
                test.is_true(type(requirement.meta.description) == "string" and #requirement.meta.description > 0)
            end
        end)

        test.it("appear as one SendGrid entry in Integrations, rendered by the shared settings card", function()
            local catalog = blocks.build(blocks.declared(), {[NAMESPACE] = true})
            local found = {}
            for _, block in ipairs(catalog) do
                local claims = block.namespace == NAMESPACE
                for _, ns in ipairs(block.namespaces or {}) do claims = claims or ns == NAMESPACE end
                if claims then found[#found + 1] = block end
            end
            test.eq(1, #found, "no generated entry beside the declared one")
            local block = found[1]
            test.eq("SendGrid", block.title)
            test.eq("Integrations", block.group)
            test.eq("simple-icons:sendgrid", block.icon)
            test.eq("kickside-settings-provider", block.component_tag)
            test.eq(NAMESPACE, (block.config :: {[string]: unknown}).namespace)
        end)
    end)
end)}
