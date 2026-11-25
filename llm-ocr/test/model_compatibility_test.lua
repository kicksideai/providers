-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local llm = require("llm")
local ocr = require("ocr")

-- A generation-capable vision card served by one fake provider route.
local function vision_card(name: string, metadata: table?, fallback: {string}?): table
    return {name = name, capabilities = {"generate"}, metadata = metadata, fallback = fallback,
        providers = {{id = "review-provider", provider_model = name}}}
end

-- Transcribes through the real LLM call path against the given cards, recording each
-- driver request and each generate call's options. A model named "<name>-down" fails
-- with a retryable provider error.
local function transcribe_with_cards(cards: {[string]: table}, opts: table): (string?, string?, {table}, {table})
    local saved = {llm._models, llm._providers, llm._model_resolver, llm._usage_tracker, llm.generate}
    local requests: {table} = {}
    local calls: {table} = {}
    local generate = llm.generate
    llm.generate = function(prompt_input, options)
        calls[#calls + 1] = options
        return generate(prompt_input, options)
    end
    llm._model_resolver = false
    llm._usage_tracker = false
    llm._models = {
        get_by_name = function(name: string) return cards[name] end,
        get_by_class = function() return {} end,
    }
    llm._providers = {
        driver_declares_legacy_reasoning_flag = function() return false end,
        driver_output_policy = function() return nil end,
        open = function() return {generate = function(_, args: table)
            requests[#requests + 1] = args
            if tostring(args.model):match("%-down$") then
                return nil, errors.new({kind = errors.INTERNAL, retryable = true,
                    message = "unavailable", details = {error_type = "server_error"}})
            end
            return {result = "Receipt total: 12.50", tokens = {}}, nil
        end} end,
    }
    local ok, text, err = pcall(function() return ocr.new({llm = llm}).transcribe("image bytes", opts) end)
    llm._models, llm._providers, llm._model_resolver, llm._usage_tracker, llm.generate =
        saved[1], saved[2], saved[3], saved[4], saved[5]
    test.is_true(ok, tostring(text))
    return text, err, requests, calls
end

local function transcribe_with_card(card: table?, opts: table): (string?, string?, {table}, {table})
    local cards: {[string]: table} = {}
    if card then cards[card.name] = card end
    local text, err, requests, calls = transcribe_with_cards(cards, opts)
    return text, err, requests, calls
end

return { run = test.run_cases(function()
    test.describe("OCR generation compatibility", function()
        for _, with_fallback in ipairs({false, true}) do
            test.it(with_fallback and "preserves a configured generation-only fallback" or "preserves a generation-only vision model", function()
                local model = with_fallback and "review-primary" or "review-vision-only"
                local card = vision_card(model, nil, with_fallback and {"review-vision-only"} or nil)
                local text, err, requests, calls = transcribe_with_card(card, {model = model})
                test.is_nil(err, tostring(err))
                test.eq(text, "Receipt total: 12.50")
                test.eq(#requests, 1)
                test.eq(requests[1].model, model)
                test.is_nil(requests[1].options.temperature)
                test.eq(requests[1].options.max_tokens, 4000)
                -- The model provider's configured request timeout governs the call.
                test.is_nil(calls[1].timeout)
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
            local _, err, _, calls = transcribe_with_card(vision_card("review-vision-only"),
                {model = "review-vision-only", timeout = "90s"})
            test.is_nil(err, tostring(err))
            test.eq(calls[1].timeout, 90)
        end)
    end)

    test.describe("OCR request profile declared by the model card", function()
        local paddle_profile = {system = false, prompt = "OCR:", image_first = true, output_limit = 8192}

        test.it("sends the image then the declared prompt, without a system message, under the declared limit", function()
            local text, err, requests = transcribe_with_card(
                vision_card("paddle-vl", {ocr = paddle_profile}), {model = "paddle-vl"})
            test.is_nil(err, tostring(err))
            test.eq(text, "Receipt total: 12.50")
            test.eq(#requests, 1)
            test.eq(requests[1].model, "paddle-vl")
            test.is_nil(requests[1].options.temperature)
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
                vision_card("plain-vision"),
                vision_card("plain-vision", {}),
                vision_card("plain-vision", {discovered = {family = "vision"}}),
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
                vision_card("custom-vl", {ocr = {system = "Read the page."}}), {model = "custom-vl"})
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
                vision_card("paddle-vl", {ocr = paddle_profile}), {model = "paddle-vl", prompt = "Read every line."})
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
                    vision_card("broken-vl", {ocr = profile}), {model = "broken-vl"})
                test.is_nil(text)
                test.contains(tostring(err), "ocr profile")
                test.eq(#requests, 0)
            end
        end)

        test.it("shapes each fallback candidate by its own card", function()
            local _, err, requests = transcribe_with_cards({
                ["paddle-down"] = vision_card("paddle-down", {ocr = paddle_profile}, {"plain-vision"}),
                ["plain-vision"] = vision_card("plain-vision"),
            }, {model = "paddle-down"})
            test.is_nil(err, tostring(err))
            test.eq(#requests, 2)
            test.eq(requests[1].model, "paddle-down")
            test.eq(#requests[1].messages, 1)
            test.eq(requests[1].messages[1].content[1].type, "image")
            test.eq(requests[1].messages[1].content[2].text, "OCR:")
            test.eq(requests[1].options.max_tokens, 8192)
            test.eq(requests[2].model, "plain-vision")
            test.eq(#requests[2].messages, 2)
            test.eq(requests[2].messages[1].content[1].text, ocr.system_prompt)
            test.eq(requests[2].messages[2].content[1].text, "Transcribe the text in this page.")
            test.eq(requests[2].messages[2].content[2].type, "image")
            test.eq(requests[2].options.max_tokens, 4000)
        end)

        test.it("fails when the model cannot be resolved", function()
            local text, err, requests = transcribe_with_card(nil, {model = "missing-vl"})
            test.is_nil(text)
            test.not_nil(err)
            test.eq(#requests, 0)
        end)
    end)
end) }
