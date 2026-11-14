-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local ocr = require("ocr")
local stage = require("stage")
local content = require("artifact_content_repo")
local uploads = require("upload_record_repo")
local time = require("time")
local uuid = require("uuid")

local function seed(pages: integer, markdown: string?): string
    local id = uuid.v4()
    local _, create_err = uploads.create(id, "ocr-test", 1000, "application/pdf",
        "app:temp_fs", id .. ".pdf", "documents", {}, "completed")
    test.is_nil(create_err, tostring(create_err))
    for page = 1, pages do
        local _, err = content.create_artifact({upload_id = id, kind = "image",
            role = "rendered-page", mime_type = "image/png", ordinal = page,
            content = "page " .. page, storage_id = "app:temp_fs", metadata = {page = page}})
        test.is_nil(err, tostring(err))
    end
    if markdown then
        local _, err = content.create_artifact({upload_id = id, kind = "markdown", role = "primary",
            mime_type = "text/markdown", content = markdown, storage_id = "app:temp_fs"})
        test.is_nil(err, tostring(err))
    end
    return id
end

return {run = test.run_cases(function()
    test.describe("OCR stage request preparation", function()
        test.it("prepares each model profile and instruction once for a thousand pages", function()
            local measurements = {}
            for _, profiled in ipairs({false, true}) do
                local id = seed(1000, nil)
                local resolves, profile_reads, instructions, generations = 0, 0, 0, 0
                local profile = {system = false, prompt = "OCR:", image_first = true, output_limit = 8192}
                local metadata = setmetatable({}, {__index = function(_, key)
                    if key == "ocr" then
                        profile_reads = profile_reads + 1
                        if profiled then return profile end
                    end
                    return nil
                end})
                local runtime = {
                    llm = {
                        FINISH_REASON = {LENGTH = "length"},
                        resolve_model = function(model)
                            resolves = resolves + 1
                            return {name = model, metadata = metadata}, nil
                        end,
                        generate = function(_, options)
                            generations = generations + 1
                            local prepared, err = options.prepare_request({model = {name = "stage-model", metadata = metadata}})
                            test.is_nil(err, tostring(err))
                            test.eq(prepared.max_tokens, profiled and 8192 or 4000)
                            return {result = "Transcribed page"}, nil
                        end,
                    },
                    prompt = {
                        ROLE = {USER = "user"},
                        text = function(value) instructions = instructions + 1; return value end,
                        image_base64 = function(_, value) return value end,
                        new = function() return {add_system = function() end, add_message = function() end} end,
                    },
                    base64 = {encode = function(value) return value, nil end},
                }
                local original = ocr.new
                ocr.new = function() return original(runtime) end
                local started = time.now()
                local ok, result = pcall(stage.run, {upload_id = id, storage_id = "app:temp_fs"}, {
                    batch_size = 4,
                    persist = function() return true, nil end,
                })
                local elapsed = time.now():sub(started):milliseconds()
                ocr.new = original
                test.is_true(ok, tostring(result))
                test.is_true(result.success)
                test.eq(result.metadata.ocr_pages, 1000, tostring(result.metadata._ocr_error_detail))
                measurements[#measurements + 1] = {profiled = profiled, elapsed_ms = elapsed,
                    resolves = resolves, profile_reads = profile_reads, instructions = instructions,
                    generations = generations}
            end
            for _, measurement in ipairs(measurements) do
                test.eq(measurement.generations, 1000)
                test.eq(measurement.resolves, 0, "OCR does not resolve separately from generation")
                test.eq(measurement.profile_reads, 1, "Profile validation repeats per page")
                test.eq(measurement.instructions, 1, "Instruction construction repeats per page")
            end
        end)

        test.it("records invalid profiles once and preserves the existing text failure policy", function()
            for _, markdown in ipairs({"", "<!-- page 1 -->\n\nExisting caption\n\n<!-- page 2 -->"}) do
                local id = seed(2, markdown)
                local profile_reads, generations, checkpoints = 0, 0, 0
                local original = ocr.new
                ocr.new = function() return original({llm = {
                    generate = function(_, options)
                        local metadata = setmetatable({}, {__index = function(_, key)
                            if key == "ocr" then profile_reads = profile_reads + 1; return {output_limit = 0} end
                        end})
                        local prepared, err = options.prepare_request({model = {name = "invalid-model", metadata = metadata}})
                        if err then return nil, err end
                        generations = generations + 1
                        return {result = "unexpected"}, nil
                    end,
                }}) end
                local ok, result = pcall(stage.run, {upload_id = id, storage_id = "app:temp_fs"}, {
                    persist = function(_, _, text, _, _, outcomes)
                        checkpoints = checkpoints + 1
                        test.contains(text, markdown)
                        test.eq(#outcomes, 2)
                        for _, outcome in ipairs(outcomes) do test.eq(outcome.status, "failed") end
                        return true, nil
                    end,
                })
                ocr.new = original
                test.is_true(ok, tostring(result))
                test.eq(result.success, markdown ~= "")
                test.eq(result.metadata.ocr_error, "transcription_failed")
                test.eq(profile_reads, 1)
                test.eq(generations, 0)
                test.eq(checkpoints, 1)
            end
        end)

        test.it("checks cancellation before preparing the model or recording failures", function()
            local id = seed(2, nil)
            local original = ocr.new
            local preparations, checkpoints = 0, 0
            ocr.new = function()
                preparations = preparations + 1
                return original({llm = {resolve_model = function() return nil, "unavailable" end}})
            end
            local ok, result = pcall(stage.run, {upload_id = id, storage_id = "app:temp_fs"}, {
                should_continue = function() return false end,
                persist = function() checkpoints = checkpoints + 1; return true, nil end,
            })
            ocr.new = original
            test.is_true(ok, tostring(result))
            test.is_false(result.success)
            test.eq(preparations, 0)
            test.eq(checkpoints, 0)
        end)
    end)
end)}
