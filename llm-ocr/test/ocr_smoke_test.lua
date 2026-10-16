local test = require("test")
local registry = require("registry")

local function run(options)
    return test.run_cases(function()
        test.describe("llm-ocr declarations", function()
            test.it("registers the universal stage and image OCR default", function()
                local stage = registry.get("kickside.llm_ocr:stage.universal")
                test.not_nil(stage)
                test.eq(stage.data.scope, "universal")
                local setting = registry.get("kickside.llm_ocr:setting.ocr_images")
                test.not_nil(setting)
                test.eq(setting.data.key, "ocr_images")
                test.eq(setting.data.default, true)
            end)
        end)
    end)(options)
end

return { run = run }
