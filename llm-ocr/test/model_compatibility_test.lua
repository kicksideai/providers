-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local llm = require("llm")
local ocr = require("ocr")

return { run = test.run_cases(function()
    test.describe("OCR generation compatibility", function()
        for _, with_fallback in ipairs({false, true}) do
            test.it(with_fallback and "preserves a configured generation-only fallback" or "preserves a generation-only vision model", function()
                local old_models, old_providers, old_track = llm._model_resolver, llm._providers, llm.track_usage
                local cards = {
                    ["review-vision-only"] = {name = "review-vision-only", capabilities = {"generate", "vision"},
                        providers = {{id = "review:plain", provider_model = "vision-only"}}},
                    ["review-primary"] = {name = "review-primary", capabilities = {"generate", "vision", "structured_output"},
                        fallback = {"review-vision-only"},
                        providers = {{id = "review:primary", provider_model = "primary"}}},
                }
                llm._model_resolver = {resolve = function(_, args) return cards[args.model], nil end}
                llm.track_usage = function() return nil end
                llm._providers = {
                    driver_declares_legacy_reasoning_flag = function() return false, nil end,
                    open = function(id)
                        local function unavailable()
                            return nil, errors.new({kind = errors.UNAVAILABLE, retryable = true,
                                message = "fixture provider unavailable", details = {error_type = "server_error"}})
                        end
                        return {
                            generate = function()
                                if id == "review:primary" then return unavailable() end
                                return {result = {content = "Receipt total: 12.50", tool_calls = {}}, finish_reason = "stop", tokens = {}}, nil
                            end,
                            structured_output = function()
                                if id == "review:primary" then return unavailable() end
                                return nil, errors.new({kind = errors.INVALID, retryable = false,
                                    message = "json_schema is unsupported by this vision endpoint", details = {error_type = "invalid_request"}})
                            end,
                        }, nil
                    end,
                }
                local model = with_fallback and "review-primary" or "review-vision-only"
                local ok, text, err = pcall(function() return ocr.new({llm = llm}).transcribe("image bytes", {model = model}) end)
                llm._model_resolver, llm._providers, llm.track_usage = old_models, old_providers, old_track
                test.is_true(ok, tostring(text))
                test.is_nil(err, tostring(err))
                test.eq(text, "Receipt total: 12.50")
            end)
        end
    end)
end) }
