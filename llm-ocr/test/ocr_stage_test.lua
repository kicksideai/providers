local test = require("test")
local contract = require("contract")
local fs = require("fs")
local uuid_v4 = require("uuid").v4
local upload_record_repo = require("upload_record_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local image_processor = require("image_processor")
local stage = require("stage")
local artifact_content_repo = require("artifact_content_repo")

local STORAGE_ID = "app:temp_fs"
local PNG = "\137PNG\r\n\26\n" .. string.rep("\0", 64)

local function set_setting(key: string, value: any)
    local def = contract.get("kickside.settings:settings")
    local inst = def:open()
    local result = inst:set({ namespace = "kickside.llm_ocr", key = key, value = value })
    test.eq(result.success, true)
end

local function write_file(path: string, bytes: string)
    local storage = fs.get(STORAGE_ID)
    test.not_nil(storage, "fixture storage unavailable")
    local ok, err = storage:writefile(path, bytes)
    test.is_nil(err)
    test.is_true(ok ~= false)
end

-- Exercise the current KickSide image processor rather than manufacturing an
-- artifact shape in the test: this pins the provider to the real integration
-- contract (primary image artifact + its original-file metadata).
local function seed_image(upload_id: string, filename: string): any
    local path = upload_id .. ".png"
    local metadata = {
        filename = filename,
        source = "ocr-test",
        source_url = "https://example.test/receipt",
        external_id = "receipt-42",
        title = "Receipt",
    }
    write_file(path, PNG)
    local _, upload_err = upload_record_repo.create(
        upload_id, "ocr-test-user", #PNG, "image/png", STORAGE_ID, path, "images", metadata, "processing"
    )
    test.is_nil(upload_err)
    local processed = image_processor.process({
        upload_id = upload_id, mime_type = "image/png", storage_id = STORAGE_ID,
        storage_path = path, size = #PNG, metadata = metadata,
    })
    test.eq(processed.success, true)
    return { upload_id = upload_id, mime_type = "image/png", storage_id = STORAGE_ID, storage_path = path, size = #PNG, metadata = metadata }
end

local function image_count(upload_id: string): integer
    local artifacts, err = artifact_parts_repo.list_artifacts(upload_id)
    test.is_nil(err)
    local count = 0
    for _, artifact in ipairs(artifacts) do
        if artifact.kind == "image" and artifact.role == "primary" then count = count + 1 end
    end
    return count
end

local function define_tests()
    test.describe("OCR over an image upload", function()
        test.it("keeps later page text when a page inside the batch is blank or fails", function()
            for _, fail_page in ipairs({ false, true }) do
                set_setting("ocr_enabled", true)
                local upload_id = uuid_v4()
                local path = upload_id .. ".pdf"
                write_file(path, "document fixture")
                local _, upload_err = upload_record_repo.create(upload_id, "ocr-test-user", 16,
                    "application/pdf", STORAGE_ID, path, "documents", {}, "processing")
                test.is_nil(upload_err)
                for page = 1, 3 do
                    local _, err = artifact_content_repo.create_artifact({ upload_id = upload_id,
                        kind = "image", role = "rendered-page", mime_type = "image/png",
                        content = PNG .. tostring(page), storage_id = STORAGE_ID, ordinal = page,
                        metadata = { page = page } })
                    test.is_nil(err)
                end
                local result = stage.run({ upload_id = upload_id, mime_type = "application/pdf", storage_id = STORAGE_ID }, {
                    batch_size = 3,
                    transcribe = function(bytes: string): (string, any?)
                        local page = bytes:sub(-1)
                        if page == "2" then
                            if fail_page then error("page two vision failure") end
                            return "", nil
                        end
                        return "Text from page " .. page, nil
                    end,
                })
                test.eq(result.metadata.ocr_pages, 2)
                test.eq(result.metadata.ocr_total_pages, 3)
                if fail_page then
                    test.eq(result.metadata.ocr_error, "transcription_failed")
                    test.contains(result.metadata._ocr_error_detail, "page two vision failure")
                else
                    test.is_false(result.metadata.ocr_error)
                    test.is_false(result.metadata._ocr_error_detail)
                end
                local primary, err = artifact_parts_repo.read_primary_content(upload_id)
                test.is_nil(err)
                test.contains(primary.content, "Text from page 1")
                test.contains(primary.content, "Text from page 3")
            end
        end)

        test.it("preserves successful page text across batches when a page fails", function()
            set_setting("ocr_enabled", true)
            local upload_id = uuid_v4()
            local path = upload_id .. ".pdf"
            write_file(path, "document fixture")
            local _, upload_err = upload_record_repo.create(upload_id, "ocr-test-user", 16,
                "application/pdf", STORAGE_ID, path, "documents", {}, "processing")
            test.is_nil(upload_err)
            for page = 1, 5 do
                local _, err = artifact_content_repo.create_artifact({ upload_id = upload_id,
                    kind = "image", role = "rendered-page", mime_type = "image/png",
                    content = PNG .. tostring(page), storage_id = STORAGE_ID, ordinal = page,
                    metadata = { page = page } })
                test.is_nil(err)
            end
            local result = stage.run({ upload_id = upload_id, mime_type = "application/pdf", storage_id = STORAGE_ID }, {
                batch_size = 2,
                transcribe = function(bytes: string): (string?, any?)
                    if bytes:sub(-1) == "4" then return nil, "provider timeout" end
                    return "Text from page " .. bytes:sub(-1), nil
                end,
            })
            test.eq(result.metadata.ocr_pages, 4)
            test.is_true(result.success)
            test.eq(result.metadata.ocr_error, "transcription_failed")
            local primary, err = artifact_parts_repo.read_primary_content(upload_id)
            test.is_nil(err)
            for _, page in ipairs({1, 2, 3, 5}) do
                test.contains(primary.content, "Text from page " .. page)
            end
        end)

        test.it("retains introductory text when the first page cannot be transcribed", function()
            for _, original in ipairs({ "Existing introductory text.\n\n<!-- page 1 -->\n", "\n<!-- page 1 -->\n" }) do
                set_setting("ocr_enabled", true)
                local id = uuid_v4()
                local _, upload_err = upload_record_repo.create(id, "ocr-test-user", 16,
                    "application/pdf", STORAGE_ID, id .. ".pdf", "documents", {}, "processing")
                test.is_nil(upload_err)
                test.is_nil(select(2, artifact_content_repo.create_artifact({ upload_id = id,
                    kind = "markdown", role = "primary", mime_type = "text/markdown",
                    content = original, storage_id = STORAGE_ID })))
                test.is_nil(select(2, artifact_content_repo.create_artifact({ upload_id = id,
                    kind = "image", role = "rendered-page", mime_type = "image/png",
                    content = PNG, storage_id = STORAGE_ID, ordinal = 1, metadata = {page = 1} })))
                local calls = 0
                local result = stage.run({upload_id = id, mime_type = "application/pdf", storage_id = STORAGE_ID}, {
                    transcribe = function() calls = calls + 1; return nil, "provider timeout" end,
                })
                test.eq(calls, 1)
                test.eq(result.success, original:find("Existing", 1, true) ~= nil)
                test.eq(result.metadata.ocr_error, "transcription_failed")
                local primary = assert(artifact_parts_repo.read_primary_content(id))
                test.eq(primary.content, original)
                test.eq(primary.metadata.ocr_page_outcomes[1].status, "failed")
                test.eq(primary.metadata.ocr_page_outcomes[1].page, 1)
            end
        end)

        test.it("leaves the call timeout to the model provider unless one is configured", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local calls, seen = 0, {}
            stage.run(seed_image(uuid_v4(), "provider-timeout.png"), { transcribe = function(_, options)
                calls = calls + 1
                seen[calls] = options.timeout
                return "text", nil
            end })
            set_setting("ocr_call_timeout_ms", 90000)
            stage.run(seed_image(uuid_v4(), "configured-timeout.png"), { transcribe = function(_, options)
                calls = calls + 1
                seen[calls] = options.timeout
                return "text", nil
            end })
            set_setting("ocr_call_timeout_ms", 0)
            test.eq(calls, 2)
            test.is_nil(seen[1])
            test.eq(seen[2], 90000)
        end)

        test.it("transcribes images with the installed default configuration", function()
            local params = seed_image(uuid_v4(), "default.png")
            local result = stage.run(params, { transcribe = function() return "NW-SMOKE-731", nil end })
            test.eq(result.metadata.ocr_pages, 1)
            local primary, err = artifact_parts_repo.read_primary_content(params.upload_id)
            test.is_nil(err)
            test.eq(primary.content, "<!-- page 1 -->\n\nNW-SMOKE-731")
        end)

        test.it("transcribes parameterized raster MIME and retains a blank outcome on retry", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "parameterized.png")
            params.mime_type = " IMAGE/PNG ; charset=binary"
            local empty = stage.run(params, { transcribe = function(bytes, options)
                test.eq(bytes, PNG)
                test.eq(options.mime, "image/png")
                return "  ", nil
            end })
            test.is_false(empty.metadata.ocr_error)
            test.eq(empty.metadata.ocr_page_outcomes[1].status, "blank")
            test.eq(image_count(params.upload_id), 1)
            local calls = 0
            local result = stage.run(params, { transcribe = function() calls = calls + 1; return "Receipt 42", nil end })
            test.is_false(result.metadata.ocr_error)
            test.eq(result.metadata.ocr_pages, 0)
            test.eq(calls, 0)
            local primary, err = artifact_parts_repo.read_primary_content(params.upload_id)
            test.is_nil(err)
            test.eq(primary.content, "<!-- page 1 -->")
            test.eq(primary.artifact.metadata.filename, "parameterized.png")
            test.eq(image_count(params.upload_id), 1)
        end)

        test.it("leaves images alone while ocr_images is off", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", false)
            local params = seed_image(uuid_v4(), "off.png")
            local calls = 0
            local result = stage.run(params, { transcribe = function() calls = calls + 1 return "text", nil end })
            test.eq(result.success, true)
            test.eq(calls, 0)
            test.eq(image_count(params.upload_id), 1)
            local text = artifact_parts_repo.get_primary_content_artifact(params.upload_id)
            test.is_nil(text)
        end)

        test.it("creates a text primary with complete original-image provenance", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "receipt.png")
            local result = stage.run(params, { transcribe = function() return "TOTAL 1250", nil end })
            test.eq(result.metadata.ocr_pages, 1)
            local primary, err = artifact_parts_repo.read_primary_content(params.upload_id)
            test.is_nil(err)
            test.eq(primary.content, "<!-- page 1 -->\n\nTOTAL 1250")
            test.eq(primary.artifact.metadata.filename, "receipt.png")
            test.eq(primary.artifact.metadata.original_filename, "receipt.png")
            test.eq(primary.artifact.metadata.original_mime_type, "image/png")
            test.eq(primary.artifact.metadata.original_size, #PNG)
            test.eq(primary.artifact.metadata.source_url, "https://example.test/receipt")
            test.eq(primary.artifact.metadata.external_id, "receipt-42")
            test.eq(primary.artifact.metadata.source, "ocr-test")
            test.eq(primary.artifact.metadata.source_mime, "image/png")
            test.eq(primary.artifact.metadata.converter, "llm-ocr")
            test.is_true(primary.artifact.metadata.conversion)
            test.eq(image_count(params.upload_id), 1)
        end)

        test.it("keeps a readable image transcript without another model call", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "retry.png")
            local calls = 0
            local function transcribe()
                calls = calls + 1
                return calls == 1 and "first pass" or "second pass", nil
            end
            stage.run(params, { transcribe = transcribe })
            local result = stage.run(params, { transcribe = transcribe })
            test.eq(result.metadata.ocr_pages, 1)
            test.eq(calls, 1)
            local primary, err = artifact_parts_repo.read_primary_content(params.upload_id)
            test.is_nil(err)
            test.eq(primary.content, "<!-- page 1 -->\n\nfirst pass")
            test.eq(image_count(params.upload_id), 1)
        end)

        test.it("stores a stable code and keeps the provider error private", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "error.png")
            local result = stage.run(params, {
                transcribe = function() return nil, "provider rejected vision request: unsupported image" end,
            })
            test.eq(result.success, false)
            test.eq(result.metadata.ocr_error, "transcription_failed")
            test.contains(result.metadata._ocr_error_detail, "provider rejected vision request: unsupported image")
        end)

        test.it("stores thrown page and checkpoint errors without losing successful pages", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "throw.png")
            local thrown = stage.run(params, { transcribe = function() error("vision connection reset") end })
            test.eq(thrown.success, false)
            test.eq(thrown.metadata.ocr_error, "transcription_failed")
            test.contains(thrown.metadata._ocr_error_detail, "vision connection reset")
            local checkpoint = stage.run(params, {
                transcribe = function() return "recognized", nil end,
                persist = function() return false, "transcript storage unavailable" end,
            })
            test.eq(checkpoint.success, false)
            test.eq(checkpoint.metadata.ocr_error, "persist_failed")
            test.contains(checkpoint.metadata._ocr_error_detail, "transcript storage unavailable")
            test.eq(image_count(params.upload_id), 1)
        end)

        test.it("clears a previous transcription failure when a retry succeeds", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "retry-after-error.png")
            local failed = stage.run(params, { transcribe = function() return nil, "temporary upstream failure" end })
            test.eq(failed.metadata.ocr_error, "transcription_failed")
            test.contains(failed.metadata._ocr_error_detail, "temporary upstream failure")

            local retried = stage.run(params, { transcribe = function() return "recovered text", nil end })
            test.is_false(retried.metadata.ocr_error)
            test.is_false(retried.metadata._ocr_error_detail)
            test.eq(retried.metadata.ocr_pages, 1)
        end)

        test.it("skips SVG with parameters and optional whitespace", function()
            set_setting("ocr_enabled", true)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "diagram.svg")
            local calls = 0
            for _, mime in ipairs({ "image/svg+xml; charset=utf-8", "IMAGE/SVG+XML ; charset=utf-8" }) do
                params.mime_type = mime
                local result = stage.run(params, { transcribe = function() calls = calls + 1 return "text", nil end })
                test.eq(result.success, true)
            end
            test.eq(calls, 0)
        end)

        test.it("global OCR disable wins even when image OCR is enabled", function()
            set_setting("ocr_enabled", false)
            set_setting("ocr_images", true)
            local params = seed_image(uuid_v4(), "disabled.png")
            local calls = 0
            local result = stage.run(params, { transcribe = function() calls = calls + 1 return "text", nil end })
            test.eq(result.success, true)
            test.eq(calls, 0)
            set_setting("ocr_enabled", true)
        end)
    end)
end

local run_cases = test.run_cases(define_tests)
return { run = function(options) return run_cases(options) end }
