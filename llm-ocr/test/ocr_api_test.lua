local test = require("test")
local uuid_v4 = require("uuid").v4
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local ocr = require("ocr")
local stage = require("stage")

local STORAGE_ID = "app:temp_fs"

-- Fakes keep the model seam under test without requiring a live LLM.
local function fake_prompt(): any
    return {
        ROLE = { USER = "user" },
        new = function(): any
            return { add_system = function() end, add_message = function() end }
        end,
        text = function(value: any): any return value end,
        image_base64 = function(mime: any, encoded: any): any return { mime = mime, data = encoded } end,
    }
end

local function fake_llm(reply: any, err: any): any
    return { generate = function(_prompt: any, options: any): (any, any)
        if err ~= nil then return nil, err end
        return { result = type(reply) == "function" and reply(options) or reply }, nil
    end }
end

local function ocr_with(reply: any, err: any): any
    return ocr.new({
        llm = fake_llm(reply, err),
        prompt = fake_prompt(),
        base64 = { encode = function(value: any): (any, any) return value, nil end },
    })
end

local function seed(markdown: string?, pages: { any }): string
    local upload_id = uuid_v4()
    local _, upload_err = upload_record_repo.create(
        upload_id, "user-ocr", 5000, "application/pdf",
        STORAGE_ID, upload_id .. ".pdf", "documents", { filename = "scan.pdf" }, "completed"
    )
    test.is_nil(upload_err)

    local source, source_err = artifact_content_repo.create_artifact({
        upload_id = upload_id, kind = "file", role = "source", mime_type = "application/pdf",
        label = "scan.pdf", ordinal = 0,
        locator = { type = "upload.original", upload_id = upload_id, storage_id = STORAGE_ID, storage_path = upload_id .. ".pdf" },
        metadata = { original_upload_id = upload_id },
    })
    test.is_nil(source_err)
    test.not_nil(source)

    if markdown ~= nil then
        local _, md_err = artifact_content_repo.create_artifact({
            upload_id = upload_id, parent_artifact_id = source.artifact_id,
            kind = "markdown", role = "primary", mime_type = "text/markdown",
            label = "scan.md", ordinal = 1, content = markdown, storage_id = STORAGE_ID,
            metadata = { source_artifact_id = source.artifact_id },
        })
        test.is_nil(md_err)
    end

    for _, page in ipairs(pages) do
        local _, img_err = artifact_content_repo.create_artifact({
            upload_id = upload_id, parent_artifact_id = source.artifact_id,
            kind = "image", role = "rendered-page", mime_type = "image/png",
            label = "page_" .. tostring(page) .. ".png", ordinal = 2000 + page,
            content = "PNGBYTES-page-" .. tostring(page), storage_id = STORAGE_ID,
            metadata = { name = "page_" .. tostring(page) .. ".png", page = page },
        })
        test.is_nil(img_err)
    end
    return upload_id
end

local function seed_extracted(markdown: string?, count: integer): string
    local upload_id = uuid_v4()
    local _, upload_err = upload_record_repo.create(
        upload_id, "user-ocr", 5000, "application/pdf",
        STORAGE_ID, upload_id .. ".pdf", "documents", { filename = "scan.pdf" }, "completed"
    )
    test.is_nil(upload_err)

    local source, source_err = artifact_content_repo.create_artifact({
        upload_id = upload_id, kind = "file", role = "source", mime_type = "application/pdf",
        label = "scan.pdf", ordinal = 0,
        locator = { type = "upload.original", upload_id = upload_id, storage_id = STORAGE_ID, storage_path = upload_id .. ".pdf" },
        metadata = { original_upload_id = upload_id },
    })
    test.is_nil(source_err)
    test.not_nil(source)

    if markdown ~= nil then
        local _, md_err = artifact_content_repo.create_artifact({
            upload_id = upload_id, parent_artifact_id = source.artifact_id,
            kind = "markdown", role = "primary", mime_type = "text/markdown",
            label = "scan.md", ordinal = 1, content = markdown, storage_id = STORAGE_ID,
            metadata = { source_artifact_id = source.artifact_id },
        })
        test.is_nil(md_err)
    end

    for i = 1, count do
        local _, img_err = artifact_content_repo.create_artifact({
            upload_id = upload_id, parent_artifact_id = source.artifact_id,
            kind = "image", role = "extracted-image", mime_type = "image/jpeg",
            label = "page" .. tostring(i) .. ".jpg", ordinal = 1000 + i,
            content = string.rep("J", 60000), storage_id = STORAGE_ID,
            metadata = { name = "page" .. tostring(i) .. ".jpg", page = i },
        })
        test.is_nil(img_err)
    end
    return upload_id
end

local function primary_text(upload_id: string): string?
    local primary, err = artifact_parts_repo.read_primary_content(upload_id)
    test.is_nil(err)
    return primary and primary.content or nil
end

