-- SPDX-License-Identifier: LicenseRef-KickSide-Community-1.0
local test = require("test")
local fs = require("fs")
local funcs = require("funcs")
local contract = require("contract")
local uuid = require("uuid")
local fixtures = require("fixtures")
local processor = require("processor")
local uploads = require("uploads")
local parts = require("parts")
local content = require("content")
local stage = require("stage")
local ocr = require("ocr")
local llm = require("llm")
local doc2md = require("doc2md")

return { run = test.run_cases(function()
    test.describe("PDF page fidelity through extraction, rendering and OCR", function()
        test.it("records an unavailable page after a composite render fails", function()
            local bytes = fixtures.pdf({"double"})
            local id, storage = uuid.v4(), fs.get("app:temp_fs")
            local path = id .. ".pdf"
            assert(storage:writefile(path, bytes))
            local params = {upload_id = id, storage_id = "app:temp_fs", storage_path = path,
                mime_type = "application/pdf", size = #bytes, metadata = {filename = "composite.pdf"}}
            test.is_nil(select(2, uploads.create(id, "page-reader", #bytes, "application/pdf", "app:temp_fs", path, "documents", {}, "processing")))
            local settings = assert(assert(contract.get("kickside.settings:settings")):open())
            for key, value in pairs({rasterize_min_source_bytes = 0, rasterize_min_page_bytes = 0}) do
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = key, value = value}).success)
            end
            test.is_true(processor.process(params).success)
            local original = assert(parts.read_primary_content(id)).content
            assert(storage:remove(path))
            local rendered, err = funcs.call("kickside.uploads.rasterize:stage", params)
            test.is_nil(err)
            test.is_true(rendered.success)
            local calls = 0
            local result = stage.run(params, {transcribe = function() calls = calls + 1; return "Partial page", nil end})
            test.is_false(result.success)
            test.eq(calls, 0)
            local primary = assert(parts.read_primary_content(id))
            test.eq(primary.content, original)
            test.eq(primary.metadata.ocr_page_outcomes[1].status, "failed")
            test.eq(#doc2md.markers(primary.content), 1)
        end)
        for _, selection in ipairs({"default", "all"}) do
            test.it("transcribes text-layer pages only under the all page selection: " .. selection, function()
                local kinds = {"text", "scan", "text"}
                local bytes = fixtures.pdf(kinds)
                local id, storage = uuid.v4(), fs.get("app:temp_fs")
                local path = id .. ".pdf"
                assert(storage:writefile(path, bytes))
                local params = {upload_id = id, storage_id = "app:temp_fs", storage_path = path,
                    mime_type = "application/pdf", size = #bytes, metadata = {filename = "selection.pdf"}}
                test.is_nil(select(2, uploads.create(id, "page-reader", #bytes, "application/pdf", "app:temp_fs", path, "documents", {}, "processing")))
                local settings = assert(assert(contract.get("kickside.settings:settings")):open())
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_min_source_bytes", value = 0}).success)
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_min_page_bytes", value = 51200}).success)
                if selection == "all" then
                    test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "all"}).success)
                end
                test.is_true(processor.process(params).success)
                local original = assert(parts.read_primary_content(id)).content
                local originals = doc2md.markers(original)
                local rendered, render_err = funcs.call("kickside.uploads.rasterize:stage", params)
                test.is_nil(render_err, tostring(render_err)); test.is_true(rendered.success)
                local images = {}
                for _, artifact in ipairs(assert(parts.list_artifacts(id))) do
                    if artifact.role == "rendered-page" then images[#images + 1] = artifact end
                end
                table.sort(images, function(a, b) return a.metadata.page < b.metadata.page end)
                local calls = 0
                local result = stage.run(params, {batch_size = 1, transcribe = function()
                    calls = calls + 1
                    return "OCR TEXT " .. images[calls].metadata.page, nil
                end})
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_page_selection", value = "sparse"}).success)
                test.is_true(result.success)
                test.eq(calls, selection == "all" and #kinds or 1)
                local markdown = assert(parts.read_primary_content(id)).content
                local markers = doc2md.markers(markdown)
                test.eq(#markers, #kinds)
                for page, marker in ipairs(markers) do
                    local body = markdown:sub(marker.finish + 1, markers[page + 1] and markers[page + 1].start - 1 or #markdown)
                    if selection == "all" or kinds[page] == "scan" then
                        test.eq(body:match("^%s*(.-)%s*$"), "OCR TEXT " .. page)
                    else
                        local old = original:sub(originals[page].finish + 1, originals[page + 1] and originals[page + 1].start - 1 or #original)
                        test.eq(body, old, "the text layer stays byte-for-byte intact")
                    end
                end
                assert(storage:remove(path))
            end)
        end
        for _, mode in ipairs({"mixed", "text", "scan", "extracted", "uneven", "form", "inline", "large"}) do
            test.it("keeps ordered pages and calls the model only for sparse pages: " .. mode, function()
                local kinds, expected = {}, 0
                local count = mode == "large" and 1025 or (mode == "extracted" and 12 or ((mode == "form" or mode == "inline") and 1 or (mode == "uneven" and 4 or 6)))
                for page = 1, count do
                    kinds[page] = (mode == "text" or (mode == "mixed" and page % 2 == 1)
                        or (mode == "large" and page < count)) and "text" or "scan"
                    if mode == "uneven" then kinds[page] = page == 1 and "double" or (page == 2 and "blank" or "scan") end
                    if mode == "form" or mode == "inline" then kinds[page] = mode end
                    if kinds[page] ~= "text" then expected = expected + 1 end
                end
                local bytes = fixtures.pdf(kinds)
                local id, storage = uuid.v4(), fs.get("app:temp_fs")
                local path = id .. ".pdf"
                assert(storage:writefile(path, bytes))
                local params = { upload_id = id, storage_id = "app:temp_fs", storage_path = path,
                    mime_type = "application/pdf", size = #bytes, metadata = {filename = "pages.pdf"} }
                local _, upload_err = uploads.create(id, "page-reader", #bytes, "application/pdf", "app:temp_fs", path, "documents", {}, "processing")
                test.is_nil(upload_err)
                local settings = assert(assert(contract.get("kickside.settings:settings")):open())
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_min_source_bytes", value = 0}).success)
                test.is_true(settings:set({namespace = "kickside.uploads.rasterize", key = "rasterize_min_page_bytes", value = (mode == "extracted" or mode == "uneven" or mode == "form" or mode == "inline") and 0 or 51200}).success)
                test.is_true(processor.process(params).success)
                local original = assert(parts.read_primary_content(id)).content
                local originals = doc2md.markers(original)
                test.eq(#originals, count)
                local rendered, render_err = funcs.call("kickside.uploads.rasterize:stage", params)
                test.is_nil(render_err, tostring(render_err)); test.is_true(rendered.success)
                local images = {}
                for _, artifact in ipairs(assert(parts.list_artifacts(id))) do
                    if artifact.role == "rendered-page" then images[#images + 1] = artifact end
                end
                test.eq(#images, mode == "extracted" and 0 or (mode == "uneven" and 2 or expected), "only scanned pages are rasterized")
                table.sort(images, function(a, b) return a.metadata.page < b.metadata.page end)
                local words_by_image = {}
                if mode == "uneven" then
                    test.eq(images[1].metadata.page, 1)
                    test.eq(images[2].metadata.page, 2)
                    words_by_image[assert(content.read_artifact_content(id, images[1].artifact_id))] = "SCANNED 1"
                    words_by_image[assert(content.read_artifact_content(id, images[2].artifact_id))] = ""
                    for page = 3, count do
                        local single = assert(doc2md.convert({bytes = fixtures.pdf({"scan"}, page)}, {extract_images = true}))
                        words_by_image[single.images[1].data] = "SCANNED " .. page
                    end
                end
                if mode == "extracted" then
                    for page = 1, count do
                        local single = assert(doc2md.convert({bytes = fixtures.pdf({"scan"}, page)}, {extract_images = true}))
                        words_by_image[single.images[1].data] = "SCANNED " .. page
                    end
                end
                local calls, current_bytes = 0, ""
                local model = ocr.new({llm = {FINISH_REASON = llm.FINISH_REASON, generate = function()
                    calls = calls + 1
                    return {result = (mode == "extracted" or mode == "uneven") and assert(words_by_image[current_bytes]) or "SCANNED " .. images[calls].metadata.page}, nil
                end}})
                local result = stage.run(params, {batch_size = 1, transcribe = function(bytes, options) current_bytes = bytes; return model.transcribe(bytes, options) end})
                test.is_true(result.success)
                test.eq(calls, expected)
                local markdown = assert(parts.read_primary_content(id)).content
                local markers = doc2md.markers(markdown)
                test.eq(#markers, count)
                for page, marker in ipairs(markers) do
                    test.eq(marker.number, page)
                    local body = markdown:sub(marker.finish + 1, markers[page + 1] and markers[page + 1].start - 1 or #markdown)
                    if kinds[page] == "text" then
                        local old = original:sub(originals[page].finish + 1, originals[page + 1] and originals[page + 1].start - 1 or #original)
                        test.eq(body, old, "the text layer stays byte-for-byte intact")
                    elseif kinds[page] == "blank" then test.is_nil(body:match("%S"))
                    else test.eq(body:match("^%s*(.-)%s*$"), "SCANNED " .. page) end
                end
                if mode == "text" then test.eq(markdown, original) end
                if mode == "mixed" then
                    local retried = stage.run(params, {transcribe = function()
                        error("completed OCR pages do not call the model again")
                    end})
                    test.is_true(retried.success)
                    test.eq(assert(parts.read_primary_content(id)).content, markdown, "retry keeps completed page work")
                    test.is_true(processor.process(params).success)
                    local regenerated = assert(parts.read_primary_content(id))
                    test.eq(regenerated.content, original, "explicit conversion replaces earlier OCR content")
                    test.is_nil(regenerated.metadata.ocr_page_outcomes)
                end
                assert(storage:remove(path))
            end)
        end
    end)
end) }
