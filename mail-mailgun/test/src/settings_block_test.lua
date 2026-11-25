-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local blocks = require("settings_blocks")

local NAMESPACE = "kickside.mail.mailgun"

return {run = test.run_cases(function()
    test.describe("Mailgun settings in System Settings", function()
        test.it("appear as one Mailgun entry in Integrations, rendered by the shared settings card", function()
            local catalog = blocks.build(blocks.declared(), {[NAMESPACE] = true})
            local found = {}
            for _, block in ipairs(catalog) do
                local claims = block.namespace == NAMESPACE
                for _, ns in ipairs(block.namespaces or {}) do claims = claims or ns == NAMESPACE end
                if claims then found[#found + 1] = block end
            end
            test.eq(1, #found, "no generated entry beside the declared one")
            local block = found[1]
            test.eq("Mailgun", block.title)
            test.eq("Integrations", block.group)
            test.eq("simple-icons:mailgun", block.icon)
            test.eq("kickside-settings-provider", block.component_tag)
            test.eq(NAMESPACE, (block.config :: {[string]: unknown}).namespace)
        end)
    end)
end)}