local function define_tests()
    test.describe("artifact_content_repo.update_content", function()
        test.it("replaces an artifact's content with new bytes", function()
            local upload_id = seed("old empty content", {})
            local primary = artifact_parts_repo.get_primary_content_artifact(upload_id)
            test.not_nil(primary)
            local old_blob = primary.blob_id

            local updated, err = artifact_content_repo.update_content(upload_id, primary.artifact_id, "brand new content")
            test.is_nil(err)
            test.not_nil(updated.blob_id)
            test.is_true(updated.blob_id ~= old_blob)
            test.eq(primary_text(upload_id), "brand new content")
        end)
    end)

    test.describe("kickside.llm_ocr:ocr lib", function()
        test.it("transcribes image bytes via the model", function()
            local text, err = ocr_with(function(options) return "TEXT[" .. options.model .. "]" end).transcribe(
                "imgbytes", { model = "class:fast", mime = "image/png" })
            test.is_nil(err)
            test.eq(text, "TEXT[class:fast]")
        end)

        test.it("requires image bytes and a model", function()
            local _, image_err = ocr_with("x").transcribe("", { model = "class:fast" })
            test.not_nil(image_err)
            local _, model_err = ocr_with("x").transcribe("img", {})
            test.not_nil(model_err)
        end)

        test.it("surfaces a generation error", function()
            local text, err = ocr_with(nil, "model exploded").transcribe("img", { model = "class:fast" })
            test.is_nil(text)
            test.not_nil(err)
            test.is_true(tostring(err):find("generate failed", 1, true) ~= nil)
        end)
    end)

    test.describe("kickside.llm_ocr:stage build_markdown", function()
        test.it("emits a bare body for a single page", function()
            test.eq(stage.build_markdown({ { page = 1, text = "only page" } }), "only page")
        end)
        test.it("emits page headers for multiple pages and drops blanks", function()
            local markdown = stage.build_markdown({
                { page = 1, text = "alpha" }, { page = 2, text = "  " }, { page = 3, text = "gamma" },
            })
            test.eq(markdown, "## Page 1\n\nalpha\n\n## Page 3\n\ngamma")
        end)
    end)

    test.describe("kickside.llm_ocr:stage document pages", function()
        local function transcriber(text: string): any
            return function(_bytes: any, _options: any): (any, any) return text, nil end
        end

        test.it("transcribes a single rendered page into the primary content", function()
            local upload_id = seed("", { 1 })
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID },
                { transcribe = transcriber("Transcribed page text") })
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 1)
            test.eq(result.metadata.ocr_total_pages, 1)
            test.eq(primary_text(upload_id), "Transcribed page text")
        end)

        test.it("keeps the page screenshots after transcription", function()
            local upload_id = seed("", { 1, 2 })
            stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("page text") })
            local artifacts = artifact_parts_repo.list_artifacts(upload_id)
            local images = 0
            for _, artifact in ipairs(artifacts) do
                if artifact.kind == "image" and artifact.role == "rendered-page" then images = images + 1 end
            end
            test.eq(images, 2)
        end)

        test.it("joins multiple pages with headers", function()
            local upload_id = seed("", { 1, 2 })
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("body") })
            test.eq(result.metadata.ocr_pages, 2)
            test.eq(result.metadata.ocr_total_pages, 2)
            local content = primary_text(upload_id) :: string
            test.is_true(content:find("## Page 1", 1, true) ~= nil)
            test.is_true(content:find("## Page 2", 1, true) ~= nil)
        end)

        test.it("no-ops when there are no page images at all", function()
            local upload_id = seed("existing text", {})
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("should not run") })
            test.is_true(result.success)
            test.is_nil(result.metadata)
            test.eq(primary_text(upload_id), "existing text")
        end)

        test.it("transcribes large extracted page images when no rendered pages exist", function()
            local upload_id = seed_extracted("", 2)
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("page body") })
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 2)
            test.eq(result.metadata.ocr_total_pages, 2)
            local content = primary_text(upload_id) :: string
            test.is_true(content:find("## Page 1", 1, true) ~= nil)
        end)

        test.it("transcribes extracted page images when extracted text is sparse", function()
            local upload_id = seed_extracted(
                "Drawing Number Description Revision Date\n\n" ..
                "| 28495-01.dwg Robot Number | ing Standard | 0 5 - 21 -0 8 |", 1)
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("corrected OCR text") })
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 1)
            test.eq(result.metadata.ocr_total_pages, 1)
            test.eq(primary_text(upload_id), "corrected OCR text")
        end)

        test.it("transcribes extracted page images when text cannot cover every page", function()
            local upload_id = seed_extracted(string.rep("real text from one page. ", 130), 3)
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("page body") })
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 3)
            test.eq(result.metadata.ocr_total_pages, 3)
        end)

        test.it("does not transcribe extracted images when the document already has text", function()
            local upload_id = seed_extracted(string.rep("real text here. ", 240), 2)
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("should not run") })
            test.is_true(result.success)
            test.is_nil(result.metadata)
        end)
        test.it("keeps sparse Word body text when an embedded image contains different facts", function()
            local body = "Revenue 2400. Jonah Reed dispatches Orchard at 09:30."
            local upload_id = seed_extracted(body, 1)
            local calls = 0
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID,
                mime_type = "application/vnd.openxmlformats-officedocument.wordprocessingml.document" }, {
                transcribe = function() calls = calls + 1 return "NW-AI-731, returns within 17 days", nil end,
            })
            test.is_true(result.success)
            test.eq(calls, 0)
            test.eq(primary_text(upload_id), body)
        end)

        test.it("no-ops on malformed params instead of failing the upload", function()
            local result = stage.run({}, { transcribe = transcriber("should not run") })
            test.is_true(result.success)
            test.is_nil(result.metadata)
        end)
    end)
end

local function run(options: any): any
    return test.run_cases(define_tests)(options)
end

return { run = run }
