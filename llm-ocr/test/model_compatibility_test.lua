-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local llm = require("llm")
local ocr = require("ocr")

return { run = test.run_cases(function()
    test.describe("OCR generation compatibility", function()
        for _, with_fallback in ipairs({false, true}) do
            test.it(with_fallback and "preserves a configured generation-only fallback" or "preserves a generation-only vision model", function()
                local original_generate = llm.generate
                local requests = {}
                llm.generate = function(prompt_input, options)
                    requests[#requests + 1] = { messages = prompt_input:get_messages(), options = options }
                    return { result = "Receipt total: 12.50", tokens = {} }, nil
                end
                local model = with_fallback and "review-primary" or "review-vision-only"
                local ok, text, err = pcall(function() return ocr.new({llm = llm}).transcribe("image bytes", {model = model}) end)
                llm.generate = original_generate
                test.is_true(ok, tostring(text))
                test.is_nil(err, tostring(err))
                test.eq(text, "Receipt total: 12.50")
                test.eq(#requests, 1)
                test.eq(requests[1].options.model, model)
                test.eq(requests[1].options.temperature, 0)
                test.eq(requests[1].options.max_tokens, 4000)
                -- The model provider's configured request timeout governs the call.
                test.is_nil(requests[1].options.timeout)
                local messages = requests[1].messages
                test.eq(#messages, 2)
                test.eq(messages[1].role, "system")
                test.eq(messages[1].content[1].text, ocr.system_prompt)
                test.eq(messages[2].role, "user")
                test.eq(messages[2].content[1].text, "Transcribe the text in this page.")
                test.eq(messages[2].content[2].type, "image")
                test.eq(messages[2].content[2].source.type, "base64")
                test.eq(messages[2].content[2].source.mime_type, "image/png")
                test.eq(messages[2].content[2].source.data, "aW1hZ2UgYnl0ZXM=")
            end)
        end
        test.it("bounds the call by an explicitly configured timeout", function()
            local original_generate = llm.generate
            local requests = {}
            llm.generate = function(_, options)
                requests[#requests + 1] = options
                return { result = "text", tokens = {} }, nil
            end
            local ok, text, err = pcall(function()
                return ocr.new({llm = llm}).transcribe("image bytes", {model = "review-vision-only", timeout = "90s"})
            end)
            llm.generate = original_generate
            test.is_true(ok, tostring(text))
            test.is_nil(err, tostring(err))
            test.eq(requests[1].timeout, 90)
        end)
    end)
end) }
