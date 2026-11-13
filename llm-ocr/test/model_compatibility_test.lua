-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local llm = require("llm")
local ocr = require("ocr")

-- Runs a transcription against a resolved model card, recording each request.
local function transcribe_with_card(card: any, opts: any): (any, any, {any})
    local original_resolver, original_generate = llm._model_resolver, llm.generate
    local requests: {any} = {}
    llm._model_resolver = {resolve = function(_, input)
        test.eq(input.model, opts.model)
        return card, nil
    end}
    llm.generate = function(prompt_input, options)
        requests[#requests + 1] = { messages = prompt_input:get_messages(), options = options }
        return { result = "Receipt total: 12.50", tokens = {} }, nil
    end
    local ok, text, err = pcall(function() return ocr.new({llm = llm}).transcribe("image bytes", opts) end)
    llm._model_resolver, llm.generate = original_resolver, original_generate
    test.is_true(ok, tostring(text))
    return text, err, requests
end

return { run = test.run_cases(function()
    test.describe("OCR generation compatibility", function()
        for _, with_fallback in ipairs({false, true}) do
            test.it(with_fallback and "preserves a configured generation-only fallback" or "preserves a generation-only vision model", function()
                local model = with_fallback and "review-primary" or "review-vision-only"
                local card = {name = model, providers = {{id = "review-provider", provider_model = model}}}
                local text, err, requests = transcribe_with_card(card, {model = model})
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
            local _, err, requests = transcribe_with_card({name = "review-vision-only"},
                {model = "review-vision-only", timeout = "90s"})
            test.is_nil(err, tostring(err))
            test.eq(requests[1].options.timeout, 90)
        end)
    end)

    test.describe("OCR request profile declared by the model card", function()
        local paddle_profile = {system = false, prompt = "OCR:", image_first = true, output_limit = 8192}

        test.it("sends the image then the declared prompt, without a system message, under the declared limit", function()
            local text, err, requests = transcribe_with_card(
                {name = "paddle-vl", metadata = {ocr = paddle_profile}}, {model = "paddle-vl"})
            test.is_nil(err, tostring(err))
            test.eq(text, "Receipt total: 12.50")
            test.eq(#requests, 1)
            test.eq(requests[1].options.model, "paddle-vl")
            test.eq(requests[1].options.temperature, 0)
            test.eq(requests[1].options.max_tokens, 8192)
            local messages = requests[1].messages
            test.eq(#messages, 1)
            test.eq(messages[1].role, "user")
            test.eq(#messages[1].content, 2)
            test.eq(messages[1].content[1].type, "image")
            test.eq(messages[1].content[1].source.data, "aW1hZ2UgYnl0ZXM=")
            test.eq(messages[1].content[2].type, "text")
            test.eq(messages[1].content[2].text, "OCR:")
        end)

        test.it("sends today's request for a card without an OCR profile", function()
            for _, card in ipairs({
                {name = "plain-vision"},
                {name = "plain-vision", metadata = {}},
                {name = "plain-vision", metadata = {discovered = {family = "vision"}}},
            }) do
                local _, err, requests = transcribe_with_card(card, {model = "plain-vision"})
                test.is_nil(err, tostring(err))
                test.eq(requests[1].options.max_tokens, 4000)
                local messages = requests[1].messages
                test.eq(#messages, 2)
                test.eq(messages[1].role, "system")
                test.eq(messages[1].content[1].text, ocr.system_prompt)
                test.eq(messages[2].role, "user")
                test.eq(messages[2].content[1].type, "text")
                test.eq(messages[2].content[1].text, "Transcribe the text in this page.")
                test.eq(messages[2].content[2].type, "image")
            end
        end)

        test.it("replaces the system prompt with the declared text", function()
            local _, err, requests = transcribe_with_card(
                {name = "custom-vl", metadata = {ocr = {system = "Read the page."}}}, {model = "custom-vl"})
            test.is_nil(err, tostring(err))
            local messages = requests[1].messages
            test.eq(#messages, 2)
            test.eq(messages[1].role, "system")
            test.eq(messages[1].content[1].text, "Read the page.")
            test.eq(messages[2].content[1].text, "Transcribe the text in this page.")
            test.eq(messages[2].content[2].type, "image")
            test.eq(requests[1].options.max_tokens, 4000)
        end)

        test.it("keeps the configured OCR prompt over the card's prompt", function()
            local _, err, requests = transcribe_with_card(
                {name = "paddle-vl", metadata = {ocr = paddle_profile}}, {model = "paddle-vl", prompt = "Read every line."})
            test.is_nil(err, tostring(err))
            test.eq(requests[1].messages[1].content[1].type, "image")
            test.eq(requests[1].messages[1].content[2].text, "Read every line.")
        end)

        test.it("rejects a malformed profile without calling the model", function()
            for _, profile in ipairs({
                {system = 1},
                {system = true},
                {system = ""},
                {prompt = false},
                {prompt = ""},
                {image_first = "yes"},
                {output_limit = 0},
                {output_limit = "8192"},
                {output_limit = 1.5},
                "OCR:",
                false,
            }) do
                local text, err, requests = transcribe_with_card(
                    {name = "broken-vl", metadata = {ocr = profile}}, {model = "broken-vl"})
                test.is_nil(text)
                test.contains(tostring(err), "ocr profile")
                test.eq(#requests, 0)
            end
        end)

        test.it("fails when the model cannot be resolved", function()
            local text, err, requests = transcribe_with_card(nil, {model = "missing-vl"})
            test.is_nil(text)
            test.not_nil(err)
            test.eq(#requests, 0)
        end)
    end)
end) }
