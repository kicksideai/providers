-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local registry = require("registry")

local trait_id = "kickside.google.traits:sheets_importer"

local function define_tests()
    test.describe("Google Sheets importer visibility", function()
        test.it("preserves boolean requirement values through dependency injection", function()
            local requirement = registry.get("kickside.google:sheets_importer_public")
            test.eq(type(requirement.data.default), "boolean")
            test.eq(requirement.data.default, false)
            local config = registry.get("app.suites:sheets_import_visibility_test")
            test.eq(type(config.meta.expected_public), "boolean")
            test.eq(type(config.meta.expected_parameter_present), "boolean")
            local dependency = registry.get("app:dep.kickside.google")
            local parameter = nil
            for _, value in ipairs(dependency.data.parameters) do
                if value.name == "kickside.google:sheets_importer_public" then
                    parameter = value
                end
            end
            test.eq(parameter ~= nil, config.meta.expected_parameter_present)
            if parameter then
                test.eq(type(parameter.value), "boolean")
                test.eq(parameter.value, config.meta.expected_public)
            else
                test.eq(config.meta.expected_public, false)
            end
            local trait = registry.get(trait_id)
            test.eq(type(trait.meta.public), "boolean")
            test.eq(trait.meta.public, config.meta.expected_public)
        end)

        test.it("lists the importer only when the host enables it", function()
            local config = registry.get("app.suites:sheets_import_visibility_test")
            local traits, err = registry.find({["meta.type"] = "agent.trait"})
            test.is_nil(err)
            test.not_nil(traits)
            local listed, reader_listed = false, false
            for _, trait in ipairs(traits) do
                if trait.meta.public and tostring(trait.id) == trait_id then
                    listed = true
                end
                if trait.meta.public and tostring(trait.id) == "kickside.google.traits:sheets_reader" then
                    reader_listed = true
                end
            end
            test.eq(reader_listed, true)
            test.eq(listed, config.meta.expected_public)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return {run = function(options) return run_cases(options) end}
