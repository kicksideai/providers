local test = require("test")
local sql = require("sql")
local uuid_v4 = require("uuid").v4
local artifact_content_repo = require("artifact_content_repo")
local artifact_parts_repo = require("artifact_parts_repo")
local upload_record_repo = require("upload_record_repo")
local upload_job = require("upload_job")
local llm = require("llm")
local ocr = require("ocr")
local stage = require("stage")
local contract = require("contract")

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

local function fake_llm(reply: any, err: any, finish_reason: string?): any
    return { FINISH_REASON = llm.FINISH_REASON, generate = function(_prompt: any, options: any): (any, any)
        if err ~= nil then return nil, err end
        return { result = type(reply) == "function" and reply(options) or reply, finish_reason = finish_reason or llm.FINISH_REASON.STOP }, nil
    end }
end

local function ocr_with(reply: any, err: any, finish_reason: string?): any
    return ocr.new({
        llm = fake_llm(reply, err, finish_reason),
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

local function seed_extracted(markdown: string?, count: integer, legacy: boolean?): string
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
            metadata = { name = "page" .. tostring(i) .. ".jpg", page = not legacy and i or nil },
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

    test.describe("all-page text preservation", function()
        for _, marked in ipairs({false, true}) do
            for _, result in ipairs({"blank", "failed", "readable", "mixed"}) do
                test.it("preserves text through " .. result .. " OCR, marked=" .. tostring(marked), function()
                    local body = string.rep("Original embedded document text. ", 60)
                    local original = marked and ("<!-- page 1 -->\n\n" .. body .. "\n\n<!-- page 2 -->\n\n" .. body) or body
                    local id = seed(original, {1, 2})
                    local settings = assert(assert(contract.get("kickside.settings:settings")):open())
                    test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "all"}).success)
                    local calls = 0
                    local params = {upload_id = id, storage_id = STORAGE_ID, mime_type = "application/pdf"}
                    local response = stage.run(params, {transcribe = function(bytes)
                        calls = calls + 1
                        if result == "failed" then return nil, "OCR request failed" end
                        if result == "blank" or (result == "mixed" and bytes:match("page%-2")) then return " \t\n", nil end
                        return "Real OCR text", nil
                    end})
                    test.eq(calls, 2)
                    test.eq(response.success, result ~= "failed")
                    if result == "readable" then
                        test.eq(primary_text(id), "<!-- page 1 -->\n\nReal OCR text\n\n<!-- page 2 -->\n\nReal OCR text")
                    elseif result == "mixed" and marked then
                        test.eq(primary_text(id), "<!-- page 1 -->\n\nReal OCR text\n\n<!-- page 2 -->\n\n" .. body)
                    else test.eq(primary_text(id), original) end
                    if result == "blank" then
                        local retried = stage.run(params, {transcribe = function() calls = calls + 1; return "Later OCR text", nil end})
                        test.is_true(retried.success)
                        test.eq(calls, 2)
                        test.eq(primary_text(id), original)
                    end
                    test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "sparse"}).success)
                end)
            end
        end
    end)

    test.describe("kickside.llm_ocr:ocr lib", function()
        test.it("transcribes image bytes via the model", function()
            local text, err = ocr_with(function(options) return "TEXT[" .. options.model .. "]" end).transcribe(
                "imgbytes", { model = "class:fast", mime = "image/png" })
            test.is_nil(err)
            test.eq(text, "TEXT[class:fast]")
        end)

        test.it("transcribes when the provider omits finish_reason", function()
            local model = ocr.new({
                llm = { FINISH_REASON = llm.FINISH_REASON, generate = function()
                    return { result = "Full page body." }, nil
                end },
                prompt = fake_prompt(),
                base64 = { encode = function(value: any): (any, any) return value, nil end },
            })
            local text, err = model.transcribe("img", { model = "class:fast" })
            test.is_nil(err)
            test.eq(text, "Full page body.")
        end)

        test.it("requires image bytes and a model", function()
            local _, image_err = ocr_with("x").transcribe("", { model = "class:fast" })
            test.not_nil(image_err)
            local _, model_err = ocr_with("x").transcribe("img", {})
            test.not_nil(model_err)
        end)

        test.it("fails a generation that stops at the token limit", function()
            local text, err = ocr_with("PAGE HEADER\n" .. string.rep(".", 200), nil, "length").transcribe(
                "img", { model = "class:fast" })
            test.is_nil(text)
            test.not_nil(err)
            test.is_true(tostring(err):find("token limit", 1, true) ~= nil, tostring(err))
        end)

        test.it("asks the model for an explicit no-text reply and returns empty text for it", function()
            test.is_true(type(ocr.NO_TEXT_REPLY) == "string" and ocr.NO_TEXT_REPLY ~= "")
            test.contains(ocr.system_prompt, ocr.NO_TEXT_REPLY)
            for _, reply in ipairs({ ocr.NO_TEXT_REPLY, "  " .. tostring(ocr.NO_TEXT_REPLY) .. "\n" }) do
                local text, err = ocr_with(reply).transcribe("img", { model = "class:fast" })
                test.is_nil(err)
                test.eq(text, "")
            end
        end)

        test.it("keeps a transcription that quotes the no-text reply among page text", function()
            local reply = "Form field: " .. tostring(ocr.NO_TEXT_REPLY)
            local text, err = ocr_with(reply).transcribe("img", { model = "class:fast" })
            test.is_nil(err)
            test.eq(text, reply)
        end)

        test.it("records a length-cut no-text reply as failed instead of blank or readable", function()
            for _, reply in ipairs({
                ocr.NO_TEXT_REPLY,
                "  " .. tostring(ocr.NO_TEXT_REPLY) .. "\n",
                "Form field: " .. tostring(ocr.NO_TEXT_REPLY),
            }) do
                local text, err = ocr_with(reply, nil, llm.FINISH_REASON.LENGTH).transcribe(
                    "img", { model = "class:fast" })
                test.is_nil(text)
                test.contains(tostring(err), "token limit")
                local upload_id = seed("", {1})
                local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {
                    transcribe = ocr_with(reply, nil, llm.FINISH_REASON.LENGTH).transcribe,
                })
                test.is_false(result.success)
                test.eq(result.metadata.ocr_error, "transcription_failed")
                test.eq(result.metadata.ocr_pages, 0)
                local primary = assert(artifact_parts_repo.read_primary_content(upload_id))
                test.eq(primary.metadata.ocr_page_outcomes[1].status, "failed")
                test.eq(primary.metadata.ocr_page_outcomes[1].error, "transcription_failed")
                test.is_nil((primary.content:find(tostring(ocr.NO_TEXT_REPLY), 1, true)))
            end
        end)

        test.it("surfaces a generation error", function()
            local text, err = ocr_with(nil, "model exploded").transcribe("img", { model = "class:fast" })
            test.is_nil(text)
            test.not_nil(err)
            test.is_true(tostring(err):find("generate failed", 1, true) ~= nil)
        end)
    end)

    test.describe("kickside.llm_ocr:stage build_markdown", function()
        test.it("emits a page marker for a single page", function()
            test.eq(stage.build_markdown({ { page = 1, text = "only page" } }), "<!-- page 1 -->\n\nonly page")
        end)
        test.it("emits page markers for multiple pages including blanks", function()
            local markdown = stage.build_markdown({
                { page = 1, text = "alpha" }, { page = 2, text = "  " }, { page = 3, text = "gamma" },
            })
            test.eq(markdown, "<!-- page 1 -->\n\nalpha\n\n<!-- page 2 -->\n\n<!-- page 3 -->\n\ngamma")
        end)
    end)

    test.describe("kickside.llm_ocr:stage document pages", function()
        test.it("checks the existing job lease between page batches", function()
            for _, sequence in ipairs({1, 2}) do
                local upload_id = seed("", {1,2,3})
                local job_id = uuid_v4()
                local db = assert(sql.get("app:db"))
                local _, err = sql.builder.insert("kickside_job"):set_map({id = job_id,
                    job_type = "ocr.fixture", job_identity = job_id, owner_kind = "installation", owner_id = "ocr-fixture",
                    status = "running", lease_token = "ocr-lease", execution_seq = 1, lease_until = "2100-01-01 00:00:00"})
                    :run_with(db):exec()
                test.is_nil(err)
                local calls = 0
                local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID,
                    cancel_ref = {job_id = job_id, lease_token = "ocr-lease", execution_seq = sequence}}, {
                    batch_size = 1, transcribe = function() calls = calls + 1; return "Scanned words", nil end})
                test.eq(calls, sequence == 1 and 3 or 0)
                test.eq(result.success, sequence == 1)
                if sequence == 1 then
                    test.eq(result.metadata.ocr_pages, 3)
                    test.contains(primary_text(upload_id), "Scanned words")
                end
                local _, delete_err = sql.builder.delete("kickside_job"):where("id = ?", job_id):run_with(db):exec()
                db:release()
                test.is_nil(delete_err)
            end
        end)

        test.it("uses the document-wide decision for marked legacy images", function()
            local pages = {}
            for page = 1, 12 do
                pages[#pages + 1] = "<!-- page " .. page .. " -->\n\n" .. (page == 1 and string.rep("Original text. ", 100) or "")
            end
            local upload_id = seed_extracted(table.concat(pages, "\n\n"), 12, true)
            local calls = 0
            local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {transcribe = function()
                calls = calls + 1
                return "Legacy scan", nil
            end})
            test.is_true(result.success)
            test.eq(calls, 12, "legacy images keep the document-wide threshold decision")
        end)

        test.it("preserves legacy page bodies on failures and partial retries", function()
            local original = "<!-- page 1 -->\n\nOriginal first caption\n\n<!-- page 2 -->\n\nOriginal second caption"
            local upload_id = seed_extracted(original, 2, true)
            local params = {upload_id = upload_id, storage_id = STORAGE_ID}
            local calls = 0
            local first = stage.run(params, {batch_size = 1, transcribe = function()
                calls = calls + 1
                if calls == 2 then return nil, "vision request failed" end
                return "First transcription", nil
            end})
            test.is_false(first.success)
            test.eq(calls, 2)
            local expected = "<!-- page 1 -->\n\nFirst transcription\n\n<!-- page 2 -->\n\nOriginal second caption"
            test.eq(primary_text(upload_id), expected)
            local primary = assert(artifact_parts_repo.read_primary_content(upload_id))
            test.eq(primary.metadata.ocr_page_outcomes[1].status, "readable")
            test.eq(primary.metadata.ocr_page_outcomes[2].status, "failed")
            calls = 0
            local failed_retry = stage.run(params, {transcribe = function()
                calls = calls + 1
                return nil, "vision request still fails"
            end})
            test.is_false(failed_retry.success)
            test.eq(calls, 1)
            test.eq(primary_text(upload_id), expected)
            calls = 0
            local retry = stage.run(params, {transcribe = function()
                calls = calls + 1
                return "Second transcription", nil
            end})
            test.is_true(retry.success)
            test.eq(calls, 1)
            test.eq(primary_text(upload_id), "<!-- page 1 -->\n\nFirst transcription\n\n<!-- page 2 -->\n\nSecond transcription")
        end)

        test.it("records a length-cut transcription as a failed page and retries it", function()
            local upload_id = seed("", {1})
            local params = {upload_id = upload_id, storage_id = STORAGE_ID}
            local cut = stage.run(params, {transcribe = ocr_with("PAGE HEADER", nil, "length").transcribe})
            test.is_false(cut.success)
            test.eq(cut.metadata.ocr_error, "transcription_failed")
            test.eq(cut.metadata.ocr_pages, 0)
            local primary = assert(artifact_parts_repo.read_primary_content(upload_id))
            test.eq(primary.metadata.ocr_page_outcomes[1].status, "failed")
            test.eq(primary.metadata.ocr_page_outcomes[1].error, "transcription_failed")
            test.is_nil((primary.content:find("PAGE HEADER", 1, true)))
            local retry = stage.run(params, {transcribe = ocr_with("PAGE HEADER\n\nFull page body.").transcribe})
            test.is_true(retry.success)
            test.eq(retry.metadata.ocr_page_outcomes[1].status, "readable")
            test.eq(primary_text(upload_id), "<!-- page 1 -->\n\nPAGE HEADER\n\nFull page body.")
        end)

        test.it("keeps a length-cut page failed when the upload retry budget is exhausted", function()
            local upload_id = seed("", {1})
            local calls = 0
            local model = ocr_with(function()
                calls = calls + 1
                return "Incomplete page body."
            end, nil, llm.FINISH_REASON.LENGTH)
            local job = { id = uuid_v4(), attempt_no = 0, max_attempts = 3 }
            repeat
                job.attempt_no = job.attempt_no + 1
                local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {
                    transcribe = model.transcribe,
                })
                test.is_false(result.success)
                test.eq(result.metadata.ocr_error, "transcription_failed")
                test.eq(result.metadata.ocr_pages, 0)
                local primary = assert(artifact_parts_repo.read_primary_content(upload_id))
                test.eq(primary.metadata.ocr_page_outcomes[1].status, "failed")
                test.eq(primary.metadata.ocr_page_outcomes[1].error, "transcription_failed")
                test.is_nil((primary.content:find("Incomplete page body.", 1, true)))
            until upload_job.terminal_failure(job, nil) or job.attempt_no > job.max_attempts
            test.eq(job.attempt_no, job.max_attempts)
            test.eq(calls, job.max_attempts)
        end)

        test.it("records a page the model reports as having no text as blank", function()
            local upload_id = seed("", {1, 2})
            local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {transcribe = ocr_with(function()
                return tostring(ocr.NO_TEXT_REPLY)
            end).transcribe})
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 0)
            test.eq(result.metadata.ocr_page_outcomes[1].status, "blank")
            test.eq(result.metadata.ocr_page_outcomes[2].status, "blank")
            test.eq(primary_text(upload_id), "<!-- page 1 -->\n\n<!-- page 2 -->")
        end)

        test.it("retains sparse text when its image is missing or transcription fails", function()
            for _, images in ipairs({{}, {1}}) do
                local original = "<!-- page 1 -->\n\nA short caption already extracted."
                local upload_id = seed(original, images)
                local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {transcribe = function()
                    return nil, "vision request failed"
                end})
                test.is_false(result.success)
                test.eq(primary_text(upload_id), original)
                test.eq(assert(artifact_parts_repo.read_primary_content(upload_id)).metadata.ocr_page_outcomes[1].status, "failed")
            end
        end)

        test.it("fences checkpoints when a newer attempt commits during transcription", function()
            for _, original in ipairs({"absent", "<!-- page 1 -->\n\nOriginal caption"}) do
                if original == "absent" then original = nil end
                local upload_id = seed(original, {1})
                local job_id = uuid_v4()
                local db = assert(sql.get("app:db"))
                local _, err = sql.builder.insert("kickside_job"):set_map({id = job_id,
                    job_type = "ocr.fixture", job_identity = job_id, owner_kind = "installation", owner_id = "ocr-fixture",
                    status = "running", lease_token = "old-lease", execution_seq = 1, lease_until = "2100-01-01 00:00:00"})
                    :run_with(db):exec()
                test.is_nil(err)
                local params = {upload_id = upload_id, storage_id = STORAGE_ID,
                    cancel_ref = {job_id = job_id, lease_token = "old-lease", execution_seq = 1}}
                local result = stage.run(params, {transcribe = function()
                    local _, update_err = sql.builder.update("kickside_job"):set_map({lease_token = "new-lease", execution_seq = 2})
                        :where("id = ?", job_id):run_with(db):exec()
                    test.is_nil(update_err)
                    local newer = stage.run({upload_id = upload_id, storage_id = STORAGE_ID,
                        cancel_ref = {job_id = job_id, lease_token = "new-lease", execution_seq = 2}}, {
                        transcribe = function() return "New attempt text", nil end})
                    test.is_true(newer.success)
                    return "Stale attempt text", nil
                end})
                test.is_false(result.success)
                test.eq(primary_text(upload_id), "<!-- page 1 -->\n\nNew attempt text")
                local primary = assert(artifact_parts_repo.get_primary_content_artifact(upload_id))
                local updated, stale_err = artifact_content_repo.update_content(upload_id, primary.artifact_id, "Stale direct write", {
                    cancel_ref = params.cancel_ref, metadata = {ocr_page_outcomes = {{page = 1, status = "failed"}}}})
                test.is_nil(updated)
                test.not_nil(stale_err)
                local created, create_err = artifact_content_repo.create_artifact({upload_id = upload_id,
                    kind = "markdown", role = "primary", mime_type = "text/markdown", content = "Stale create",
                    storage_id = STORAGE_ID, cancel_ref = params.cancel_ref})
                test.is_nil(created)
                test.not_nil(create_err)
                test.eq(primary_text(upload_id), "<!-- page 1 -->\n\nNew attempt text")
                test.eq(assert(artifact_parts_repo.read_primary_content(upload_id)).metadata.ocr_page_outcomes[1].status, "readable")
                local _, delete_err = sql.builder.delete("kickside_job"):where("id = ?", job_id):run_with(db):exec()
                db:release()
                test.is_nil(delete_err)
            end
        end)

        test.it("resumes pages that have no outcome in an interrupted checkpoint", function()
            local markdown = "<!-- page 1 -->\n\nAlready read\n\n<!-- page 2 -->\n\n<!-- page 3 -->"
            local upload_id = seed(markdown, {1,2,3})
            local primary = assert(artifact_parts_repo.get_primary_content_artifact(upload_id))
            local _, err = artifact_content_repo.update_content(upload_id, primary.artifact_id, markdown, {metadata = {
                ocr_page_outcomes = {{page = 1, status = "readable", source = "ocr"}, {page = 2, source = "ocr"}, {page = 3, source = "ocr"}}
            }})
            test.is_nil(err)
            local calls = 0
            local result = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {transcribe = function(bytes)
                calls = calls + 1
                return "Read page " .. bytes:match("page%-(%d+)"), nil
            end})
            test.is_true(result.success)
            test.eq(calls, 2)
            test.contains(primary_text(upload_id), "Already read")
            test.contains(primary_text(upload_id), "Read page 2")
            test.contains(primary_text(upload_id), "Read page 3")
        end)

        test.it("keeps failed and blank page markers, records outcomes and retries only failed pages", function()
            local text = string.rep("The original text page keeps its wording. ", 60)
            local markdown = "<!-- page 1 -->\n\n<!-- page 2 -->\n\n<!-- page 3 -->\n\n<!-- page 4 -->\n\n" .. text
            local upload_id = seed(markdown, {1,2,3})
            local calls = {}
            local function transcribe(bytes)
                local page = tonumber(bytes:match("page%-(%d+)"))
                calls[#calls + 1] = page
                if page == 3 then return nil, "vision request failed" end
                return page == 1 and "A scanned fact" or "", nil
            end
            local first = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {batch_size = 1, transcribe = transcribe})
            test.is_false(first.success)
            test.eq(#calls, 3)
            for page = 1, 4 do test.contains(primary_text(upload_id), "<!-- page " .. page .. " -->") end
            test.contains(primary_text(upload_id), text)
            local primary = assert(artifact_parts_repo.read_primary_content(upload_id))
            local outcomes = primary.artifact.metadata.ocr_page_outcomes
            test.eq(outcomes[1].status, "readable")
            test.eq(outcomes[2].status, "blank")
            test.eq(outcomes[3].status, "failed")
            test.eq(outcomes[4].status, "readable")
            local retried = stage.run({upload_id = upload_id, storage_id = STORAGE_ID}, {transcribe = function(bytes)
                calls[#calls + 1] = tonumber(bytes:match("page%-(%d+)"))
                return "The previously failed scanned fact", nil
            end})
            test.is_true(retried.success)
            test.eq(#calls, 4)
            test.eq(calls[4], 3)
            test.contains(primary_text(upload_id), "A scanned fact")
            test.contains(primary_text(upload_id), "The previously failed scanned fact")
        end)

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
            test.eq(primary_text(upload_id), "<!-- page 1 -->\n\nTranscribed page text")
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

        test.it("joins multiple pages with markers", function()
            local upload_id = seed("", { 1, 2 })
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("body") })
            test.eq(result.metadata.ocr_pages, 2)
            test.eq(result.metadata.ocr_total_pages, 2)
            local content = primary_text(upload_id) :: string
            test.is_true(content:find("<!-- page 1 -->", 1, true) ~= nil)
            test.is_true(content:find("<!-- page 2 -->", 1, true) ~= nil)
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
            test.is_true(content:find("<!-- page 1 -->", 1, true) ~= nil)
        end)

        test.it("transcribes extracted page images when extracted text is sparse", function()
            local upload_id = seed_extracted(
                "Drawing Number Description Revision Date\n\n" ..
                "| 28495-01.dwg Robot Number | ing Standard | 0 5 - 21 -0 8 |", 1)
            local result = stage.run({ upload_id = upload_id, storage_id = STORAGE_ID }, { transcribe = transcriber("corrected OCR text") })
            test.is_true(result.success)
            test.eq(result.metadata.ocr_pages, 1)
            test.eq(result.metadata.ocr_total_pages, 1)
            test.eq(primary_text(upload_id), "<!-- page 1 -->\n\ncorrected OCR text")
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
