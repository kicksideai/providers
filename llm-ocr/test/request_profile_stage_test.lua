local test = require("test")
local llm = require("llm")
local stage = require("stage")
local prompt = require("prompt")
local ocr = require("ocr")
local contract = require("contract")
local fs = require("fs")
local uuid = require("uuid")
local json = require("json")
local base64 = require("base64")
local uploads = require("uploads")
local content = require("content")
local parts = require("parts")

local PNG = "\137PNG\r\n\26\n" .. string.rep("\0", 64)
local STORAGE = "app:temp_fs"

local function setting(key, value)
    local instance = contract.get("kickside.settings:settings"):open()
    test.is_true(instance:set({namespace = "kickside.llm_ocr", key = key, value = value}).success)
end

local function seed(text)
    local id = uuid.v4()
    local storage = fs.get(STORAGE)
    test.not_nil(storage)
    local _, write_err = storage:writefile(id .. ".pdf", "document fixture")
    test.is_nil(write_err)
    local _, err = uploads.create(id, "ocr-profile-test", 16, "application/pdf", STORAGE,
        id .. ".pdf", "documents", {}, "processing")
    test.is_nil(err)
    local _, image_err = content.create_artifact({upload_id = id, kind = "image", role = "rendered-page",
        mime_type = "image/png", content = PNG, storage_id = STORAGE, ordinal = 1, metadata = {page = 1}})
    test.is_nil(image_err)
    if text then
        local _, text_err = content.create_artifact({upload_id = id, kind = "markdown", role = "primary",
            mime_type = "text/markdown", content = text, storage_id = STORAGE, ordinal = 0})
        test.is_nil(text_err)
    end
    return {upload_id = id, mime_type = "application/pdf", storage_id = STORAGE}
end

return {run = test.run_cases(function()
    describe("OCR model profiles through the real stage", function()
        local saved, card, requests, reply
        before_each(function()
            saved = {llm._models, llm._providers, llm._model_resolver, llm._usage_tracker}
            requests, reply = {}, "Profile transcript"
            card = {name = "profile-model", capabilities = {"generate"}, output_tokens = 2048,
                providers = {{id = "profile-provider", provider_model = "profile-wire"}}}
            llm._usage_tracker = false
            llm._model_resolver = {resolve = function() return card end}
            llm._providers = {
                driver_declares_legacy_reasoning_flag = function() return false end,
                driver_output_policy = function() return nil end,
                open = function() return {generate = function(_, args)
                    requests[#requests + 1] = args
                    return {result = reply, tokens = {}}, nil
                end} end,
            }
            setting("ocr_enabled", true)
            setting("ocr_model", "profile-model")
            setting("ocr_prompt", "")
            setting("ocr_call_timeout_ms", 0)
            local instance = contract.get("kickside.settings:settings"):open()
            test.is_true(instance:set({namespace = "kickside.uploads.rasterize",
                key = "rasterize_min_page_bytes", value = 0}).success)
        end)
        after_each(function()
            llm._models, llm._providers, llm._model_resolver, llm._usage_tracker =
                saved[1], saved[2], saved[3], saved[4]
        end)

        it("serializes the complete no-profile request identically to the previous construction", function()
            local params = seed(nil)
            local result = stage.run(params)
            test.is_true(result.success)
            test.eq(#requests, 1)
            local observed = json.encode(requests[1])
            local baseline = prompt.new()
            baseline:add_system(ocr.system_prompt)
            baseline:add_message(prompt.ROLE.USER, {prompt.text("Transcribe the text in this page."),
                prompt.image_base64("image/png", base64.encode(PNG))})
            local _, err = llm.generate(baseline, {model = "profile-model", temperature = 0, max_tokens = 4000})
            test.is_nil(err, tostring(err))
            test.eq(json.encode(requests[2]), observed)
        end)

        it("uses each concrete card's profile and enforces its model output limit", function()
            for _, profile in ipairs({
                {system = false, prompt = "OCR:", image_first = true, output_limit = 8192},
                {system = "Read literally.", prompt = "Transcribe.", output_limit = 4096},
            }) do
                card.metadata = {ocr = profile}
                local params = seed(nil)
                local result = stage.run(params)
                test.is_true(result.success)
                local request = requests[#requests]
                test.eq(request.options.max_tokens, 2048)
                local messages = request.messages
                test.eq(#messages, profile.system == false and 1 or 2)
                local user = messages[#messages]
                test.eq(user.content[profile.image_first and 2 or 1].text, profile.prompt)
                test.eq(user.content[profile.image_first and 1 or 2].type, "image")
                local primary, err = parts.read_primary_content(params.upload_id)
                test.is_nil(err)
                test.contains(primary.content, "Profile transcript")
            end
        end)

        it("rejects false metadata before generation through the stage", function()
            card.metadata = {ocr = false}
            local result = stage.run(seed(nil))
            test.is_false(result.success)
            test.eq(result.metadata.ocr_error, "transcription_failed")
            test.contains(result.metadata._ocr_error_detail, "ocr profile must be an object")
            test.eq(#requests, 0)
        end)

        it("preserves embedded text when a profiled model declares a blank page", function()
            card.metadata = {ocr = {system = false, prompt = "OCR:", image_first = true}}
            reply = "[[NO_TEXT]]"
            local original = "<!-- page 1 -->\n\nEmbedded text survives profiled blank OCR."
            local params = seed(original)
            local result = stage.run(params)
            test.is_true(result.success)
            test.eq(#requests, 1)
            local primary, err = parts.read_primary_content(params.upload_id)
            test.is_nil(err)
            test.eq(primary.content, original)
        end)
    end)
end)}
